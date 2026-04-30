import Link from "next/link"
import { TrendingUp } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-teal-400" />
              <span className="font-bold text-white">StratEdge</span>
            </div>
            <p className="text-sm leading-relaxed">
              Decision support tools for managers, founders, and business professionals.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/tools" className="hover:text-white transition-colors">Tools</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Consulting</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-slate-400">Strategy</span></li>
              <li><span className="text-slate-400">Finance</span></li>
              <li><span className="text-slate-400">Innovation</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Create Account</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 mt-8 pt-6 text-sm text-slate-500 text-center">
          © {new Date().getFullYear()} StratEdge Consulting. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
