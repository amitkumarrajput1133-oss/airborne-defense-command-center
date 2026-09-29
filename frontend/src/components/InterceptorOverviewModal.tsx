import React, { useState } from 'react';
import {
  Activity,
  BrainCircuit,
  Crosshair,
  Gauge,
  Info,
  Radio,
  Rocket,
  Shield,
  Sparkles,
  X,
  Zap
} from 'lucide-react';

interface InterceptorOverviewModalProps {
  onClose: () => void;
}

type ComponentId = 'seeker' | 'guidance' | 'dacs' | 'propulsion';

interface ComponentDetail {
  id: ComponentId;
  label: string;
  section: string;
  plusPoint: string;
  metric: string;
  icon: React.ReactNode;
  color: string;
}

const COMPONENTS: ComponentDetail[] = [
  {
    id: 'seeker',
    label: 'Multi-Mode Simulated Seeker',
    section: 'Nose section',
    plusPoint: 'High-refresh-rate logical target acquisition reduces sensor-noise impact and tracking delay during final approach.',
    metric: 'Noise resilience / final approach',
    icon: <Radio className="h-4 w-4" />,
    color: '#67e8f9'
  },
  {
    id: 'guidance',
    label: 'AI Navigation & Guidance Core',
    section: 'Mid-body',
    plusPoint: 'Runs continuous trajectory prediction and recalculates the interception point against maneuvering threat profiles.',
    metric: 'Real-time prediction loop',
    icon: <BrainCircuit className="h-4 w-4" />,
    color: '#a78bfa'
  },
  {
    id: 'dacs',
    label: 'Divert & Attitude Control System',
    section: 'Vector-control ring',
    plusPoint: 'Models rapid vector adjustments for high-g logical turns while preserving simulated closing speed against erratic targets.',
    metric: 'Maneuver response / vector agility',
    icon: <Zap className="h-4 w-4" />,
    color: '#fbbf24'
  },
  {
    id: 'propulsion',
    label: 'Multi-Stage Propulsion System',
    section: 'Aft section',
    plusPoint: 'Uses a fast initial acceleration profile followed by sustained closing speed to minimize simulated time-to-intercept.',
    metric: 'Acceleration / closing speed',
    icon: <Rocket className="h-4 w-4" />,
    color: '#4ade80'
  }
];

