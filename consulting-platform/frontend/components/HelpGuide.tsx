"use client"
import { useState, useEffect } from "react"
import { getHelp } from "@/lib/api"
import { ChevronDown, ChevronUp } from "lucide-react"

interface HelpSection { title: string; content: string }

export default function HelpGuide() {
  const [sections, setSections] = useState<HelpSection[]>([])
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    getHelp().then((d) => setSections(d.sections || [])).catch(() => {})
  }, [])

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="font-bold text-slate-900 mb-4 text-lg">Help Guide</h3>
      <div className="space-y-2">
        {sections.map((s, i) => (
          <div key={i} className="border border-slate-100 rounded-lg overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors"
              onClick={() => setOpen(open === i ? null : i)}>
              {s.title}
              {open === i ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>
            {open === i && (
              <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {s.content}
              </div>
            )}
          </div>
        ))}
        {sections.length === 0 && (
          <p className="text-sm text-slate-400">Loading help content...</p>
        )}
      </div>
    </div>
  )
}
