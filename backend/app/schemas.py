from __future__ import annotations

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    video_url: Optional[str] = None
    youtube_url: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class Course(CourseBase):
    id: int
    owner_id: Optional[int] = None
    exams: List["Exam"] = Field(default_factory=list)

    class Config:
        from_attributes = True

class ExamBase(BaseModel):
    title: str
    description: Optional[str] = None
    course_id: int
    question_count: int = 0
    time_limit: int = 60  # Time limit in minutes

class ExamCreate(ExamBase):
    pass

class SectionBase(BaseModel):
    title: str
    description: Optional[str] = None
    order: int = 0

class SectionCreate(SectionBase):
    exam_id: int

class Section(SectionBase):
    id: int
    exam_id: int
    questions: List["Question"] = Field(default_factory=list)

    class Config:
        from_attributes = True

class OptionCreate(BaseModel):
    text: str
    is_correct: bool = False

class Option(BaseModel):
    id: int
    text: str
    is_correct: bool

    class Config:
        from_attributes = True

class QuestionCreate(BaseModel):
    text: str
    section_id: Optional[int] = None
    order: int = 0
    options: List[OptionCreate] = Field(default_factory=list)

class Question(BaseModel):
    id: int
    text: str
    section_id: Optional[int] = None
    order: int = 0
    options: List[Option] = Field(default_factory=list)

    class Config:
        from_attributes = True

class Exam(ExamBase):
    id: int
    is_admin: bool = False
    time_limit: int = 60
    questions: List[Question] = Field(default_factory=list)
    sections: List[Section] = Field(default_factory=list)

    class Config:
        from_attributes = True

class TestResultBase(BaseModel):
    user_id: int
    exam_id: int
    score: Optional[int] = None
    passed: bool = False
    time_taken: Optional[int] = None

class TestResultCreate(TestResultBase):
    pass

class TestResult(TestResultBase):
    id: int
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

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
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str
