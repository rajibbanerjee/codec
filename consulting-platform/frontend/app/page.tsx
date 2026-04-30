import Link from "next/link"
import { ArrowRight, BarChart2, Brain, Target, Layers, Lightbulb, Database, Shield } from "lucide-react"
import ToolCard from "@/components/ToolCard"

const domains = [
  { icon: <Target className="h-5 w-5" />, title: "Strategy", desc: "Competitive positioning, growth planning, and strategic fit assessment." },
  { icon: <BarChart2 className="h-5 w-5" />, title: "Finance & Decision Support", desc: "Short-run decisions, pricing, profitability analysis, and capital allocation." },
  { icon: <Lightbulb className="h-5 w-5" />, title: "Design Thinking", desc: "Opportunity mapping, ideation, and human-centred problem solving." },
  { icon: <Layers className="h-5 w-5" />, title: "IT / Project Management", desc: "Portfolio prioritisation, risk assessment, and delivery frameworks." },
  { icon: <Brain className="h-5 w-5" />, title: "Business Transformation", desc: "Change management, operating model design, and digital adoption." },
  { icon: <Database className="h-5 w-5" />, title: "Data-Driven Decisions", desc: "AI-assisted analytics, scenario modelling, and evidence-based strategy." },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 text-sm px-3 py-1 rounded-full mb-6">
            <Shield className="h-3.5 w-3.5" /> Management Consulting Platform
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Make Better Business Decisions<br />
            <span className="text-teal-400"> With Confidence</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            A practical decision-support platform for managers, founders, and business professionals
            who want to make better strategic, financial, and operational decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tools" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-medium px-6 py-3 rounded-lg transition-colors">
              Explore Tools <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/services" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-lg transition-colors">
              Our Services
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Consulting Domains</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Structured tools and frameworks across every dimension of modern business management.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {domains.map((d) => (
              <div key={d.title} className="flex gap-4 p-5 rounded-xl border border-slate-100 hover:border-teal-200 hover:shadow-sm transition-all">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">{d.icon}</div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{d.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Featured Tool</h2>
            <p className="text-slate-500">Start making data-driven decisions today.</p>
          </div>
          <div className="max-w-md mx-auto">
            <ToolCard
              name="Marketing Channel Decision Tool"
              category="Finance"
              description="Compare marketing channels using contribution analysis, break-even modelling, ROI, and CAC. Enter a plain English scenario and get a full financial dashboard."
              accessType="Free"
              status="Available"
              href="/tools/short-run-marketing-decision"
            />
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-teal-700 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Make Smarter Decisions?</h2>
          <p className="text-teal-100 mb-8">Access our growing library of financial and strategic decision tools — free to start.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/tools/short-run-marketing-decision" className="bg-white text-teal-700 font-medium px-6 py-3 rounded-lg hover:bg-teal-50 transition-colors">
              Try Free Tool Now
            </Link>
            <Link href="/pricing" className="border border-teal-300 text-white font-medium px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
