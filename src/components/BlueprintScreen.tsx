import React, { useState } from 'react';
import { Cpu, Shield, Zap, Flame, Radio, Layers, Activity } from 'lucide-react';
import { BlueprintNodeKey } from '../types';

export const BlueprintScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BlueprintNodeKey>('seeker');

  return (
    <div className="flex-1 flex flex-col gap-3 p-3.5 overflow-y-auto">
      {/* Top Banner */}
      <div className="hud-panel corner-bracket rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#00e5ff]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-hud font-bold tracking-wider text-white flex items-center gap-2">
              1.8M SINGLE-BODY KINETIC INTERCEPTOR // DETAILED ENGINEERING SPECIFICATION
              <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-[#00ff66]/15 text-[#00ff66] border border-[#00ff66]/30">
                CLASS: KIN-INT-MOD4
              </span>
            </h2>
            <p className="text-xs text-[#6e91b8] font-mono-tech">
              Aerospace hypersonic kinetic kill vehicle. Integrated boost-sustain motor, 8-channel pulse DACS, and 35GHz active MMW seeker.
            </p>
          </div>
        </div>

        {/* Component Selector Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['seeker', 'dacs', 'ai', 'casing', 'motor', 'fins'] as BlueprintNodeKey[]).map((key) => {
            const labels: Record<BlueprintNodeKey, string> = {
              seeker: '1. MMW RADOME',
              dacs: '2. MINI-DACS',
              ai: '3. AI SOC',
              casing: '4. CARBON CASING',
              motor: '5. SOLID MOTOR',
              fins: '6. GRID FINS',
            };
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-2.5 py-1.5 rounded text-xs font-mono-tech transition-all cursor-pointer ${
                  activeTab === key
                    ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/60 font-bold shadow-[0_0_8px_rgba(0,229,255,0.3)]'
                    : 'bg-[#060e1d] text-[#6b91bc] border border-[#162947] hover:text-white'
                }`}
              >
                {labels[key]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Visual Breakdown & Technical Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1">
        {/* Left: Interactive Vector Cross Section */}
        <div className="lg:col-span-7 hud-panel corner-bracket rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#142642]">
            <span className="text-xs font-hud font-bold tracking-wider text-white">
              LONGITUDINAL CAD CROSS-SECTION (INTERNAL ASSEMBLY)
            </span>
            <span className="text-[10px] font-mono-tech text-[#00e5ff]">SCALE: 1:1 CAD-ORTHO</span>
          </div>

          {/* SVG Diagram with highlights */}
          <div className="relative w-full h-64 my-3 bg-[#030711] border border-[#152e50] rounded-lg p-3 flex items-center justify-center overflow-hidden">
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(#00e5ff 1px, transparent 1px), linear-gradient(90deg, #00e5ff 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />

            <svg viewBox="0 0 540 180" className="w-full h-full relative z-10">
              <defs>
                <linearGradient id="bodyFullGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#08182e" />
                  <stop offset="50%" stopColor="#122a4d" />
                  <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Centerline */}
              <line x1="20" y1="90" x2="520" y2="90" stroke="#00e5ff" strokeWidth="0.8" strokeDasharray="6,4" opacity="0.4" />

              {/* Nozzle */}
              <path d="M 30 75 L 60 80 L 60 100 L 30 105 Z" fill="#14263f" stroke="#00e5ff" strokeWidth="1.5" />
              {/* Fins */}
              <polygon
                points="60,78 30,35 85,48 95,78"
                fill={activeTab === 'fins' ? '#00e5ff' : '#0d223d'}
                stroke="#00e5ff"
                strokeWidth="1.5"
                opacity={activeTab === 'fins' ? 1 : 0.7}
              />
              <polygon
                points="60,102 30,145 85,132 95,102"
                fill={activeTab === 'fins' ? '#00e5ff' : '#0d223d'}
                stroke="#00e5ff"
                strokeWidth="1.5"
                opacity={activeTab === 'fins' ? 1 : 0.7}
              />

              {/* Motor */}
              <rect
                x="60"
                y="76"
                width="160"
                height="28"
                fill={activeTab === 'motor' ? '#123e54' : '#08172c'}
                stroke={activeTab === 'motor' ? '#00ff66' : '#00e5ff'}
                strokeWidth="2"
              />
              <text x="140" y="93" fill="#6d98c7" fontSize="10" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
                SOLID ROCKET MOTOR GRAIN
              </text>

              {/* DACS */}
              <rect
                x="220"
                y="70"
                width="65"
                height="40"
                fill={activeTab === 'dacs' ? '#3b2f0a' : '#102540'}
                stroke={activeTab === 'dacs' ? '#ffb703' : '#ffb703'}
                strokeWidth={activeTab === 'dacs' ? 2.5 : 1.5}
                rx="2"
              />
              <text x="252" y="94" fill="#ffb703" fontSize="9" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
                MINI-DACS
              </text>

              {/* AI Avionics */}
              <rect
                x="285"
                y="76"
                width="110"
                height="28"
                fill={activeTab === 'ai' ? '#083244' : '#08172c'}
                stroke={activeTab === 'ai' ? '#00e5ff' : '#00e5ff'}
                strokeWidth="2"
              />
              <text x="340" y="93" fill="#00e5ff" fontSize="9" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
                AVIONICS / AI CORE
              </text>

              {/* Seeker Radome */}
              <path
                d="M 395 76 C 450 76 500 83 520 90 C 500 97 450 104 395 104 Z"
                fill={activeTab === 'seeker' ? '#0c3e56' : 'url(#bodyFullGrad)'}
                stroke={activeTab === 'seeker' ? '#00e5ff' : '#00e5ff'}
                strokeWidth={activeTab === 'seeker' ? 2.5 : 1.5}
              />
              <circle cx="515" cy="90" r="4" fill="#00e5ff" />
              <text x="450" y="93" fill="#cbe6ff" fontSize="9" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
                AESA RADOME
              </text>
            </svg>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#142642] font-mono-tech text-xs">
            <div className="p-2 rounded bg-[#060d1c] border border-[#142642]">
              <span className="text-[10px] text-[#5e84ad] block">TOTAL MASS</span>
              <span className="text-white font-bold">18.6 KG</span>
            </div>
            <div className="p-2 rounded bg-[#060d1c] border border-[#142642]">
              <span className="text-[10px] text-[#5e84ad] block">DIAMETER</span>
              <span className="text-[#00e5ff] font-bold">160 MM</span>
            </div>
            <div className="p-2 rounded bg-[#060d1c] border border-[#142642]">
              <span className="text-[10px] text-[#5e84ad] block">MAX VELOCITY</span>
              <span className="text-[#ffb703] font-bold">MACH 4.8+</span>
            </div>
            <div className="p-2 rounded bg-[#060d1c] border border-[#142642]">
              <span className="text-[10px] text-[#5e84ad] block">MAX G-LOAD</span>
              <span className="text-[#00ff66] font-bold">45.0 G</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Subsystem Deep Dive */}
        <div className="lg:col-span-5 hud-panel corner-bracket rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#142642] mb-3">
              <div className="flex items-center gap-2">
                {activeTab === 'seeker' && <Radio className="w-4 h-4 text-[#00e5ff]" />}
                {activeTab === 'ai' && <Cpu className="w-4 h-4 text-[#00e5ff]" />}
                {activeTab === 'dacs' && <Zap className="w-4 h-4 text-[#ffb703]" />}
                {activeTab === 'casing' && <Shield className="w-4 h-4 text-[#00ff66]" />}
                {activeTab === 'motor' && <Flame className="w-4 h-4 text-[#ff7700]" />}
                {activeTab === 'fins' && <Shield className="w-4 h-4 text-[#00e5ff]" />}
                <h3 className="text-xs font-hud font-bold tracking-wider text-white">
                  SUBSYSTEM TELEMETRY: {activeTab.toUpperCase()}
                </h3>
              </div>
              <span className="text-[10px] font-mono-tech text-[#00ff66] bg-[#00ff66]/10 px-2 py-0.5 rounded border border-[#00ff66]/30">
                CALIBRATED
              </span>
            </div>

            {/* Content per tab */}
            {activeTab === 'seeker' && (
              <div className="space-y-3 font-mono-tech text-xs">
                <p className="text-[#84a9d4] leading-relaxed">
                  Ka-band active phased array millimeter wave seeker designed for piercing all atmospheric chaff, smoke, and electronic jamming.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">CENTER FREQUENCY:</span>
                    <span className="text-white font-bold">35.0 GHz Ka-Band</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">BEAM STEERING SLEW:</span>
                    <span className="text-[#00e5ff] font-bold">600°/s Electronic</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">TRACKING RANGE:</span>
                    <span className="text-[#00ff66] font-bold">18.5 KM Active Lock</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">ECCM AGILITY:</span>
                    <span className="text-[#ffb703] font-bold">Frequency Hopping (120 hops/s)</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dacs' && (
              <div className="space-y-3 font-mono-tech text-xs">
                <p className="text-[#84a9d4] leading-relaxed">
                  Divert and Attitude Control System (Mini-DACS) utilizes 8 fast-acting solid pulse valves arranged radially around the center of mass to counteract high-G target bypasses.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">VALVE REACTION TIME:</span>
                    <span className="text-[#00ff66] font-bold">&lt; 1.5 Milliseconds</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">TOTAL IMPULSE:</span>
                    <span className="text-white font-bold">1,850 N·s</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">LATERAL THRUST:</span>
                    <span className="text-[#ffb703] font-bold">850 N Per Thruster</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">RESERVE PRESSURE:</span>
                    <span className="text-[#00e5ff] font-bold">4,800 PSI</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-3 font-mono-tech text-xs">
                <p className="text-[#84a9d4] leading-relaxed">
                  Radiation-hardened high-compute tactical coprocessor running augmented proportional navigation (APN) with real-time Kalman trajectory prediction.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">THROUGHPUT:</span>
                    <span className="text-white font-bold">400 TFLOPS FP16</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">PREDICTION HORIZON:</span>
                    <span className="text-[#00e5ff] font-bold">3.5 Seconds Hypersonic</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">KALMAN COVARIANCE:</span>
                    <span className="text-[#00ff66] font-bold">0.0028 (High Confidence)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">GUIDANCE LAW:</span>
                    <span className="text-[#ffb703] font-bold">True APN + Dogleg Compensation</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'casing' && (
              <div className="space-y-3 font-mono-tech text-xs">
                <p className="text-[#84a9d4] leading-relaxed">
                  Filament-wound Toray T1100 carbon-fiber structural airframe with toughened cyanate ester matrix. Engineered to maintain airframe rigidity under 30g sustained lateral acceleration.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">G-LOAD TOLERANCE:</span>
                    <span className="text-[#00ff66] font-bold">30.0 G Sustained</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">COMPOSITE MATRIX:</span>
                    <span className="text-white font-bold">Toray T1100 / Cyanate Ester</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">TENSILE STRENGTH:</span>
                    <span className="text-[#00e5ff] font-bold">7.0 GPa High Modulus</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">THERMAL LINER:</span>
                    <span className="text-[#ffb703] font-bold">Kevlar / EPDM Elastomeric</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'motor' && (
              <div className="space-y-3 font-mono-tech text-xs">
                <p className="text-[#84a9d4] leading-relaxed">
                  Dual-thrust composite grain solid rocket propellant delivering maximum initial thrust for instant egress and sustained burnout thrust.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">BOOST THRUST:</span>
                    <span className="text-[#ff2a55] font-bold">18.4 kN (0.0 to 1.8s)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">SUSTAIN THRUST:</span>
                    <span className="text-[#00e5ff] font-bold">4.2 kN (1.8 to 4.8s)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">PROPELLANT:</span>
                    <span className="text-white font-bold">Hydroxyl-terminated Polybutadiene (HTPB)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">SPECIFIC IMPULSE:</span>
                    <span className="text-[#00ff66] font-bold">268 s (Sea-Level)</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'fins' && (
              <div className="space-y-3 font-mono-tech text-xs">
                <p className="text-[#84a9d4] leading-relaxed">
                  Four lattice grid fins folding flat against the fuselage until booster separation. Exceptional high angle-of-attack maneuverability at supersonic velocities.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">CONFIGURATION:</span>
                    <span className="text-white font-bold">4x Planar Titanium Grid</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">MAX DEFLECTION:</span>
                    <span className="text-[#00e5ff] font-bold">±38° Slew Angle</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">SERVO POWER:</span>
                    <span className="text-[#00ff66] font-bold">28V Brushless DC</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-[#060c18] border border-[#162d4e]">
                    <span className="text-[#597ea6]">THERMAL BARRIER:</span>
                    <span className="text-[#ffb703] font-bold">Zirconia Plasma Spray Coating</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#142642] flex items-center justify-between text-[11px] font-mono-tech">
            <span className="text-[#5e83ab] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#00e5ff]" />
              SYSTEM DIAGNOSTICS: NOMINAL
            </span>
            <span className="text-[#00ff66] font-bold">READY FOR MISSION DEPLOYMENT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
