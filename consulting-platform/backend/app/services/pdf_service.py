"""
PDF Report Generation Service using ReportLab.
"""

import os
import uuid
from datetime import datetime
from typing import Any, Dict, List

REPORTS_DIR = "/tmp/reports"
os.makedirs(REPORTS_DIR, exist_ok=True)

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.platypus import (
        Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle, HRFlowable
    )
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


NAVY   = colors.HexColor("#1e293b") if REPORTLAB_AVAILABLE else None
TEAL   = colors.HexColor("#0f766e") if REPORTLAB_AVAILABLE else None
LIGHT  = colors.HexColor("#f1f5f9") if REPORTLAB_AVAILABLE else None
WHITE  = colors.white if REPORTLAB_AVAILABLE else None
GREEN  = colors.HexColor("#15803d") if REPORTLAB_AVAILABLE else None
RED    = colors.HexColor("#b91c1c") if REPORTLAB_AVAILABLE else None


def _currency_prefix(currency: str) -> str:
    return {"INR": "₹", "USD": "$", "EUR": "€", "GBP": "£"}.get(currency, "")


def _fmt(value: float, currency: str = "") -> str:
    prefix = _currency_prefix(currency)
    if abs(value) >= 1_000_000:
        return f"{prefix}{value/1_000_000:.2f}M"
    if abs(value) >= 1_000:
        return f"{prefix}{value/1_000:.1f}K"
    return f"{prefix}{value:,.2f}"


