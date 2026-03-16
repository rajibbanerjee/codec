import type { ChannelData, BreakevenResult } from '../types';
import { formatCurrency, formatNumber, formatPct } from '../utils/calculations';
import { generatePDFReport } from '../utils/pdfReport';

interface Props {
  channels: ChannelData[];
  results: BreakevenResult[];
}

function MetricRow({ label, value, highlight }: { label: string; value: string; highlight?: 'green' | 'red' | 'neutral' }) {
  const cls = highlight === 'green' ? 'text-green-400' : highlight === 'red' ? 'text-red-400' : 'text-white';
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={`font-semibold text-sm ${cls}`}>{value}</span>
    </div>
  );
}

export function ReportView({ channels, results }: Props) {
  const handleDownload = () => {
    generatePDFReport(channels, results);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Analysis Report</h2>
            <p className="text-slate-400 text-sm">
              {channels.length} channel{channels.length !== 1 ? 's' : ''} &bull; Generated{' '}
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-indigo-500/25"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-[#1a1a2e] border border-slate-700 rounded-xl p-6">
        <h3 className="text-white font-bold text-lg mb-4 pb-3 border-b border-slate-700">Executive Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard label="Channels" value={channels.length.toString()} icon="📊" />
          <SummaryCard
            label="Avg BEP Units"
            value={formatNumber(results.reduce((s, r) => s + (isFinite(r.breakevenUnits) ? r.breakevenUnits : 0), 0) / results.filter(r => isFinite(r.breakevenUnits)).length)}
            icon="⚖️"
          />
          <SummaryCard
            label="Best CM %"
            value={formatPct(Math.max(...results.map(r => r.contributionMarginPct)))}
            icon="📈"
            highlight="green"
          />
          <SummaryCard
            label="Best Max Profit"
            value={formatCurrency(Math.max(...results.map(r => r.profitAtMaxOrder)))}
            icon="💰"
            highlight="green"
          />
        </div>
      </div>

      {/* Per-channel detail */}
      {results.map((r) => {
        const ch = channels.find(c => c.id === r.channelId)!;
        return (
          <div key={r.channelId} className="bg-[#1a1a2e] border border-slate-700 rounded-xl overflow-hidden">
            {/* Channel header */}
            <div className="flex items-center gap-3 p-5 border-b border-slate-700" style={{ borderLeftColor: r.color, borderLeftWidth: 4 }}>
              <div className="w-3 h-8 rounded-full" style={{ background: r.color }} />
              <div>
                <h3 className="text-white font-bold text-xl">{r.channelName}</h3>
                <p className="text-slate-400 text-sm">Contribution Margin: {formatCurrency(r.contributionMargin)}/unit ({formatPct(r.contributionMarginPct)})</p>
              </div>
              <div className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold ${r.contributionMarginPct >= 40 ? 'bg-green-500/20 text-green-400' : r.contributionMarginPct >= 20 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                {r.contributionMarginPct >= 40 ? 'Strong' : r.contributionMarginPct >= 20 ? 'Moderate' : 'Weak'} Margin
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-700">
              {/* Cost Structure */}
              <div className="p-5">
                <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">Cost Structure</p>
                <MetricRow label="Selling Price / Unit" value={formatCurrency(ch.sellingPricePerUnit)} />
                <MetricRow label="Variable Cost / Unit" value={formatCurrency(ch.variableCostPerUnit)} />
                <MetricRow label="Contribution Margin" value={`${formatCurrency(r.contributionMargin)} (${formatPct(r.contributionMarginPct)})`} highlight={r.contributionMargin > 0 ? 'green' : 'red'} />
                <MetricRow label="Fixed Cost" value={formatCurrency(ch.fixedCost)} />
              </div>

              {/* Breakeven */}
              <div className="p-5">
                <p className="text-pink-400 text-xs font-semibold uppercase tracking-wider mb-3">Breakeven Analysis</p>
                <MetricRow label="Breakeven Units" value={isFinite(r.breakevenUnits) ? formatNumber(r.breakevenUnits) + ' units' : 'N/A'} />
                <MetricRow label="Breakeven Revenue" value={isFinite(r.breakevenRevenue) ? formatCurrency(r.breakevenRevenue) : 'N/A'} />
                <MetricRow label="Order Range" value={`${formatNumber(ch.orderSizeMin)} – ${formatNumber(ch.orderSizeMax)} units`} />
                <MetricRow label="Within BEP?" value={ch.orderSizeMax >= r.breakevenUnits ? 'Yes (Max order exceeds BEP)' : 'No (Below BEP)'} highlight={ch.orderSizeMax >= r.breakevenUnits ? 'green' : 'red'} />
              </div>

              {/* Profitability */}
              <div className="p-5">
                <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">Profitability</p>
                <MetricRow label={`Profit @ Min Order (${formatNumber(ch.orderSizeMin)}u)`} value={formatCurrency(r.profitAtMinOrder)} highlight={r.profitAtMinOrder >= 0 ? 'green' : 'red'} />
                <MetricRow label={`Profit @ Max Order (${formatNumber(ch.orderSizeMax)}u)`} value={formatCurrency(r.profitAtMaxOrder)} highlight={r.profitAtMaxOrder >= 0 ? 'green' : 'red'} />
                <MetricRow label={`Units for Min Profit (${formatCurrency(ch.desiredProfitMin)})`} value={isFinite(r.unitsForMinProfit) ? formatNumber(r.unitsForMinProfit) + ' units' : 'N/A'} />
                <MetricRow label={`Units for Max Profit (${formatCurrency(ch.desiredProfitMax)})`} value={isFinite(r.unitsForMaxProfit) ? formatNumber(r.unitsForMaxProfit) + ' units' : 'N/A'} />
              </div>
            </div>

            {/* Narrative */}
            <div className="p-5 bg-[#0f0f1a] border-t border-slate-700">
              <p className="text-slate-400 text-sm leading-relaxed">
                <span className="text-white font-semibold">{r.channelName}</span> has a contribution margin of{' '}
                <span className={r.contributionMargin > 0 ? 'text-green-400' : 'text-red-400'}>{formatCurrency(r.contributionMargin)}/unit ({formatPct(r.contributionMarginPct)})</span>.
                {isFinite(r.breakevenUnits) ? (
                  <> The channel breaks even at <span className="text-white">{formatNumber(r.breakevenUnits)} units</span> ({formatCurrency(r.breakevenRevenue)} revenue). </>
                ) : ' The channel cannot break even with current pricing. '}
                {r.profitAtMaxOrder > 0
                  ? <>At maximum order size of {formatNumber(ch.orderSizeMax)} units, it generates <span className="text-green-400">{formatCurrency(r.profitAtMaxOrder)}</span> in profit.</>
                  : <>Even at maximum order size of {formatNumber(ch.orderSizeMax)} units, this channel remains at a <span className="text-red-400">{formatCurrency(r.profitAtMaxOrder)}</span> loss.</>
                }
                {isFinite(r.unitsForMaxProfit) && (
                  <> To achieve the desired profit of {formatCurrency(ch.desiredProfitMax)}, <span className="text-white">{formatNumber(r.unitsForMaxProfit)} units</span> must be sold.</>
                )}
              </p>
            </div>
          </div>
        );
      })}

      {/* Download CTA */}
      <div className="text-center py-6">
        <p className="text-slate-400 text-sm mb-4">Ready to share your analysis?</p>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-xl shadow-indigo-500/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Full PDF Report
        </button>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon, highlight }: { label: string; value: string; icon: string; highlight?: 'green' | 'red' }) {
  return (
    <div className="bg-[#0f0f1a] rounded-xl p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-slate-400 text-xs uppercase tracking-wider">{label}</p>
      <p className={`text-lg font-bold mt-1 ${highlight === 'green' ? 'text-green-400' : highlight === 'red' ? 'text-red-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}
