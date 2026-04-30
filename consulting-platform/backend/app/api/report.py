import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.models.schemas import ReportRequest
from app.agents.report_generation_agent import generate_report

router = APIRouter(prefix="/api", tags=["report"])


@router.post("/generate-report")
def create_report(request: ReportRequest):
    try:
        filepath = generate_report(request)
        filename = os.path.basename(filepath)
        return {"success": True, "filename": filename, "download_url": f"/api/download-report/{filename}"}
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download-report/{filename}")
def download_report(filename: str):
    # Sanitize: only allow hex filenames with .pdf extension
    if not filename.endswith(".pdf") or "/" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    filepath = f"/tmp/reports/{filename}"
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Report not found")
    return FileResponse(filepath, media_type="application/pdf",
                        headers={"Content-Disposition": f"attachment; filename={filename}"})
