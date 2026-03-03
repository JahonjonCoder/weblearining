from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    courses = relationship("Course", back_populates="owner")

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    video_url = Column(String, nullable=True)
    youtube_url = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="courses")
    exams = relationship("Exam", back_populates="course")


class Exam(Base):
    __tablename__ = "exams"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    question_count = Column(Integer, default=0)
    time_limit = Column(Integer, default=60)  # Time limit in minutes
    course = relationship("Course", back_populates="exams")
    questions = relationship("Question", back_populates="exam")
    test_results = relationship("TestResult", back_populates="exam")
    sections = relationship("Section", back_populates="exam")


class Section(Base):
    __tablename__ = "sections"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    exam_id = Column(Integer, ForeignKey("exams.id"))
    order = Column(Integer, default=0)  # Section order in exam
    exam = relationship("Exam", back_populates="sections")
    questions = relationship("Question", back_populates="section")


class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id"))
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=True)
    order = Column(Integer, default=0)  # Question order in section
    exam = relationship("Exam", back_populates="questions")
    section = relationship("Section", back_populates="questions")
    options = relationship("Option", back_populates="question")


class Option(Base):
    __tablename__ = "options"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)
    is_correct = Column(Boolean, default=False)
    question_id = Column(Integer, ForeignKey("questions.id"))
    order = Column(Integer, default=0)  # Option order in question
    question = relationship("Question", back_populates="options")


class TestResult(Base):
    __tablename__ = "test_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    exam_id = Column(Integer, ForeignKey("exams.id"))
    score = Column(Integer, nullable=True)  # Score out of 100
    passed = Column(Boolean, default=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    time_taken = Column(Integer, nullable=True)  # Time taken in seconds
    exam = relationship("Exam", back_populates="test_results")
    user = relationship("User")
