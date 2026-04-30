"use client"
import { useState } from "react"
import { interpretScript, calculateChannels, generateReport, getReportDownloadUrl } from "@/lib/api"
import { FormSchema, ChannelInput, BusinessContext, CalculationResponse } from "@/types/finance"
import ChannelFormSection from "@/components/ChannelFormSection"
import DecisionDashboard from "@/components/DecisionDashboard"
import HelpGuide from "@/components/HelpGuide"
import { Loader2, Plus, Zap, ChevronDown, ChevronUp } from "lucide-react"

const DEFAULT_CHANNEL = (): ChannelInput => ({
  name: "",
  leads: 0,
  conversion_rate: 0,
  selling_price: 0,
  variable_cost_per_customer: 0,
  marketing_spend: 0,
  additional_fixed_cost: 0,
})

const DEFAULT_CONTEXT: BusinessContext = {
  business_type: "B2B",
  currency: "USD",
  time_period: "Campaign",
  objective: "profit_maximization",
}

const EXAMPLE_TEXT = `I am planning to compare Google Ads and LinkedIn Ads for selling a B2B consulting package. Google Ads may generate around 500 leads with 3% conversion. LinkedIn may generate 200 leads with 8% conversion. The consulting package price is around $50,000. Variable delivery cost is approximately $15,000 per client. Google Ads budget is $80,000 and LinkedIn budget is $120,000.`

