import Link from "next/link"
import { cn } from "@/lib/utils"

interface ToolCardProps {
  name: string
  category: string
  description: string
  accessType: "Free" | "Paid" | "Subscription"
  status: "Available" | "Coming Soon"
  href?: string
}

const accessColors = {
  Free: "bg-green-100 text-green-700",
  Paid: "bg-blue-100 text-blue-700",
  Subscription: "bg-purple-100 text-purple-700",
}

export default function ToolCard({ name, category, description, accessType, status, href }: ToolCardProps) {
  const isAvailable = status === "Available"

  return (
    <div className={cn(
      "bg-white rounded-xl border p-6 flex flex-col gap-3 shadow-sm transition-shadow",
      isAvailable ? "hover:shadow-md" : "opacity-70"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{category}</span>
          <h3 className="font-semibold text-slate-900 mt-0.5 leading-snug">{name}</h3>
        </div>
        <div className="flex flex-col gap-1 items-end shrink-0">
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", accessColors[accessType])}>
            {accessType}
          </span>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
            isAvailable ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500")}>
            {status}
          </span>
        </div>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed flex-1">{description}</p>
      {isAvailable && href ? (
        <Link href={href}
          className="mt-auto text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
          Launch Tool →
        </Link>
      ) : (
        <span className="mt-auto text-sm text-slate-400">Available soon</span>
      )}
    </div>
  )
}
