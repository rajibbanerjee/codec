"use client"
import { CalculationResponse } from "@/types/finance"
import { formatCurrency, formatPct } from "@/lib/utils"
import MetricCard from "./MetricCard"
import ResultTable from "./ResultTable"
import RecommendationBox from "./RecommendationBox"
import { Trophy, TrendingUp, Target, DollarSign, Users } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"

interface Props {
  data: CalculationResponse
  currency: string
  onDownload: () => void
  downloading: boolean
}

export default function DecisionDashboard({ data, currency, onDownload, downloading }: Props) {
  const { channels, recommendation } = data

  const totalProfit = channels.reduce((sum, c) => sum + c.net_profit, 0)
  const bestChannel = channels.find((c) => c.name === recommendation.best_by_profit)

  const chartData = channels.map((c) => ({
    name: c.name,
    Revenue: Math.round(c.expected_revenue),
    Profit: Math.round(c.net_profit),
    Contribution: Math.round(c.contribution),
  }))

  const roiData = channels.map((c) => ({ name: c.name, ROI: parseFloat((c.roi * 100).toFixed(1)) }))
  const cacData = channels.map((c) => ({ name: c.name, CAC: Math.round(c.cac) }))
  const bevData = channels.map((c) => ({
    name: c.name,
    "Break-even Volume": c.break_even_volume > 999999 ? 0 : Math.round(c.break_even_volume),
  }))

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Best Channel (Profit)"
          value={recommendation.best_by_profit}
          icon={<Trophy className="h-5 w-5" />}
          highlight="green"
        />
        <MetricCard
          label="Best Channel (ROI)"
          value={recommendation.best_by_roi}
          icon={<TrendingUp className="h-5 w-5" />}
          highlight="blue"
        />
        <MetricCard
          label="Total Expected Profit"
          value={formatCurrency(totalProfit, currency)}
          icon={<DollarSign className="h-5 w-5" />}
          highlight={totalProfit >= 0 ? "green" : "red"}
        />
        <MetricCard
          label="Best CAC"
          value={bestChannel ? formatCurrency(bestChannel.cac, currency) : "N/A"}
          sub={recommendation.best_by_cac}
          icon={<Users className="h-5 w-5" />}
          highlight="default"
        />
      </div>

      {/* Per-channel break-even */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((ch) => (
          <div key={ch.name} className="bg-white rounded-xl border p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">{ch.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                ch.profitability_status === "Profitable" ? "bg-green-100 text-green-700" :
                ch.profitability_status === "Loss-making" ? "bg-red-100 text-red-700" :
                "bg-amber-100 text-amber-700"}`}>
                {ch.profitability_status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div><span className="text-slate-400">Customers:</span> {ch.expected_customers.toFixed(0)}</div>
              <div><span className="text-slate-400">Revenue:</span> {formatCurrency(ch.expected_revenue, currency)}</div>
              <div><span className="text-slate-400">Net Profit:</span>
                <span className={ch.net_profit < 0 ? " text-red-600 font-semibold" : " text-green-600 font-semibold"}>
                  {" "}{formatCurrency(ch.net_profit, currency)}
                </span>
              </div>
              <div><span className="text-slate-400">ROI:</span> {formatPct(ch.roi)}</div>
              <div><span className="text-slate-400">BEV:</span> {ch.break_even_volume > 999999 ? "∞" : ch.break_even_volume.toFixed(0)}</div>
              <div><span className="text-slate-400">BEC:</span> {ch.break_even_cash > 999999 ? "∞" : formatCurrency(ch.break_even_cash, currency)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <h4 className="font-semibold text-slate-800 mb-4 text-sm">Revenue vs Profit vs Contribution</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Revenue" fill="#0f766e" radius={[3,3,0,0]} />
              <Bar dataKey="Contribution" fill="#0ea5e9" radius={[3,3,0,0]} />
              <Bar dataKey="Profit" fill="#15803d" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <h4 className="font-semibold text-slate-800 mb-4 text-sm">ROI Comparison (%)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={roiData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip formatter={(v) => `${Number(v)}%`} />
              <Bar dataKey="ROI" fill="#7c3aed" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <h4 className="font-semibold text-slate-800 mb-4 text-sm">Customer Acquisition Cost (CAC)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cacData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatCurrency(Number(v), currency)} />
              <Bar dataKey="CAC" fill="#f59e0b" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <h4 className="font-semibold text-slate-800 mb-4 text-sm">Break-even Volume</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bevData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="Break-even Volume" fill="#dc2626" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full results table */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3">Detailed Results</h3>
        <ResultTable results={channels} currency={currency} />
      </div>

      {/* Recommendation */}
      <RecommendationBox recommendation={recommendation} currency={currency} />

      {/* Download */}
      <div className="flex justify-end">
        <button
          onClick={onDownload}
          disabled={downloading}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-60 text-sm font-medium">
          <Target className="h-4 w-4" />
          {downloading ? "Generating PDF..." : "Download PDF Report"}
        </button>
      </div>
    </div>
  )
}
