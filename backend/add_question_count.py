import sqlite3

db_path = 'sql_app.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()
cur.execute("PRAGMA table_info('exams')")
cols = [row[1] for row in cur.fetchall()]
if 'question_count' not in cols:
    cur.execute("ALTER TABLE exams ADD COLUMN question_count INTEGER DEFAULT 0")
    conn.commit()
    print('question_count column added')
else:
    print('question_count column already exists')
conn.close()
