# Civic Issues Platform

## Backend (FastAPI)

Run locally:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Endpoints:
- POST `/api/auth/signup`
- POST `/api/auth/login`
- GET `/api/issues`
- POST `/api/issues` (multipart/form-data: title, details, category, reporter_*, lat?, lng?, photo?)

MySQL support:

```bash
pip install pymysql
set DATABASE_URL=mysql+pymysql://user:pass@localhost:3306/civic_issues
python -m uvicorn backend.main:app --reload --port 8000
```

## Frontend (React CRA)

Run locally:

```bash
cd frontend/my-react
npm install
npm start
```

Open `http://localhost:3000` while backend runs on port 8000.

Environment variable:

```bash
# in frontend/my-react/.env
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

"# Civic-Issue" 
