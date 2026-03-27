# CS308-Project-Team-16

Team 16 online store project for CS308.

## Repository Structure

- `backend`: FastAPI application with Pydantic schemas and route modules
- `frontend`: React + Vite application with shared layout and routing
- `plan.md`: sprint plan and backlog notes

## Quick Start

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```
