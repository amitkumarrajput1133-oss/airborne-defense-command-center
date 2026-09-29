import React from 'react';
import { AlertTriangle, RotateCcw, TrendingUp, Compass, Cpu, Radio } from 'lucide-react';

interface BlackBoxScreenProps {
  onReEngage: () => void;
}

export const BlackBoxScreen: React.FC<BlackBoxScreenProps> = ({ onReEngage }) => {
  return (
    <div className="flex-1 flex flex-col gap-3.5 p-3.5 overflow-y-auto">
      {/* Header Banner */}
      <div className="hud-panel corner-bracket rounded-lg p-3.5 bg-gradient-to-r from-[#20050d] via-[#100713] to-[#060c18] border-l-4 border-l-[#ff2a55] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#ff2a55]/20 border border-[#ff2a55]/60 text-[#ff2a55] flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm md:text-base font-hud font-bold tracking-wider text-white">
                FLIGHT DATA RECORDER // POST-MORTEM TELEMETRY ANALYSIS
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#ff2a55]/20 text-[#ff2a55] border border-[#ff2a55]/60 font-mono-tech font-bold">
                INCIDENT ID: KIN-BREACH-9
              </span>
            </div>
            <p className="text-xs text-[#a3c4ea] font-mono-tech mt-0.5">
              Target: Hypersonic BOGEY-X // Interceptor: 1.8M Single-Body // Result: Interception Bypass & Platform Destruction
            </p>
          </div>
        </div>

        <button
          onClick={onReEngage}
          className="px-4 py-2 rounded bg-[#ff2a55]/20 hover:bg-[#ff2a55]/30 border border-[#ff2a55]/60 text-white text-xs font-mono-tech font-bold transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(255,42,85,0.4)]"
        >
          <RotateCcw className="w-4 h-4 text-[#00ff66]" />
          <span>RE-RUN ENGAGEMENT SIMULATION</span>
        </button>
      </div>

      {/* Forensic Telemetry Charts & Root Cause */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1">
        {/* Left: Telemetry Graphs */}
        <div className="lg:col-span-8 hud-panel corner-bracket rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#142642]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00e5ff]" />
              <span className="text-xs font-hud font-bold tracking-wider text-white">
                DYNAMIC TELEMETRY TIMELINE PLOT (T-0.0s TO IMPACT T+4.2s)
              </span>
            </div>
            <span className="text-[10px] font-mono-tech text-[#00ff66]">SAMPLING: 1,000 HZ</span>
          </div>

          {/* SVG Flight Data Curves */}
          <div className="relative w-full h-72 my-3 bg-[#030712] border border-[#162d4e] rounded-lg p-3 flex flex-col justify-between overflow-hidden">
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(#00e5ff 1px, transparent 1px), linear-gradient(90deg, #00e5ff 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            <svg viewBox="0 0 600 240" className="w-full h-full relative z-10">
              {/* Y Axis Guide Lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="#162e4f" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="40" y1="80" x2="580" y2="80" stroke="#162e4f" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="40" y1="140" x2="580" y2="140" stroke="#162e4f" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="40" y1="200" x2="580" y2="200" stroke="#2a4d7a" strokeWidth="1.5" />

              {/* Y Axis Labels */}
              <text x="35" y="24" fill="#688eb6" fontSize="9" fontFamily="'JetBrains Mono', monospace" textAnchor="end">
                50 KM / 50G
              </text>
              <text x="35" y="84" fill="#688eb6" fontSize="9" fontFamily="'JetBrains Mono', monospace" textAnchor="end">
                30 KM / 30G
              </text>
              <text x="35" y="144" fill="#688eb6" fontSize="9" fontFamily="'JetBrains Mono', monospace" textAnchor="end">
                10 KM / 10G
              </text>
              <text x="35" y="204" fill="#688eb6" fontSize="9" fontFamily="'JetBrains Mono', monospace" textAnchor="end">
                0.0 KM
              </text>

              {/* Curve 1: Slant Range (Distance to target dropping to 0) */}
              <path
                d="M 50 25 C 150 40 300 110 440 180 L 520 200"
                fill="none"
                stroke="#00e5ff"
                strokeWidth="2.5"
              />

              {/* Curve 2: Threat G-load spike during evasive maneuver */}
              <path
                d="M 50 195 L 340 190 Q 380 40 430 70 L 460 180 L 520 200"
                fill="none"
                stroke="#ff2a55"
                strokeWidth="2.5"
              />

              {/* Critical event markers */}
              {/* Launch */}
              <line x1="120" y1="20" x2="120" y2="200" stroke="#00ff66" strokeWidth="1" strokeDasharray="2,2" />
              <text x="125" y="45" fill="#00ff66" fontSize="9" fontFamily="'JetBrains Mono', monospace">
                T+0.8s KIN LAUNCH
              </text>

              {/* Jink */}
              <line x1="390" y1="20" x2="390" y2="200" stroke="#ffb703" strokeWidth="1" strokeDasharray="2,2" />
              <text x="395" y="55" fill="#ffb703" fontSize="9" fontFamily="'JetBrains Mono', monospace" fontWeight="bold">
                T+3.2s 32G JINK (DOGLEG)
              </text>

              {/* Impact */}
              <line x1="520" y1="20" x2="520" y2="200" stroke="#ff2a55" strokeWidth="1.8" />
              <circle cx="520" cy="200" r="5" fill="#ff2a55" className="animate-ping" />
              <text x="510" y="30" fill="#ff2a55" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="bold" textAnchor="end">
                T+4.12s IMPACT [BREACH]
              </text>
            </svg>

            {/* Legend */}
            <div className="flex items-center justify-between text-[10px] font-mono-tech border-t border-[#132844] pt-1.5 px-2">
              <span className="flex items-center gap-1.5 text-[#00e5ff]">
                <span className="w-2.5 h-0.5 bg-[#00e5ff] inline-block" /> SLANT RANGE (KM)
              </span>
              <span className="flex items-center gap-1.5 text-[#ff2a55]">
                <span className="w-2.5 h-0.5 bg-[#ff2a55] inline-block" /> THREAT LATERAL G-LOAD
              </span>
              <span className="flex items-center gap-1.5 text-[#ffb703]">
                <span className="w-2 h-2 rounded-full bg-[#ffb703] inline-block" /> EVASION DETECTED
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#060c18] border border-[#142642] font-mono-tech text-xs flex items-center justify-between">
            <span className="text-[#6285ad]">RADAR LOCK DISCONNECT:</span>
            <span className="text-[#ff2a55] font-bold">LOSS OF SIGNAL AT 14.8 METERS MISS DISTANCE</span>
          </div>
        </div>

        {/* Right: Chronological Incident Telemetry & Recommendations */}
        <div className="lg:col-span-4 hud-panel corner-bracket rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#142642] mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#ff2a55]" />
                <h3 className="text-xs font-hud font-bold tracking-wider text-white">
                  INCIDENT CHRONOLOGY
                </h3>
              </div>
              <span className="text-[10px] font-mono-tech text-[#ff2a55] font-bold">FATAL ERROR</span>
            </div>

            <div className="space-y-2.5 font-mono-tech text-xs">
              <div className="p-2 rounded bg-[#060d1b] border-l-2 border-l-[#00ff66] border border-[#142642]">
                <div className="text-[#00ff66] font-bold text-[10px]">T+00:00.000 // DETECTION</div>
                <div className="text-[#96b8de] text-[11px] mt-0.5">
                  BOGEY-X radar return confirmed on bearing 042°. Slant range 64.8 KM, Mach 5.1.
                </div>
              </div>

              <div className="p-2 rounded bg-[#060d1b] border-l-2 border-l-[#00e5ff] border border-[#142642]">
                <div className="text-[#00e5ff] font-bold text-[10px]">T+00:01.240 // EJECTION</div>
                <div className="text-[#96b8de] text-[11px] mt-0.5">
                  VIPER-01 dispatched 1.8M single-body interceptor. Boost motor ignited, velocity Mach 3.4.
                </div>
              </div>

              <div className="p-2 rounded bg-[#060d1b] border-l-2 border-l-[#ffb703] border border-[#142642]">
                <div className="text-[#ffb703] font-bold text-[10px]">T+00:03.205 // EVASIVE DOGLEG</div>
                <div className="text-[#96b8de] text-[11px] mt-0.5">
                  BOGEY-X initiated 32G sudden lateral dogleg. Interceptor Mini-DACS exhausted reserve trying to correct.
                </div>
              </div>

              <div className="p-2 rounded bg-[#20060e] border-l-2 border-l-[#ff2a55] border border-[#ff2a55]/50">
                <div className="text-[#ff2a55] font-bold text-[10px]">T+00:04.125 // CATASTROPHIC HIT</div>
                <div className="text-[#ffccd6] text-[11px] mt-0.5">
                  Kinetic round overshot by 14.8m. BOGEY-X impacted VIPER-01 fuselage. Hull integrity 0%.
                </div>
              </div>
            </div>
          </div>

          {/* Corrective Action Strategy */}
          <div className="mt-3 p-2.5 rounded bg-[#081528] border border-[#1b3b64] font-mono-tech text-xs">
            <div className="text-[#00e5ff] font-bold text-[11px] mb-1 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              RECOMMENDED COUNTERMEASURE ADJUSTMENT:
            </div>
            <p className="text-[10px] text-[#86a8d0] leading-relaxed">
              Upgrade APN predictive lead angle filter to 2,400 Hz and increase Mini-DACS chamber pressure to 6,200 PSI to handle &gt;35G evasive jinks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
