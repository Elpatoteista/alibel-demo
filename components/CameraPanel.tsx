'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, AlertTriangle, Play, Cpu } from 'lucide-react';
import type { SimulationState } from '@/types/simulation';
import type { CameraStatus } from '@/hooks/useCamera';
import type { FaceBox } from '@/hooks/useFaceDetection';

interface CameraPanelProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraStatus: CameraStatus;
  simState: SimulationState;
  faceBox: FaceBox | null;
  modelLoaded: boolean;
  onActivateCamera: () => void;
  onStartMonitoring: () => void;
  onSimulateEMS: () => void;
  onReset: () => void;
}

// ── Tracking face box overlay ──────────────────────────────────────────────
function TrackingOverlay({
  simState,
  faceBox,
}: {
  simState: SimulationState;
  faceBox: FaceBox | null;
}) {
  const isCritical = simState === 'criticalAlert' || simState === 'sendingAlert';
  const isAnomaly  = simState === 'anomalyDetected';
  const isValiding = simState === 'validating';
  const isDelivered = simState === 'delivered';
  const isNormal   = simState === 'monitoring';

  const boxColor = isCritical || isDelivered
    ? '#ef4444'
    : isAnomaly || isValiding
    ? '#f59e0b'
    : '#00e676';

  const statusLabel = isCritical
    ? 'EMS DETECTADA'
    : isDelivered
    ? 'ALERTA ENVIADA'
    : isValiding
    ? 'VALIDANDO...'
    : isAnomaly
    ? 'ANOMALÍA'
    : 'OPERADOR';

  // Normalized face box → percent strings (video is mirrored via CSS, so mirror X)
  const box = faceBox
    ? {
        // Mirror X because video is flipped with scaleX(-1)
        left:   `${(1 - faceBox.x - faceBox.width) * 100}%`,
        top:    `${faceBox.y * 100}%`,
        width:  `${faceBox.width * 100}%`,
        height: `${faceBox.height * 100}%`,
      }
    : {
        // Fallback centered box when no face is detected yet
        left: '25%', top: '15%', width: '50%', height: '60%',
      };

  const hasRealFace = faceBox !== null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">

      {/* ── Main tracking box ── */}
      <div
        className="absolute"
        style={{
          ...box,
          border: `2px solid ${boxColor}`,
          borderRadius: 4,
          transition: hasRealFace
            ? 'left 0.12s ease-out, top 0.12s ease-out, width 0.12s ease-out, height 0.12s ease-out'
            : 'none',
          boxShadow: `0 0 12px ${boxColor}44`,
        }}
      >
        {/* Corner accents */}
        {[
          'top-0 left-0 border-t-2 border-l-2',
          'top-0 right-0 border-t-2 border-r-2',
          'bottom-0 left-0 border-b-2 border-l-2',
          'bottom-0 right-0 border-b-2 border-r-2',
        ].map((cls, i) => (
          <span
            key={i}
            className={`absolute w-4 h-4 ${cls}`}
            style={{ borderColor: boxColor, margin: -1 }}
          />
        ))}

        {/* Status label below box */}
        <div
          className="absolute left-0 right-0 flex justify-center"
          style={{ top: 'calc(100% + 6px)' }}
        >
          <span
            className="text-label px-2 py-0.5 rounded font-bold tracking-widest"
            style={{
              color: boxColor,
              background: `${boxColor}18`,
              border: `1px solid ${boxColor}40`,
              fontSize: '0.55rem',
            }}
          >
            {statusLabel}
          </span>
        </div>

        {/* Confidence badge */}
        {hasRealFace && faceBox && (
          <div
            className="absolute right-0 flex items-center gap-1"
            style={{ top: 'calc(-100% + 6px)', transform: 'translateY(-4px)' }}
          >
            <span
              className="text-label px-1.5 py-0.5 rounded"
              style={{
                color: boxColor,
                background: `${boxColor}15`,
                border: `1px solid ${boxColor}30`,
                fontSize: '0.5rem',
              }}
            >
              {Math.round(faceBox.confidence * 100)}%
            </span>
          </div>
        )}

        {/* Scan line inside box */}
        {(isNormal || isAnomaly || isValiding) && (
          <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 2 }}>
            <div
              className="absolute left-0 right-0 h-px scan-line"
              style={{ background: `linear-gradient(90deg, transparent, ${boxColor}, transparent)`, opacity: 0.8 }}
            />
          </div>
        )}

        {/* Critical pulse ring */}
        {(isCritical || isDelivered) && (
          <div
            className="absolute -inset-2 rounded animate-ping"
            style={{ border: `1px solid ${boxColor}`, opacity: 0.3 }}
          />
        )}
      </div>

      {/* ── EKG / VFC line ── */}
      <div
        className="absolute bottom-3 left-3 right-3 flex items-center gap-2"
        style={{ opacity: 0.9 }}
      >
        <span className="text-label text-slate-500" style={{ fontSize: '0.55rem' }}>VFC</span>
        <svg viewBox="0 0 300 28" className="flex-1 h-7">
          <polyline
            points={
              (isCritical || isDelivered)
                ? '0,14 50,14 55,14 60,14 300,14'
                : isAnomaly || isValiding
                ? '0,14 15,14 20,3 25,25 30,14 60,14 80,14 90,3 95,25 100,14 160,14 170,10 175,18 180,14 240,14 250,7 255,21 260,14 300,14'
                : '0,14 15,14 20,2 25,26 30,14 70,14 80,14 90,2 95,26 100,14 170,14 180,10 185,18 190,14 250,14 260,4 265,24 270,14 300,14'
            }
            fill="none"
            stroke={boxColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 2px ${boxColor}80)` }}
          />
        </svg>
        <span
          className="font-mono font-bold tabular-nums"
          style={{ color: boxColor, fontSize: '0.7rem' }}
        >
          {isCritical || isDelivered ? '—' : isAnomaly ? '41' : isValiding ? '28' : '68'}
        </span>
        <span className="text-label text-slate-600" style={{ fontSize: '0.5rem' }}>ms</span>
      </div>

      {/* ── Grid overlay ── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${boxColor}0a 1px, transparent 1px), linear-gradient(90deg, ${boxColor}0a 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Top-right scan icon ── */}
      {isNormal && (
        <div className="absolute top-3 right-3">
          <div
            className="w-6 h-6 rounded-full border border-[#00e676]/40 animate-radar"
            style={{ borderStyle: 'dashed' }}
          />
        </div>
      )}
    </div>
  );
}

// ── Camera placeholder ─────────────────────────────────────────────────────
function CameraPlaceholder({
  cameraStatus,
  modelLoaded,
}: {
  cameraStatus: CameraStatus;
  modelLoaded: boolean;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[#070a07]">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center border"
        style={{ background: 'rgba(0,230,118,0.04)', borderColor: 'rgba(0,230,118,0.15)' }}
      >
        {cameraStatus === 'denied'
          ? <CameraOff className="w-9 h-9 text-slate-600" />
          : <Camera className="w-9 h-9 text-slate-700" />
        }
      </div>

      {cameraStatus === 'idle' && (
        <div className="text-center px-6">
          <p className="text-white font-semibold text-lg mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            Cámara no inicializada
          </p>
          <p className="text-slate-600 text-sm">
            Active la cámara para iniciar el monitoreo del operador
          </p>
        </div>
      )}

      {cameraStatus === 'requesting' && (
        <div className="text-center">
          <p className="text-[#00e676] font-medium text-base mb-3">
            Solicitando acceso...
          </p>
          <div className="flex gap-1.5 justify-center">
            {[0, 1, 2, 3].map(i => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-bounce"
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {(cameraStatus === 'denied' || cameraStatus === 'error') && (
        <div className="text-center px-8 max-w-sm">
          <p className="text-amber-400 font-semibold text-base mb-2">
            {cameraStatus === 'denied' ? 'Permiso de cámara denegado' : 'Error de acceso a cámara'}
          </p>
          <p className="text-slate-500 text-sm leading-relaxed">
            Habilite el acceso a la cámara en su navegador. La simulación continúa disponible.
          </p>
        </div>
      )}

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,230,118,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,230,118,0.04) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Model loading indicator */}
      {!modelLoaded && cameraStatus === 'active' && (
        <div
          className="absolute top-3 left-3 flex items-center gap-2 rounded px-2 py-1"
          style={{ background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.2)' }}
        >
          <Cpu className="w-3 h-3 text-[#00e676] animate-spin" />
          <span className="text-label text-[#00e676]" style={{ fontSize: '0.55rem' }}>
            Cargando modelo...
          </span>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function CameraPanel({
  videoRef,
  cameraStatus,
  simState,
  faceBox,
  modelLoaded,
  onActivateCamera,
  onStartMonitoring,
  onSimulateEMS,
  onReset,
}: CameraPanelProps) {
  const isCritical = simState === 'criticalAlert' || simState === 'sendingAlert';
  const isDelivered = simState === 'delivered';
  const canSimulate = simState === 'monitoring';
  const isActive = !['idle', 'cameraReady'].includes(simState);

  return (
    <div
      className="flex flex-col rounded-2xl border overflow-hidden transition-all duration-500"
      style={{
        borderColor: isCritical ? 'rgba(239,68,68,0.5)' : '#1f2d1f',
        background: '#0d110d',
        boxShadow: isCritical
          ? '0 0 40px rgba(239,68,68,0.15)'
          : isActive
          ? '0 0 20px rgba(0,230,118,0.06)'
          : 'none',
      }}
    >
      {/* ── Panel header ── */}
      <div
        className="flex items-center justify-between px-5 py-3.5 border-b"
        style={{
          borderColor: isCritical ? 'rgba(239,68,68,0.25)' : '#1a2d1a',
          background: isCritical ? 'rgba(127,0,0,0.1)' : 'rgba(17,24,17,0.7)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <Camera
            className="w-4 h-4"
            style={{ color: isCritical ? '#ef4444' : '#00e676' }}
          />
          <span className="font-semibold text-white" style={{ fontSize: '0.9rem' }}>
            Vista de cabina — Monitoreo en tiempo real
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          {modelLoaded && isActive && (
            <span
              className="text-label flex items-center gap-1"
              style={{ color: '#00e676', fontSize: '0.55rem' }}
            >
              <Cpu className="w-3 h-3" />
              IA ACTIVA
            </span>
          )}
          {cameraStatus === 'active' && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-label text-red-400 tracking-widest" style={{ fontSize: '0.6rem' }}>EN VIVO</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Viewport ── */}
      <div className="relative bg-[#070a07]" style={{ aspectRatio: '16/9' }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{
            opacity: cameraStatus === 'active' ? 1 : 0,
            transform: 'scaleX(-1)',
            transition: 'opacity 0.5s ease',
          }}
        />

        {/* Overlay shown when camera is active and monitoring */}
        {cameraStatus === 'active' && isActive && (
          <TrackingOverlay simState={simState} faceBox={faceBox} />
        )}

        {/* Camera off / loading state */}
        {cameraStatus !== 'active' && (
          <CameraPlaceholder cameraStatus={cameraStatus} modelLoaded={modelLoaded} />
        )}

        {/* Model loading indicator while camera is active */}
        {cameraStatus === 'active' && !modelLoaded && isActive && (
          <div
            className="absolute top-3 left-3 flex items-center gap-1.5 rounded px-2 py-1"
            style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(0,230,118,0.3)' }}
          >
            <Cpu className="w-3 h-3 text-[#00e676] animate-spin" />
            <span className="text-label text-[#00e676]" style={{ fontSize: '0.55rem' }}>
              Cargando detección facial...
            </span>
          </div>
        )}

        {/* Critical border */}
        {isCritical && (
          <div className="absolute inset-0 pointer-events-none animate-critical" style={{ border: '3px solid', borderRadius: 0 }} />
        )}
        {isDelivered && (
          <div className="absolute inset-0 pointer-events-none border-2 border-red-600/30" />
        )}
      </div>

      {/* ── Controls bar ── */}
      <div
        className="flex flex-wrap items-center gap-3 px-5 py-3.5 border-t"
        style={{ borderColor: '#1a2d1a', background: 'rgba(11,14,11,0.5)' }}
      >
        {simState === 'idle' && (
          <button
            id="btn-activar-camara"
            onClick={onActivateCamera}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.03] active:scale-95"
            style={{
              background: 'rgba(0,230,118,0.12)',
              border: '1px solid rgba(0,230,118,0.4)',
              color: '#00e676',
              boxShadow: '0 0 12px rgba(0,230,118,0.15)',
            }}
          >
            <Camera className="w-4 h-4" />
            Activar cámara
          </button>
        )}

        {simState === 'cameraReady' && (
          <button
            id="btn-iniciar-monitoreo"
            onClick={onStartMonitoring}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.03] active:scale-95"
            style={{
              background: 'rgba(0,230,118,0.15)',
              border: '1px solid rgba(0,230,118,0.5)',
              color: '#00e676',
              boxShadow: '0 0 16px rgba(0,230,118,0.2)',
            }}
          >
            <Play className="w-4 h-4" />
            Iniciar monitoreo
          </button>
        )}

        {canSimulate && (
          <button
            id="btn-simular-ems"
            onClick={onSimulateEMS}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.03] active:scale-95"
            style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.5)',
              color: '#ef4444',
              boxShadow: '0 0 12px rgba(239,68,68,0.15)',
            }}
          >
            <AlertTriangle className="w-4 h-4" />
            Simular EMS
          </button>
        )}

        {(isCritical || isDelivered || simState === 'anomalyDetected' || simState === 'validating') && (
          <button
            id="btn-reiniciar"
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
            style={{ background: 'rgba(17,24,17,0.8)', border: '1px solid #1f2d1f', color: '#64748b' }}
          >
            Reiniciar simulación
          </button>
        )}

        <div className="ml-auto font-mono" style={{ fontSize: '0.7rem' }}>
          {cameraStatus === 'active'
            ? <span style={{ color: '#00e676' }}>CAM · 1280×720 · H.264</span>
            : <span className="text-slate-700">SIN SEÑAL</span>
          }
        </div>
      </div>
    </div>
  );
}
