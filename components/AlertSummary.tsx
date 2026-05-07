'use client';

import { CheckCircle, User, Cpu, MapPin, Clock, AlertTriangle, Users, X } from 'lucide-react';
import type { AlertSummaryData } from '@/types/simulation';

interface AlertSummaryProps {
  data: AlertSummaryData;
  onDismiss: () => void;
}

export default function AlertSummary({ data, onDismiss }: AlertSummaryProps) {
  return (
    <div className="relative rounded-xl border border-red-700/60 bg-red-950/30 overflow-hidden shadow-2xl shadow-red-900/40">
      {/* Pulsing border glow */}
      <div className="absolute inset-0 rounded-xl border-2 border-red-500/20 animate-pulse pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-red-900/30 border-b border-red-800/40">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-red-600/30 border-2 border-red-500 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-red-400/30 animate-ping" />
          </div>
          <div>
            <p className="text-xs text-red-400 uppercase tracking-widest font-medium">Evento crítico confirmado</p>
            <h3 className="text-lg font-bold text-white">Alerta crítica enviada correctamente</h3>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 text-slate-400 hover:text-slate-200 transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Event details grid */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SummaryItem
          icon={AlertTriangle}
          label="Tipo de evento"
          value={data.eventType}
          valueColor="text-red-300"
        />
        <SummaryItem
          icon={User}
          label="Operador afectado"
          value={`${data.operatorId} · ${data.operatorName}`}
        />
        <SummaryItem
          icon={Cpu}
          label="Maquinaria asociada"
          value={data.machineryId}
          subValue="Excavadora Caterpillar 390F"
        />
        <SummaryItem
          icon={MapPin}
          label="Ubicación"
          value={data.location}
        />
        <SummaryItem
          icon={Clock}
          label="Hora del evento"
          value={data.eventTime}
        />
        <SummaryItem
          icon={CheckCircle}
          label="Estado de recepción"
          value={data.receptionStatus}
          valueColor="text-emerald-400"
        />
      </div>

      {/* Recipients */}
      <div className="px-5 pb-5">
        <div className="rounded-lg border p-4" style={{ background: 'rgba(17,24,17,0.6)', borderColor: '#1f2d1f' }}>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-[#00e676]" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Destinatarios confirmados</p>
          </div>
          <div className="flex flex-col gap-2">
            {data.recipients.map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#00e676] flex-shrink-0" />
                <span className="text-sm text-slate-300">{r}</span>
                <span
                  className="ml-auto text-xs px-2 py-0.5 rounded border font-medium"
                  style={{ background: 'rgba(0,200,83,0.1)', color: '#00e676', borderColor: 'rgba(0,200,83,0.25)' }}
                >
                  Confirmado
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-5 pb-5">
        <button
          onClick={onDismiss}
          className="w-full py-2.5 border rounded-lg text-sm font-medium transition-all duration-200"
          style={{ background: 'rgba(17,24,17,0.8)', borderColor: '#1f2d1f', color: '#94a3b8' }}
        >
          Reiniciar simulación
        </button>
      </div>
    </div>
  );
}

function SummaryItem({
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
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-slate-800/60 border border-slate-700/40">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
      </div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
        <p className={`text-sm font-medium ${valueColor}`}>{value}</p>
        {subValue && <p className="text-xs text-slate-500 mt-0.5">{subValue}</p>}
      </div>
    </div>
  );
}
