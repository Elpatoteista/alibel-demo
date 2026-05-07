'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  SimulationState,
  AlertStep,
  TelemetryData,
  AlertSummaryData,
} from '@/types/simulation';

const INITIAL_ALERT_STEPS: AlertStep[] = [
  { id: 'detection', label: 'Evento detectado', description: 'Anomalía biomédica registrada por sensores de cabina', status: 'pending' },
  { id: 'validation', label: 'Validación temporal', description: 'Confirmación de umbral crítico sostenido (≥ 8 s)', status: 'pending' },
  { id: 'alert_gen', label: 'Alerta generada', description: 'Protocolo EMS activado · Datos del evento encapsulados', status: 'pending' },
  { id: 'supervisor', label: 'Supervisor notificado', description: 'Notificación enviada a supervisor de turno — Canal 2', status: 'pending' },
  { id: 'monitoring', label: 'Monitoreo central', description: 'Escalamiento a centro de monitoreo regional', status: 'pending' },
  { id: 'delivered', label: 'Alerta entregada', description: 'Recepción confirmada · Protocolo de respuesta iniciado', status: 'pending' },
];

const MOCK_OPERATOR = {
  operatorId: 'OP-2847',
  operatorName: 'Carlos Herrera Díaz',
  machineryId: 'EX-CAT-039',
  location: 'Faena Norte · Nivel 3 · Sector B-12',
};

function buildTelemetry(state: SimulationState, tick: number): TelemetryData {
  const base: TelemetryData = {
    ...MOCK_OPERATOR,
    movementLevel: 78 + Math.sin(tick * 0.3) * 8,
    noResponseTime: 0,
    monitoringStatus: 'Monitoreo activo',
    alertSeverity: '—',
    alertChannel: '—',
    heartRateVariability: 62 + Math.sin(tick * 0.5) * 5,
    cabinTemp: '19.4 °C',
  };

  switch (state) {
    case 'idle':
      return { ...base, movementLevel: 0, monitoringStatus: 'Sistema en espera', heartRateVariability: 0 };
    case 'cameraReady':
      return { ...base, movementLevel: 0, monitoringStatus: 'Inicializando sensores', heartRateVariability: 0 };
    case 'monitoring':
      return base;
    case 'anomalyDetected':
      return {
        ...base,
        movementLevel: 18 + Math.max(0, Math.sin(tick * 0.2) * 6),
        noResponseTime: Math.min(tick * 1.2, 8),
        monitoringStatus: 'Anomalía detectada',
        alertSeverity: 'Moderada',
        heartRateVariability: 41 + Math.sin(tick * 0.8) * 4,
      };
    case 'validating':
      return {
        ...base,
        movementLevel: 8,
        noResponseTime: 9 + tick * 0.5,
        monitoringStatus: 'Validando evento crítico',
        alertSeverity: 'Alta',
        heartRateVariability: 28,
      };
    case 'criticalAlert':
    case 'sendingAlert':
      return {
        ...base,
        movementLevel: 2,
        noResponseTime: 12 + tick * 0.3,
        monitoringStatus: 'EMS DETECTADA',
        alertSeverity: 'CRÍTICA',
        alertChannel: 'Canal prioritario',
        heartRateVariability: 0,
      };
    case 'delivered':
      return {
        ...base,
        movementLevel: 2,
        noResponseTime: 15,
        monitoringStatus: 'Alerta entregada',
        alertSeverity: 'CRÍTICA',
        alertChannel: 'Canal prioritario · Confirmado',
        heartRateVariability: 0,
      };
    default:
      return base;
  }
}

export function useSimulation() {
  const [simState, setSimState] = useState<SimulationState>('idle');
  const [alertSteps, setAlertSteps] = useState<AlertStep[]>(INITIAL_ALERT_STEPS);
  const [tick, setTick] = useState(0);
  const [telemetry, setTelemetry] = useState<TelemetryData>(buildTelemetry('idle', 0));
  const [alertSummary, setAlertSummary] = useState<AlertSummaryData | null>(null);
  const tickRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Live tick for telemetry animations
  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;
      setTick(t => t + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Update telemetry whenever state or tick changes
  useEffect(() => {
    setTelemetry(buildTelemetry(simState, tickRef.current));
  }, [simState, tick]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const setStep = useCallback((stepId: string, status: AlertStep['status']) => {
    setAlertSteps(prev =>
      prev.map(s => (s.id === stepId ? { ...s, status } : s))
    );
  }, []);

  const activateCamera = useCallback(() => {
    setSimState('cameraReady');
  }, []);

  const startMonitoring = useCallback(() => {
    setSimState('monitoring');
  }, []);

  const simulateEMS = useCallback(() => {
    if (simState !== 'monitoring' && simState !== 'cameraReady') return;

    clearTimers();
    setAlertSteps(INITIAL_ALERT_STEPS);

    const schedule = (fn: () => void, ms: number) => {
      const t = setTimeout(fn, ms);
      timersRef.current.push(t);
    };

    // T+0s: anomaly detected
    setSimState('anomalyDetected');

    // T+3s: step 1 active → completed
    schedule(() => setStep('detection', 'active'), 500);
    schedule(() => setStep('detection', 'completed'), 2000);

    // T+4s: validating
    schedule(() => {
      setSimState('validating');
      setStep('validation', 'active');
    }, 3000);
    schedule(() => setStep('validation', 'completed'), 5000);

    // T+5.5s: critical alert
    schedule(() => {
      setSimState('criticalAlert');
      setStep('alert_gen', 'active');
    }, 5500);
    schedule(() => setStep('alert_gen', 'completed'), 7000);

    // T+7.5s: sending alert to supervisor
    schedule(() => {
      setSimState('sendingAlert');
      setStep('supervisor', 'active');
    }, 7500);
    schedule(() => setStep('supervisor', 'completed'), 9000);

    // T+9s: escalation to monitoring center
    schedule(() => setStep('monitoring', 'active'), 9500);
    schedule(() => setStep('monitoring', 'completed'), 11000);

    // T+11s: delivered
    schedule(() => {
      setStep('delivered', 'active');
    }, 11500);

    schedule(() => {
      setStep('delivered', 'completed');
      setSimState('delivered');
      const now = new Date();
      setAlertSummary({
        operatorId: MOCK_OPERATOR.operatorId,
        operatorName: MOCK_OPERATOR.operatorName,
        machineryId: MOCK_OPERATOR.machineryId,
        location: MOCK_OPERATOR.location,
        eventTime: now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        eventType: 'Posible emergencia médica súbita (EMS)',
        receptionStatus: 'Confirmada',
        recipients: ['Supervisor de turno — Canal 2', 'Centro de monitoreo regional'],
      });
    }, 13000);
  }, [simState, clearTimers, setStep]);

  const resetSimulation = useCallback(() => {
    clearTimers();
    setSimState('monitoring');
    setAlertSteps(INITIAL_ALERT_STEPS);
    setAlertSummary(null);
  }, [clearTimers]);

  const fullReset = useCallback(() => {
    clearTimers();
    setSimState('idle');
    setAlertSteps(INITIAL_ALERT_STEPS);
    setAlertSummary(null);
  }, [clearTimers]);

  return {
    simState,
    alertSteps,
    telemetry,
    alertSummary,
    activateCamera,
    startMonitoring,
    simulateEMS,
    resetSimulation,
    fullReset,
  };
}
