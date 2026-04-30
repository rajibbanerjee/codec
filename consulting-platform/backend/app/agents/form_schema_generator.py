"""
Form Schema Generator Agent

Takes the interpreted context (from UserScriptInterpreterAgent) and
generates a structured FormSchema that drives the dynamic frontend form.

Rules:
- Approximate values → "slider" type
- Exact values → "number" type
- Enum/categorical fields → "dropdown" type
- Slider min/max is derived from the extracted value
- Required fields: leads, conversion_rate, selling_price, variable_cost_per_customer, marketing_spend
"""

from typing import Any, Dict, List, Optional

from app.models.schemas import (
    BusinessContext,
    ChannelFormSection,
    FormField,
    FormSchema,
)
from app.utils.constants import APPROXIMATION_KEYWORDS


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _is_approximate_confidence(confidence: Optional[str]) -> bool:
    return confidence in ("estimated",)


def _slider_range(value: float) -> tuple[float, float]:
    """
    Generate a sensible min/max range for a slider based on the value.
    The range is set so the value sits roughly in the middle lower quartile.
    """
    if value <= 0:
        return 0.0, 100.0
    # Use 0 as min; max = value * 4 (rounded to a nice number)
    raw_max = value * 4
    # Round up to nearest order of magnitude step
    magnitude = 10 ** (len(str(int(raw_max))) - 1)
    nice_max = ((int(raw_max) // magnitude) + 1) * magnitude
    return 0.0, float(nice_max)


def _currency_unit(currency: str) -> str:
    symbols = {"INR": "₹", "USD": "$", "GBP": "£", "EUR": "€"}
    return symbols.get(currency, currency)


# ---------------------------------------------------------------------------
# Field builders
# ---------------------------------------------------------------------------

def _build_leads_field(channel_data: Dict[str, Any], currency: str) -> FormField:
    value = channel_data.get("leads")
    confidence = channel_data.get("leads_confidence", "unknown")
    is_approx = _is_approximate_confidence(confidence)

    if value is not None and is_approx:
        lo, hi = _slider_range(value)
        return FormField(
            name="leads",
            label="Expected Leads / Visitors",
            type="slider",
            value=value,
            min=lo,
            max=hi,
            unit="leads",
            confidence=confidence,
            required=True,
        )
    return FormField(
        name="leads",
        label="Expected Leads / Visitors",
        type="number",
        value=value,
        unit="leads",
        confidence=confidence,
        required=True,
    )


def _build_conversion_field(channel_data: Dict[str, Any], currency: str) -> FormField:
    value = channel_data.get("conversion_rate")
    confidence = channel_data.get("conversion_confidence", "unknown")
    is_approx = _is_approximate_confidence(confidence)

    if value is not None and is_approx:
        return FormField(
            name="conversion_rate",
            label="Conversion Rate",
            type="slider",
            value=value,
            min=0.0,
            max=100.0,
            unit="%",
            confidence=confidence,
            required=True,
        )
    return FormField(
        name="conversion_rate",
        label="Conversion Rate",
        type="number",
        value=value,
        unit="%",
        confidence=confidence,
        required=True,
    )


def _build_selling_price_field(channel_data: Dict[str, Any], currency: str) -> FormField:
    value = channel_data.get("selling_price")
    confidence = channel_data.get("price_confidence", "unknown")
    is_approx = _is_approximate_confidence(confidence)
    unit = _currency_unit(currency)

    if value is not None and is_approx:
        lo, hi = _slider_range(value)
        return FormField(
            name="selling_price",
            label="Selling Price / Revenue per Customer",
            type="slider",
            value=value,
            min=lo,
            max=hi,
            unit=unit,
            confidence=confidence,
            required=True,
        )
    return FormField(
        name="selling_price",
        label="Selling Price / Revenue per Customer",
        type="number",
        value=value,
        unit=unit,
        confidence=confidence,
        required=True,
    )


def _build_variable_cost_field(channel_data: Dict[str, Any], currency: str) -> FormField:
    value = channel_data.get("variable_cost_per_customer")
    confidence = channel_data.get("cost_confidence", "unknown")
    is_approx = _is_approximate_confidence(confidence)
    unit = _currency_unit(currency)

    if value is not None and is_approx:
        lo, hi = _slider_range(value)
        return FormField(
            name="variable_cost_per_customer",
            label="Variable Cost per Customer",
            type="slider",
            value=value,
            min=lo,
            max=hi,
            unit=unit,
            confidence=confidence,
            required=True,
        )
    return FormField(
        name="variable_cost_per_customer",
        label="Variable Cost per Customer",
        type="number",
        value=value,
        unit=unit,
        confidence=confidence,
        required=True,
    )


def _build_marketing_spend_field(channel_data: Dict[str, Any], currency: str) -> FormField:
    value = channel_data.get("marketing_spend")
    confidence = channel_data.get("spend_confidence", "unknown")
    is_approx = _is_approximate_confidence(confidence)
    unit = _currency_unit(currency)

    if value is not None and is_approx:
        lo, hi = _slider_range(value)
        return FormField(
            name="marketing_spend",
            label="Marketing Spend / Budget",
            type="slider",
            value=value,
            min=lo,
            max=hi,
            unit=unit,
            confidence=confidence,
            required=True,
        )
    return FormField(
        name="marketing_spend",
        label="Marketing Spend / Budget",
        type="number",
        value=value,
        unit=unit,
        confidence=confidence,
        required=True,
    )


def _build_additional_fixed_cost_field(channel_data: Dict[str, Any], currency: str) -> FormField:
    value = channel_data.get("additional_fixed_cost")
    unit = _currency_unit(currency)
    return FormField(
        name="additional_fixed_cost",
        label="Additional Fixed Cost (optional)",
        type="number",
        value=value if value is not None else 0,
        unit=unit,
        confidence="exact",
        required=False,
    )


# ---------------------------------------------------------------------------
# Main public function
# ---------------------------------------------------------------------------

def generate_form_schema(interpreted_context: Dict[str, Any]) -> FormSchema:
    """
    Convert the raw interpreted context into a FormSchema.

    Parameters
    ----------
    interpreted_context : dict
        Output from `interpret_user_script()`, containing:
        - business_type, currency, time_period
        - channels: list of channel dicts with extracted values
        - warnings: list of warning strings

    Returns
    -------
    FormSchema
        Pydantic model ready to serialize and send to the frontend.
    """
    business_type = interpreted_context.get("business_type", "B2B")
    currency = interpreted_context.get("currency", "USD")
    time_period = interpreted_context.get("time_period", "Campaign")
    raw_channels: List[Dict[str, Any]] = interpreted_context.get("channels", [])
    context_warnings: List[str] = interpreted_context.get("warnings", [])

    # Build BusinessContext with dropdown fields
    business_context = BusinessContext(
        business_type=business_type,
        currency=currency,
        time_period=time_period,
        objective="profit_maximization",
    )

    # Build channel form sections
    channel_sections: List[ChannelFormSection] = []
    missing_fields: List[str] = []

    for ch in raw_channels:
        channel_name = ch.get("name", "Unknown Channel")

        fields: List[FormField] = [
            _build_leads_field(ch, currency),
            _build_conversion_field(ch, currency),
            _build_selling_price_field(ch, currency),
            _build_variable_cost_field(ch, currency),
            _build_marketing_spend_field(ch, currency),
            _build_additional_fixed_cost_field(ch, currency),
        ]

        # Track missing required fields
        for field in fields:
            if field.required and field.value is None:
                missing_fields.append(f"{channel_name}: {field.label}")

        channel_sections.append(ChannelFormSection(name=channel_name, fields=fields))

    # Build warnings list
    warnings: List[str] = list(context_warnings)
    if missing_fields:
        warnings.append(
            f"{len(missing_fields)} required field(s) could not be auto-filled and need manual entry."
        )

    return FormSchema(
        business_context=business_context,
        channels=channel_sections,
        missing_fields=missing_fields,
        warnings=warnings,
    )
