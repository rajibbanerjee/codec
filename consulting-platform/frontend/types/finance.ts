export interface FormField {
  name: string
  label: string
  type: "slider" | "number" | "dropdown" | "text"
  value?: number | string | null
  min?: number
  max?: number
  unit?: string
  confidence?: "exact" | "estimated" | "unknown"
  required?: boolean
  options?: string[]
}

export interface ChannelFormSection {
  name: string
  fields: FormField[]
}

export interface BusinessContext {
  business_type: string
  currency: string
  time_period: string
  objective: string
}

export interface FormSchema {
  business_context: BusinessContext
  channels: ChannelFormSection[]
  missing_fields: string[]
  warnings: string[]
}

export interface ChannelInput {
  name: string
  leads: number
  conversion_rate: number
  selling_price: number
  variable_cost_per_customer: number
  marketing_spend: number
  additional_fixed_cost: number
}

export interface ChannelResult {
  name: string
  leads: number
  conversion_rate: number
  expected_customers: number
  expected_revenue: number
  total_variable_cost: number
  contribution: number
  contribution_per_customer: number
  net_profit: number
  break_even_volume: number
  break_even_cash: number
  contribution_margin_pct: number
  cost_per_lead: number
  cac: number
  roi: number
  profitability_status: "Profitable" | "Break-even" | "Loss-making"
}

export interface Recommendation {
  best_by_profit: string
  best_by_roi: string
  best_by_cac: string
  best_by_lowest_breakeven: string
  summary: string
  interpretation: string
  suggested_decision: string
  risks_and_assumptions: string
}

export interface CalculationResponse {
  success: boolean
  channels: ChannelResult[]
  recommendation: Recommendation
  scenario_id?: string
}
