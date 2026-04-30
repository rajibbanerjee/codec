"""
Recommendation Agent

Analyses ChannelResult objects and produces a human-readable
managerial recommendation comparing all channels.
"""

from typing import List
from app.models.schemas import ChannelResult, Recommendation, BusinessContext

_LARGE = 999_999_999.0


def _best_by(channels: List[ChannelResult], key: str, highest: bool = True) -> str:
    if not channels:
        return "N/A"
    filtered = [c for c in channels if getattr(c, key) < _LARGE]
    if not filtered:
        filtered = channels
    result = max(filtered, key=lambda c: getattr(c, key)) if highest else min(filtered, key=lambda c: getattr(c, key))
    return result.name


def _fmt(value: float, currency: str = "") -> str:
    prefix = {"INR": "₹", "USD": "$", "EUR": "€", "GBP": "£"}.get(currency, "")
    if abs(value) >= 1_000_000:
        return f"{prefix}{value/1_000_000:.2f}M"
    if abs(value) >= 1_000:
        return f"{prefix}{value/1_000:.1f}K"
    return f"{prefix}{value:.2f}"


def generate_recommendation(channels: List[ChannelResult], context: BusinessContext) -> Recommendation:
    cur = context.currency

    best_profit  = _best_by(channels, "net_profit", highest=True)
    best_roi     = _best_by(channels, "roi", highest=True)
    best_cac     = _best_by(channels, "cac", highest=False)
    best_bev     = _best_by(channels, "break_even_volume", highest=False)

    profitable   = [c for c in channels if c.profitability_status == "Profitable"]
    loss_making  = [c for c in channels if c.profitability_status == "Loss-making"]

    # --- Summary ---
    if len(channels) == 1:
        ch = channels[0]
        summary = (
            f"{ch.name} is the only channel analysed. "
            f"Net profit is {_fmt(ch.net_profit, cur)} with an ROI of {ch.roi*100:.1f}%. "
            f"Status: {ch.profitability_status}."
        )
    else:
        names = " vs ".join(c.name for c in channels)
        summary = (
            f"Comparing {names}: "
            f"{best_profit} leads on net profit, "
            f"{best_roi} offers the highest ROI, and "
            f"{best_cac} has the lowest customer acquisition cost."
        )

    # --- Interpretation ---
    lines = []
    for ch in channels:
        roi_pct = f"{ch.roi*100:.1f}%"
        lines.append(
            f"{ch.name}: {ch.expected_customers:.0f} customers expected, "
            f"net profit {_fmt(ch.net_profit, cur)}, ROI {roi_pct}, "
            f"CAC {_fmt(ch.cac, cur)}, break-even at {ch.break_even_volume:.0f} customers. "
            f"Status: {ch.profitability_status}."
        )
    interpretation = " | ".join(lines)

    # --- Suggested Decision ---
    obj = context.objective
    if obj == "roi_maximization":
        winner = best_roi
        rationale = "highest return on marketing investment"
    elif obj == "cac_minimization":
        winner = best_cac
        rationale = "lowest customer acquisition cost"
    elif obj == "market_reach":
        winner = _best_by(channels, "expected_customers", highest=True)
        rationale = "greatest expected customer reach"
    else:  # profit_maximization (default)
        winner = best_profit
        rationale = "highest net profit"

    if profitable:
        suggestion = (
            f"Prioritise {winner} — it delivers the {rationale}. "
        )
        if len(profitable) > 1:
            suggestion += f"All profitable channels ({', '.join(c.name for c in profitable)}) can run concurrently if budget permits."
    elif not loss_making:
        suggestion = f"All channels are at break-even. Consider optimising conversion rates before scaling spend."
    else:
        loss_names = ", ".join(c.name for c in loss_making)
        suggestion = (
            f"Caution: {loss_names} {'is' if len(loss_making)==1 else 'are'} loss-making under current assumptions. "
            f"Revisit pricing, variable cost, or targeting before committing budget."
        )

    # --- Risks ---
    risks = (
        "These projections rely on estimated conversion rates and lead volumes which may differ from actuals. "
        "Variable costs should be reviewed against operational capacity. "
        "External factors (seasonality, competitive response, platform algorithm changes) are not modelled. "
        "Break-even analysis assumes a linear cost structure."
    )

    return Recommendation(
        best_by_profit=best_profit,
        best_by_roi=best_roi,
        best_by_cac=best_cac,
        best_by_lowest_breakeven=best_bev,
        summary=summary,
        interpretation=interpretation,
        suggested_decision=suggestion,
        risks_and_assumptions=risks,
    )
