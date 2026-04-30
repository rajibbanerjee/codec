"""
Financial Calculation Agent

Orchestrates per-channel metric calculation using the finance_calculations service
and then calls the recommendation agent to build the full CalculationResponse.
"""

from typing import List
from app.models.schemas import (
    CalculationRequest,
    CalculationResponse,
    ChannelResult,
)
from app.services.finance_calculations import calculate_all_channels
from app.agents.recommendation_agent import generate_recommendation
import uuid


def run_calculation(request: CalculationRequest) -> CalculationResponse:
    results: List[ChannelResult] = calculate_all_channels(request.channels)
    recommendation = generate_recommendation(results, request.business_context)
    return CalculationResponse(
        success=True,
        channels=results,
        recommendation=recommendation,
        scenario_id=str(uuid.uuid4()),
    )
