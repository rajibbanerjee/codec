from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


# ---------------------------------------------------------------------------
# Interpretation layer
# ---------------------------------------------------------------------------

class InterpretScriptRequest(BaseModel):
    """Request body for the interpret-script endpoint."""
    user_text: str = Field(..., description="Plain English description of the business scenario")


class FormField(BaseModel):
    """A single field definition for the dynamic form."""
    name: str = Field(..., description="Field key name")
    label: str = Field(..., description="Human-readable label")
    type: str = Field(..., description="Field type: slider | number | dropdown | text")
    value: Optional[float | str | int] = Field(None, description="Pre-filled value extracted from text")
    min: Optional[float] = Field(None, description="Minimum value (for sliders)")
    max: Optional[float] = Field(None, description="Maximum value (for sliders)")
    unit: Optional[str] = Field(None, description="Unit of measurement, e.g. INR, %")
    confidence: Optional[str] = Field(None, description="Confidence level: exact | estimated | unknown")
    required: bool = Field(False, description="Whether the field is required")
    options: Optional[List[str]] = Field(None, description="Dropdown options list")


class ChannelFormSection(BaseModel):
    """Form section for a single marketing channel."""
    name: str = Field(..., description="Channel name")
    fields: List[FormField] = Field(default_factory=list)


class BusinessContext(BaseModel):
    """Business context settings."""
    business_type: str = Field("B2B", description="B2B or B2C")
    currency: str = Field("USD", description="Currency code: USD, INR, EUR, GBP")
    time_period: str = Field("Campaign", description="Time period: Monthly, Quarterly, Annual, Campaign")
    objective: str = Field("profit_maximization", description="Optimization objective")


class FormSchema(BaseModel):
    """The complete dynamic form schema generated from user text interpretation."""
    business_context: BusinessContext = Field(default_factory=BusinessContext)
    channels: List[ChannelFormSection] = Field(default_factory=list)
    missing_fields: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


class InterpretScriptResponse(BaseModel):
    """Response from the interpret-script endpoint."""
    success: bool
    interpreted_context: Dict[str, Any] = Field(default_factory=dict)
    form_schema: FormSchema


# ---------------------------------------------------------------------------
# Calculation layer
# ---------------------------------------------------------------------------

class ChannelInput(BaseModel):
    """User-submitted data for a single marketing channel."""
    name: str = Field(..., description="Channel name")
    leads: float = Field(0, description="Number of leads / visitors")
    conversion_rate: float = Field(0, description="Conversion rate as percentage 0-100")
    selling_price: float = Field(0, description="Revenue per customer")
    variable_cost_per_customer: float = Field(0, description="Variable cost per acquired customer")
    marketing_spend: float = Field(0, description="Total marketing spend for this channel")
    additional_fixed_cost: float = Field(0, description="Any additional fixed costs for this channel")


class CalculationRequest(BaseModel):
    """Request body for the calculate-channel-decision endpoint."""
    business_context: BusinessContext = Field(default_factory=BusinessContext)
    channels: List[ChannelInput] = Field(..., description="List of channels to analyse")
    scenario_name: Optional[str] = Field("Untitled Scenario", description="Name for this scenario")


class ChannelResult(BaseModel):
    """Full financial metrics for a single channel."""
    name: str
    leads: float
    conversion_rate: float
    expected_customers: float
    expected_revenue: float
    total_variable_cost: float
    contribution: float
    contribution_per_customer: float
    net_profit: float
    break_even_volume: float
    break_even_cash: float
    contribution_margin_pct: float
    cost_per_lead: float
    cac: float  # Customer Acquisition Cost
    roi: float
    profitability_status: str  # "Profitable" | "Break-even" | "Loss-making"


class Recommendation(BaseModel):
    """AI-generated recommendation comparing channels."""
    best_by_profit: str
    best_by_roi: str
    best_by_cac: str
    best_by_lowest_breakeven: str
    summary: str
    interpretation: str
    suggested_decision: str
    risks_and_assumptions: str


class CalculationResponse(BaseModel):
    """Response from the calculate-channel-decision endpoint."""
    success: bool
    channels: List[ChannelResult]
    recommendation: Recommendation
    scenario_id: Optional[str] = None


# ---------------------------------------------------------------------------
# Report layer
# ---------------------------------------------------------------------------

class ReportRequest(BaseModel):
    """Request body for the generate-report endpoint."""
    scenario_name: str
    business_context: BusinessContext
    channels_input: List[ChannelInput]
    calculation_results: List[Dict[str, Any]]
    recommendation: Dict[str, Any]
    user_text: Optional[str] = None
