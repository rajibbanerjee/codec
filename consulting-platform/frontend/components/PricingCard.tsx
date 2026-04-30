import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface PricingCardProps {
  name: string
  price: string
  billing?: string
  description: string
  features: string[]
  highlighted?: boolean
  cta: string
}

export default function PricingCard({ name, price, billing, description, features, highlighted, cta }: PricingCardProps) {
  return (
    <div className={cn(
      "rounded-xl border p-6 flex flex-col gap-5",
      highlighted
        ? "bg-slate-900 text-white border-slate-700 shadow-xl scale-105"
        : "bg-white border-slate-200 shadow-sm"
    )}>
      <div>
        <h3 className={cn("font-bold text-lg", highlighted ? "text-white" : "text-slate-900")}>{name}</h3>
        <p className={cn("text-sm mt-1", highlighted ? "text-slate-300" : "text-slate-500")}>{description}</p>
      </div>
      <div>
        <span className={cn("text-3xl font-bold", highlighted ? "text-white" : "text-slate-900")}>{price}</span>
        {billing && <span className={cn("text-sm ml-1", highlighted ? "text-slate-400" : "text-slate-500")}>{billing}</span>}
      </div>
      <ul className="space-y-2 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className={cn("h-4 w-4 shrink-0 mt-0.5", highlighted ? "text-teal-400" : "text-teal-600")} />
            <span className={highlighted ? "text-slate-300" : "text-slate-600"}>{f}</span>
          </li>
        ))}
      </ul>
      <button className={cn(
        "w-full py-2.5 rounded-lg font-medium text-sm transition-colors mt-auto",
        highlighted
          ? "bg-teal-500 text-white hover:bg-teal-400"
          : "bg-slate-900 text-white hover:bg-slate-800"
      )}>
        {cta}
      </button>
    </div>
  )
}
