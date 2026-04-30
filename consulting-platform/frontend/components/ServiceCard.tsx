import { ReactNode } from "react"

interface ServiceCardProps {
  icon: ReactNode
  title: string
  description: string
  problems: string[]
  tools: string[]
  comingSoon?: string[]
}

export default function ServiceCard({ icon, title, description, problems, tools, comingSoon }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
          {icon}
        </div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Problems Solved</p>
        <ul className="space-y-1">
          {problems.map((p) => (
            <li key={p} className="text-xs text-slate-600 flex items-start gap-1.5">
              <span className="text-teal-500 mt-0.5">✓</span> {p}
            </li>
          ))}
        </ul>
      </div>
      {tools.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Available Tools</p>
          <div className="flex flex-wrap gap-1">
            {tools.map((t) => (
              <span key={t} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      )}
      {comingSoon && comingSoon.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Coming Soon</p>
          <div className="flex flex-wrap gap-1">
            {comingSoon.map((t) => (
              <span key={t} className="text-xs bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
