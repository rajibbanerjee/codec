"""
Finance Calculations Service

Pure financial computation functions. No I/O or external dependencies.
All calculations follow standard short-run contribution analysis methodology.
"""

from typing import List

from app.models.schemas import ChannelInput, ChannelResult

_LARGE_NUMBER = 999_999_999.0  # Sentinel for divide-by-zero results (infinity proxy)


def calculate_channel_metrics(channel: ChannelInput) -> ChannelResult:
    """
    Calculate all financial metrics for a single marketing channel.

    Formulae
    --------
    1.  Expected Customers      = Leads × (Conversion Rate / 100)
    2.  Expected Revenue        = Expected Customers × Selling Price
    3.  Total Variable Cost     = Expected Customers × Variable Cost per Customer
    4.  Contribution            = Expected Revenue − Total Variable Cost
    5.  Contribution per Cust.  = Selling Price − Variable Cost per Customer
    6.  Net Profit              = Contribution − Marketing Spend − Additional Fixed Cost
    7.  Break-even Volume       = (Marketing Spend + Additional Fixed Cost) / Contribution per Customer
                                  → ∞ (large sentinel) if Contribution per Customer == 0
    8.  Break-even Cash         = Break-even Volume × Selling Price
    9.  Contribution Margin %   = (Contribution / Expected Revenue) × 100  (0 if revenue == 0)
    10. Cost per Lead           = Marketing Spend / Leads                  (0 if leads == 0)
    11. CAC                     = Marketing Spend / Expected Customers      (0 if customers == 0)
    12. ROI                     = Net Profit / Marketing Spend             (0 if marketing_spend == 0)
    13. Profitability Status    = "Profitable" | "Break-even" | "Loss-making"
    """

    leads = max(channel.leads, 0.0)
    conversion_rate = max(min(channel.conversion_rate, 100.0), 0.0)
    selling_price = max(channel.selling_price, 0.0)
    variable_cost_per_customer = max(channel.variable_cost_per_customer, 0.0)
    marketing_spend = max(channel.marketing_spend, 0.0)
    additional_fixed_cost = max(channel.additional_fixed_cost, 0.0)

    # 1. Expected Customers
    expected_customers = leads * (conversion_rate / 100.0)

    # 2. Expected Revenue
    expected_revenue = expected_customers * selling_price

    # 3. Total Variable Cost
    total_variable_cost = expected_customers * variable_cost_per_customer

    # 4. Contribution
    contribution = expected_revenue - total_variable_cost

    # 5. Contribution per Customer
    contribution_per_customer = selling_price - variable_cost_per_customer

    # 6. Net Profit
    net_profit = contribution - marketing_spend - additional_fixed_cost

    # 7. Break-even Volume
    total_fixed_costs = marketing_spend + additional_fixed_cost
    if contribution_per_customer == 0:
        break_even_volume = _LARGE_NUMBER
    else:
        break_even_volume = total_fixed_costs / contribution_per_customer

    # 8. Break-even Cash
    break_even_cash = break_even_volume * selling_price if break_even_volume < _LARGE_NUMBER else _LARGE_NUMBER

    # 9. Contribution Margin %
    contribution_margin_pct = (contribution / expected_revenue * 100.0) if expected_revenue > 0 else 0.0

    # 10. Cost per Lead
    cost_per_lead = marketing_spend / leads if leads > 0 else 0.0

    # 11. CAC
    cac = marketing_spend / expected_customers if expected_customers > 0 else 0.0

    # 12. ROI
    roi = net_profit / marketing_spend if marketing_spend > 0 else 0.0

    # 13. Profitability Status
    if net_profit > 0:
        profitability_status = "Profitable"
    elif net_profit == 0:
        profitability_status = "Break-even"
    else:
        profitability_status = "Loss-making"

    return ChannelResult(
        name=channel.name,
        leads=leads,
        conversion_rate=conversion_rate,
        expected_customers=round(expected_customers, 2),
        expected_revenue=round(expected_revenue, 2),
        total_variable_cost=round(total_variable_cost, 2),
        contribution=round(contribution, 2),
        contribution_per_customer=round(contribution_per_customer, 2),
        net_profit=round(net_profit, 2),
        break_even_volume=round(break_even_volume, 2),
        break_even_cash=round(break_even_cash, 2),
        contribution_margin_pct=round(contribution_margin_pct, 2),
        cost_per_lead=round(cost_per_lead, 2),
        cac=round(cac, 2),
        roi=round(roi, 4),
        profitability_status=profitability_status,
    )


def calculate_all_channels(channels: List[ChannelInput]) -> List[ChannelResult]:
    """Calculate metrics for all channels."""
    return [calculate_channel_metrics(ch) for ch in channels]
