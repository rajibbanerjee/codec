"use client"
import { ChannelResult } from "@/types/finance"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

const statusStyle = {
  Profitable: "bg-green-100 text-green-700",
  "Break-even": "bg-amber-100 text-amber-700",
  "Loss-making": "bg-red-100 text-red-700",
}

interface Props {
  results: ChannelResult[]
  currency: string
}

const cols: { key: keyof ChannelResult; label: string; format: (v: number | string, cur: string) => string }[] = [
  { key: "leads", label: "Leads", format: (v) => Number(v).toLocaleString() },
  { key: "conversion_rate", label: "Conv. %", format: (v) => `${v}%` },
  { key: "expected_customers", label: "Customers", format: (v) => Number(v).toFixed(0) },
  { key: "expected_revenue", label: "Revenue", format: (v, c) => formatCurrency(Number(v), c) },
  { key: "contribution", label: "Contribution", format: (v, c) => formatCurrency(Number(v), c) },
  { key: "net_profit", label: "Net Profit", format: (v, c) => formatCurrency(Number(v), c) },
  { key: "break_even_volume", label: "BEV", format: (v) => Number(v) > 999999 ? "∞" : Number(v).toFixed(0) },
  { key: "cac", label: "CAC", format: (v, c) => formatCurrency(Number(v), c) },
  { key: "roi", label: "ROI", format: (v) => `${(Number(v) * 100).toFixed(1)}%` },
  { key: "profitability_status", label: "Status", format: (v) => String(v) },
]

export default function ResultTable({ results, currency }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-slate-900 text-white">
            <th className="px-4 py-3 text-left font-medium">Channel</th>
            {cols.map((c) => (
              <th key={c.key} className="px-4 py-3 text-right font-medium whitespace-nowrap">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((row, i) => (
            <tr key={row.name} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
              <td className="px-4 py-3 font-semibold text-slate-800">{row.name}</td>
              {cols.map((c) => {
                const val = row[c.key]
                const formatted = c.format(val as number | string, currency)
                const isStatus = c.key === "profitability_status"
                return (
                  <td key={c.key} className="px-4 py-3 text-right">
                    {isStatus ? (
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium",
                        statusStyle[val as keyof typeof statusStyle] || "bg-slate-100 text-slate-500")}>
                        {formatted}
                      </span>
                    ) : (
                      <span className={cn(
                        c.key === "net_profit" && Number(val) < 0 ? "text-red-600 font-semibold" :
                        c.key === "net_profit" && Number(val) > 0 ? "text-green-600 font-semibold" : ""
                      )}>{formatted}</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
