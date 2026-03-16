import React, { useState } from 'react';
import type { ChannelData } from '../types';

const PALETTE = [
  '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6',
  '#8b5cf6', '#14b8a6', '#f97316', '#ef4444', '#06b6d4',
];

interface Props {
  onAdd: (channel: ChannelData) => void;
  existingCount: number;
}

const defaultForm = {
  name: '',
  sellingPricePerUnit: '',
  variableCostPerUnit: '',
  fixedCost: '',
  orderSizeMin: '',
  orderSizeMax: '',
  desiredProfitMin: '',
  desiredProfitMax: '',
};

export function ChannelForm({ onAdd, existingCount }: Props) {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [color, setColor] = useState(PALETTE[existingCount % PALETTE.length]);

  const set = (key: string, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    const nums: (keyof typeof form)[] = [
      'sellingPricePerUnit', 'variableCostPerUnit', 'fixedCost',
      'orderSizeMin', 'orderSizeMax', 'desiredProfitMin', 'desiredProfitMax',
    ];
    nums.forEach(k => {
      if (form[k] === '' || isNaN(Number(form[k]))) e[k] = 'Must be a number';
    });
    if (!e.orderSizeMin && !e.orderSizeMax && Number(form.orderSizeMin) > Number(form.orderSizeMax))
      e.orderSizeMax = 'Max must be ≥ min';
    if (!e.desiredProfitMin && !e.desiredProfitMax && Number(form.desiredProfitMin) > Number(form.desiredProfitMax))
      e.desiredProfitMax = 'Max must be ≥ min';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onAdd({
      id: crypto.randomUUID(),
      name: form.name.trim(),
      color,
      sellingPricePerUnit: Number(form.sellingPricePerUnit),
      variableCostPerUnit: Number(form.variableCostPerUnit),
      fixedCost: Number(form.fixedCost),
      orderSizeMin: Number(form.orderSizeMin),
      orderSizeMax: Number(form.orderSizeMax),
      desiredProfitMin: Number(form.desiredProfitMin),
      desiredProfitMax: Number(form.desiredProfitMax),
    });
    setForm(defaultForm);
  };

  const Field = ({ label, field, prefix = '', placeholder = '0' }: { label: string; field: keyof typeof form; prefix?: string; placeholder?: string }) => (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{prefix}</span>}
        <input
          type="number"
          value={form[field]}
          onChange={e => set(field, e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-[#0f0f1a] border rounded-lg text-white text-sm py-2 px-3 ${prefix ? 'pl-7' : ''} focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors[field] ? 'border-red-500' : 'border-slate-700 hover:border-slate-500'}`}
        />
      </div>
      {errors[field] && <p className="text-red-400 text-xs mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-[#1a1a2e] border border-slate-700 rounded-xl p-6 shadow-xl">
      <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
        <span className="w-2 h-6 rounded-full inline-block" style={{ background: color }} />
        Add New Channel
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {/* Name + Color */}
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-400 mb-1">Channel Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Online Store"
              className={`w-full bg-[#0f0f1a] border rounded-lg text-white text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.name ? 'border-red-500' : 'border-slate-700 hover:border-slate-500'}`}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Color</label>
            <div className="flex gap-1.5 flex-wrap max-w-[160px]">
              {PALETTE.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c ? 'border-white scale-125' : 'border-transparent'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="border-t border-slate-700 pt-4">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">Pricing & Costs</p>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Selling Price / Unit" field="sellingPricePerUnit" prefix="$" />
            <Field label="Variable Cost / Unit" field="variableCostPerUnit" prefix="$" />
            <Field label="Fixed Cost" field="fixedCost" prefix="$" />
          </div>
        </div>

        {/* Order Size */}
        <div className="border-t border-slate-700 pt-4">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">Order Size Range</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Min Order Size (units)" field="orderSizeMin" placeholder="100" />
            <Field label="Max Order Size (units)" field="orderSizeMax" placeholder="1000" />
          </div>
        </div>

        {/* Desired Profit */}
        <div className="border-t border-slate-700 pt-4">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">Desired Profit Range</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Min Desired Profit" field="desiredProfitMin" prefix="$" />
            <Field label="Max Desired Profit" field="desiredProfitMax" prefix="$" />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="mt-5 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
      >
        Add Channel
      </button>
    </form>
  );
}
