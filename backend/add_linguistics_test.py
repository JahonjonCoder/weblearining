"""
Script to add linguistics test (Kirish Ishlar) to the database
"""

import sys
sys.path.insert(0, '.')

from app.database import SessionLocal
from app.models import Course, Exam, Question, Option

# Create session
db = SessionLocal()

try:
    # Check if test already exists
    existing_exam = db.query(Exam).filter(Exam.title == "Kirish Ishlar - Kiritma Gaplar").first()
    if existing_exam:
        print("Test already exists. Skipping...")
        db.close()
        sys.exit(0)

    # Get or create course
    course = db.query(Course).filter(Course.title == "O'zbek Tili").first()
    if not course:
        course = Course(
            title="O'zbek Tili",
            description="O'zbek tili grammatikasi"
        )
        db.add(course)
        db.commit()
        print(f"Created course: {course.title}")

    # Create exam
    exam = Exam(
        title="Kirish Ishlar - Kiritma Gaplar",
        description="Kirish so'z va kiritma gaplar mavzusi bo'yicha test",
        course_id=course.id,
        time_limit=30,  # 30 minutes
        question_count=5
    )
    db.add(exam)
    db.commit()
    print(f"Created exam: {exam.title}")

    # Questions data
    questions_data = [
        {
            "text": "Kiritma gap qatnashgan gapni toping.",
            "options": [
                {"text": "Men ertaga darsga boraman.", "is_correct": False},
                {"text": "U, bilasiz, juda tirishqoq o'quvchi.", "is_correct": True},
                {"text": "Kitob javonda turibdi.", "is_correct": False},
                {"text": "Men bugun uyda dam olaman.", "is_correct": False},
            ]
        },
        {
            "text": "Kirish so'z qatnashgan gapni toping.",
            "options": [
                {"text": "Kecha yomg'ir yog'di.", "is_correct": False},
                {"text": "U bugun, agar vaqt topsa, keladi.", "is_correct": False},
                {"text": "Afsuski, mashg'ulot o'tilmadi.", "is_correct": True},
                {"text": "Ular stadionga bordi.", "is_correct": False},
            ]
        },
        {
            "text": "Qaysi gapda kirish birikma bor?",
            "options": [
                {"text": "Men ham futbol o'ynayman.", "is_correct": False},
                {"text": "Bu ish, ehtimol, tez tugaydi.", "is_correct": True},
                {"text": "O'quvchilar sinfga kirdi.", "is_correct": False},
                {"text": "Bugun havo iliq bo'ldi.", "is_correct": False},
            ]
        },
        {
            "text": "Kirish so'zning vazifasi noto'g'ri ko'rsatilgan variantni toping.",
            "options": [
                {"text": "Balki — taxminni bildiradi", "is_correct": False},
                {"text": "Afsuski — taassufni bildiradi", "is_correct": False},
                {"text": "Darhaqiqat — quvonch bildiradi", "is_correct": True},
                {"text": "Ehtimol — gumonni bildiradi", "is_correct": False},
            ]
        },
        {
            "text": "Kiritma gap qanday belgi bilan ajratiladi?",
            "options": [
                {"text": "Nuqta bilan", "is_correct": False},
                {"text": "Vergul bilan", "is_correct": False},
                {"text": "Qavs yoki tire bilan", "is_correct": True},
                {"text": "Ikki nuqta bilan", "is_correct": False},
            ]
        },
    ]

    # Add questions and options
    for idx, q_data in enumerate(questions_data):
        question = Question(
            exam_id=exam.id,
            text=q_data["text"],
            order=idx + 1
        )
        db.add(question)
        db.flush()  # Flush to get the question ID
        
        # Add options
        for opt_idx, opt_data in enumerate(q_data["options"]):
            option = Option(
                question_id=question.id,
                text=opt_data["text"],
                is_correct=opt_data["is_correct"],
                order=opt_idx + 1
            )
            db.add(option)
        
        print(f"Added question {idx + 1}: {q_data['text'][:50]}...")
    
    db.commit()
    print(f"\n✅ Successfully added linguistics test with {len(questions_data)} questions!")

except Exception as e:
    db.rollback()
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
