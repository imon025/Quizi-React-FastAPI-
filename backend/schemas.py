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
    shuffle_questions: bool = True
    shuffle_options: bool = True
    fullscreen_required: bool = False
    tab_switch_detection: bool = False
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
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str
    point_value: int = 1

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

class ResultResponse(BaseModel):
    id: int
    student_id: int
    quiz_id: int
    score: int
    total_marks: int
    eye_tracking_violations: int
    timeline: Optional[List[dict]] = None
    completed_at: datetime
    student: Optional[UserResponse] = None
    quiz: Optional[QuizResponse] = None
    
    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str # 'course', 'quiz', 'system'
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
