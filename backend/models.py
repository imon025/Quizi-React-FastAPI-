from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    mobile = Column(String)
    hashed_password = Column(String)
    user_type = Column(Integer)  # 0 = Student, 1 = Teacher
    
    # Student specific fields
    student_id = Column(String, nullable=True)
    
    # Teacher specific fields
    degree = Column(String, nullable=True)
    
    # Common optional fields
    department = Column(String, nullable=True)
    university = Column(String, nullable=True)

    # Relationships
    taught_courses = relationship("Course", back_populates="teacher")
    enrollments = relationship("Enrollment", back_populates="student")
    results = relationship("Result", back_populates="student")

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    course_code = Column(String, unique=True, index=True)
    subject = Column(String)
    semester = Column(String)
    batch = Column(String)
    description = Column(String)
    banner_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    self_join_enabled = Column(Boolean, default=True)
    access_key = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    teacher_id = Column(Integer, ForeignKey("users.id"))

    teacher = relationship("User", back_populates="taught_courses")
    quizzes = relationship("Quiz", back_populates="course")
    enrollments = relationship("Enrollment", back_populates="course")

class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    duration = Column(Integer)  # in minutes
    deadline = Column(DateTime(timezone=True))
    passing_marks = Column(Integer)
    total_marks = Column(Integer)
    access_key = Column(String)
    attempts_count = Column(Integer, default=1)
    
    # Security & Shuffling
    shuffle_questions = Column(Boolean, default=True)
    shuffle_options = Column(Boolean, default=True)
    fullscreen_required = Column(Boolean, default=False)
    tab_switch_detection = Column(Boolean, default=False)
    
    status = Column(String, default="draft")  # draft, scheduled, live, ended
    course_id = Column(Integer, ForeignKey("courses.id"))

    course = relationship("Course", back_populates="quizzes")
    questions = relationship("Question", back_populates="quiz")
    results = relationship("Result", back_populates="quiz")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    text = Column(String)
    option_a = Column(String)
    option_b = Column(String)
    option_c = Column(String)
    option_d = Column(String)
    correct_option = Column(String)  # 'a', 'b', 'c', or 'd'
    point_value = Column(Integer, default=1)

    quiz = relationship("Quiz", back_populates="questions")

class Result(Base):
    __tablename__ = "results"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    score = Column(Integer)
    total_marks = Column(Integer)
    eye_tracking_violations = Column(Integer, default=0)
    timeline = Column(JSON, nullable=True)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("User", back_populates="results")
    quiz = relationship("Quiz", back_populates="results")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    message = Column(String)
    type = Column(String) # 'course', 'quiz', 'system'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_read = Column(Boolean, default=False)
