# Backend

## Run

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

## Structure

- `app/api`: FastAPI route modules
- `app/core`: settings and shared config
- `app/schemas`: Pydantic schemas
- `app/data`: in-memory placeholder data for early API development
