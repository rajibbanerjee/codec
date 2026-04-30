import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface MetricCardProps {
  label: string
  value: string
  sub?: string
  icon?: ReactNode
  highlight?: "green" | "red" | "amber" | "blue" | "default"
}

const highlightMap = {
  green: "border-l-4 border-green-500 bg-green-50",
  red: "border-l-4 border-red-500 bg-red-50",
  amber: "border-l-4 border-amber-500 bg-amber-50",
  blue: "border-l-4 border-blue-500 bg-blue-50",
  default: "border border-slate-200 bg-white",
}

export default function MetricCard({ label, value, sub, icon, highlight = "default" }: MetricCardProps) {
  return (
    <div className={cn("rounded-lg p-4 shadow-sm", highlightMap[highlight])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{label}</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
    </div>
  )
}
