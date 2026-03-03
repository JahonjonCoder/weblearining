"""
Script to initialize the database with all tables
"""

import sys
sys.path.insert(0, '.')

from app.database import engine, Base
from app.models import User, Course, Exam, Question, Option, Section, TestResult

# Create all tables
Base.metadata.create_all(bind=engine)
print("✅ Database tables created successfully!")
