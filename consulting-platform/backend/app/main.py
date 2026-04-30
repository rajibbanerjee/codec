import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.interpret_script import router as interpret_router
from app.api.calculate import router as calculate_router
from app.api.report import router as report_router
from app.api.help import router as help_router

os.makedirs("/tmp/reports", exist_ok=True)

app = FastAPI(
    title="StratEdge Consulting – Decision Platform API",
    version="1.0.0",
    description="Backend API for management consulting decision support tools.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interpret_router)
app.include_router(calculate_router)
app.include_router(report_router)
app.include_router(help_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "StratEdge Consulting API"}
