'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Shield, Activity, Clock } from 'lucide-react';
import type { SimulationState } from '@/types/simulation';

interface HeaderProps {
  simState: SimulationState;
}

function LiveClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    setTime(fmt());
    const interval = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(interval);
  }, []);

  return <span suppressHydrationWarning>{time}</span>;
}

// ALIBEL brand: green #00e676 / carbon #1a1a1a
const STATUS_CONFIG: Record<
  SimulationState,
  { label: string; color: string; dot: string }
> = {
  idle:            { label: 'Sistema en espera',    color: 'text-slate-400',              dot: 'bg-slate-500' },
  cameraReady:     { label: 'Inicializando',         color: 'text-[#00e676]',              dot: 'bg-[#00e676]' },
  monitoring:      { label: 'Monitoreando',          color: 'text-[#00e676]',              dot: 'bg-[#00e676] animate-pulse' },
  anomalyDetected: { label: 'Anomalía detectada',   color: 'text-amber-400',              dot: 'bg-amber-400 animate-pulse' },
  validating:      { label: 'Validando evento',     color: 'text-orange-400',             dot: 'bg-orange-400 animate-pulse' },
  criticalAlert:   { label: 'ALERTA CRÍTICA',       color: 'text-red-400 font-bold',      dot: 'bg-red-500' },
  sendingAlert:    { label: 'Enviando alerta',      color: 'text-red-400 font-bold',      dot: 'bg-red-500 animate-pulse' },
  delivered:       { label: 'Alerta entregada',     color: 'text-[#00e676]',              dot: 'bg-[#00e676]' },
};

export default function Header({ simState }: HeaderProps) {
  const isCritical = simState === 'criticalAlert' || simState === 'sendingAlert';
  const isMonitoring = !['idle', 'cameraReady'].includes(simState);
  const status = STATUS_CONFIG[simState];

  const today =
    typeof window !== 'undefined'
      ? new Date().toLocaleDateString('es-CL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '';

  return (
    <header
      className={`relative z-10 border-b transition-colors duration-700 ${
        isCritical
          ? 'bg-[#150808]/95 border-red-900/60'
          : 'bg-[#0d110d]/95 border-[#1a2d1a]/80'
      } backdrop-blur-sm`}
    >
      {/* Subtle green top accent line */}
      {!isCritical && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00e676]/40 to-transparent" />
      )}
      {isCritical && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 via-transparent to-red-900/10 pointer-events-none" />
      )}

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* ── Logo + Brand ── */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo: use dark_logo on dark background */}
            <div className="relative h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0">
              <Image
                src="/alibel-logo-dark.png"
                alt="ALIBEL"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-bold text-xl sm:text-2xl tracking-wide">
                  ALIBEL
                </span>
                <span className="hidden sm:inline text-xs font-medium text-[#00e676]/60 bg-[#00e676]/5 border border-[#00e676]/20 px-2 py-0.5 rounded font-mono">
                  v1.0 · PoC
                </span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm truncate italic">
                detect. protect. respond.
              </p>
            </div>
          </div>

          {/* ── System status (center) ── */}
          <div className="hidden md:flex items-center gap-3 bg-[#111811]/80 border border-[#1f2d1f] rounded-lg px-4 py-2.5">
            <div className="relative flex-shrink-0">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${status.dot}`} />
              {isCritical && (
                <span className="absolute inset-0 rounded-full bg-red-500 opacity-50 animate-ping" />
              )}
              {(simState === 'monitoring' || simState === 'delivered') && (
                <span className="absolute inset-0 rounded-full bg-[#00e676] opacity-40 animate-ping" />
              )}
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-widest leading-none mb-0.5">
                Estado del sistema
              </p>
              <p className={`text-sm leading-none transition-colors duration-500 ${status.color}`}>
                {status.label}
              </p>
            </div>
          </div>

          {/* ── Date, time, active indicator ── */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex flex-col items-end">
              <div className="flex items-center gap-1.5 text-slate-300 text-sm font-mono tabular-nums">
                <Clock className="w-3.5 h-3.5 text-slate-600" />
                <LiveClock />
              </div>
              <p className="text-slate-600 text-xs capitalize" suppressHydrationWarning>
                {today}
              </p>
            </div>

            <div className={`flex items-center gap-1.5 border rounded-md px-3 py-1.5 transition-all duration-500 ${
              isMonitoring && !isCritical
                ? 'bg-[#00e676]/10 border-[#00e676]/30'
                : isCritical
                ? 'bg-red-900/20 border-red-700/40'
                : 'bg-[#111811] border-[#1f2d1f]'
            }`}>
              {isMonitoring && !isCritical ? (
                <Activity className="w-4 h-4 text-[#00e676] animate-pulse" />
              ) : isCritical ? (
                <Activity className="w-4 h-4 text-red-400 animate-pulse" />
              ) : (
                <Shield className="w-4 h-4 text-slate-600" />
              )}
              <span className={`text-xs font-medium ${
                isMonitoring && !isCritical
                  ? 'text-[#00e676]'
                  : isCritical
                  ? 'text-red-400'
                  : 'text-slate-600'
              }`}>
                {isMonitoring ? 'Activo' : 'Standby'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
