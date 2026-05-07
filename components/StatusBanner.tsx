'use client';

import type { SimulationState } from '@/types/simulation';

interface StatusBannerProps {
  simState: SimulationState;
}

const statusMessages: Record<SimulationState, { message: string; sub: string; style: React.CSSProperties; dot: string } | null> = {
  idle: null,
  cameraReady: {
    message: 'Cámara inicializada',
    sub: 'Presione "Iniciar monitoreo" para comenzar',
    style: { background: 'rgba(0,230,118,0.05)', borderColor: 'rgba(0,230,118,0.2)', color: 'rgba(0,230,118,0.9)' },
    dot: '#00e676',
  },
  monitoring: {
    message: 'Monitoreo en tiempo real activo',
    sub: 'Operador estable · Sistema funcionando normalmente',
    style: { background: 'rgba(0,230,118,0.06)', borderColor: 'rgba(0,230,118,0.25)', color: 'rgba(0,230,118,0.9)' },
    dot: '#00e676',
  },
  anomalyDetected: {
    message: 'Anomalía detectada',
    sub: 'Reducción de actividad del operador · Iniciando validación',
    style: { background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.25)', color: 'rgba(245,158,11,0.9)' },
    dot: '#f59e0b',
  },
  validating: {
    message: 'Validando condición crítica...',
    sub: 'Confirmando umbral de inactividad sostenida ≥ 8 segundos',
    style: { background: 'rgba(249,115,22,0.06)', borderColor: 'rgba(249,115,22,0.25)', color: 'rgba(249,115,22,0.9)' },
    dot: '#f97316',
  },
  criticalAlert: {
    message: '⚠ EMS DETECTADA — Generando alerta automática',
    sub: 'Evento crítico confirmado · Protocolo de respuesta activado',
    style: { background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.35)', color: 'rgba(239,68,68,0.95)', fontWeight: '600' },
    dot: '#ef4444',
  },
  sendingAlert: {
    message: 'Enviando alerta al supervisor y centro de monitoreo',
    sub: 'Notificación en curso · Aguardando confirmación de recepción',
    style: { background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.9)' },
    dot: '#ef4444',
  },
  delivered: {
    message: 'Alerta entregada correctamente',
    sub: 'Recibida por supervisor y centro de monitoreo · Protocolo iniciado',
    style: { background: 'rgba(0,230,118,0.06)', borderColor: 'rgba(0,230,118,0.25)', color: 'rgba(0,230,118,0.9)' },
    dot: '#00e676',
  },
};

export default function StatusBanner({ simState }: StatusBannerProps) {
  const config = statusMessages[simState];
  if (!config) return null;

  return (
    <div
      className="rounded-lg border px-4 py-3 mb-4 transition-all duration-700"
      style={config.style}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
          style={{ background: config.dot }}
        />
        <p className="text-sm">{config.message}</p>
      </div>
      <p className="text-xs opacity-70 mt-0.5 pl-3.5">{config.sub}</p>
    </div>
  );
}
