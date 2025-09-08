import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'pending';
}

// Accent palette per type for a rich glass look
const accent = {
  success: {
    glow: 'from-emerald-400/35 via-emerald-300/20 to-transparent',
    dot: 'bg-emerald-400',
    barFrom: 'from-emerald-400',
    barTo: 'to-emerald-500',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
    ),
  },
  error: {
    glow: 'from-rose-400/35 via-rose-300/20 to-transparent',
    dot: 'bg-rose-400',
    barFrom: 'from-rose-400',
    barTo: 'to-rose-500',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 9l-6 6M9 9l6 6" /></svg>
    ),
  },
  pending: {
    glow: 'from-amber-400/35 via-amber-300/20 to-transparent',
    dot: 'bg-amber-400',
    barFrom: 'from-amber-400',
    barTo: 'to-amber-500',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v6l4 2" /></svg>
    ),
  },
} as const;

const Toast: React.FC<ToastProps> = ({ message, type }) => {
  const [progress, setProgress] = useState(0);
  const duration = 3200; // ms

  useEffect(() => {
    const timer = setInterval(() => setProgress((p) => (p >= 100 ? 100 : p + 2)), duration / 50);
    return () => clearInterval(timer);
  }, [duration]);

  const a = accent[type];

  return (
    <div className="fixed bottom-6 right-6 z-[1000]" role="status" aria-live="polite">
      <div className="relative">
        {/* Ambient glow behind the toast */}
        <div className={`absolute -inset-5 rounded-[28px] blur-2xl bg-gradient-to-br ${a.glow}`} aria-hidden />

        {/* Glass container */}
        <div className="relative overflow-hidden rounded-[18px] bg-white/12 dark:bg-white/8 backdrop-blur-2xl ring-1 ring-white/30 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
          {/* Top shine */}
          <div className="pointer-events-none absolute inset-x-0 -top-0.5 h-10 bg-gradient-to-b from-white/45 to-transparent" />

          <div className="relative px-4 py-3 min-w-[260px]">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${a.dot} ring-1 ring-white/50 text-white shadow-[0_0_16px_rgba(255,255,255,0.35)]`}>
                {a.icon}
              </span>
              <p className="text-sm font-medium text-white drop-shadow-sm tracking-[0.2px]">{message}</p>
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
              <div className={`h-full rounded-full bg-gradient-to-r ${a.barFrom} ${a.barTo} shadow-[0_0_14px_currentColor]`} style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
