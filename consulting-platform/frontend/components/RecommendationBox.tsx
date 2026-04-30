import { Recommendation } from "@/types/finance"
import { Trophy, TrendingUp, Users, AlertTriangle } from "lucide-react"

interface Props {
  recommendation: Recommendation
  currency: string
}

export default function RecommendationBox({ recommendation }: Props) {
  return (
    <div className="bg-slate-900 text-white rounded-xl p-6 space-y-5">
      <h3 className="font-bold text-lg text-white">Managerial Recommendation</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <Trophy className="h-4 w-4" />, label: "Best by Profit", value: recommendation.best_by_profit },
          { icon: <TrendingUp className="h-4 w-4" />, label: "Best by ROI", value: recommendation.best_by_roi },
          { icon: <Users className="h-4 w-4" />, label: "Lowest CAC", value: recommendation.best_by_cac },
          { icon: <AlertTriangle className="h-4 w-4" />, label: "Lowest Break-even", value: recommendation.best_by_lowest_breakeven },
        ].map((item) => (
          <div key={item.label} className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-teal-300 mb-1">{item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </div>
            <p className="font-bold text-sm">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3 text-sm leading-relaxed">
        <div>
          <p className="text-teal-300 text-xs font-semibold uppercase tracking-wide mb-1">Summary</p>
          <p className="text-slate-300">{recommendation.summary}</p>
        </div>
        <div>
          <p className="text-teal-300 text-xs font-semibold uppercase tracking-wide mb-1">Suggested Decision</p>
          <p className="text-slate-200 font-medium">{recommendation.suggested_decision}</p>
        </div>
        <div>
          <p className="text-teal-300 text-xs font-semibold uppercase tracking-wide mb-1">Interpretation</p>
          <p className="text-slate-300">{recommendation.interpretation}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          <p className="text-amber-300 text-xs font-semibold uppercase tracking-wide mb-1">Risks & Assumptions</p>
          <p className="text-slate-300 text-xs">{recommendation.risks_and_assumptions}</p>
        </div>
      </div>
    </div>
  )
}
