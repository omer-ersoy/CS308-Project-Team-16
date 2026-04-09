# Backend

## Run

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

## Auth Testing

- `POST /api/auth/register`: create a new user with a hashed password
- `POST /api/auth/login`: receive a bearer token
- `GET /api/users/me`: send `Authorization: Bearer <token>` to test a protected route

Demo login after startup:

```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

## Structure

- `app/api`: FastAPI route modules
- `app/core`: settings and shared config
- `app/schemas`: Pydantic schemas
- `app/data`: in-memory placeholder data for early API development
