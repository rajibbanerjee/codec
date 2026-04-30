"""
Report Generation Agent

Orchestrates PDF report creation from scenario data.
"""

from app.services.pdf_service import generate_pdf
from app.models.schemas import ReportRequest


def generate_report(request: ReportRequest) -> str:
    """Generate PDF report and return file path."""
    return generate_pdf(
        scenario_name=request.scenario_name,
        business_context=request.business_context.model_dump(),
        channels_input=[ch.model_dump() for ch in request.channels_input],
        calculation_results=request.calculation_results,
        recommendation=request.recommendation,
        user_text=request.user_text or "",
    )
