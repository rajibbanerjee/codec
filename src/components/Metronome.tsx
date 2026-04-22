import { useState, useRef, useCallback, useEffect } from 'react';

const LOOKAHEAD_SEC = 0.12;
const SCHEDULE_INTERVAL_MS = 25;

const TIME_SIGNATURES = [2, 3, 4, 5, 6, 7, 8];

const TEMPO_MARKS = [
  { max: 40,  label: 'Grave' },
  { max: 60,  label: 'Largo' },
  { max: 66,  label: 'Larghetto' },
  { max: 76,  label: 'Adagio' },
  { max: 108, label: 'Andante' },
  { max: 120, label: 'Moderato' },
  { max: 156, label: 'Allegro' },
  { max: 176, label: 'Vivace' },
  { max: 200, label: 'Presto' },
  { max: 999, label: 'Prestissimo' },
];

function getTempoLabel(bpm: number) {
  return TEMPO_MARKS.find(t => bpm <= t.max)?.label ?? 'Prestissimo';
}

function scheduleClick(
  ctx: AudioContext,
  time: number,
  isAccent: boolean,
  volume: number,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(isAccent ? 1400 : 900, time);

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(volume, time + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

  osc.start(time);
  osc.stop(time + 0.07);
}

export function Metronome() {
  const [bpm, setBpmState] = useState(120);
  const [beats, setBeatsState] = useState(4);
  const [volume, setVolumeState] = useState(0.8);
  const [isRunning, setIsRunning] = useState(false);
  const [activeBeat, setActiveBeat] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextBeatTimeRef = useRef(0);
  const beatIndexRef = useRef(0);
  const schedulerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mutable refs so the scheduler closure always reads fresh values
  const bpmRef = useRef(bpm);
  const beatsRef = useRef(beats);
  const volumeRef = useRef(volume);
  const runningRef = useRef(false);

  const setBpm = (v: number) => { bpmRef.current = v; setBpmState(v); };
  const setBeats = (v: number) => { beatsRef.current = v; setBeatsState(v); };
  const setVolume = (v: number) => { volumeRef.current = v; setVolumeState(v); };

  const runScheduler = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || !runningRef.current) return;

    while (nextBeatTimeRef.current < ctx.currentTime + LOOKAHEAD_SEC) {
      const beatIdx = beatIndexRef.current;
      const schedTime = nextBeatTimeRef.current;

      scheduleClick(ctx, schedTime, beatIdx === 0, volumeRef.current);

      const delay = Math.max(0, (schedTime - ctx.currentTime) * 1000);
      setTimeout(() => setActiveBeat(beatIdx), delay);

      beatIndexRef.current = (beatIdx + 1) % beatsRef.current;
      nextBeatTimeRef.current += 60 / bpmRef.current;
    }

    schedulerTimerRef.current = setTimeout(runScheduler, SCHEDULE_INTERVAL_MS);
  }, []);

  const start = useCallback(async () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    beatIndexRef.current = 0;
    nextBeatTimeRef.current = ctx.currentTime;
    runningRef.current = true;
    setIsRunning(true);
    setActiveBeat(null);
    runScheduler();
  }, [runScheduler]);

  const stop = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
    setActiveBeat(null);
    if (schedulerTimerRef.current) {
      clearTimeout(schedulerTimerRef.current);
      schedulerTimerRef.current = null;
    }
  }, []);

  const toggle = useCallback(() => {
    if (runningRef.current) stop();
    else start();
  }, [start, stop]);

  useEffect(() => () => {
    runningRef.current = false;
    if (schedulerTimerRef.current) clearTimeout(schedulerTimerRef.current);
    audioCtxRef.current?.close();
  }, []);

  // Tap tempo
  const tapTimesRef = useRef<number[]>([]);
  const handleTap = () => {
    const now = performance.now();
    const taps = tapTimesRef.current;
    taps.push(now);
    if (taps.length > 8) taps.shift();
    if (taps.length >= 2) {
      const gaps = taps.slice(1).map((t, i) => t - taps[i]);
      const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      const detected = Math.round(60000 / avg);
      setBpm(Math.max(20, Math.min(300, detected)));
    }
  };

  const nudgeBpm = (delta: number) => setBpm(Math.max(20, Math.min(300, bpmRef.current + delta)));

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-8">

      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-1">Metronome</h2>
        <p className="text-slate-400 text-sm">Web Audio API precision timing</p>
      </div>

      {/* BPM display */}
      <div className="bg-[#12122a] border border-slate-700/80 rounded-2xl p-8 text-center shadow-xl">
        <div className="text-7xl font-black text-white tabular-nums mb-1 tracking-tight">
          {bpm}
        </div>
        <div className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-6">
          {getTempoLabel(bpm)} · BPM
        </div>

        {/* BPM Slider */}
        <input
          type="range"
          min={20}
          max={300}
          value={bpm}
          onChange={e => setBpm(Number(e.target.value))}
          className="w-full h-2 rounded-full accent-indigo-500 cursor-pointer mb-6"
        />

        {/* Nudge buttons */}
        <div className="flex justify-center gap-2 flex-wrap">
          {[-10, -5, -1].map(d => (
            <button
              key={d}
              onClick={() => nudgeBpm(d)}
              className="px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-600/60 text-slate-300 text-sm font-mono transition-colors"
            >
              {d}
            </button>
          ))}
          {[+1, +5, +10].map(d => (
            <button
              key={d}
              onClick={() => nudgeBpm(d)}
              className="px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-600/60 text-slate-300 text-sm font-mono transition-colors"
            >
              +{d}
            </button>
          ))}
        </div>
      </div>

      {/* Beat visualizer */}
      <div className="bg-[#12122a] border border-slate-700/80 rounded-2xl p-6 shadow-xl">
        <p className="text-slate-500 text-xs text-center uppercase tracking-wider mb-4">Beat</p>
        <div className="flex justify-center gap-3 flex-wrap">
          {Array.from({ length: beats }, (_, i) => {
            const isActive = activeBeat === i;
            const isAccent = i === 0;
            return (
              <div
                key={i}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-75 ${
                  isActive
                    ? isAccent
                      ? 'bg-red-500 border-red-400 text-white scale-125 shadow-lg shadow-red-500/50'
                      : 'bg-indigo-500 border-indigo-400 text-white scale-110 shadow-lg shadow-indigo-500/50'
                    : 'bg-slate-800/60 border-slate-600/50 text-slate-500'
                }`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Time signature */}
        <div className="bg-[#12122a] border border-slate-700/80 rounded-2xl p-5 shadow-xl">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">Time Signature</p>
          <div className="flex flex-wrap gap-2">
            {TIME_SIGNATURES.map(b => (
              <button
                key={b}
                onClick={() => setBeats(b)}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                  beats === b
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-slate-700/60 text-slate-400 hover:bg-slate-600/60 hover:text-white'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
          <p className="text-slate-600 text-xs mt-2">{beats}/4 time</p>
        </div>

        {/* Volume */}
        <div className="bg-[#12122a] border border-slate-700/80 rounded-2xl p-5 shadow-xl">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">
            Volume · {Math.round(volume * 100)}%
          </p>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            className="w-full h-2 rounded-full accent-indigo-500 cursor-pointer"
          />
          <div className="flex justify-between text-slate-600 text-xs mt-2">
            <span>Soft</span>
            <span>Loud</span>
          </div>
        </div>
      </div>

      {/* Start / Stop + Tap */}
      <div className="flex gap-4">
        <button
          onClick={toggle}
          className={`flex-1 py-4 rounded-2xl text-lg font-bold transition-all shadow-xl flex items-center justify-center gap-3 ${
            isRunning
              ? 'bg-slate-700 hover:bg-slate-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/30'
          }`}
        >
          {isRunning ? (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
              Stop
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Start
            </>
          )}
        </button>

        <button
          onClick={handleTap}
          className="px-6 py-4 rounded-2xl text-sm font-bold bg-[#12122a] border border-slate-700/80 hover:border-indigo-500/50 hover:bg-slate-800/60 text-slate-300 hover:text-white transition-all shadow-xl"
        >
          Tap
          <br />
          <span className="text-xs font-normal text-slate-500">Tempo</span>
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-slate-600 text-xs">
        Press <kbd className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-slate-400 font-mono text-xs">Space</kbd> to start/stop
      </p>
    </div>
  );
}
