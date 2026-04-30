import ServiceCard from "@/components/ServiceCard"
import { BarChart2, Brain, Target, Layers, Lightbulb, Database } from "lucide-react"

const services = [
  {
    icon: <Target className="h-5 w-5" />,
    title: "Strategy Consulting",
    description: "From competitive analysis to growth strategy, we help you define and execute strategic priorities.",
    problems: ["Unclear competitive position", "Stagnant growth", "Market entry decisions", "M&A evaluation"],
    tools: ["Strategy Fit Assessment"],
    comingSoon: ["Competitive Landscape Mapper", "SWOT Analyser"],
  },
  {
    icon: <BarChart2 className="h-5 w-5" />,
    title: "Finance & Decision Support",
    description: "Short-run and long-run financial decision modelling, pricing, profitability, and capital allocation.",
    problems: ["Which marketing channel to choose", "Pricing uncertainty", "Make vs buy decisions", "Working capital drain"],
    tools: ["Marketing Channel Decision Tool"],
    comingSoon: ["Product Pricing Tool", "Make vs Buy Tool", "Working Capital Diagnostic"],
  },
  {
    icon: <Lightbulb className="h-5 w-5" />,
    title: "Design Thinking & Innovation",
    description: "Human-centred frameworks to identify opportunities, prototype ideas, and validate assumptions.",
    problems: ["Customer pain point discovery", "Idea prioritisation", "Innovation pipeline management"],
    tools: [],
    comingSoon: ["Opportunity Mapper", "Idea Scoring Tool"],
  },
  {
    icon: <Layers className="h-5 w-5" />,
    title: "IT / Project Management",
    description: "Portfolio governance, risk management, and delivery frameworks for technology initiatives.",
    problems: ["Project risk identification", "IT investment prioritisation", "Delivery predictability"],
    tools: [],
    comingSoon: ["Project Risk Assessment", "IT Portfolio Prioritisation"],
  },
  {
    icon: <Brain className="h-5 w-5" />,
    title: "Business Transformation",
    description: "Operating model redesign, change management, and digital adoption for business transformation.",
    problems: ["Organisational inefficiency", "Change resistance", "Digital transformation planning"],
    tools: [],
    comingSoon: ["Transformation Readiness Assessment", "Change Impact Analyser"],
  },
  {
    icon: <Database className="h-5 w-5" />,
    title: "AI & Data-Driven Decision Making",
    description: "AI-assisted analytics, scenario modelling, and evidence-based decision frameworks.",
    problems: ["Data overload without insights", "Inconsistent decision quality", "Bias in judgement"],
    tools: ["Marketing Channel Decision Tool"],
    comingSoon: ["Scenario Modelling Suite", "Data Dashboard Builder"],
  },
]

export default function ServicesPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Consulting Services</h1>
          <p className="text-slate-500 max-w-xl mx-auto">
            Structured consulting domains with integrated digital tools, frameworks, and expert support.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => <ServiceCard key={s.title} {...s} />)}
        </div>
      </div>
    </div>
  )
}
