import type { ChannelData } from '../types';
import { formatCurrency, formatNumber } from '../utils/calculations';

interface Props {
  channel: ChannelData;
  onDelete: (id: string) => void;
}

export function ChannelCard({ channel, onDelete }: Props) {
  return (
    <div className="bg-[#1a1a2e] border border-slate-700 rounded-xl p-5 shadow-lg hover:border-slate-500 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-8 rounded-full" style={{ background: channel.color }} />
          <h3 className="font-bold text-white text-lg">{channel.name}</h3>
        </div>
        <button
          onClick={() => onDelete(channel.id)}
          className="text-slate-500 hover:text-red-400 transition-colors text-sm px-2 py-1 rounded hover:bg-red-400/10"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <Metric label="Selling Price / Unit" value={formatCurrency(channel.sellingPricePerUnit)} />
        <Metric label="Variable Cost / Unit" value={formatCurrency(channel.variableCostPerUnit)} />
        <Metric label="Fixed Cost" value={formatCurrency(channel.fixedCost)} />
        <Metric label="Order Size" value={`${formatNumber(channel.orderSizeMin)} – ${formatNumber(channel.orderSizeMax)}`} />
        <Metric label="Desired Profit" value={`${formatCurrency(channel.desiredProfitMin)} – ${formatCurrency(channel.desiredProfitMax)}`} span />
      </div>
    </div>
  );
}

function Metric({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div className={`bg-[#0f0f1a] rounded-lg p-3 ${span ? 'col-span-2' : ''}`}>
      <p className="text-slate-500 text-xs mb-0.5">{label}</p>
      <p className="text-white font-semibold">{value}</p>
    </div>
  );
}
