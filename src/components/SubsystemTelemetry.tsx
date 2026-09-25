import React, { useState } from 'react';
import { Cpu, ShieldCheck, Zap, Radio, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import { InterceptionOutcome, ThreatLevel } from '../types';

interface SubsystemTelemetryProps {
  threatLevel: ThreatLevel;
  interceptorActive: boolean;
  jetDestroyed: boolean;
  outcome: InterceptionOutcome;
}

export const SubsystemTelemetry: React.FC<SubsystemTelemetryProps> = ({
  threatLevel: _threatLevel,
  interceptorActive,
  jetDestroyed,
  outcome,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`hud-panel corner-bracket rounded-lg p-3 flex flex-col select-none transition-all duration-200 ${isCollapsed ? 'min-h-[44px]' : 'min-h-[220px]'}`}>
      <div className="flex items-center justify-between pb-2 border-b border-[#142642] mb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#00ff66]" />
          <h3 className="text-xs font-hud font-bold tracking-wider text-white">
            LIVE SUBSYSTEM TELEMETRY
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono-tech text-[#5c80a6]">SYNC: 60Hz</span>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded hover:bg-[#00e5ff]/10 text-[#6a92bd] hover:text-[#00e5ff] transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Telemetry' : 'Collapse Telemetry (Expand Blueprint space)'}
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
        {/* 1. Seeker / Radome Assembly */}
        <div className="p-2 rounded bg-[#060d1b] border border-[#142642] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  outcome === 'intercepted'
                    ? 'bg-[#00ff66] shadow-[0_0_8px_#00ff66]'
                    : jetDestroyed
                    ? 'bg-[#ff2a55] shadow-[0_0_8px_#ff2a55]'
                    : interceptorActive
                    ? 'bg-[#00e5ff] animate-ping'
                    : 'bg-[#00ff66]'
                }`}
              />
              <Radio className="w-3 h-3 text-[#00e5ff]" />
              <span>1. SEEKER / RADOME</span>
            </div>
            <div className="text-[9px] text-[#6b8eb6] font-mono-tech">
              Si3N4 Ceramic // 35GHz Ka-Band
            </div>
          </div>
          <div className="text-right font-mono-tech">
            {outcome === 'intercepted' ? (
              <>
                <span className="text-[10px] font-bold text-[#00ff66] bg-[#00ff66]/15 px-1.5 py-0.5 rounded border border-[#00ff66]/40">
                  TERMINAL KILL
                </span>
                <div className="text-[8px] text-[#00ff66] mt-0.5">DIRECT IMPACT</div>
              </>
            ) : jetDestroyed ? (
              <>
                <span className="text-[10px] font-bold text-[#ff2a55] bg-[#ff2a55]/15 px-1.5 py-0.5 rounded border border-[#ff2a55]/40">
                  LOSS OF LOCK
                </span>
                <div className="text-[8px] text-[#ff2a55] mt-0.5">BYPASS DETECTED</div>
              </>
            ) : interceptorActive ? (
              <>
                <span className="text-[10px] font-bold text-[#00e5ff] bg-[#00e5ff]/15 px-1.5 py-0.5 rounded border border-[#00e5ff]/40">
                  SEEKER: LOCKED
                </span>
                <div className="text-[8px] text-[#00e5ff] mt-0.5">35.0 GHz MONOPULSE</div>
              </>
            ) : (
              <>
                <span className="text-[10px] font-bold text-[#00ff66] bg-[#00ff66]/10 px-1.5 py-0.5 rounded border border-[#00ff66]/30">
                  STANDBY
                </span>
                <div className="text-[8px] text-[#557b9f] mt-0.5">AESA READY</div>
              </>
            )}
          </div>
        </div>

        {/* 2. Mini-DACS Thrusters */}
        <div className="p-2 rounded bg-[#060d1b] border border-[#142642] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  outcome === 'intercepted'
                    ? 'bg-[#00ff66]'
                    : jetDestroyed
                    ? 'bg-[#ff2a55]'
                    : interceptorActive
                    ? 'bg-[#ffb703] animate-pulse'
                    : 'bg-[#00ff66]'
                }`}
              />
              <Zap className="w-3 h-3 text-[#ffb703]" />
              <span>2. MINI-DACS THRUSTERS</span>
            </div>
            <div className="text-[9px] text-[#6b8eb6] font-mono-tech">
              8-Thruster Forward Ring
            </div>
          </div>
          <div className="text-right font-mono-tech">
            {outcome === 'intercepted' ? (
              <>
                <span className="text-[10px] font-bold text-[#00ff66] bg-[#00ff66]/15 px-1.5 py-0.5 rounded border border-[#00ff66]/40">
                  DIVERT SUCCESS
                </span>
                <div className="text-[8px] text-[#00ff66] mt-0.5">1,200 PSI RESIDUAL</div>
              </>
            ) : jetDestroyed ? (
              <>
                <span className="text-[10px] font-bold text-[#ff2a55] bg-[#ff2a55]/15 px-1.5 py-0.5 rounded border border-[#ff2a55]/40">
                  EXHAUSTED
                </span>
                <div className="text-[8px] text-[#ff2a55] mt-0.5">MAX G EXCEEDED</div>
              </>
            ) : interceptorActive ? (
              <>
                <span className="text-[10px] font-bold text-[#ffb703] bg-[#ffb703]/15 px-1.5 py-0.5 rounded border border-[#ffb703]/40">
                  DACS: FIRING
                </span>
                <div className="text-[8px] text-[#ffb703] mt-0.5">LATERAL PULSE</div>
              </>
            ) : (
              <>
                <span className="text-[10px] font-bold text-[#00ff66] bg-[#00ff66]/10 px-1.5 py-0.5 rounded border border-[#00ff66]/30">
                  DACS: READY
                </span>
                <div className="text-[8px] text-[#557b9f] mt-0.5">4,800 PSI CHARGED</div>
              </>
            )}
          </div>
        </div>

        {/* 3. AI Guidance SoC */}
        <div className="p-2 rounded bg-[#060d1b] border border-[#142642] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  outcome === 'intercepted'
                    ? 'bg-[#00ff66]'
                    : jetDestroyed
                    ? 'bg-[#ff2a55]'
                    : interceptorActive
                    ? 'bg-[#00e5ff] animate-pulse'
                    : 'bg-[#00e5ff]'
                }`}
              />
              <Cpu className="w-3 h-3 text-[#00e5ff]" />
              <span>3. AI GUIDANCE SOC</span>
            </div>
            <div className="text-[9px] text-[#6b8eb6] font-mono-tech">
              Rad-Hard SOI // 400 TFLOPS
            </div>
          </div>
          <div className="text-right font-mono-tech">
            {outcome === 'intercepted' ? (
              <>
                <span className="text-[10px] font-bold text-[#00ff66] bg-[#00ff66]/15 px-1.5 py-0.5 rounded border border-[#00ff66]/40">
                  TARGET ELIMINATED
                </span>
                <div className="text-[8px] text-[#00ff66] mt-0.5">0.0M MISS DISTANCE</div>
              </>
            ) : jetDestroyed ? (
              <>
                <span className="text-[10px] font-bold text-[#ff2a55] bg-[#ff2a55]/15 px-1.5 py-0.5 rounded border border-[#ff2a55]/40">
                  TARGET BYPASS
                </span>
                <div className="text-[8px] text-[#ff2a55] mt-0.5">OFF-BORESIGHT MISS</div>
              </>
            ) : interceptorActive ? (
              <>
                <span className="text-[10px] font-bold text-[#00e5ff] bg-[#00e5ff]/15 px-1.5 py-0.5 rounded border border-[#00e5ff]/40">
                  PROP-NAV ONLINE
                </span>
                <div className="text-[8px] text-[#00e5ff] mt-0.5">1,200 Hz GUIDANCE</div>
              </>
            ) : (
              <>
                <span className="text-[10px] font-bold text-[#00e5ff] bg-[#00e5ff]/10 px-1.5 py-0.5 rounded border border-[#00e5ff]/30">
                  ONLINE
                </span>
                <div className="text-[8px] text-[#557b9f] mt-0.5">99.8% READY</div>
              </>
            )}
          </div>
        </div>

        {/* 4. Carbon Composite Casing */}
        <div className="p-2 rounded bg-[#060d1b] border border-[#142642] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  outcome === 'intercepted'
                    ? 'bg-[#00ff66]'
                    : jetDestroyed
                    ? 'bg-[#ffb703]'
                    : interceptorActive
                    ? 'bg-[#00ff66]'
                    : 'bg-[#00ff66]'
                }`}
              />
              <ShieldCheck className="w-3 h-3 text-[#00ff66]" />
              <span>4. CARBON CASING</span>
            </div>
            <div className="text-[9px] text-[#6b8eb6] font-mono-tech">
              T1100 Composite // 30g Rated
            </div>
          </div>
          <div className="text-right font-mono-tech">
            {outcome === 'intercepted' ? (
              <>
                <span className="text-[10px] font-bold text-[#00ff66] bg-[#00ff66]/15 px-1.5 py-0.5 rounded border border-[#00ff66]/40">
                  HULL: INTEGRITY OK
                </span>
                <div className="text-[8px] text-[#00ff66] mt-0.5">MAX G SURVIVED</div>
              </>
            ) : jetDestroyed ? (
              <>
                <span className="text-[10px] font-bold text-[#ffb703] bg-[#ffb703]/15 px-1.5 py-0.5 rounded border border-[#ffb703]/40">
                  HULL: INTEGRITY OK
                </span>
                <div className="text-[8px] text-[#ffb703] mt-0.5">PEAK 32.4g STRAIN</div>
              </>
            ) : interceptorActive ? (
              <>
                <span className="text-[10px] font-bold text-[#00ff66] bg-[#00ff66]/15 px-1.5 py-0.5 rounded border border-[#00ff66]/40">
                  HULL: INTEGRITY OK
                </span>
                <div className="text-[8px] text-[#00ff66] mt-0.5">24.6g DYNAMIC LOAD</div>
              </>
            ) : (
              <>
                <span className="text-[10px] font-bold text-[#00ff66] bg-[#00ff66]/10 px-1.5 py-0.5 rounded border border-[#00ff66]/30">
                  HULL: INTEGRITY OK
                </span>
                <div className="text-[8px] text-[#557b9f] mt-0.5">0.0g STATIC</div>
              </>
            )}
          </div>
        </div>

        {/* 5. Solid Rocket Motor */}
        <div className="p-2 rounded bg-[#060d1b] border border-[#142642] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  outcome === 'intercepted'
                    ? 'bg-[#00ff66]'
                    : jetDestroyed
                    ? 'bg-[#688db3]'
                    : interceptorActive
                    ? 'bg-[#ff7700] animate-pulse'
                    : 'bg-[#00ff66]'
                }`}
              />
              <Flame className="w-3 h-3 text-[#ff7700]" />
              <span>5. SOLID ROCKET MOTOR</span>
            </div>
            <div className="text-[9px] text-[#6b8eb6] font-mono-tech">
              HTPB Propellant // 18.4kN Peak
            </div>
          </div>
          <div className="text-right font-mono-tech">
            {outcome === 'intercepted' ? (
              <>
                <span className="text-[10px] font-bold text-[#00ff66] bg-[#00ff66]/15 px-1.5 py-0.5 rounded border border-[#00ff66]/40">
                  BURNOUT (SUCCESS)
                </span>
                <div className="text-[8px] text-[#00ff66] mt-0.5">FULL IMPULSE</div>
              </>
            ) : jetDestroyed ? (
              <>
                <span className="text-[10px] font-bold text-[#688db3] bg-[#0c182c] px-1.5 py-0.5 rounded border border-[#1b3456]">
                  BURNOUT
                </span>
                <div className="text-[8px] text-[#557b9f] mt-0.5">0 kN RESIDUAL</div>
              </>
            ) : interceptorActive ? (
              <>
                <span className="text-[10px] font-bold text-[#ff7700] bg-[#ff7700]/15 px-1.5 py-0.5 rounded border border-[#ff7700]/40">
                  MOTOR: IGNITED
                </span>
                <div className="text-[8px] text-[#ff7700] mt-0.5">18.4 kN PEAK BOOST</div>
              </>
            ) : (
              <>
                <span className="text-[10px] font-bold text-[#00ff66] bg-[#00ff66]/10 px-1.5 py-0.5 rounded border border-[#00ff66]/30">
                  ARMED
                </span>
                <div className="text-[8px] text-[#557b9f] mt-0.5">GRAIN TEMP 21°C</div>
              </>
            )}
          </div>
        </div>
        </div>
      )}
    </div>
  );
};
