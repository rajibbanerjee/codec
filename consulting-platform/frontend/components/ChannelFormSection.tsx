"use client"
import { ChannelInput, ChannelFormSection as ChannelSchema } from "@/types/finance"
import { Trash2 } from "lucide-react"

interface Props {
  schema?: ChannelSchema
  data: ChannelInput
  index: number
  currency: string
  onChange: (index: number, field: keyof ChannelInput, value: string | number) => void
  onRemove: (index: number) => void
  canRemove: boolean
}

const currencySymbol = (c: string) => ({ USD: "$", INR: "₹", EUR: "€", GBP: "£" }[c] || "")

export default function ChannelFormSection({ schema, data, index, currency, onChange, onRemove, canRemove }: Props) {
  const sym = currencySymbol(currency)

  const field = (
    label: string,
    key: keyof ChannelInput,
    opts: { type?: string; min?: number; max?: number; step?: number; unit?: string; required?: boolean }
  ) => {
    const { type = "number", min = 0, step = 1, unit = "", required = false } = opts
    const schemaField = schema?.fields.find((f) => f.name === key)
    const useSlider = schemaField?.type === "slider"

    return (
      <div key={key} className="space-y-1">
        <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
          {unit && <span className="text-slate-400">({unit})</span>}
        </label>
        {useSlider ? (
          <div className="space-y-1">
            <input
              type="range"
              min={schemaField?.min ?? min}
              max={schemaField?.max ?? 10000}
              step={step}
              value={Number(data[key])}
              onChange={(e) => onChange(index, key, parseFloat(e.target.value))}
              className="w-full accent-teal-600"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">{schemaField?.min ?? min}</span>
              <span className="text-sm font-semibold text-teal-700">
                {sym}{Number(data[key]).toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">{schemaField?.max ?? 10000}</span>
            </div>
          </div>
        ) : (
          <div className="relative">
            {unit === sym && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">{sym}</span>}
            <input
              type={type}
              min={min}
              step={step}
              value={data[key] as number}
              onChange={(e) => onChange(index, key, parseFloat(e.target.value) || 0)}
              className={`w-full border border-slate-200 rounded-lg py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${unit === sym ? "pl-7 pr-3" : "px-3"}`}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">
            {index + 1}
          </span>
          <h3 className="font-semibold text-slate-900">{data.name}</h3>
        </div>
        {canRemove && (
          <button onClick={() => onRemove(index)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mb-3">
        <label className="text-xs font-medium text-slate-600">Channel Name <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange(index, "name", e.target.value)}
          placeholder="e.g. Google Ads"
          className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {field("Expected Leads", "leads", { step: 10, required: true })}
        {field("Conversion Rate", "conversion_rate", { min: 0, step: 0.1, unit: "%", required: true })}
        {field("Selling Price", "selling_price", { step: 100, unit: sym, required: true })}
        {field("Variable Cost / Customer", "variable_cost_per_customer", { step: 100, unit: sym, required: true })}
        {field("Marketing Spend", "marketing_spend", { step: 1000, unit: sym, required: true })}
        {field("Additional Fixed Cost", "additional_fixed_cost", { step: 100, unit: sym })}
      </div>
    </div>
  )
}
