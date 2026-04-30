"""
Validation Service - validates channel inputs and returns user-friendly errors.
"""

from typing import List, Tuple
from app.models.schemas import ChannelInput


def validate_channels(channels: List[ChannelInput]) -> Tuple[bool, List[str]]:
    errors = []
    for ch in channels:
        name = ch.name or "Unnamed Channel"
        if ch.leads < 0:
            errors.append(f"{name}: Leads cannot be negative.")
        if not (0 <= ch.conversion_rate <= 100):
            errors.append(f"{name}: Conversion rate must be between 0 and 100.")
        if ch.selling_price <= 0:
            errors.append(f"{name}: Selling price must be positive.")
        if ch.variable_cost_per_customer < 0:
            errors.append(f"{name}: Variable cost cannot be negative.")
        if ch.marketing_spend < 0:
            errors.append(f"{name}: Marketing spend cannot be negative.")
        if ch.variable_cost_per_customer >= ch.selling_price and ch.selling_price > 0:
            errors.append(f"{name}: Variable cost equals or exceeds selling price — contribution will be zero or negative.")
    return (len(errors) == 0, errors)
