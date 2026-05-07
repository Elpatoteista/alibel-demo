'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Activity, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SimulationState } from '@/types/simulation';

interface HeaderProps {
  simState: SimulationState;
}

function LiveClock() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(new Date().toLocaleDateString('es-CL', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex flex-col items-end">
      <span className="text-white font-mono text-base font-semibold tabular-nums tracking-wider" suppressHydrationWarning>
        {time}
      </span>
      <span className="text-label text-slate-600 capitalize" suppressHydrationWarning>{date}</span>
    </div>
  );
}

const STATUS: Record<SimulationState, { label: string; color: string; dot: string; ring?: string }> = {
  idle: { label: 'Sistema en espera', color: 'text-slate-500', dot: '#475569' },
  cameraReady: { label: 'Inicializando...', color: 'text-[#00e676]', dot: '#00e676' },
  monitoring: { label: 'Monitoreando', color: 'text-[#00e676]', dot: '#00e676', ring: '#00e676' },
  anomalyDetected: { label: 'Anomalía detectada', color: 'text-amber-400', dot: '#f59e0b', ring: '#f59e0b' },
  validating: { label: 'Validando evento', color: 'text-orange-400', dot: '#f97316', ring: '#f97316' },
  criticalAlert: { label: '⚠ ALERTA CRÍTICA', color: 'text-red-400', dot: '#ef4444', ring: '#ef4444' },
  sendingAlert: { label: 'Enviando alerta', color: 'text-red-400', dot: '#ef4444', ring: '#ef4444' },
  delivered: { label: 'Alerta entregada', color: 'text-[#00e676]', dot: '#00e676' },
};

export default function Header({ simState }: HeaderProps) {
  const isCritical = simState === 'criticalAlert' || simState === 'sendingAlert';
  const isMonitoring = !['idle', 'cameraReady'].includes(simState);
  const s = STATUS[simState];
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`relative z-20 border-b transition-colors duration-700 ${isCritical ? 'bg-[#130606]/95 border-red-900/50' : 'bg-[#0a0d0a]/95 border-[#1a2d1a]/70'
        } backdrop-blur-md`}
    >
      {/* Top green accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] transition-all duration-700"
        style={{
          background: isCritical
            ? 'linear-gradient(90deg, transparent, #ef4444, transparent)'
            : 'linear-gradient(90deg, transparent, #00e676 40%, #00e676 60%, transparent)',
          opacity: isMonitoring ? 1 : 0.3,
        }}
      />

      <div className="max-w-screen-2xl mx-auto px-5 sm:px-8">
        <div className="flex items-center gap-6 h-[72px] sm:h-[84px]">

          {/* ── LOGO (icon only, no text) ── */}
          <div className="relative flex-shrink-0 h-20 w-20 sm:h-14 sm:w-14">
            <Image
              src="/alibel-icon-light.png"
              alt="ALIBEL"
              fill
              className="object-contain rounded-lg"
              priority
            />
            {/* Subtle glow ring on active */}
            {isMonitoring && !isCritical && (
              <div
                className="absolute inset-0 rounded-lg animate-green-glow"
                style={{ boxShadow: '0 0 16px 2px rgba(0,230,118,0.35)' }}
              />
            )}
          </div>

          {/* ── Brand text ── */}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-3">
              <h1
                className="text-white font-bold tracking-tight leading-none"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', letterSpacing: '-0.02em' }}
              >
                ALIBEL
              </h1>
              <span
                className="hidden sm:inline text-label border rounded px-2 py-0.5"
                style={{ color: '#00e676', borderColor: 'rgba(0,230,118,0.25)', background: 'rgba(0,230,118,0.06)', fontSize: '0.6rem' }}
              >
                v1.0 · PoC
              </span>
            </div>
            <p
              className="text-slate-500 mt-0.5 italic hidden sm:block"
              style={{ fontSize: '0.78rem', letterSpacing: '0.04em' }}
            >
              detect. protect. respond.
            </p>
          </div>

          {/* ── Status pill (center, desktop) ── */}
          {mounted && (
            <div
              className="hidden lg:flex items-center gap-3 rounded-xl px-5 py-2.5 border"
              style={{ background: 'rgba(13,17,13,0.9)', borderColor: '#1f2d1f' }}
            >
              <div className="relative flex-shrink-0 w-3 h-3">
                <span
                  className="absolute inset-0 rounded-full"
                  style={{ background: s.dot }}
                />
                {s.ring && (
                  <span
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{ background: s.ring, opacity: 0.4 }}
                  />
                )}
              </div>
              <div>
                <p className="text-label text-slate-600" style={{ fontSize: '0.6rem' }}>Estado del sistema</p>
                <p
                  className={`font-semibold leading-none mt-0.5 ${s.color} transition-colors duration-500`}
                  style={{ fontSize: '0.9rem' }}
                >
                  {s.label}
                </p>
              </div>
            </div>
          )}

          {/* ── Right: clock + active badge ── */}
          <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
            <div className="hidden md:block">
              <LiveClock />
            </div>

            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2 border transition-all duration-500"
              style={{
                background: isCritical
                  ? 'rgba(127,0,0,0.15)'
                  : isMonitoring
                    ? 'rgba(0,230,118,0.08)'
                    : 'rgba(13,17,13,0.8)',
                borderColor: isCritical ? '#7f0000' : isMonitoring ? 'rgba(0,230,118,0.3)' : '#1f2d1f',
              }}
            >
              <Activity
                className="w-4 h-4"
                style={{ color: isCritical ? '#ef4444' : isMonitoring ? '#00e676' : '#475569' }}
              />
              <span
                className="font-semibold text-sm"
                style={{ color: isCritical ? '#ef4444' : isMonitoring ? '#00e676' : '#475569' }}
              >
                {isMonitoring ? 'ACTIVO' : 'STANDBY'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Critical flash bar */}
      {isCritical && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-500 animate-pulse" />
      )}
    </motion.header>
  );
}
