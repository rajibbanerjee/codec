import React, { useState, useMemo, useEffect } from 'react';
import type { ChannelData, ViewMode } from './types';
import { ChannelForm } from './components/ChannelForm';
import { ChannelCard } from './components/ChannelCard';
import { Dashboard } from './components/Dashboard';
import { ReportView } from './components/ReportView';
import { Metronome } from './components/Metronome';
import { calculateBreakeven } from './utils/calculations';

const SAMPLE_CHANNELS: ChannelData[] = [
  {
    id: '1',
    name: 'Online Store',
    color: '#6366f1',
    sellingPricePerUnit: 89,
    variableCostPerUnit: 32,
    fixedCost: 12000,
    orderSizeMin: 150,
    orderSizeMax: 800,
    desiredProfitMin: 5000,
    desiredProfitMax: 30000,
  },
  {
    id: '2',
    name: 'Retail Partners',
    color: '#ec4899',
    sellingPricePerUnit: 75,
    variableCostPerUnit: 38,
    fixedCost: 8000,
    orderSizeMin: 200,
    orderSizeMax: 1200,
    desiredProfitMin: 8000,
    desiredProfitMax: 40000,
  },
];

export default function App() {
  const [channels, setChannels] = useState<ChannelData[]>(SAMPLE_CHANNELS);
  const [view, setView] = useState<ViewMode>('channels');
  const [showForm, setShowForm] = useState(false);

  const results = useMemo(() => channels.map(calculateBreakeven), [channels]);

  const addChannel = (ch: ChannelData) => {
    setChannels(prev => [...prev, ch]);
    setShowForm(false);
  };

  const deleteChannel = (id: string) => {
    setChannels(prev => prev.filter(c => c.id !== id));
  };

  // Space bar shortcut when on metronome view — let the Metronome component handle it
  useEffect(() => {
    if (view !== 'metronome') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view]);

  const navItems: { key: ViewMode; label: string; icon: React.ReactNode; alwaysEnabled?: boolean }[] = [
    {
      key: 'channels', label: 'Channels', icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      )
    },
    {
      key: 'dashboard', label: 'Dashboard', icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      key: 'report', label: 'Report', icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      key: 'metronome', label: 'Metronome', alwaysEnabled: true, icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-[#0c0c1a] text-white">
      {/* Top Nav */}
      <header className="bg-[#12122a] border-b border-slate-700/80 sticky top-0 z-50 shadow-xl shadow-black/30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/30">
              CA
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-white text-sm leading-tight">Channel Analyzer</h1>
              <p className="text-slate-500 text-xs">Breakeven &amp; Profitability</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex bg-[#0c0c1a] rounded-xl p-1 gap-1 border border-slate-700/80">
            {navItems.map(n => (
              <button
                key={n.key}
                onClick={() => setView(n.key)}
                disabled={!n.alwaysEnabled && n.key !== 'channels' && channels.length === 0}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                  view === n.key
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {n.icon}
                <span className="hidden sm:inline">{n.label}</span>
                {n.key === 'channels' && channels.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${view === n.key ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    {channels.length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Add button */}
          {view === 'channels' && (
            <button
              onClick={() => setShowForm(f => !f)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-shrink-0 ${
                showForm
                  ? 'bg-slate-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              }`}
            >
              {showForm ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="hidden sm:inline">Cancel</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Add Channel</span>
                </>
              )}
            </button>
          )}

          {/* Spacer for metronome view */}
          {view === 'metronome' && <div className="w-24 flex-shrink-0" />}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Channels View */}
        {view === 'channels' && (
          <div className="space-y-6">
            {showForm && (
              <ChannelForm onAdd={addChannel} existingCount={channels.length} />
            )}

            {channels.length === 0 && !showForm && (
              <div className="text-center py-24">
                <div className="w-20 h-20 bg-[#1a1a2e] border border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                  📦
                </div>
                <h2 className="text-xl font-bold text-white mb-2">No channels yet</h2>
                <p className="text-slate-400 mb-6 max-w-sm mx-auto">
                  Add your first sales channel to start analyzing breakeven points and profitability
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Add Your First Channel
                </button>
              </div>
            )}

            {channels.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-slate-300 font-semibold">
                    {channels.length} Channel{channels.length !== 1 ? 's' : ''}
                  </h2>
                  <button
                    onClick={() => setView('dashboard')}
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    View Dashboard
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {channels.map(ch => (
                    <ChannelCard key={ch.id} channel={ch} onDelete={deleteChannel} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dashboard View */}
        {view === 'dashboard' && channels.length > 0 && (
          <Dashboard channels={channels} results={results} />
        )}

        {/* Report View */}
        {view === 'report' && channels.length > 0 && (
          <ReportView channels={channels} results={results} />
        )}

        {/* Metronome View */}
        {view === 'metronome' && <Metronome />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16 py-6 text-center text-slate-600 text-xs">
        Channel Characteristics Analyzer &bull; Breakeven &amp; Profitability Analysis
      </footer>
    </div>
  );
}
