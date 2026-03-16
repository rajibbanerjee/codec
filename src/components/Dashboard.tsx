import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import type { ChannelData, BreakevenResult } from '../types';
import { formatCurrency, formatNumber, formatPct } from '../utils/calculations';

interface Props {
  channels: ChannelData[];
  results: BreakevenResult[];
}

const tooltipStyle = {
  backgroundColor: '#1a1a2e',
  border: '1px solid #374151',
  borderRadius: '8px',
  color: '#e2e8f0',
};

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-[#1a1a2e] border border-slate-700 rounded-xl p-4 flex items-center gap-4">
      <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ background: color }} />
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className="text-white font-bold text-xl mt-0.5">{value}</p>
        {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px flex-1 bg-slate-700" />
      <h3 className="text-slate-300 text-sm font-semibold uppercase tracking-widest whitespace-nowrap">{children}</h3>
      <div className="h-px flex-1 bg-slate-700" />
    </div>
  );
}

export function Dashboard({ channels, results }: Props) {
  if (results.length === 0) return null;

  // ── Breakeven Bar Data ────────────────────────────────────────────────────
  const bepData = results.map(r => ({
    name: r.channelName,
    'BEP Units': isFinite(r.breakevenUnits) ? Math.round(r.breakevenUnits) : 0,
    'BEP Revenue': isFinite(r.breakevenRevenue) ? Math.round(r.breakevenRevenue) : 0,
    fill: r.color,
  }));

  // ── CM Comparison ─────────────────────────────────────────────────────────
  const cmData = results.map(r => ({
    name: r.channelName,
    'CM per Unit': r.contributionMargin,
    'CM %': r.contributionMarginPct,
    fill: r.color,
  }));

  // ── Profit @ Range ────────────────────────────────────────────────────────
  const profitRangeData = results.map(r => ({
    name: r.channelName,
    'Min Order Profit': Math.round(r.profitAtMinOrder),
    'Max Order Profit': Math.round(r.profitAtMaxOrder),
    fill: r.color,
  }));

  // ── Combined profitability curves ─────────────────────────────────────────
  const combinedCurveData: Record<string, number | string>[] = [];

  // Use the first channel's profitabilityData as x axis template
  if (results.length > 0) {
    const basePoints = results[0].profitabilityData;
    basePoints.forEach(p => {
      const row: Record<string, number | string> = { units: p.units };
      results.forEach(r => {
        // Interpolate profit at this unit count for each channel
        const ch = channels.find(c => c.id === r.channelId)!;
        const profit = (ch.sellingPricePerUnit - ch.variableCostPerUnit) * p.units - ch.fixedCost;
        row[r.channelName] = Math.round(profit);
      });
      combinedCurveData.push(row);
    });
  }

  // ── Radar data (normalized metrics) ──────────────────────────────────────
  const normalize = (val: number, min: number, max: number) =>
    max === min ? 50 : Math.round(((val - min) / (max - min)) * 100);

  const allCM = results.map(r => r.contributionMarginPct);
  const allBEP = results.filter(r => isFinite(r.breakevenUnits)).map(r => r.breakevenUnits);
  const allMaxProfit = results.map(r => r.profitAtMaxOrder);
  const allMinUnitsNeeded = results.filter(r => isFinite(r.unitsForMaxProfit)).map(r => r.unitsForMaxProfit);

  const radarData = [
    { subject: 'CM %', ...Object.fromEntries(results.map(r => [r.channelName, normalize(r.contributionMarginPct, Math.min(...allCM), Math.max(...allCM))])) },
    { subject: 'Max Profit', ...Object.fromEntries(results.map(r => [r.channelName, normalize(r.profitAtMaxOrder, Math.min(...allMaxProfit), Math.max(...allMaxProfit))])) },
    { subject: 'Low BEP', ...Object.fromEntries(results.map(r => [r.channelName, isFinite(r.breakevenUnits) ? 100 - normalize(r.breakevenUnits, Math.min(...allBEP), Math.max(...allBEP)) : 0])) },
    { subject: 'Efficiency', ...Object.fromEntries(results.map(r => [r.channelName, isFinite(r.unitsForMaxProfit) ? 100 - normalize(r.unitsForMaxProfit, Math.min(...allMinUnitsNeeded.filter(isFinite)), Math.max(...allMinUnitsNeeded.filter(isFinite))) : 0])) },
    { subject: 'Min Order Profit', ...Object.fromEntries(results.map(r => [r.channelName, normalize(r.profitAtMinOrder, Math.min(...results.map(x => x.profitAtMinOrder)), Math.max(...results.map(x => x.profitAtMinOrder)))])) },
  ];

  return (
    <div className="space-y-8">
      {/* KPI strip */}
      <div>
        <SectionTitle>Key Performance Indicators</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {results.map(r => (
            <StatCard
              key={r.channelId}
              label={r.channelName}
              value={isFinite(r.breakevenUnits) ? `${formatNumber(r.breakevenUnits)} units` : 'N/A'}
              sub={`BEP Revenue: ${isFinite(r.breakevenRevenue) ? formatCurrency(r.breakevenRevenue) : 'N/A'}`}
              color={r.color}
            />
          ))}
        </div>
      </div>

      {/* Breakeven Units Bar */}
      <div>
        <SectionTitle>Breakeven Volume Comparison</SectionTitle>
        <div className="bg-[#1a1a2e] border border-slate-700 rounded-xl p-5">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bepData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => formatNumber(v)} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: unknown, name: unknown) => [(name as string).includes('Revenue') ? formatCurrency(v as number) : formatNumber(v as number) + ' units', name as string]}
              />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Bar dataKey="BEP Units" fill="#6366f1" radius={[4, 4, 0, 0]}>
                {bepData.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Contribution Margin */}
      <div>
        <SectionTitle>Contribution Margin Analysis</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#1a1a2e] border border-slate-700 rounded-xl p-5">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">CM per Unit ($)</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cmData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [formatCurrency(v as number), 'CM/Unit']} />
                {results.map(r => (
                  <Bar key={r.channelId} dataKey="CM per Unit" fill={r.color} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-[#1a1a2e] border border-slate-700 rounded-xl p-5">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">CM Percentage (%)</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cmData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `${v.toFixed(0)}%`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [formatPct(v as number), 'CM %']} />
                {results.map(r => (
                  <Bar key={r.channelId} dataKey="CM %" fill={r.color} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Profitability Curve */}
      <div>
        <SectionTitle>Profitability Curves (across volume)</SectionTitle>
        <div className="bg-[#1a1a2e] border border-slate-700 rounded-xl p-5">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={combinedCurveData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" />
              <XAxis dataKey="units" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => formatNumber(v)} label={{ value: 'Units Sold', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => formatCurrency(v)} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown, name: unknown) => [formatCurrency(v as number), name as string]} labelFormatter={v => `${formatNumber(v as number)} units`} />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Break-Even', fill: '#ef4444', fontSize: 10, position: 'right' }} />
              {results.map(r => (
                <Line
                  key={r.channelId}
                  type="monotone"
                  dataKey={r.channelName}
                  stroke={r.color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Profit at Order Range */}
      <div>
        <SectionTitle>Profit at Order Size Range</SectionTitle>
        <div className="bg-[#1a1a2e] border border-slate-700 rounded-xl p-5">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={profitRangeData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => formatCurrency(v)} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown, name: unknown) => [formatCurrency(v as number), name as string]} />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
              <Bar dataKey="Min Order Profit" fill="#6366f1" opacity={0.7} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Max Order Profit" fill="#10b981" opacity={0.9} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar chart */}
      {results.length > 1 && (
        <div>
          <SectionTitle>Multi-Dimensional Channel Comparison</SectionTitle>
          <div className="bg-[#1a1a2e] border border-slate-700 rounded-xl p-5">
            <p className="text-slate-500 text-xs mb-4 text-center">Normalized scores (100 = best). Lower BEP and fewer units needed for max profit = better.</p>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#2d2d4a" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} />
                {results.map(r => (
                  <Radar
                    key={r.channelId}
                    name={r.channelName}
                    dataKey={r.channelName}
                    stroke={r.color}
                    fill={r.color}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed comparison table */}
      <div>
        <SectionTitle>Detailed Metrics Table</SectionTitle>
        <div className="bg-[#1a1a2e] border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-indigo-600/30 border-b border-slate-700">
                  <th className="text-left px-4 py-3 text-slate-300 font-semibold">Channel</th>
                  <th className="text-right px-4 py-3 text-slate-300 font-semibold">CM / Unit</th>
                  <th className="text-right px-4 py-3 text-slate-300 font-semibold">CM %</th>
                  <th className="text-right px-4 py-3 text-slate-300 font-semibold">BEP Units</th>
                  <th className="text-right px-4 py-3 text-slate-300 font-semibold">BEP Revenue</th>
                  <th className="text-right px-4 py-3 text-slate-300 font-semibold">Profit @ Min</th>
                  <th className="text-right px-4 py-3 text-slate-300 font-semibold">Profit @ Max</th>
                  <th className="text-right px-4 py-3 text-slate-300 font-semibold">Units for Max Profit</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.channelId} className={`border-b border-slate-700/50 ${i % 2 === 0 ? '' : 'bg-slate-800/20'} hover:bg-indigo-500/5 transition-colors`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                        <span className="text-white font-medium">{r.channelName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-200">{formatCurrency(r.contributionMargin)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${r.contributionMarginPct >= 40 ? 'bg-green-500/20 text-green-400' : r.contributionMarginPct >= 20 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                        {formatPct(r.contributionMarginPct)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-200">{isFinite(r.breakevenUnits) ? formatNumber(r.breakevenUnits) : 'N/A'}</td>
                    <td className="px-4 py-3 text-right text-slate-200">{isFinite(r.breakevenRevenue) ? formatCurrency(r.breakevenRevenue) : 'N/A'}</td>
                    <td className={`px-4 py-3 text-right font-medium ${r.profitAtMinOrder >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(r.profitAtMinOrder)}</td>
                    <td className={`px-4 py-3 text-right font-medium ${r.profitAtMaxOrder >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(r.profitAtMaxOrder)}</td>
                    <td className="px-4 py-3 text-right text-slate-200">{isFinite(r.unitsForMaxProfit) ? formatNumber(r.unitsForMaxProfit) + ' units' : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
