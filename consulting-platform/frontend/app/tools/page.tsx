import ToolCard from "@/components/ToolCard"

const tools = [
  { name: "Marketing Channel Decision Tool", category: "Finance", description: "Compare marketing channels using contribution analysis, break-even modelling, ROI, and CAC. Enter plain English and get a full dashboard.", accessType: "Free" as const, status: "Available" as const, href: "/tools/short-run-marketing-decision" },
  { name: "Product Pricing Decision Tool", category: "Finance", description: "Analyse pricing strategies using cost-plus, value-based, and competitive pricing frameworks.", accessType: "Paid" as const, status: "Coming Soon" as const },
  { name: "Make vs Buy Decision Tool", category: "Finance", description: "Evaluate outsourcing vs in-house decisions using total cost of ownership analysis.", accessType: "Paid" as const, status: "Coming Soon" as const },
  { name: "Customer Profitability Tool", category: "Finance", description: "Segment customers by contribution, identify loss-making segments, and prioritise retention.", accessType: "Subscription" as const, status: "Coming Soon" as const },
  { name: "Working Capital Diagnostic Tool", category: "Finance", description: "Diagnose cash conversion cycle inefficiencies and model working capital improvement scenarios.", accessType: "Subscription" as const, status: "Coming Soon" as const },
  { name: "Strategy Fit Assessment Tool", category: "Strategy", description: "Evaluate strategic options against organisational capabilities and market conditions.", accessType: "Paid" as const, status: "Coming Soon" as const },
  { name: "Design Thinking Opportunity Mapper", category: "Design Thinking", description: "Map customer pain points to innovation opportunities using structured frameworks.", accessType: "Paid" as const, status: "Coming Soon" as const },
  { name: "Project Risk Assessment Tool", category: "IT / Project Management", description: "Identify and score project risks with mitigation planning and visual risk matrices.", accessType: "Paid" as const, status: "Coming Soon" as const },
  { name: "IT Portfolio Prioritisation Tool", category: "IT / Project Management", description: "Prioritise IT initiatives using value vs effort scoring and strategic alignment.", accessType: "Subscription" as const, status: "Coming Soon" as const },
]

export default function ToolsPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Tools Marketplace</h1>
          <p className="text-slate-500 max-w-xl mx-auto">
            Decision support tools built on proven management frameworks. Free tools available now — more launching soon.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((t) => (
            <ToolCard key={t.name} {...t} />
          ))}
        </div>
      </div>
    </div>
  )
}
