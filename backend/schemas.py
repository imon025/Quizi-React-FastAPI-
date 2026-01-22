from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    full_name: str
    mobile: str
    password: str
    user_type: int
    student_id: Optional[str] = None
    degree: Optional[str] = None
    department: Optional[str] = None
    university: Optional[str] = None

class UserLogin(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    password: Optional[str] = None
    degree: Optional[str] = None
    department: Optional[str] = None
    university: Optional[str] = None
    student_id: Optional[str] = None

class UserResponse(UserBase):
    id: int
    full_name: str
    mobile: str
    user_type: int
    student_id: Optional[str] = None
    degree: Optional[str] = None
    department: Optional[str] = None
    university: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class UserRegistrationResponse(BaseModel):
    message: str
    user: UserResponse

# --- Course Schemas ---
class CourseBase(BaseModel):
    title: str
    course_code: str
    subject: str
    semester: str
    batch: str
    description: str
    banner_url: Optional[str] = None
    is_active: bool = True
    self_join_enabled: bool = True
    access_key: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class CourseResponse(CourseBase):
    id: int
    teacher_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- Quiz Schemas ---
class QuizBase(BaseModel):
    title: str
    description: str
    start_time: datetime
    end_time: datetime
    duration: int
    deadline: Optional[datetime] = None
    passing_marks: int
    total_marks: int
    access_key: str
    attempts_count: int = 1
    max_questions: int = 0
    shuffle_questions: bool = False
    eye_tracking_enabled: bool = False
    fullscreen_required: bool = False
    tab_switch_detection: bool = False
    violation_limit: int = 5
    status: str = "draft"

class QuizCreate(QuizBase):
    course_id: int

class QuizResponse(QuizBase):
    id: int
    course_id: int
    course: Optional[CourseResponse] = None
    
    class Config:
        from_attributes = True

# --- Question Schemas ---
class QuestionBase(BaseModel):
    text: str
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    correct_option: Optional[str] = None
    point_value: int = 1
    question_type: str = "mcq" # mcq, true_false, description

class QuestionCreate(QuestionBase):
    quiz_id: Optional[int] = None

class QuestionResponse(QuestionBase):
    id: int
    quiz_id: int
    
    class Config:
        from_attributes = True

# --- Result Schemas ---
class ResultCreate(BaseModel):
    quiz_id: int
    score: int
    total_marks: int
    eye_tracking_violations: int = 0
    timeline: Optional[List[dict]] = None
    answers: Optional[dict] = None

class ResultResponse(BaseModel):
    id: int
    student_id: int
    quiz_id: Optional[int] = None
    score: int
    total_marks: int
    eye_tracking_violations: int
    timeline: Optional[List[dict]] = None
    answers: Optional[dict] = None
    feedback: Optional[dict] = None
    completed_at: datetime
    student: Optional[UserResponse] = None
    quiz: Optional[QuizResponse] = None
    
    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    title: str
    message: str
    type: str # 'course', 'quiz', 'system'
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
