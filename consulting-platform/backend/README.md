# Management Consulting Platform - Backend

FastAPI backend for the StratEdge Consulting Management Platform, providing financial decision-making tools for marketing channel analysis.

## Setup

```bash
cd consulting-platform/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| POST | /api/interpret-script | Interpret plain English business scenario |
| POST | /api/calculate-channel-decision | Run financial calculations |
| POST | /api/generate-report | Generate PDF report |
| GET | /api/download-report/{filename} | Download generated PDF |
| GET | /api/help/short-run-decision | Help guide |

## Architecture

- **agents/**: AI/ML agents (currently rule-based, LLM-ready)
- **services/**: Business logic services
- **api/**: FastAPI route handlers
- **models/**: Pydantic schemas
- **utils/**: Constants and helpers
