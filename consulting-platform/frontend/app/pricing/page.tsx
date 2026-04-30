import PricingCard from "@/components/PricingCard"

const plans = [
  {
    name: "Free",
    price: "$0",
    billing: "forever",
    description: "Get started with basic decision tools.",
    features: [
      "Up to 2 marketing channels",
      "Basic financial dashboard",
      "Break-even & contribution analysis",
      "Limited PDF export",
      "Help guide access",
    ],
    cta: "Start Free",
  },
  {
    name: "Professional",
    price: "$29",
    billing: "/ month",
    description: "For individuals who need full access.",
    features: [
      "Up to 10 marketing channels",
      "Full financial dashboard",
      "Save scenarios",
      "PDF export & report download",
      "Advanced assumptions",
      "Sensitivity analysis (coming soon)",
      "Priority email support",
    ],
    cta: "Start Trial",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$99",
    billing: "/ month",
    description: "For teams and growing organisations.",
    features: [
      "Everything in Professional",
      "Up to 5 team members",
      "Scenario history",
      "Advanced dashboards",
      "Custom scenarios",
      "Multi-user access",
    ],
    cta: "Contact Sales",
  },
  {
    name: "Consulting",
    price: "Custom",
    description: "Expert-led consulting with tailored tools.",
    features: [
      "Everything in Business",
      "Expert review sessions",
      "Custom reports",
      "Dedicated consulting hours",
      "Tailored recommendations",
      "Bespoke tool development",
    ],
    cta: "Talk to Us",
  },
]

export default function PricingPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Simple, Transparent Pricing</h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            Start free. Upgrade when you need more power. Cancel anytime.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {plans.map((p) => <PricingCard key={p.name} {...p} />)}
        </div>
        <p className="text-center text-sm text-slate-400 mt-10">
          All plans include access to the free Marketing Channel Decision Tool. Paid plans billed monthly or annually (save 20% annually).
        </p>
      </div>
    </div>
  )
}
