'use client';

import {
  User, Cpu, MapPin, Activity, Clock, AlertTriangle,
  Radio, Thermometer, TrendingDown, TrendingUp,
} from 'lucide-react';
import type { TelemetryData, SimulationState } from '@/types/simulation';

interface TelemetryPanelProps {
  data: TelemetryData;
  simState: SimulationState;
}

// ALIBEL brand: #00e676 green / carbon surfaces
function MetricBar({ value, color }: { value: number; color: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="h-1.5 bg-[#1a2d1a]/60 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function DataRow({
  icon: Icon,
  label,
  value,
  valueColor = 'text-white',
  subValue,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueColor?: string;
  subValue?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[#1a2d1a]/40 last:border-0">
      <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-[#111811] border border-[#1f2d1f]/60">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-600 uppercase tracking-widest mb-0.5">{label}</p>
        <p className={`text-sm font-medium truncate ${valueColor} transition-colors duration-500`}>{value}</p>
        {subValue && <p className="text-xs text-slate-600 mt-0.5">{subValue}</p>}
      </div>
    </div>
  );
}

export default function TelemetryPanel({ data, simState }: TelemetryPanelProps) {
  const isCritical = ['criticalAlert', 'sendingAlert', 'delivered'].includes(simState);
  const isAnomaly = ['anomalyDetected', 'validating'].includes(simState);
  const isMonitoring = !['idle', 'cameraReady'].includes(simState);

  // Movement bar color
  const movementColor =
    data.movementLevel > 50
      ? 'bg-[#00e676]'           // green = normal
      : data.movementLevel > 20
      ? 'bg-amber-400'           // amber = low
      : 'bg-red-500';            // red = critical

  const statusColor = isCritical
    ? 'text-red-400'
    : isAnomaly
    ? 'text-amber-400'
    : isMonitoring
    ? 'text-[#00e676]'
    : 'text-slate-500';

  const hrv = Math.round(data.heartRateVariability);

  return (
    <div className={`rounded-xl border overflow-hidden transition-all duration-700 ${
      isCritical ? 'border-red-800/50' : 'border-[#1f2d1f]/80'
    } bg-[#0d110d]`}>

      {/* Header */}
      <div className={`px-4 py-3 border-b flex items-center gap-2 ${
        isCritical
          ? 'border-red-900/40 bg-red-950/20'
          : 'border-[#1f2d1f]/60 bg-[#111811]/60'
      }`}>
        <Activity className={`w-4 h-4 ${isCritical ? 'text-red-400' : 'text-[#00e676]'}`} />
        <span className="text-sm font-semibold text-white">Telemetría del operador</span>
      </div>

      <div className="p-4 space-y-0">
        <DataRow
          icon={User}
          label="ID Operador"
          value={data.operatorId}
          subValue="Carlos Herrera Díaz"
        />
        <DataRow
          icon={Cpu}
          label="ID Maquinaria"
          value={data.machineryId}
          subValue="Excavadora Caterpillar 390F"
        />
        <DataRow
          icon={MapPin}
          label="Ubicación de faena"
          value={data.location}
        />

        {/* Movement level */}
        <div className="py-2.5 border-b border-[#1a2d1a]/40">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-[#111811] border border-[#1f2d1f]/60">
              {data.movementLevel > 40
                ? <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                : <TrendingDown className="w-3.5 h-3.5 text-slate-500" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-slate-600 uppercase tracking-widest">Nivel de movimiento</p>
                <span className={`text-xs font-mono font-bold ${
                  data.movementLevel > 50 ? 'text-[#00e676]' : data.movementLevel > 20 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {isMonitoring ? `${Math.round(data.movementLevel)}%` : '—'}
                </span>
              </div>
              <MetricBar value={isMonitoring ? data.movementLevel : 0} color={movementColor} />
            </div>
          </div>
        </div>

        {/* No response timer */}
        <div className="py-2.5 border-b border-[#1a2d1a]/40">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-[#111811] border border-[#1f2d1f]/60">
              <Clock className={`w-3.5 h-3.5 ${data.noResponseTime > 0 ? 'text-red-400' : 'text-slate-500'}`} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-600 uppercase tracking-widest mb-0.5">Tiempo sin respuesta</p>
              <p className={`text-sm font-mono font-medium transition-colors duration-500 ${
                data.noResponseTime > 8 ? 'text-red-400' : data.noResponseTime > 0 ? 'text-amber-400' : 'text-slate-500'
              }`}>
                {data.noResponseTime > 0 ? `${Math.round(data.noResponseTime)} s` : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* HRV */}
        <div className="py-2.5 border-b border-[#1a2d1a]/40">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-[#111811] border border-[#1f2d1f]/60">
              <Activity className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-600 uppercase tracking-widest mb-0.5">Variabilidad FC (VFC)</p>
              <p className={`text-sm font-mono font-medium transition-colors duration-500 ${
                hrv === 0 ? 'text-red-500' : hrv < 40 ? 'text-amber-400' : 'text-[#00e676]'
              }`}>
                {isMonitoring ? (hrv === 0 ? 'Sin señal' : `${hrv} ms`) : '—'}
              </p>
            </div>
          </div>
        </div>

        <DataRow
          icon={Thermometer}
          label="Temp. cabina"
          value={isMonitoring ? data.cabinTemp : '—'}
        />
        <DataRow
          icon={AlertTriangle}
          label="Severidad del evento"
          value={data.alertSeverity}
          valueColor={
            data.alertSeverity === 'CRÍTICA'  ? 'text-red-400' :
            data.alertSeverity === 'Alta'      ? 'text-orange-400' :
            data.alertSeverity === 'Moderada'  ? 'text-amber-400' :
            'text-slate-500'
          }
        />
        <DataRow
          icon={Radio}
          label="Canal de alerta"
          value={data.alertChannel || '—'}
          valueColor={data.alertChannel !== '—' ? 'text-[#00e676]' : 'text-slate-500'}
        />
        <DataRow
          icon={Activity}
          label="Estado de monitoreo"
          value={data.monitoringStatus}
          valueColor={statusColor}
        />
      </div>
    </div>
  );
}