def generate_pdf(
    scenario_name: str,
    business_context: Dict[str, Any],
    channels_input: List[Dict[str, Any]],
    calculation_results: List[Dict[str, Any]],
    recommendation: Dict[str, Any],
    user_text: str = "",
) -> str:
    """Generate PDF and return file path. Raises RuntimeError if reportlab unavailable."""
    if not REPORTLAB_AVAILABLE:
        raise RuntimeError("ReportLab is not installed. Run: pip install reportlab")

    filename = f"{uuid.uuid4().hex}.pdf"
    filepath = os.path.join(REPORTS_DIR, filename)
    currency = business_context.get("currency", "USD")

    styles = getSampleStyleSheet()
    h1 = ParagraphStyle("h1", parent=styles["Heading1"], textColor=NAVY, fontSize=16, spaceAfter=6)
    h2 = ParagraphStyle("h2", parent=styles["Heading2"], textColor=TEAL, fontSize=12, spaceAfter=4)
    body = ParagraphStyle("body", parent=styles["Normal"], fontSize=9, spaceAfter=4, leading=13)
    small = ParagraphStyle("small", parent=styles["Normal"], fontSize=8, textColor=colors.grey)

    doc = SimpleDocTemplate(filepath, pagesize=A4,
                            leftMargin=2*cm, rightMargin=2*cm,
                            topMargin=2*cm, bottomMargin=2*cm)
    story = []

    # --- Header ---
    story.append(Paragraph("StratEdge Consulting", h1))
    story.append(Paragraph("Short Run Financial Decision Making – Marketing Channel Decision Tool", h2))
    story.append(Paragraph(f"Scenario: <b>{scenario_name}</b> | Generated: {datetime.now().strftime('%d %b %Y %H:%M')}", small))
    story.append(HRFlowable(width="100%", thickness=1, color=NAVY))
    story.append(Spacer(1, 0.3*cm))

    # --- Executive Summary ---
    story.append(Paragraph("Executive Summary", h2))
    story.append(Paragraph(recommendation.get("summary", ""), body))
    story.append(Spacer(1, 0.3*cm))

    # --- Business Context ---
    story.append(Paragraph("Business Context", h2))
    ctx_data = [["Parameter", "Value"],
                ["Business Type", business_context.get("business_type", "")],
                ["Currency", currency],
                ["Time Period", business_context.get("time_period", "")],
                ["Objective", business_context.get("objective", "").replace("_", " ").title()]]
    ctx_table = Table(ctx_data, colWidths=[6*cm, 10*cm])
    ctx_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), NAVY),
        ("TEXTCOLOR", (0,0), (-1,0), WHITE),
        ("FONTSIZE", (0,0), (-1,-1), 9),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [LIGHT, WHITE]),
        ("GRID", (0,0), (-1,-1), 0.5, colors.lightgrey),
        ("PADDING", (0,0), (-1,-1), 5),
    ]))
    story.append(ctx_table)
    story.append(Spacer(1, 0.4*cm))

    # --- Input Assumptions ---
    story.append(Paragraph("Input Assumptions", h2))
    in_headers = ["Channel", "Leads", "Conv. Rate", "Selling Price", "Var. Cost", "Mktg Spend"]
    in_rows = [in_headers]
    for ch in channels_input:
        in_rows.append([
            ch.get("name", ""),
            str(int(ch.get("leads", 0))),
            f"{ch.get('conversion_rate', 0)}%",
            _fmt(ch.get("selling_price", 0), currency),
            _fmt(ch.get("variable_cost_per_customer", 0), currency),
            _fmt(ch.get("marketing_spend", 0), currency),
        ])
    in_table = Table(in_rows, colWidths=[3.5*cm, 2*cm, 2.5*cm, 3.5*cm, 3*cm, 3*cm])
    in_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), TEAL),
        ("TEXTCOLOR", (0,0), (-1,0), WHITE),
        ("FONTSIZE", (0,0), (-1,-1), 8),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [LIGHT, WHITE]),
        ("GRID", (0,0), (-1,-1), 0.5, colors.lightgrey),
        ("PADDING", (0,0), (-1,-1), 4),
    ]))
    story.append(in_table)
    story.append(Spacer(1, 0.4*cm))

    # --- Calculation Results ---
    story.append(Paragraph("Calculation Results", h2))
    res_headers = ["Channel", "Customers", "Revenue", "Contribution", "Net Profit", "ROI", "BEV", "Status"]
    res_rows = [res_headers]
    for res in calculation_results:
        status = res.get("profitability_status", "")
        res_rows.append([
            res.get("name", ""),
            str(int(res.get("expected_customers", 0))),
            _fmt(res.get("expected_revenue", 0), currency),
            _fmt(res.get("contribution", 0), currency),
            _fmt(res.get("net_profit", 0), currency),
            f"{res.get('roi', 0)*100:.1f}%",
            str(int(res.get("break_even_volume", 0))),
            status,
        ])
    res_table = Table(res_rows, colWidths=[3*cm, 2*cm, 2.5*cm, 2.8*cm, 2.5*cm, 1.8*cm, 1.5*cm, 2.4*cm])
    row_styles = [
        ("BACKGROUND", (0,0), (-1,0), NAVY),
        ("TEXTCOLOR", (0,0), (-1,0), WHITE),
        ("FONTSIZE", (0,0), (-1,-1), 8),
        ("GRID", (0,0), (-1,-1), 0.5, colors.lightgrey),
        ("PADDING", (0,0), (-1,-1), 4),
    ]
    for i, res in enumerate(calculation_results, start=1):
        status = res.get("profitability_status", "")
        bg = GREEN if status == "Profitable" else (RED if status == "Loss-making" else colors.orange)
        row_styles.append(("TEXTCOLOR", (7, i), (7, i), bg))
    res_table.setStyle(TableStyle(row_styles))
    story.append(res_table)
    story.append(Spacer(1, 0.4*cm))

    # --- Recommendation ---
    story.append(Paragraph("Recommendation", h2))
    for label, key in [
        ("Suggested Decision", "suggested_decision"),
        ("Interpretation", "interpretation"),
        ("Risks & Assumptions", "risks_and_assumptions"),
    ]:
        story.append(Paragraph(f"<b>{label}:</b> {recommendation.get(key, '')}", body))
    story.append(Spacer(1, 0.3*cm))

    # --- Footer ---
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.grey))
    story.append(Paragraph(
        "This report is generated for decision support purposes only. "
        "Actual results may vary. StratEdge Consulting accepts no liability for decisions "
        "made solely on the basis of this tool's outputs.",
        small
    ))

    doc.build(story)
    return filepath
