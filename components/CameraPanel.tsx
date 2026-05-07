'use client';

// React hooks not directly needed here — parent manages state
import { Camera, CameraOff, AlertTriangle, Scan, Play } from 'lucide-react';
import type { SimulationState } from '@/types/simulation';
import type { CameraStatus } from '@/hooks/useCamera';

interface CameraPanelProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraStatus: CameraStatus;
  simState: SimulationState;
  onActivateCamera: () => void;
  onStartMonitoring: () => void;
  onSimulateEMS: () => void;
  onReset: () => void;
}

// ALIBEL brand green: #00e676
function ScanOverlay({ simState }: { simState: SimulationState }) {
  const isCritical = simState === 'criticalAlert' || simState === 'sendingAlert';
  const isAnomaly = simState === 'anomalyDetected';
  const isValidating = simState === 'validating';
  const isMonitoring = simState === 'monitoring';
  const isDelivered = simState === 'delivered';

  const boxColor = isCritical || isDelivered
    ? 'border-red-500'
    : isAnomaly || isValidating
    ? 'border-amber-400'
    : 'border-[#00e676]';

  const labelColor = isCritical || isDelivered
    ? 'text-red-400 bg-red-950/80 border-red-500/30'
    : isAnomaly || isValidating
    ? 'text-amber-400 bg-amber-950/80 border-amber-500/30'
    : 'text-[#00e676] bg-[#00150a]/80 border-[#00e676]/30';

  const statusLabel = isCritical
    ? 'EMS DETECTADA'
    : isDelivered
    ? 'ALERTA ENVIADA'
    : isValidating
    ? 'VALIDANDO...'
    : isAnomaly
    ? 'ANOMALÍA'
    : 'OPERADOR';

  const ekvColor = isCritical || isDelivered
    ? '#ef4444'
    : isAnomaly
    ? '#f59e0b'
    : '#00e676';

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Face bounding box */}
      <div
        className={`absolute border-2 ${boxColor} transition-colors duration-500`}
        style={{ top: '18%', left: '25%', width: '50%', height: '55%', borderRadius: 4 }}
      >
        {/* Corner accents */}
        <span className={`absolute -top-px -left-px w-6 h-6 border-t-2 border-l-2 ${boxColor}`} />
        <span className={`absolute -top-px -right-px w-6 h-6 border-t-2 border-r-2 ${boxColor}`} />
        <span className={`absolute -bottom-px -left-px w-6 h-6 border-b-2 border-l-2 ${boxColor}`} />
        <span className={`absolute -bottom-px -right-px w-6 h-6 border-b-2 border-r-2 ${boxColor}`} />

        {/* Status label */}
        <div className="absolute -bottom-7 left-0 right-0 flex justify-center">
          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${labelColor}`}>
            {statusLabel}
          </span>
        </div>

        {/* Scan line */}
        {(isMonitoring || isAnomaly || isValidating) && (
          <div className="absolute inset-0 overflow-hidden">
            <div
              className={`absolute left-0 right-0 h-0.5 scan-line`}
              style={{
                animation: 'scanLine 2s linear infinite',
                backgroundColor: isAnomaly ? 'rgba(245,158,11,0.7)' : 'rgba(0,230,118,0.5)',
              }}
            />
          </div>
        )}
      </div>

      {/* Pulse ring for critical */}
      {(isCritical || isDelivered) && (
        <div
          className="absolute border-2 border-red-500/30 rounded animate-ping"
          style={{ top: '16%', left: '23%', width: '54%', height: '59%', animationDuration: '1.5s' }}
        />
      )}

      {/* Green glow ring in monitoring */}
      {isMonitoring && (
        <div
          className="absolute border border-[#00e676]/10 rounded"
          style={{ top: '16%', left: '23%', width: '54%', height: '59%', animationDuration: '3s' }}
        />
      )}

      {/* VFC/EKG line bottom */}
      {simState !== 'idle' && simState !== 'cameraReady' && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500">VFC</span>
            <div className="flex-1 h-8 relative">
              <svg viewBox="0 0 300 32" className="w-full h-full">
                <polyline
                  points={
                    (isCritical || isDelivered)
                      ? '0,16 40,16 45,16 50,16 55,16 60,16 300,16'
                      : isAnomaly || isValidating
                      ? '0,16 20,16 25,4 30,28 35,16 60,16 80,16 90,4 95,28 100,16 150,16 160,12 165,20 170,16 220,16 230,8 235,24 240,16 300,16'
                      : '0,16 20,16 25,4 30,28 35,16 60,16 80,16 90,4 95,28 100,16 150,16 160,12 165,20 170,16 220,16 230,4 235,28 240,16 300,16'
                  }
                  fill="none"
                  stroke={ekvColor}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-xs font-mono" style={{ color: ekvColor }}>
              {isCritical || isDelivered ? '---' : isAnomaly ? '41' : isValidating ? '28' : '68'}
            </span>
          </div>
        </div>
      )}

      {/* Scan icon */}
      {isMonitoring && (
        <div className="absolute top-3 right-3">
          <Scan className="w-5 h-5 text-[#00e676]/60 animate-pulse" />
        </div>
      )}

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,230,118,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,230,118,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
}

export default function CameraPanel({
  videoRef,
  cameraStatus,
  simState,
  onActivateCamera,
  onStartMonitoring,
  onSimulateEMS,
  onReset,
}: CameraPanelProps) {
  const isCritical = simState === 'criticalAlert' || simState === 'sendingAlert';
  const isDelivered = simState === 'delivered';
  const canSimulate = simState === 'monitoring';

  return (
    <div className={`flex flex-col rounded-xl border overflow-hidden transition-all duration-700 ${
      isCritical
        ? 'border-red-700/60 shadow-lg shadow-red-900/30'
        : 'border-[#1f2d1f]/80'
    } bg-[#0d110d]`}>

      {/* Panel header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${
        isCritical
          ? 'border-red-900/40 bg-red-950/20'
          : 'border-[#1f2d1f]/60 bg-[#111811]/60'
      }`}>
        <div className="flex items-center gap-2">
          <Camera className={`w-4 h-4 ${isCritical ? 'text-red-400' : 'text-[#00e676]'}`} />
          <span className="text-sm font-semibold text-white">Vista de cabina — Monitoreo en tiempo real</span>
        </div>
        <div className="flex items-center gap-2">
          {cameraStatus === 'active' && (
            <>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-medium text-red-400 uppercase tracking-widest">EN VIVO</span>
            </>
          )}
        </div>
      </div>

      {/* Camera viewport */}
      <div className="relative bg-[#070a07]" style={{ aspectRatio: '16/9' }}>
        {/* Video element */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            cameraStatus === 'active' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Overlay when active */}
        {cameraStatus === 'active' && simState !== 'idle' && simState !== 'cameraReady' && (
          <ScanOverlay simState={simState} />
        )}

        {/* Camera off state */}
        {cameraStatus !== 'active' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#070a07]">
            <div className="relative">
              {cameraStatus === 'denied'
                ? <CameraOff className="w-16 h-16 text-slate-700" />
                : <Camera className="w-16 h-16 text-slate-800" />
              }
            </div>

            {cameraStatus === 'idle' && (
              <div className="text-center px-4">
                <p className="text-slate-500 text-sm font-medium mb-1">Cámara no inicializada</p>
                <p className="text-slate-700 text-xs">Active la cámara para iniciar el monitoreo del operador</p>
              </div>
            )}
            {cameraStatus === 'requesting' && (
              <div className="text-center">
                <p className="text-slate-500 text-sm">Solicitando acceso a la cámara...</p>
                <div className="mt-2 flex gap-1 justify-center">
                  {[0, 1, 2].map(i => (
                    <span key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            {(cameraStatus === 'denied' || cameraStatus === 'error') && (
              <div className="text-center px-6">
                <p className="text-amber-500 text-sm font-medium mb-1">
                  {cameraStatus === 'denied' ? 'Permiso de cámara denegado' : 'Error al acceder a la cámara'}
                </p>
                <p className="text-slate-600 text-xs">
                  Habilite el acceso a la cámara en su navegador y recargue la página.
                  La demo de simulación continúa disponible.
                </p>
              </div>
            )}

            {/* Grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(rgba(0,230,118,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,230,118,0.5) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>
        )}

        {/* Critical border flash */}
        {isCritical && (
          <div className="absolute inset-0 pointer-events-none border-4 border-red-500/60 animate-pulse rounded" />
        )}
        {isDelivered && (
          <div className="absolute inset-0 pointer-events-none border-4 border-red-600/30 rounded" />
        )}
      </div>

      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-[#111811]/40 border-t border-[#1f2d1f]/50">
        {simState === 'idle' && (
          <button
            onClick={onActivateCamera}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{ background: 'rgba(0,230,118,0.12)', border: '1px solid rgba(0,230,118,0.35)', color: '#00e676' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,230,118,0.2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,230,118,0.12)'; }}
          >
            <Camera className="w-4 h-4" />
            Activar cámara
          </button>
        )}

        {simState === 'cameraReady' && (
          <button
            onClick={onStartMonitoring}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{ background: 'rgba(0,230,118,0.15)', border: '1px solid rgba(0,230,118,0.4)', color: '#00e676' }}
          >
            <Play className="w-4 h-4" />
            Iniciar monitoreo
          </button>
        )}

        {canSimulate && (
          <button
            onClick={onSimulateEMS}
            className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg shadow-red-900/40"
          >
            <AlertTriangle className="w-4 h-4" />
            Simular EMS
          </button>
        )}

        {(isCritical || isDelivered || simState === 'anomalyDetected' || simState === 'validating') && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-[#161d16] hover:bg-[#1f2d1f] border border-[#1f2d1f] text-slate-400 hover:text-slate-200 rounded-lg text-sm font-medium transition-all duration-200"
          >
            Reiniciar simulación
          </button>
        )}

        <div className="ml-auto text-xs font-mono">
          {cameraStatus === 'active'
            ? <span style={{ color: '#00e676' }}>CAM · 1280×720 · H.264</span>
            : <span className="text-slate-700">SIN SEÑAL</span>
          }
        </div>
      </div>
    </div>
  );
}
