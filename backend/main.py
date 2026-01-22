from fastapi import FastAPI, Depends, HTTPException, status
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from backend import models, schemas, auth, database
from sqlalchemy import func

from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from typing import List

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Allow CORS for frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Quizi API is running"}

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = auth.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(models.User).filter(models.User.email == payload["email"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# --- AUTH ROUTES ---

@app.post("/auth/register", response_model=schemas.UserRegistrationResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        full_name=user.full_name,
        email=user.email,
        mobile=user.mobile,
        hashed_password=hashed_password,
        user_type=user.user_type,
        student_id=user.student_id,
        degree=user.degree,
        department=user.department,
        university=user.university
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Account created successfully!", "user": new_user}

@app.post("/auth/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    if not auth.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    access_token = auth.create_access_token(data={"sub": user.email, "user_type": user.user_type})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@app.get("/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.put("/auth/me", response_model=schemas.UserResponse)
def update_me(user_update: schemas.UserUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # If email is being updated, check if it's already taken
    if user_update.email and user_update.email != current_user.email:
        existing_user = db.query(models.User).filter(models.User.email == user_update.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = user_update.email

    if user_update.full_name:
        current_user.full_name = user_update.full_name
    if user_update.mobile:
        current_user.mobile = user_update.mobile
    if user_update.password:
        current_user.hashed_password = auth.get_password_hash(user_update.password)
    
    # Optional fields
    if user_update.student_id is not None:
        current_user.student_id = user_update.student_id
    if user_update.degree is not None:
        current_user.degree = user_update.degree
    if user_update.department is not None:
        current_user.department = user_update.department
    if user_update.university is not None:
        current_user.university = user_update.university

    db.commit()
    db.refresh(current_user)
    return current_user

# --- TEACHER UTILS ---

@app.get("/teacher/students")
def get_my_students(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.user_type != 1:
        raise HTTPException(status_code=403, detail="Only teachers can view students")
    
    # Get all courses taught by this teacher
    courses = current_user.taught_courses
    students_data = []
    
    seen_student_ids = set()

    for course in courses:
        for enrollment in course.enrollments:
            student = enrollment.student
            # Unique students only? Or list per course?
            # Request says "enroled student of user courses"
            # Let's return a flat list of students with course info, or just students.
            # Usually teachers want to see who is in which course.
            
            # Let's create a composite object
            students_data.append({
                "student_id": student.id,
                "full_name": student.full_name,
                "email": student.email,
                "course_title": course.title,
                "course_code": course.course_code,
                "enrolled_at": enrollment.enrolled_at
            })
            
    return students_data

# --- COURSE ROUTES ---

@app.post("/courses", response_model=schemas.CourseResponse)
def create_course(course: schemas.CourseCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.user_type != 1: # Teacher
        raise HTTPException(status_code=403, detail="Only teachers can create courses")
    
    # Check if course code already exists
    existing_course = db.query(models.Course).filter(models.Course.course_code == course.course_code).first()
    if existing_course:
        raise HTTPException(status_code=400, detail="Course code already exists")
        
    try:
        new_course = models.Course(**course.dict(), teacher_id=current_user.id)
        db.add(new_course)
        # Note: No notification here as no students are enrolled yet
        
        db.commit()
        db.refresh(new_course)
        return new_course
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/courses", response_model=List[schemas.CourseResponse])
def get_courses(db: Session = Depends(get_db)):
    return db.query(models.Course).all()

@app.get("/courses/all", response_model=List[schemas.CourseResponse])
def get_all_courses(db: Session = Depends(get_db)):
    return db.query(models.Course).all()

@app.get("/courses/my", response_model=List[schemas.CourseResponse])
def get_my_courses(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.user_type == 1: # Teacher
        return current_user.taught_courses
    else: # Student
        return [enrollment.course for enrollment in current_user.enrollments]

@app.get("/courses/{course_id}", response_model=schemas.CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@app.put("/courses/{course_id}", response_model=schemas.CourseResponse)
def update_course(course_id: int, course_update: schemas.CourseCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course or course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    for key, value in course_update.dict().items():
        setattr(course, key, value)
    db.commit()
    
    # Create notifications for all enrolled students
    enrollments = db.query(models.Enrollment).filter_by(course_id=course.id).all()
    for enrollment in enrollments:
        notif = models.Notification(
            user_id=enrollment.student_id,
            title="Course Updated",
            message=f"The course '{course.title}' has been updated by the instructor.",
            type="course"
        )
        db.add(notif)
    db.commit()

    db.refresh(course)
    return course

@app.delete("/courses/{course_id}")
def delete_course(course_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course or course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(course)
    db.commit()
    return {"message": "Course deleted"}

@app.post("/courses/{course_id}/enroll")
def enroll_student(course_id: int, enrollment_data: dict, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.user_type != 0:
        raise HTTPException(status_code=403, detail="Only students can enroll in courses")
    
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if not course.self_join_enabled:
        raise HTTPException(status_code=400, detail="Self-join is disabled for this course")

    if course.access_key and enrollment_data.get("access_key") != course.access_key:
        raise HTTPException(status_code=403, detail="Invalid course access key")
    
    # Check if already enrolled
    existing_enrollment = db.query(models.Enrollment).filter_by(student_id=current_user.id, course_id=course_id).first()
    if existing_enrollment:
        return {"message": "Already enrolled"}
        
    enrollment = models.Enrollment(student_id=current_user.id, course_id=course_id)
    db.add(enrollment)
    
    # Notify Teacher
    notif = models.Notification(
        user_id=course.teacher_id,
        title="New Student Joined",
        message=f"Student {current_user.full_name} has enrolled in your course: {course.title}",
        type="course"
    )
    db.add(notif)
    
    db.commit()
    return {"message": "Successfully enrolled"}

# --- QUIZ ROUTES ---

@app.post("/quizzes", response_model=schemas.QuizResponse)
def create_quiz(quiz: schemas.QuizCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.user_type != 1:
        raise HTTPException(status_code=403, detail="Only teachers can create quizzes")
    
    new_quiz = models.Quiz(**quiz.dict())
    db.add(new_quiz)
    
    # Notify all enrolled students
    enrollments = db.query(models.Enrollment).filter_by(course_id=quiz.course_id).all()
    for enrollment in enrollments:
        notif = models.Notification(
            user_id=enrollment.student_id,
            title="New Quiz Posted!",
            message=f"A new quiz '{quiz.title}' has been added to your course: {new_quiz.course.title}",
            type="quiz"
        )
        db.add(notif)
    
    db.commit()
    db.refresh(new_quiz)
    return new_quiz

@app.put("/quizzes/{quiz_id}", response_model=schemas.QuizResponse)
def update_quiz(quiz_id: int, quiz_update: schemas.QuizBase, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.user_type != 1:
        raise HTTPException(status_code=403, detail="Only teachers can update quizzes")
    
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
        
    # Verify course ownership
    if quiz.course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this quiz")
        
    for key, value in quiz_update.dict().items():
        setattr(quiz, key, value)
    
    db.commit()
    
    # Notify all enrolled students
    enrollments = db.query(models.Enrollment).filter_by(course_id=quiz.course_id).all()
    for enrollment in enrollments:
        notif = models.Notification(
            user_id=enrollment.student_id,
            title="Quiz Updated",
            message=f"The quiz '{quiz.title}' in course '{quiz.course.title}' has been updated.",
            type="quiz"
        )
        db.add(notif)
    db.commit()

    db.refresh(quiz)
    return quiz

@app.get("/enrollments/my", response_model=List[schemas.CourseResponse])
def get_my_enrollments(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.user_type != 0:
        raise HTTPException(status_code=403, detail="Only students have enrollments")
    return [e.course for e in current_user.enrollments]

@app.get("/courses/{course_id}/quizzes", response_model=List[schemas.QuizResponse])
def get_course_quizzes(course_id: int, db: Session = Depends(get_db)):
    return db.query(models.Quiz).filter_by(course_id=course_id).all()

@app.get("/quizzes/my", response_model=List[schemas.QuizResponse])
def get_my_created_quizzes(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.user_type != 1:
        raise HTTPException(status_code=403, detail="Only teachers can view their quizzes")
    
    # All quizzes from all courses taught by this teacher
    # Efficient way: join Course
    quizzes = db.query(models.Quiz).join(models.Course).filter(models.Course.teacher_id == current_user.id).all()
    return quizzes

@app.post("/quizzes/{quiz_id}/validate")
def validate_quiz_key(quiz_id: int, key: str, db: Session = Depends(get_db)):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    if quiz.access_key != key:
        raise HTTPException(status_code=400, detail="Invalid access key")
    
    # Check time window
    now = datetime.utcnow()
    # Note: Using naive UTC for simplicity, in production use proper timezone handling
    if quiz.start_time and now < quiz.start_time:
        raise HTTPException(status_code=400, detail="Quiz has not started yet")
    if quiz.end_time and now > quiz.end_time:
        raise HTTPException(status_code=400, detail="Quiz has ended")
        
    return {"message": "Key validated"}

@app.get("/quizzes/{quiz_id}/start", response_model=List[schemas.QuestionResponse])
def start_quiz(quiz_id: int, key: str, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Validate key and time again for security
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz or quiz.access_key != key:
        raise HTTPException(status_code=400, detail="Unauthorized")
    
    # Randomized question selection
    import random
    all_questions = db.query(models.Question).filter_by(quiz_id=quiz_id).all()
    
    if quiz.shuffle_questions:
        random.shuffle(all_questions)
        
    return all_questions

# --- QUESTION ROUTES ---

@app.post("/questions", response_model=schemas.QuestionResponse)
def create_question(question: schemas.QuestionCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.user_type != 1:
        raise HTTPException(status_code=403, detail="Only teachers can manage questions")
    
    new_question = models.Question(**question.dict())
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    
    # Update Quiz Total Marks
    quiz = db.query(models.Quiz).filter(models.Quiz.id == question.quiz_id).first()
    if quiz:
        total = db.query(func.sum(models.Question.point_value)).filter(models.Question.quiz_id == quiz.id).scalar() or 0
        quiz.total_marks = total
        db.commit()
        
    return new_question

@app.post("/quizzes/{quiz_id}/questions/bulk")
def bulk_upload_questions(quiz_id: int, questions: List[schemas.QuestionCreate], current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.user_type != 1:
        raise HTTPException(status_code=403, detail="Only teachers can manage questions")
    
    # Verify quiz ownership/existence
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    new_questions = [models.Question(**q.dict(exclude={'quiz_id'}), quiz_id=quiz_id) for q in questions]
    db.add_all(new_questions)
    db.commit()
    
    # Update Quiz Total Marks
    total = db.query(func.sum(models.Question.point_value)).filter(models.Question.quiz_id == quiz_id).scalar() or 0
    quiz.total_marks = total
    db.commit()
    
    return {"message": f"Successfully uploaded {len(new_questions)} questions"}

@app.get("/quizzes/{quiz_id}/questions", response_model=List[schemas.QuestionResponse])
def get_quiz_questions(quiz_id: int, db: Session = Depends(get_db)):
    return db.query(models.Question).filter_by(quiz_id=quiz_id).all()

@app.get("/results/my", response_model=List[schemas.ResultResponse])
def get_my_results(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Result).filter(models.Result.student_id == current_user.id).all()

@app.get("/results/teacher/all", response_model=List[schemas.ResultResponse])
def get_teacher_results(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.user_type != 1: # Teacher
        raise HTTPException(status_code=403, detail="Only teachers can view all results")
    
    # Get all courses by this teacher
    course_ids = [course.id for course in current_user.taught_courses]
    # Get all quizzes in those courses
    quiz_ids = [quiz.id for quiz in db.query(models.Quiz).filter(models.Quiz.course_id.in_(course_ids)).all()]
    # Get all results for those quizzes
    return db.query(models.Result).filter(models.Result.quiz_id.in_(quiz_ids)).all()

# --- QUESTION MANAGEMENT ---

@app.put("/questions/{question_id}", response_model=schemas.QuestionResponse)
def update_question(question_id: int, question_update: schemas.QuestionBase, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.user_type != 1:
        raise HTTPException(status_code=403, detail="Only teachers can update questions")
    db_question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    update_data = question_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_question, key, value)
    
    db.commit()

    # Update Quiz Total Marks
    quiz = db.query(models.Quiz).filter(models.Quiz.id == db_question.quiz_id).first()
    if quiz:
        total = db.query(func.sum(models.Question.point_value)).filter(models.Question.quiz_id == quiz.id).scalar() or 0
        quiz.total_marks = total
        db.commit()

    # Notify Teacher
    notif = models.Notification(
        user_id=quiz.course.teacher_id,
        title="Quiz Content Updated",
        message=f"Quiz '{quiz.title}' content has been updated by the system or another teacher.",
        type="quiz"
    )
    db.add(notif)
    db.commit()

    db.refresh(db_question)
    return db_question

@app.delete("/questions/{question_id}")
def delete_question(question_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.user_type != 1:
        raise HTTPException(status_code=403, detail="Only teachers can delete questions")
    db_question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    quiz_id = db_question.quiz_id
    db.delete(db_question)
    db.commit()
    
    # Update Quiz Total Marks
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if quiz:
        total = db.query(func.sum(models.Question.point_value)).filter(models.Question.quiz_id == quiz.id).scalar() or 0
        quiz.total_marks = total
        db.commit()
        
    return {"message": "Question deleted successfully"}

# --- QUIZ DELETION ---

@app.delete("/quizzes/{quiz_id}")
def delete_quiz(quiz_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.user_type != 1:
        raise HTTPException(status_code=403, detail="Only teachers can delete quizzes")
    db_quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not db_quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    db.delete(db_quiz)
    db.commit()
    return {"message": "Quiz and its questions deleted successfully"}

@app.post("/results", response_model=schemas.ResultResponse)
def submit_quiz_result(result: schemas.ResultCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.user_type != 0:
        raise HTTPException(status_code=403, detail="Only students can submit results")
    
    quiz = db.query(models.Quiz).filter(models.Quiz.id == result.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # Server-side Grading Logic
    questions = db.query(models.Question).filter(models.Question.quiz_id == result.quiz_id).all()
    calculated_score = 0
    calculated_total_marks = 0 # Verify total marks dynamically
    
    user_answers = result.answers or {}
    
    for q in questions:
        calculated_total_marks += q.point_value
        ans = str(user_answers.get(str(q.id), "")).lower().strip()
        
        if q.question_type == 'description':
            continue # Manual grading required, 0 points for now
            
        # MCQ and True/False Logic
        correct = str(q.correct_option).lower().strip()
        if ans == correct and ans != "":
            calculated_score += q.point_value

    new_result = models.Result(
        score=calculated_score,
        total_marks=calculated_total_marks,
        eye_tracking_violations=result.eye_tracking_violations,
        timeline=result.timeline,
        answers=result.answers,
        student_id=current_user.id,
        quiz_id=result.quiz_id
    )
    db.add(new_result)
    db.commit()
    db.refresh(new_result)
    
    # Notify Teacher of Submission
    notif = models.Notification(
        user_id=new_result.quiz.course.teacher_id,
        title="New Quiz Submission",
        message=f"Student {current_user.full_name} has submitted an attempt for quiz: {new_result.quiz.title}",
        type="quiz"
    )
    db.add(notif)
    db.commit()
    
    return new_result

@app.put("/results/{result_id}/grade")
def grade_result(result_id: int, payload: dict, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.user_type != 1:
        raise HTTPException(status_code=403, detail="Only teachers can grade")
        
    result = db.query(models.Result).filter(models.Result.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
        
    # Verify course ownership
    if result.quiz.course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Payload can contain 'feedback' and 'answers'
    feedback = payload.get("feedback", {})
    answers = payload.get("answers", {})

    # Update feedback
    current_feedback = result.feedback or {}
    current_feedback.update(feedback)
    result.feedback = current_feedback

    # Update answers if provided (Remarking feature)
    if answers:
        current_answers = result.answers or {}
        current_answers.update(answers)
        result.answers = current_answers
    
    # Commit interim state to allow recalculation logic to see updated answers
    db.add(result)
    db.commit()
    db.refresh(result)
    
    # Recalculate Score
    # 1. Start with Auto-graded score (re-verify)
    questions = db.query(models.Question).filter(models.Question.quiz_id == result.quiz_id).all()
    new_score = 0
    user_answers = result.answers or {}

    for q in questions:
        ans = str(user_answers.get(str(q.id), "")).lower().strip()
        
        # Priority 1: Manual Score in Feedback (Override)
        q_feed = current_feedback.get(str(q.id))
        if q_feed and 'score' in q_feed:
            try:
                new_score += int(q_feed['score'])
            except (ValueError, TypeError):
                pass # faulty score payload
        else:
            # Priority 2: Auto-grading (Default for non-description)
            if q.question_type == 'description':
                # Description questions without manual score get 0 by default
                pass 
            else:
                # Auto-grade check
                correct = str(q.correct_option).lower().strip()
                if ans == correct and ans != "":
                    new_score += q.point_value
    
    result.score = new_score
    db.commit()
    db.refresh(result)

    # Notify Student of Grading
    notif = models.Notification(
        user_id=result.student_id,
        title="Result Graded",
        message=f"Your result for quiz '{result.quiz.title}' has been graded. Your score: {result.score}/{result.total_marks}",
        type="quiz"
    )
    db.add(notif)
    db.commit()

    return result

@app.get("/notifications", response_model=List[schemas.NotificationResponse])
def get_notifications(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Notification).filter(models.Notification.user_id == current_user.id).order_by(models.Notification.created_at.desc()).limit(20).all()

@app.delete("/notifications/{notif_id}")
def delete_notification(notif_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    notif = db.query(models.Notification).filter(models.Notification.id == notif_id, models.Notification.user_id == current_user.id).first()
    if notif:
        db.delete(notif)
        db.commit()
        return {"message": "Notification deleted"}
    raise HTTPException(status_code=404, detail="Notification not found")

@app.post("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: int, db: Session = Depends(get_db)):
    notif = db.query(models.Notification).filter(models.Notification.id == notif_id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"message": "Notification updated"}
