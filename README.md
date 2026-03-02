# WebLearning

Simple online learning platform using FastAPI (backend) and React (frontend).

## Features

- 📚 **Kurslar ko'rish** - Mavjud kurslarning ro'yxatini ko'rish
- 🎥 **Video yuklash** - Kurslarga videolar qo'shish
- 📝 **Tavsif yozish** - Har bir kurs uchun batafsil tavsif qo'shish
- 🔧 **Admin Panel** - Yangi kurslar qo'shish uchun oson interfeys

## Backend

1. Navigate to `backend` directory.
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   venv\Scripts\activate   # Windows
   pip install -r requirements.txt
   ```
3. Start the server from the `backend` directory. If you run from the project root, specify the full module path:
   ```bash
   # from backend folder
   uvicorn app.main:app --reload

   # or from workspace root
   python -m uvicorn backend.app.main:app --reload
   ```
4. API docs available at http://localhost:8000/docs

## Frontend

1. Navigate to `frontend` directory.
2. Install packages:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm start
   ```
4. The app will open at http://localhost:3000 and call the backend at port 8000.

## Admin Panel

Yangi kurs yoki imtixon qo'shish uchun:
1. Frontend http://localhost:3000 oching
2. "Admin" button bosing
3. Tablar orasidan kerakli bo'limni tanlang (Kurs Qo'shish yoki Imtixon Qo'shish)
4. Formani to'ldiring:
   - Kurs uchun: nom, tavsif, video
   - Imtixon uchun: nom, tavsif, kurs ID
5. "Kurs Qo'shish" yoki "Imtixon Qo'shish" tugmasini bosing
6. Kurs videolari `backend/uploads/` papkasiga saqlanadi

## Database

- Backend uses SQLite for simplicity
- Database file: `backend/sql_app.db`
- Swap to PostgreSQL or other DB in production

## Project Structure

```
weblearining/
├── backend/
│   ├── app/
│   │   ├── main.py (FastAPI app, CORS, static files)
│   │   ├── models.py (SQLAlchemy models)
│   │   ├── schemas.py (Pydantic schemas)
│   │   ├── database.py (DB connection)
│   │   └── routers/
│   │       ├── courses.py (course CRUD + file upload)
│   │       └── users.py (user registration)
│   ├── uploads/ (video files saved here)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.js (main component with navigation)
│   │   ├── AdminPanel.js (admin panel for adding courses)
│   │   └── index.js
│   ├── public/
│   └── package.json
└── README.md
```

## Notes

- You can extend the models and add authentication, more course features, user enrollment, etc.
- The frontend has a navigation bar with two views: "Kurslar" (courses) and "Admin" (admin panel)
- Videos are served from `http://localhost:8000/uploads/`

