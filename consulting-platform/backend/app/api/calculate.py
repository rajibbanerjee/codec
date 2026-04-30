from fastapi import APIRouter, HTTPException
from app.models.schemas import CalculationRequest, CalculationResponse
from app.agents.financial_calculation_agent import run_calculation
from app.services.validation_service import validate_channels

router = APIRouter(prefix="/api", tags=["calculate"])


@router.post("/calculate-channel-decision", response_model=CalculationResponse)
def calculate_channel_decision(request: CalculationRequest):
    valid, errors = validate_channels(request.channels)
    if not valid:
        raise HTTPException(status_code=422, detail={"validation_errors": errors})
    return run_calculation(request)
