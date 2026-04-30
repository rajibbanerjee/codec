from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["help"])


@router.get("/help/short-run-decision")
def get_help():
    return {
        "title": "Short Run Financial Decision Making – Help Guide",
        "sections": [
            {
                "title": "What is Short-Run Decision Making?",
                "content": "Short-run decisions focus on maximising contribution using existing fixed costs. Only variable costs and avoidable fixed costs are relevant. The goal is to find the option that generates the highest contribution margin given current constraints."
            },
            {
                "title": "What is Contribution?",
                "content": "Contribution = Revenue − Variable Costs. It is the amount available to cover fixed costs and generate profit. A positive contribution means each sale helps pay for overheads."
            },
            {
                "title": "What is Break-even Volume?",
                "content": "Break-even Volume = Fixed Costs ÷ Contribution per Customer. It tells you how many customers you need to acquire before the channel starts generating profit."
            },
            {
                "title": "What is Break-even Cash?",
                "content": "Break-even Cash = Break-even Volume × Selling Price. It shows the total revenue needed to cover all costs — the minimum revenue target before the channel becomes worthwhile."
            },
            {
                "title": "What is ROI?",
                "content": "ROI = Net Profit ÷ Marketing Spend. A positive ROI means the channel returned more than it cost. An ROI of 1.5 means every unit of spend returned 1.5 units of profit."
            },
            {
                "title": "What is CAC?",
                "content": "Customer Acquisition Cost (CAC) = Marketing Spend ÷ Customers Acquired. Lower CAC means you are acquiring customers more efficiently. Compare CAC against Customer Lifetime Value (CLV) for long-run viability."
            },
            {
                "title": "How to Interpret Channel Comparison?",
                "content": "Compare channels across: (1) Net Profit — which channel delivers more absolute profit? (2) ROI — which channel is more efficient per unit of spend? (3) CAC — which channel acquires customers cheapest? (4) Break-even Volume — which channel needs fewer customers to become profitable? Choose based on your primary objective."
            },
            {
                "title": "What Assumptions Matter Most?",
                "content": "Conversion Rate and Selling Price are the most sensitive variables. A small change in either has a large impact on profitability. Treat all estimated values (shown as sliders) as ranges, not certainties. Run multiple scenarios by adjusting assumptions."
            },
        ]
    }