export default function MarketingDecisionPage() {
  const [userText, setUserText] = useState("")
  const [loading, setLoading] = useState(false)
  const [schema, setSchema] = useState<FormSchema | null>(null)
  const [context, setContext] = useState<BusinessContext>(DEFAULT_CONTEXT)
  const [channels, setChannels] = useState<ChannelInput[]>([DEFAULT_CHANNEL()])
  const [result, setResult] = useState<CalculationResponse | null>(null)
  const [calcLoading, setCalcLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [warnings, setWarnings] = useState<string[]>([])

  async function handleInterpret() {
    if (!userText.trim()) return
    setLoading(true)
    setError(null)
    try {
      const data = await interpretScript(userText)
      const s: FormSchema = data.form_schema
      setSchema(s)
      setContext(s.business_context || DEFAULT_CONTEXT)
      setWarnings(s.warnings || [])

      if (s.channels && s.channels.length > 0) {
        const mapped: ChannelInput[] = s.channels.map((ch) => {
          const getVal = (name: string) => {
            const f = ch.fields.find((ff) => ff.name === name)
            return f?.value ?? 0
          }
          return {
            name: ch.name,
            leads: Number(getVal("leads")),
            conversion_rate: Number(getVal("conversion_rate")),
            selling_price: Number(getVal("selling_price")),
            variable_cost_per_customer: Number(getVal("variable_cost_per_customer")),
            marketing_spend: Number(getVal("marketing_spend")),
            additional_fixed_cost: Number(getVal("additional_fixed_cost")),
          }
        })
        setChannels(mapped)
      }
    } catch (e) {
      setError(`Interpretation failed: ${e instanceof Error ? e.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  function handleChannelChange(index: number, field: keyof ChannelInput, value: string | number) {
    setChannels((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  function addChannel() {
    setChannels((prev) => [...prev, DEFAULT_CHANNEL()])
  }

  function removeChannel(index: number) {
    setChannels((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleCalculate() {
    setCalcLoading(true)
    setError(null)
    setResult(null)
    try {
      const payload = { business_context: context, channels, scenario_name: "Marketing Channel Analysis" }
      const data = await calculateChannels(payload)
      setResult(data)
      setTimeout(() => document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" }), 100)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Calculation failed"
      try {
        const parsed = JSON.parse(msg)
        if (Array.isArray(parsed)) setError(parsed.join("\n"))
        else setError(JSON.stringify(parsed))
      } catch {
        setError(msg)
      }
    } finally {
      setCalcLoading(false)
    }
  }

  async function handleDownload() {
    if (!result) return
    setDownloading(true)
    try {
      const payload = {
        scenario_name: "Marketing Channel Analysis",
        business_context: context,
        channels_input: channels,
        calculation_results: result.channels,
        recommendation: result.recommendation,
        user_text: userText,
      }
      const data = await generateReport(payload)
      const url = getReportDownloadUrl(data.filename)
      window.open(url, "_blank")
    } catch (e) {
      setError(`PDF generation failed: ${e instanceof Error ? e.message : "Unknown error"}`)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Title */}
      <div>
        <div className="text-xs text-teal-600 font-semibold uppercase tracking-wide mb-1">Finance · Short Run Decision Making</div>
        <h1 className="text-2xl font-bold text-slate-900">Marketing Channel Decision Tool</h1>
        <p className="text-slate-500 mt-1 text-sm max-w-2xl">
          Describe your marketing scenario in plain English. The system extracts variables, builds a form,
          and generates a full financial dashboard with break-even analysis, ROI, and a managerial recommendation.
        </p>
      </div>

      {/* Step 1 – Script input */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">1</span>
          <h2 className="font-semibold text-slate-900">Describe Your Decision</h2>
        </div>
        <textarea
          rows={5}
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          placeholder="e.g. I want to compare Google Ads and LinkedIn Ads for a B2B software product. Google Ads may generate around 300 leads with 5% conversion…"
          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <button
            onClick={() => setUserText(EXAMPLE_TEXT)}
            className="text-xs text-teal-600 hover:text-teal-700 underline underline-offset-2">
            Load example scenario
          </button>
          <button
            onClick={handleInterpret}
            disabled={loading || !userText.trim()}
            className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-60 text-sm font-medium">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {loading ? "Interpreting…" : "Generate Decision Form"}
          </button>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700 space-y-1">
          {warnings.map((w, i) => <p key={i}>⚠ {w}</p>)}
        </div>
      )}

      {/* Step 2 – Context */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">2</span>
          <h2 className="font-semibold text-slate-900">Business Context</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Business Type", key: "business_type", options: ["B2B", "B2C"] },
            { label: "Currency", key: "currency", options: ["USD", "INR", "EUR", "GBP"] },
            { label: "Time Period", key: "time_period", options: ["Campaign", "Monthly", "Quarterly", "Annual"] },
            { label: "Objective", key: "objective", options: ["profit_maximization", "roi_maximization", "cac_minimization", "market_reach"] },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs font-medium text-slate-600">{f.label}</label>
              <select
                value={context[f.key as keyof BusinessContext]}
                onChange={(e) => setContext((c) => ({ ...c, [f.key]: e.target.value }))}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                {f.options.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Step 3 – Channels */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">3</span>
          <h2 className="font-semibold text-slate-900">Channel Assumptions</h2>
        </div>
        {channels.map((ch, i) => (
          <ChannelFormSection
            key={i}
            index={i}
            data={ch}
            schema={schema?.channels[i]}
            currency={context.currency}
            onChange={handleChannelChange}
            onRemove={removeChannel}
            canRemove={channels.length > 1}
          />
        ))}
        <button
          onClick={addChannel}
          className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium border border-teal-200 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-lg transition-colors">
          <Plus className="h-4 w-4" /> Add Channel
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 whitespace-pre-line">
          {error}
        </div>
      )}

      {/* Step 4 – Analyse */}
      <div className="flex justify-end">
        <button
          onClick={handleCalculate}
          disabled={calcLoading || channels.length === 0}
          className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-60 font-medium">
          {calcLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {calcLoading ? "Analysing…" : "Analyse Decision"}
        </button>
      </div>

      {/* Dashboard */}
      {result && (
        <div id="dashboard" className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">5</span>
            <h2 className="font-semibold text-slate-900 text-lg">Decision Dashboard</h2>
          </div>
          <DecisionDashboard
            data={result}
            currency={context.currency}
            onDownload={handleDownload}
            downloading={downloading}
          />
        </div>
      )}

      {/* Help */}
      <div className="pt-4">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
          {showHelp ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {showHelp ? "Hide Help Guide" : "Show Help Guide"}
        </button>
        {showHelp && (
          <div className="mt-4">
            <HelpGuide />
          </div>
        )}
      </div>
    </div>
  )
}
