"use client"
import Link from "next/link"
import { useState } from "react"
import { Menu, X, TrendingUp } from "lucide-react"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/tools", label: "Tools" },
  { href: "/pricing", label: "Pricing" },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-teal-600" />
            <span className="font-bold text-slate-900 text-lg">StratEdge</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href}
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login"
              className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md">
              Sign In
            </Link>
            <Link href="/login"
              className="text-sm bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors">
              Get Started
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-slate-100 py-3 space-y-1">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href}
                className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md"
                onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <Link href="/login"
              className="block px-3 py-2 text-sm font-medium text-teal-600 hover:bg-slate-50 rounded-md"
              onClick={() => setOpen(false)}>
              Sign In / Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
