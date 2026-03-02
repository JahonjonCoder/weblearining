import sqlite3

db_path = 'sql_app.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()
cur.execute("PRAGMA table_info('users')")
cols = [row[1] for row in cur.fetchall()]
if 'is_admin' not in cols:
    cur.execute("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0")
    conn.commit()
    print('is_admin column added')
else:
    print('is_admin column already exists')
conn.close()
