import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency: string = "USD"): string {
  const prefix: Record<string, string> = { USD: "$", INR: "₹", EUR: "€", GBP: "£" }
  const p = prefix[currency] || ""
  if (Math.abs(value) >= 1_000_000) return `${p}${(value / 1_000_000).toFixed(2)}M`
  if (Math.abs(value) >= 1_000) return `${p}${(value / 1_000).toFixed(1)}K`
  return `${p}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
