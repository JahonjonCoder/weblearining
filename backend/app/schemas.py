from __future__ import annotations

from pydantic import BaseModel
from typing import List, Optional

class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    video_url: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class Course(CourseBase):
    id: int
    owner_id: int
    exams: List["Exam"] = []

    class Config:
        from_attributes = True

class ExamBase(BaseModel):
    title: str
    description: Optional[str] = None
    course_id: int

class ExamCreate(ExamBase):
    pass

class Option(BaseModel):
    id: int
    text: str
    is_correct: bool

    class Config:
        from_attributes = True

class Question(BaseModel):
    id: int
    text: str
    options: List[Option] = []

    class Config:
        from_attributes = True

class Exam(ExamBase):
    id: int
    questions: List[Question] = []

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    courses: List[Course] = []

    class Config:
        from_attributes = True
