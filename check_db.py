import sys
sys.path.insert(0,'.')
from backend.app.database import SessionLocal
from backend.app.models import Exam
s=SessionLocal()
print('count', s.query(Exam).count())
for e in s.query(Exam).all():
    print(e.id, e.title)
