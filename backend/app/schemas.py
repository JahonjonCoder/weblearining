from __future__ import annotations

from pydantic import BaseModel, Field
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
    exams: List["Exam"] = Field(default_factory=list)

    class Config:
        orm_mode = True

class ExamBase(BaseModel):
    title: str
    description: Optional[str] = None
    course_id: int
    question_count: int = 0

class ExamCreate(ExamBase):
    pass

class OptionCreate(BaseModel):
    text: str
    is_correct: bool = False

class Option(BaseModel):
    id: int
    text: str
    is_correct: bool

    class Config:
        orm_mode = True

class QuestionCreate(BaseModel):
    text: str
    options: List[OptionCreate] = Field(default_factory=list)

class Question(BaseModel):
    id: int
    text: str
    options: List[Option] = Field(default_factory=list)

    class Config:
        orm_mode = True

class Exam(ExamBase):
    id: int
    questions: List[Question] = Field(default_factory=list)

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    is_admin: bool = False

class User(UserBase):
    id: int
    is_admin: bool = False
    courses: List[Course] = Field(default_factory=list)

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: str
    password: str
