'use client';

import { Check, Loader2, Circle, Zap, ShieldAlert, Send, Radio, CheckCircle } from 'lucide-react';
import type { AlertStep } from '@/types/simulation';

const stepIcons = [Zap, ShieldAlert, CheckCircle, Send, Radio, Check];

interface AlertFlowProps {
  steps: AlertStep[];
}

export default function AlertFlow({ steps }: AlertFlowProps) {
  const hasAny = steps.some(s => s.status !== 'pending');

  return (
    <div className={`rounded-xl border overflow-hidden transition-all duration-700 ${
      hasAny ? 'border-[#1f3a1f]' : 'border-[#1a2d1a]/40'
    } bg-[#0d110d]`}>

      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1f2d1f]/60 bg-[#111811]/60 flex items-center gap-2">
        <Send className="w-4 h-4 text-[#00e676]" />
        <span className="text-sm font-semibold text-white">Flujo de escalamiento de alerta</span>
      </div>

      <div className="p-4 sm:p-6">
        <ol className="relative">
          {steps.map((step, index) => {
            const StepIcon = stepIcons[index] || Circle;
            const isCompleted = step.status === 'completed';
            const isActive = step.status === 'active';
            const isPending = step.status === 'pending';
            const isLast = index === steps.length - 1;

            return (
              <li key={step.id} className="relative flex gap-4 pb-0">
                {/* Connector line */}
                {!isLast && (
                  <div className="absolute left-4 top-8 bottom-0 w-px">
                    <div
                      className="h-full transition-all duration-700"
                      style={{ background: isCompleted ? '#00e676' : '#1a2d1a' }}
                    />
                  </div>
                )}

                {/* Step indicator */}
                <div className="relative flex-shrink-0 mb-4">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500"
                    style={{
                      background: isCompleted
                        ? '#00c853'
                        : isActive
                        ? 'rgba(0,230,118,0.08)'
                        : '#111811',
                      borderColor: isCompleted
                        ? '#00e676'
                        : isActive
                        ? '#00e676'
                        : '#1f2d1f',
                      boxShadow: isCompleted
                        ? '0 0 8px rgba(0,230,118,0.4)'
                        : isActive
                        ? '0 0 12px rgba(0,230,118,0.3)'
                        : 'none',
                    }}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 text-[#00e676] animate-spin" />
                    ) : (
                      <StepIcon className="w-3.5 h-3.5 text-slate-700" />
                    )}
                  </div>

                  {/* Pulse ring for active */}
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-full border-2 animate-ping"
                      style={{ borderColor: 'rgba(0,230,118,0.3)' }}
                    />
                  )}
                </div>

                {/* Step content */}
                <div className={`flex-1 pb-5 ${isLast ? 'pb-0' : ''}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-sm font-semibold transition-colors duration-500"
                      style={{
                        color: isCompleted ? '#00e676' : isActive ? '#b9ffdb' : '#374151',
                      }}
                    >
                      {step.label}
                    </span>
                    {isCompleted && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-medium border"
                        style={{ background: 'rgba(0,200,83,0.1)', color: '#00e676', borderColor: 'rgba(0,200,83,0.25)' }}
                      >
                        ✓ Completado
                      </span>
                    )}
                    {isActive && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-medium border animate-pulse"
                        style={{ background: 'rgba(0,230,118,0.08)', color: '#00e676', borderColor: 'rgba(0,230,118,0.2)' }}
                      >
                        En proceso
                      </span>
                    )}
                  </div>
                  <p className={`text-xs transition-colors duration-500 ${
                    isCompleted || isActive ? 'text-slate-500' : 'text-slate-700'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        {!hasAny && (
          <div className="mt-2 text-center">
            <p className="text-slate-700 text-xs">
              El flujo se activará automáticamente al detectar un evento EMS
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
