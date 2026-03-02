import sqlite3

conn = sqlite3.connect('sql_app.db')
cur = conn.cursor()
cur.execute("UPDATE exams SET question_count = 0 WHERE question_count IS NULL")
conn.commit()
print('rows updated:', cur.rowcount)
conn.close()
