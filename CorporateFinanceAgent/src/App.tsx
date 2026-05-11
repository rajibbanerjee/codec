import { useState, useEffect, useRef } from 'react'
import Vapi from '@vapi-ai/web'

const KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY ?? ''
const AID = import.meta.env.VITE_VAPI_ASSISTANT_ID ?? ''

type Status = 'idle' | 'connecting' | 'active' | 'ended'
interface Msg { role: 'user' | 'assistant'; text: string }

const BAR_SEEDS = [0.45, 0.75, 0.55, 1, 0.65, 0.9, 0.5, 0.85, 0.48]

export default function App() {
  const [status, setStatus] = useState<Status>('idle')
  const [muted, setMuted] = useState(false)
  const [vol, setVol] = useState(0)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [err, setErr] = useState<string | null>(null)
  const vapiRef = useRef<InstanceType<typeof Vapi> | null>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!KEY) {
      setErr('API key not configured. Please check GitHub Secrets.')
      return
    }
    if (!AID) {
      setErr('Assistant ID not configured. Please check GitHub Secrets.')
      return
    }
    let vapi: InstanceType<typeof Vapi>
    try {
      vapi = new Vapi(KEY)
      vapiRef.current = vapi
      vapi.on('call-start', () => { setStatus('active'); setErr(null) })
      vapi.on('call-end', () => { setStatus('ended'); setVol(0); setMuted(false) })
      vapi.on('volume-level', (v: number) => setVol(v))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vapi.on('error', (e: any) => {
        console.error('Vapi error event:', e)
        setStatus('idle')
        setErr(e?.message || e?.error || JSON.stringify(e) || 'Voice agent error. Check your API key and assistant ID.')
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vapi.on('call-start-failed' as any, (e: any) => {
        console.error('Vapi call-start-failed:', e)
        setStatus('idle')
        setErr(e?.message || 'Call failed to start — check your assistant ID and API key.')
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vapi.on('message', (m: any) => {
        if (m.type === 'transcript' && m.transcriptType === 'final' && m.transcript?.trim())
          setMsgs(p => [...p, { role: m.role, text: m.transcript }])
      })
    } catch (e) {
      console.error('Vapi init error', e)
      setErr(e instanceof Error ? e.message : 'Failed to initialize voice agent. Check your API key.')
    }
    return () => { try { vapiRef.current?.stop() } catch { /* ignore */ } }
  }, [])

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs])

  const start = async () => {
    if (!vapiRef.current) {
      setErr('Voice agent not initialized. Please refresh the page.')
      return
    }
    if (!AID) {
      setErr('Assistant ID not configured. Please check GitHub Secrets.')
      return
    }
    setStatus('connecting')
    setMsgs([])
    setErr(null)
    try {
      await vapiRef.current.start(AID)
    } catch (e) {
      console.error('Vapi start error:', e)
      setStatus('idle')
      setErr(e instanceof Error ? e.message : 'Failed to connect — check your API key and assistant ID.')
    }
  }

  const stop = () => { vapiRef.current?.stop(); setStatus('idle'); setErr(null) }

  const toggleMute = () => {
    const next = !muted
    vapiRef.current?.setMuted(next)
    setMuted(next)
  }

  const configured = !!KEY && !!AID
  const isIdle = status === 'idle' || status === 'ended'
  const isActive = status === 'active'
  const isConnecting = status === 'connecting'

  const glow = isActive
    ? `0 0 ${55 + vol * 90}px ${12 + vol * 35}px rgba(99,102,241,${0.28 + vol * 0.38}),0 0 ${90 + vol * 60}px rgba(168,85,247,${0.12 + vol * 0.18})`
    : '0 0 55px 14px rgba(99,102,241,0.18)'

  return (
    <>
      <style>{`
        .app{min-height:100vh;display:flex;flex-direction:column;background:#06060f;color:#e2e8f0;position:relative;overflow:hidden}
        .blob{position:absolute;border-radius:50%;filter:blur(110px);pointer-events:none;animation:drift 14s ease-in-out infinite alternate}
        .b1{width:650px;height:650px;background:radial-gradient(circle,#312e81 0%,transparent 70%);top:-220px;left:-160px;opacity:.28}
        .b2{width:480px;height:480px;background:radial-gradient(circle,#581c87 0%,transparent 70%);bottom:-160px;right:-120px;opacity:.2;animation-duration:11s;animation-delay:-5s}
        .b3{width:320px;height:320px;background:radial-gradient(circle,#0e7490 0%,transparent 70%);top:40%;left:55%;opacity:.1;animation-duration:18s;animation-delay:-9s}
        @keyframes drift{from{transform:translate(0,0) scale(1)}to{transform:translate(28px,18px) scale(1.09)}}
        .grid{position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(rgba(148,163,184,.055) 1px,transparent 1px);background-size:30px 30px;mask-image:radial-gradient(ellipse 65% 65% at 50% 50%,black 20%,transparent 80%)}
        .hdr{position:relative;z-index:10;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(6,6,15,.85);backdrop-filter:blur(14px)}
        .hdr-inner{max-width:880px;margin:0 auto;padding:0 1.5rem;height:64px;display:flex;align-items:center;justify-content:space-between}
        .logo{display:flex;align-items:center;gap:.75rem}
        .logo-av{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,#4f46e5,#7c3aed);display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:700;color:#fff;box-shadow:0 0 18px rgba(99,102,241,.45);flex-shrink:0}
        .logo-name{font-size:.9rem;font-weight:700;color:#fff;line-height:1.2}
        .logo-sub{font-size:.7rem;color:#475569}
        .badge{display:flex;align-items:center;gap:.4rem;padding:.28rem .75rem;border-radius:999px;font-size:.72rem;font-weight:600;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);color:#475569;transition:all .3s}
        .badge-live{background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.3);color:#4ade80}
        .badge-dot{width:7px;height:7px;border-radius:50%;background:#4ade80;animation:bpulse 1.4s ease-in-out infinite}
        @keyframes bpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.8)}}
        .main{position:relative;z-index:10;flex:1;display:flex;align-items:center;justify-content:center;padding:2rem 1.5rem}
        .card{width:100%;max-width:500px;display:flex;flex-direction:column;align-items:center;gap:1.75rem}
        .hero{text-align:center}
        .hero h1{font-size:1.7rem;font-weight:700;color:#fff;letter-spacing:-.025em;line-height:1.2;margin-bottom:.45rem}
        .hero h1 span{background:linear-gradient(90deg,#818cf8,#a78bfa,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .hero p{font-size:.875rem;color:#475569;max-width:340px;line-height:1.55}
        .orb-wrap{position:relative;display:flex;align-items:center;justify-content:center}
        .ring{position:absolute;border-radius:50%;border:1px solid rgba(99,102,241,.28);animation:expand 2.6s ease-out infinite;pointer-events:none}
        .ring:nth-child(1){width:190px;height:190px;animation-delay:0s}
        .ring:nth-child(2){width:190px;height:190px;animation-delay:.85s;border-color:rgba(168,85,247,.2)}
        .ring:nth-child(3){width:190px;height:190px;animation-delay:1.7s;border-color:rgba(236,72,153,.13)}
        @keyframes expand{0%{transform:scale(.88);opacity:.85}100%{transform:scale(1.9);opacity:0}}
        .orb{width:154px;height:154px;border-radius:50%;background:linear-gradient(145deg,#312e81 0%,#4c1d95 45%,#6b21a8 100%);display:flex;align-items:center;justify-content:center;position:relative;transition:transform .1s ease,box-shadow .12s ease;cursor:default}
        .orb-shine{position:absolute;inset:9px;border-radius:50%;background:radial-gradient(circle at 33% 28%,rgba(255,255,255,.22) 0%,transparent 58%);pointer-events:none}
        .orb svg{width:50px;height:50px;color:rgba(255,255,255,.87);position:relative;z-index:1}
        .spin{animation:spin .85s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .bars{display:flex;align-items:center;gap:4px;height:38px;opacity:0;transition:opacity .4s}
        .bars-on{opacity:1}
        .bar{width:4px;border-radius:3px;background:linear-gradient(to top,#6366f1,#a78bfa);animation:baranim .65s ease-in-out infinite alternate;animation-delay:var(--d);transform-origin:center}
        @keyframes baranim{from{transform:scaleY(.3)}to{transform:scaleY(1)}}
        .ctrls{display:flex;align-items:center;justify-content:center}
        .btn-go{display:flex;align-items:center;gap:.6rem;padding:.875rem 1.875rem;border-radius:1.1rem;background:linear-gradient(135deg,#4f46e5,#7c3aed);border:none;cursor:pointer;color:#fff;font-size:.975rem;font-weight:600;font-family:inherit;box-shadow:0 4px 22px rgba(99,102,241,.38);transition:all .2s}
        .btn-go svg{width:19px;height:19px;flex-shrink:0}
        .btn-go:hover:not(:disabled){background:linear-gradient(135deg,#4338ca,#6d28d9);box-shadow:0 6px 30px rgba(99,102,241,.52);transform:translateY(-1px)}
        .btn-go:disabled{opacity:.35;cursor:not-allowed;transform:none;box-shadow:none}
        .btn-cancel{padding:.8rem 1.875rem;border-radius:1rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#94a3b8;font-size:.925rem;font-weight:500;font-family:inherit;cursor:pointer;transition:all .2s}
        .btn-cancel:hover{background:rgba(255,255,255,.1);color:#fff}
        .act{display:flex;align-items:center;gap:.875rem}
        .btn-mute{width:50px;height:50px;border-radius:.875rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#94a3b8;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
        .btn-mute svg{width:19px;height:19px}
        .btn-mute:hover{background:rgba(255,255,255,.11);color:#fff}
        .btn-mute-on{background:rgba(245,158,11,.11);border-color:rgba(245,158,11,.32);color:#fbbf24}
        .btn-end{width:58px;height:58px;border-radius:.975rem;background:linear-gradient(135deg,#dc2626,#b91c1c);border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(220,38,38,.38);transition:all .2s}
        .btn-end svg{width:21px;height:21px}
        .btn-end:hover{background:linear-gradient(135deg,#ef4444,#dc2626);box-shadow:0 6px 26px rgba(220,38,38,.52);transform:scale(1.04)}
        .chat{width:100%;max-height:210px;overflow-y:auto;display:flex;flex-direction:column;gap:.55rem;padding:.875rem 1rem;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.06);border-radius:1rem;scrollbar-width:thin;scrollbar-color:#1e293b transparent}
        .msg{display:flex;flex-direction:column}
        .msg-u{align-items:flex-end}
        .msg-a{align-items:flex-start}
        .msg-role{font-size:.65rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#334155;margin-bottom:3px}
        .msg p{font-size:.845rem;line-height:1.5;padding:.45rem .8rem;border-radius:.7rem;max-width:82%}
        .msg-u p{background:rgba(99,102,241,.2);border:1px solid rgba(99,102,241,.28);color:#c7d2fe;border-radius:.7rem .7rem 0 .7rem}
        .msg-a p{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07);color:#e2e8f0;border-radius:.7rem .7rem .7rem 0}
        .ftr{position:relative;z-index:10;text-align:center;padding:1.1rem;font-size:.7rem;color:#1e293b;border-top:1px solid rgba(255,255,255,.04)}
      `}</style>

      <div className="app">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
        <div className="grid" />

        <header className="hdr">
          <div className="hdr-inner">
            <div className="logo">
              <div className="logo-av">RB</div>
              <div>
                <div className="logo-name">Rajib Banerjee</div>
                <div className="logo-sub">Corporate Finance Agent</div>
              </div>
            </div>
            <div className={`badge ${isActive ? 'badge-live' : ''}`}>
              {isActive && <span className="badge-dot" />}
              {status === 'idle' && 'Ready'}
              {status === 'connecting' && 'Connecting…'}
              {status === 'active' && 'Live'}
              {status === 'ended' && 'Ended'}
            </div>
          </div>
        </header>

        <main className="main">
          <div className="card">
            <div className="hero">
              <h1>Corporate <span>Finance Agent</span></h1>
              <p>
                {!configured && 'Voice agent is not yet configured.'}
                {configured && isIdle && 'Ask me about valuations, financial modeling, M&A, or capital markets.'}
                {configured && isConnecting && 'Connecting you to the agent…'}
                {configured && isActive && (muted ? 'Your microphone is muted.' : 'I\'m listening — speak freely.')}
                {configured && status === 'ended' && 'Call ended. Ready for another conversation.'}
              </p>
            </div>

            <div className="orb-wrap">
              {isActive && <><div className="ring" /><div className="ring" /><div className="ring" /></>}
              <div className="orb" style={{ boxShadow: glow, transform: `scale(${1 + vol * 0.055})` }}>
                <div className="orb-shine" />
                {isConnecting ? (
                  <svg className="spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity=".18" />
                    <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1a5 5 0 0 1 5 5v6a5 5 0 0 1-10 0V6a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zm-1 14.93V20h-2v1h6v-1h-2v-2.07A8.001 8.001 0 0 0 20 10h-2a6 6 0 0 1-12 0H4a8.001 8.001 0 0 0 7 7.93z" />
                  </svg>
                )}
              </div>
            </div>

            <div className={`bars ${isActive ? 'bars-on' : ''}`}>
              {BAR_SEEDS.map((h, i) => (
                <div key={i} className="bar" style={{ '--d': `${i * 85}ms`, height: `${Math.max(4, h * (6 + vol * 32))}px`, opacity: 0.5 + vol * 0.5 } as React.CSSProperties} />
              ))}
            </div>

            <div className="ctrls">
              {isIdle && (
                <button className="btn-go" onClick={start} disabled={!configured}>
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24 1.11.37 2.3.57 3.58.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.29 21 3 13.71 3 4.5c0-.55.45-1 1-1H7.5c.55 0 1 .45 1 1 0 1.29.2 2.53.57 3.7.11.35.03.74-.24 1.02L6.6 10.8z" /></svg>
                  Start Conversation
                </button>
              )}
              {isConnecting && <button className="btn-cancel" onClick={stop}>Cancel</button>}
              {isActive && (
                <div className="act">
                  <button className={`btn-mute ${muted ? 'btn-mute-on' : ''}`} onClick={toggleMute}>
                    {muted ? (
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3 3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z" /></svg>
                    )}
                  </button>
                  <button className="btn-end" onClick={stop}>
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" /></svg>
                  </button>
                </div>
              )}
            </div>

            {err && (
              <div style={{color:'#fca5a5',background:'rgba(220,38,38,0.1)',border:'1px solid rgba(220,38,38,0.25)',borderRadius:'0.75rem',padding:'0.6rem 1rem',fontSize:'0.8rem',textAlign:'center',maxWidth:360,lineHeight:1.5}}>
                ⚠️ {err}
              </div>
            )}

            {msgs.length > 0 && (
              <div className="chat" ref={chatRef}>
                {msgs.map((m, i) => (
                  <div key={i} className={`msg ${m.role === 'user' ? 'msg-u' : 'msg-a'}`}>
                    <span className="msg-role">{m.role === 'assistant' ? 'Agent' : 'You'}</span>
                    <p>{m.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <footer className="ftr">Rajib Banerjee &bull; Corporate Finance Agent &bull; Powered by Vapi</footer>
      </div>
    </>
  )
}
