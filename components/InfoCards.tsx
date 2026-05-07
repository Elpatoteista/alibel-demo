'use client';

import { Eye, ShieldAlert, HelpCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const CARDS = [
  {
    icon: Eye,
    title: '¿Qué detecta ALIBEL?',
    body: 'ALIBEL monitorea continuamente al operador dentro de la cabina, detectando indicadores fisiológicos y biomecánicos de una emergencia médica súbita: pérdida de conciencia, colapso o inmovilidad prolongada.',
    border: 'border-[#00e676]/15 hover:border-[#00e676]/35',
    iconBg: 'bg-[#00e676]/8',
    iconColor: 'text-[#00e676]',
    bgCard: 'bg-[#00e676]/[0.03]',
  },
  {
    icon: ShieldAlert,
    title: '¿Qué problema resuelve?',
    body: 'Los protocolos actuales dependen de que el operador active manualmente una señal de auxilio. Si sufre una EMS y pierde la conciencia, no existe mecanismo automático de respuesta. ALIBEL cierra esa brecha crítica.',
    border: 'border-amber-800/20 hover:border-amber-600/40',
    iconBg: 'bg-amber-900/10',
    iconColor: 'text-amber-400',
    bgCard: 'bg-amber-900/[0.03]',
  },
  {
    icon: HelpCircle,
    title: '¿Qué pasa si el operador no puede pedir ayuda?',
    body: 'ALIBEL genera y envía la alerta de forma automática al supervisor y al centro de monitoreo, sin requerir ninguna acción del operador. El sistema actúa cuando el operador no puede hacerlo.',
    border: 'border-red-800/20 hover:border-red-600/40',
    iconBg: 'bg-red-900/10',
    iconColor: 'text-red-400',
    bgCard: 'bg-red-900/[0.03]',
  },
  {
    icon: TrendingUp,
    title: '¿Qué valor entrega a la operación?',
    body: 'Reduce el tiempo de respuesta ante emergencias médicas en faena, mejora la trazabilidad de incidentes, cumple con estándares de seguridad industrial y protege la vida del operador cuando los protocolos manuales fallan.',
    border: 'border-[#00e676]/15 hover:border-[#00e676]/35',
    iconBg: 'bg-[#00e676]/8',
    iconColor: 'text-[#00e676]',
    bgCard: 'bg-[#00e676]/[0.03]',
  },
];

export default function InfoCards() {
  return (
    <section className="mt-12 mb-8">
      {/* Section divider */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0.8 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mb-8 flex items-center gap-3"
      >
        <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, #1f2d1f)' }} />
        <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-widest px-2">
          Acerca de ALIBEL · detect. protect. respond.
        </h2>
        <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, #1f2d1f)' }} />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {CARDS.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={`${card.bgCard} border ${card.border} rounded-xl p-5 transition-all duration-300 group bg-[#0d110d] hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#00e676]/5`}
          >
            <div className="mb-3">
              <div className={`inline-flex p-2 rounded-lg ${card.iconBg} border border-[#1f2d1f]/60 ${card.iconColor}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">
              {card.title}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {card.body}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 1 }}
        className="mt-8 text-center text-xs text-slate-700 font-mono"
      >
        ALIBEL PoC · Prueba de concepto · Artefacto 6 · 2026
      </motion.p>
    </section>
  );
}