export const InterceptorOverviewModal: React.FC<InterceptorOverviewModalProps> = ({ onClose }) => {
  const [selectedId, setSelectedId] = useState<ComponentId>('guidance');
  const selected = COMPONENTS.find((component) => component.id === selectedId) || COMPONENTS[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/85 p-3 backdrop-blur-sm md:p-6" role="dialog" aria-modal="true" aria-labelledby="interceptor-overview-title">
      <div className="blueprint-modal relative flex max-h-[94vh] w-full max-w-[1400px] flex-col overflow-hidden rounded-xl border border-cyan-500/40 bg-[#07131d] shadow-[0_0_80px_rgba(6,182,212,0.18)]">
        <div className="flex items-start justify-between border-b border-cyan-900/80 px-4 py-4 md:px-6">
          <div className="flex items-start gap-3">
            <div className="rounded-lg border border-cyan-400/50 bg-cyan-950/70 p-2.5 text-cyan-300"><Crosshair className="h-5 w-5" /></div>
            <div>
              <div className="mb-1 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9]" />Virtual platform // component study</div>
              <h2 id="interceptor-overview-title" className="text-lg font-bold uppercase tracking-wider text-slate-100 md:text-xl">Interceptor System Overview</h2>
              <p className="mt-1 max-w-2xl text-xs text-slate-400">Exploded schematic of the software-simulated interceptor model and its theoretical contribution to interception performance.</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close interceptor system overview" title="Close overview" className="rounded-md border border-slate-700 bg-slate-900/70 p-2 text-slate-400 transition-colors hover:border-cyan-500/60 hover:text-cyan-200"><X className="h-5 w-5" /></button>
        </div>

        <div className="min-h-0 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
            <section className="blueprint-grid relative overflow-hidden rounded-lg border border-cyan-900/80 p-3 md:p-5" aria-label="Exploded interceptor schematic">
              <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-cyan-500/80"><span>Plate 07 // longitudinal systems layout</span><span>Scale: conceptual</span></div>
              <div className="relative flex min-h-[410px] items-center justify-center overflow-hidden rounded border border-cyan-950/80 bg-[#06131d]/80 md:min-h-[500px]">
                <div className="absolute left-3 top-3 font-mono text-[9px] leading-relaxed text-cyan-700/90">SIMULATION MODEL<br />AXIS: X // NOMINAL<br />UNITS: ABSTRACT</div>
                <div className="absolute bottom-3 right-3 font-mono text-[9px] text-cyan-700/90">REV 1.0A / EDUCATIONAL</div>
                <svg viewBox="0 0 900 500" className="h-auto w-full max-w-[920px]" role="img" aria-label="Exploded blueprint of the virtual interceptor">
                  <defs>
                    <filter id="blueprint-glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                    <linearGradient id="bodyFill" x1="0" x2="1"><stop stopColor="#0c3343" /><stop offset="0.5" stopColor="#12465a" /><stop offset="1" stopColor="#082532" /></linearGradient>
                  </defs>
                  <g fill="none" stroke="#164e63" strokeWidth="1" opacity="0.65"><path d="M70 250H830" strokeDasharray="8 8" /><path d="M120 180H780M120 320H780" strokeDasharray="3 8" /><ellipse cx="450" cy="250" rx="355" ry="105" /><ellipse cx="450" cy="250" rx="280" ry="72" /></g>
                  <g stroke="#67e8f9" strokeWidth="2" fill="url(#bodyFill)" filter="url(#blueprint-glow)"><path d="M120 250L185 210L300 210L350 175L620 175L715 205L790 250L715 295L620 325L350 325L300 290L185 290Z" /><path d="M185 210L185 290M300 210L300 290M350 175L350 325M620 175L620 325M715 205L715 295" /><path d="M120 250L170 238L170 262Z" fill="#155e75" /><path d="M300 210L250 150L290 208M300 290L250 350L290 292" fill="#0b3141" /><path d="M570 175L535 115L610 175M570 325L535 385L610 325" fill="#0b3141" /><path d="M650 195L690 135L715 205M650 305L690 365L715 295" fill="#0b3141" /></g>
                  <g fill="none" stroke="#a5f3fc" strokeWidth="2"><ellipse cx="145" cy="250" rx="22" ry="30" /><path d="M128 238Q145 250 128 262M162 238Q145 250 162 262" /><rect x="365" y="205" width="185" height="90" rx="9" stroke="#c4b5fd" /><circle cx="430" cy="250" r="28" stroke="#c4b5fd" /><path d="M415 250H445M430 235V265" stroke="#ddd6fe" /><circle cx="665" cy="250" r="34" stroke="#fcd34d" strokeDasharray="5 5" /><path d="M638 250H692M665 223V277" stroke="#fcd34d" /><path d="M735 220L770 250L735 280" stroke="#86efac" /></g>
                  <g fill="#67e8f9" fontFamily="monospace" fontSize="12" letterSpacing="1"><text x="92" y="140">01 / SEEKER</text><text x="345" y="92">02 / GUIDANCE CORE</text><text x="620" y="128">03 / DACS</text><text x="722" y="335">04 / STAGE 1 + 2</text></g>
                  <g stroke="#67e8f9" strokeWidth="1" fill="none" opacity="0.9"><path d="M145 150V218" /><path d="M430 102V202" /><path d="M665 138V216" /><path d="M750 325V278" /></g>
                  <g fill="#67e8f9" stroke="#042f3d" strokeWidth="2" cursor="pointer" onClick={() => setSelectedId('seeker')}><circle cx="145" cy="150" r="11" /><text x="141" y="154" fill="#042f3d" fontSize="11" fontWeight="bold">1</text></g>
                  <g fill="#a78bfa" stroke="#26144f" strokeWidth="2" cursor="pointer" onClick={() => setSelectedId('guidance')}><circle cx="430" cy="102" r="11" /><text x="426" y="106" fill="#26144f" fontSize="11" fontWeight="bold">2</text></g>
                  <g fill="#fbbf24" stroke="#422006" strokeWidth="2" cursor="pointer" onClick={() => setSelectedId('dacs')}><circle cx="665" cy="138" r="11" /><text x="661" y="142" fill="#422006" fontSize="11" fontWeight="bold">3</text></g>
                  <g fill="#4ade80" stroke="#052e16" strokeWidth="2" cursor="pointer" onClick={() => setSelectedId('propulsion')}><circle cx="750" cy="325" r="11" /><text x="746" y="329" fill="#052e16" fontSize="11" fontWeight="bold">4</text></g>
                </svg>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 font-mono text-[10px] text-cyan-500/80"><Info className="h-3.5 w-3.5" /> Select a numbered hotspot to inspect the subsystem</div>
              </div>
            </section>

            <aside className="flex flex-col gap-4">
              <div className="hud-panel rounded-lg border border-slate-800 bg-[#0b1723] p-4">
                <div className="mb-3 flex items-center gap-2 border-b border-slate-800 pb-3"><Sparkles className="h-4 w-4 text-cyan-300" /><h3 className="text-xs font-bold uppercase tracking-widest text-slate-200">Selected Component</h3></div>
                <div className="mb-2 flex items-start gap-3" style={{ color: selected.color }}><div className="rounded border border-current/40 bg-black/20 p-2">{selected.icon}</div><div><div className="text-[10px] font-mono uppercase tracking-widest opacity-80">{selected.section}</div><h4 className="mt-1 text-sm font-bold text-slate-100">{selected.label}</h4></div></div>
                <div className="mt-4 rounded border border-cyan-900/70 bg-cyan-950/20 p-3"><div className="mb-1 text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">Plus point</div><p className="text-xs leading-relaxed text-slate-300">{selected.plusPoint}</p></div>
                <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-slate-400"><Activity className="h-3.5 w-3.5 text-emerald-400" /> Maps to: <span className="text-emerald-300">{selected.metric}</span></div>
              </div>

              <div className="hud-panel rounded-lg border border-slate-800 bg-[#0b1723] p-4">
                <div className="mb-3 flex items-center gap-2 border-b border-slate-800 pb-3"><Gauge className="h-4 w-4 text-amber-300" /><h3 className="text-xs font-bold uppercase tracking-widest text-slate-200">Effectiveness Dashboard</h3></div>
                <div className="grid grid-cols-1 gap-2.5 font-mono">
                  <div className="rounded border border-emerald-900/70 bg-emerald-950/20 p-3"><div className="text-[10px] uppercase tracking-wider text-slate-500">Maneuverability rating</div><div className="mt-1 flex items-end justify-between"><span className="text-lg font-bold text-emerald-300">HIGH</span><span className="text-[10px] text-emerald-400/80">VARIABLE / RANDOM READY</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full w-[88%] rounded-full bg-emerald-400" /></div></div>
                  <div className="rounded border border-cyan-900/70 bg-cyan-950/20 p-3"><div className="text-[10px] uppercase tracking-wider text-slate-500">Estimated intercept success rate</div><div className="mt-1 text-2xl font-bold text-cyan-300">94.2<span className="text-sm">%</span></div><div className="mt-1 text-[10px] text-cyan-400/70">Model architecture estimate</div></div>
                  <div className="rounded border border-violet-900/70 bg-violet-950/20 p-3"><div className="text-[10px] uppercase tracking-wider text-slate-500">System latency</div><div className="mt-1 text-2xl font-bold text-violet-300">&lt; 10<span className="text-sm">ms</span></div><div className="mt-1 text-[10px] text-violet-400/70">Prediction to trajectory correction</div></div>
                </div>
              </div>

              <div className="rounded-lg border border-amber-900/60 bg-amber-950/20 p-3 text-[11px] leading-relaxed text-amber-200/80"><Shield className="mb-2 h-4 w-4 text-amber-300" />The subsystem labels describe theoretical software behaviors in an abstract simulation. No payload, hardware, guidance, or classified implementation specifications are represented.</div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};