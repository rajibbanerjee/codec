export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border border-slate-200 p-8 w-full max-w-sm shadow-sm space-y-5">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-900">Sign In</h1>
          <p className="text-sm text-slate-500 mt-1">Access your StratEdge account</p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600">Email</label>
            <input type="email" placeholder="you@company.com"
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Password</label>
            <input type="password" placeholder="••••••••"
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <button className="w-full bg-teal-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
            Sign In
          </button>
        </div>
        <p className="text-center text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <span className="text-teal-600 cursor-pointer hover:underline">Create one free</span>
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 text-center">
          Auth is in development. Use the tools freely for now.
        </div>
      </div>
    </div>
  )
}
