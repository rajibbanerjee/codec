# StratEdge Consulting Platform

Management consulting decision-support tools platform.

## Quick Start

### Backend (FastAPI - Python)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

## Phase 1 Features

- Home, Services, Tools Marketplace, Pricing pages
- Marketing Channel Decision Tool (Finance module)
  - Plain English input → form schema generation
  - Multi-channel financial analysis
  - Dashboard with Recharts
  - PDF report download
- Modular backend with agent architecture

## Structure

```
consulting-platform/
├── backend/         # FastAPI Python backend
│   └── app/
│       ├── agents/     # Business logic agents
│       ├── api/        # FastAPI route handlers
│       ├── models/     # Pydantic schemas
│       ├── services/   # Finance calc, PDF, validation
│       └── utils/      # Constants
└── frontend/        # Next.js TypeScript frontend
    ├── app/             # Next.js app router pages
    ├── components/      # React components
    ├── lib/             # API client, utilities
    └── types/           # TypeScript interfaces
```
