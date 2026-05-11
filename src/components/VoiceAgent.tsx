import { useState, useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY || 'c91307da-fb95-4aec-800e-3178be5075d3';
const VAPI_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID || 'db5531b5-af6f-47ad-950f-83d7b9eaba3f';

type CallStatus = 'idle' | 'connecting' | 'active' | 'ended';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

const BAR_HEIGHTS = [0.5, 0.8, 0.6, 1, 0.7, 0.9, 0.55, 0.85, 0.65];

export function VoiceAgent() {
  const [status, setStatus] = useState<CallStatus>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const vapiRef = useRef<InstanceType<typeof Vapi> | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;

    vapi.on('call-start', () => setStatus('active'));
    vapi.on('call-end', () => {
      setStatus('ended');
      setVolume(0);
      setIsMuted(false);
    });
    vapi.on('volume-level', (v: number) => setVolume(v));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vapi.on('message', (msg: any) => {
      if (msg.type === 'transcript' && msg.transcriptType === 'final' && msg.transcript?.trim()) {
        setMessages(prev => [...prev, { role: msg.role, text: msg.transcript }]);
      }
    });

    return () => { vapi.stop(); };
  }, []);

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const startCall = async () => {
    if (!vapiRef.current) return;
    setStatus('connecting');
    setMessages([]);
    try {
      await vapiRef.current.start(VAPI_ASSISTANT_ID);
    } catch {
      setStatus('idle');
    }
  };

  const endCall = () => {
    vapiRef.current?.stop();
    setStatus('idle');
  };

  const toggleMute = () => {
    if (!vapiRef.current) return;
    const next = !isMuted;
    vapiRef.current.setMuted(next);
    setIsMuted(next);
  };

  const isActive = status === 'active';
  const isConnecting = status === 'connecting';
  const isIdle = status === 'idle' || status === 'ended';

  return (
    <div className="voice-agent-page">
      {/* Animated background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Grid overlay */}
      <div className="grid-overlay" />

      <div className="voice-agent-content">
        {/* Central orb area */}
        <div className="orb-section">
          {/* Outer pulse rings when active */}
          {isActive && (
            <>
              <div className="pulse-ring ring-1" style={{ '--vol': volume } as React.CSSProperties} />
              <div className="pulse-ring ring-2" style={{ '--vol': volume } as React.CSSProperties} />
              <div className="pulse-ring ring-3" style={{ '--vol': volume } as React.CSSProperties} />
            </>
          )}

          {/* Main orb */}
          <div
            className="orb"
            style={{
              '--vol': volume,
              boxShadow: isActive
                ? `0 0 ${60 + volume * 80}px ${20 + volume * 30}px rgba(99,102,241,${0.25 + volume * 0.35}), 0 0 ${120 + volume * 60}px rgba(168,85,247,${0.1 + volume * 0.15})`
                : '0 0 60px 20px rgba(99,102,241,0.15)',
            } as React.CSSProperties}
          >
            <div className="orb-inner-shine" />
            <div className="orb-icon">
              {isConnecting ? (
                <svg className="w-14 h-14 text-white/80 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-14 h-14 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1a9 9 0 0 1 9 9c0 4.97-4.03 9-9 9S3 14.97 3 10a9 9 0 0 1 9-9zm0 2a7 7 0 1 0 0 14A7 7 0 0 0 12 3zm0 2a1 1 0 0 1 1 1v3.586l2.707 2.707a1 1 0 0 1-1.414 1.414l-3-3A1 1 0 0 1 11 10V6a1 1 0 0 1 1-1z" />
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 3a3 3 0 0 1 3 3v2a3 3 0 0 1-6 0V8a3 3 0 0 1 3-3zm0 11.5c-2.33 0-4.31-1.46-5.11-3.5h1.67c.69 1.19 1.97 2 3.44 2s2.75-.81 3.44-2h1.67c-.8 2.04-2.78 3.5-5.11 3.5z" />
                </svg>
              )}
            </div>
          </div>

          {/* Voice waveform bars */}
          <div className={`waveform-bars ${isActive ? 'waveform-active' : ''}`}>
            {BAR_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className="wave-bar"
                style={{
                  '--base-h': `${h}`,
                  '--delay': `${i * 0.09}s`,
                  '--vol': volume,
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>

        {/* Status text */}
        <div className="status-section">
          <p className="status-text">
            {status === 'idle' && 'Click below to start a conversation'}
            {status === 'connecting' && 'Connecting to assistant…'}
            {status === 'active' && !isMuted && 'Listening — speak now'}
            {status === 'active' && isMuted && 'Microphone is muted'}
            {status === 'ended' && 'Call ended — click to call again'}
          </p>

          <div className={`status-dot-row ${isActive ? 'visible' : ''}`}>
            {[0, 1, 2].map(i => (
              <div key={i} className="status-dot" style={{ '--i': i } as React.CSSProperties} />
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="action-buttons">
          {isIdle && (
            <button className="btn-call-start" onClick={startCall}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24 1.11.37 2.3.57 3.58.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.29 21 3 13.71 3 4.5c0-.55.45-1 1-1H7.5c.55 0 1 .45 1 1 0 1.29.2 2.53.57 3.7.11.35.03.74-.24 1.02L6.6 10.8z" />
              </svg>
              Start Conversation
            </button>
          )}

          {isConnecting && (
            <button className="btn-cancel" onClick={endCall}>
              Cancel
            </button>
          )}

          {isActive && (
            <div className="active-controls">
              <button
                className={`btn-mute ${isMuted ? 'muted' : ''}`}
                onClick={toggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3 3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z" />
                  </svg>
                )}
              </button>

              <button className="btn-end-call" onClick={endCall} title="End call">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Transcript */}
        {messages.length > 0 && (
          <div className="transcript-container" ref={transcriptRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`transcript-msg ${msg.role}`}>
                <div className="transcript-bubble">
                  <span className="transcript-role">{msg.role === 'assistant' ? 'Assistant' : 'You'}</span>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
