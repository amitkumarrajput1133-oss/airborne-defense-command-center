import React from 'react';
import { Gauge, Navigation, Radio, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';
import { InterceptionOutcome } from '../types';

interface FlightTelemetryProps {
  jetX: number;
  jetY: number;
  jetAngle: number;
  threatDistanceKm: number;
  interceptorMach: number;
  ecmNoiseDb: number;
  closureRate: number;
  jetDestroyed: boolean;
  outcome?: InterceptionOutcome;
  onSpawnThreat: () => void;
}

export const FlightTelemetry: React.FC<FlightTelemetryProps> = ({
  jetX,
  jetY,
  jetAngle,
  threatDistanceKm,
  interceptorMach,
  ecmNoiseDb,
  closureRate,
  jetDestroyed,
  outcome,
  onSpawnThreat,
}) => {
  // Heading in degrees
  let headingDeg = Math.round((jetAngle * 180) / Math.PI + 90);
  if (headingDeg < 0) headingDeg += 360;
  headingDeg = headingDeg % 360;

  // Proximity percentage
  const proximityPercent = Math.max(0, Math.min(100, Math.round((1 - threatDistanceKm / 65) * 100)));

  return (
    <div className="hud-panel corner-bracket rounded-lg p-3.5 flex flex-col flex-1 min-h-[340px]">
      <div className="flex items-center justify-between pb-2 border-b border-[#142642] mb-2.5">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-[#00e5ff]" />
          <h3 className="text-xs font-hud font-bold tracking-wider text-white">
            LIVE FLIGHT TELEMETRY
          </h3>
        </div>
        <span className="text-[9px] font-mono-tech text-[#00e5ff] animate-pulse">STREAMING</span>
      </div>

      <div className="space-y-2.5 flex-1 font-mono-tech">
        {/* Metric 1: Jet Coordinates */}
        <div className="p-2.5 rounded bg-[#060d1c] border border-[#142642]">
          <div className="flex items-center justify-between text-[11px] text-[#6d91bb] mb-1">
            <span>VIPER-01 COORDINATES (X, Y)</span>
            <Navigation className="w-3 h-3 text-[#00e5ff]" />
          </div>
          <div className="flex items-baseline justify-between">
            {jetDestroyed ? (
              <span className="text-sm font-bold text-[#ff2a55] tracking-wider">
                SIGNAL LOST [0.0, 0.0]
              </span>
            ) : (
              <span className="text-sm font-bold text-white tracking-wider">
                X: {jetX.toFixed(1)} Y: {jetY.toFixed(1)}
              </span>
            )}
            <span className="text-[10px] text-[#00e5ff]">GRID 4B</span>
          </div>
          <div className="text-[10px] text-[#567a9f] mt-0.5">
            Alt: {jetDestroyed ? '0 FT' : '32,400 FT'} // Heading:{' '}
            <span className={jetDestroyed ? 'text-[#ff2a55]' : 'text-[#c7def7]'}>
              {jetDestroyed ? 'OFFLINE' : `${String(headingDeg).padStart(3, '0')}°`}
            </span>
          </div>
        </div>

        {/* Metric 2: Threat Slant Range */}
        <div className="p-2.5 rounded bg-[#060d1c] border border-[#142642]">
          <div className="flex items-center justify-between text-[11px] text-[#6d91bb] mb-1">
            <span>THREAT SLANT RANGE</span>
            <Radio className="w-3 h-3 text-[#ff2a55]" />
          </div>
          <div className="flex items-baseline justify-between">
            {outcome === 'intercepted' ? (
              <span className="text-base font-bold text-[#00ff66] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#00ff66]" />
                0.0 KM [DESTROYED]
              </span>
            ) : jetDestroyed ? (
              <span className="text-base font-bold text-[#ff2a55]">0.0 KM [IMPACT]</span>
            ) : (
              <span
                className={`text-base font-bold ${
                  threatDistanceKm < 15
                    ? 'text-[#ff2a55] animate-pulse'
                    : threatDistanceKm < 30
                    ? 'text-[#ffb703]'
                    : 'text-[#00ff66]'
                }`}
              >
                {threatDistanceKm.toFixed(1)} KM
              </span>
            )}
            <span className="text-[10px] text-[#ffb703]">
              {outcome === 'intercepted'
                ? 'TARGET NEUTRALIZED'
                : `CLOSING ${closureRate > 0 ? `-${closureRate}` : closureRate} M/S`}
            </span>
          </div>
          <div className="w-full bg-[#0a1527] h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className={`h-full transition-all duration-150 ${
                outcome === 'intercepted'
                  ? 'bg-[#00ff66] w-0'
                  : jetDestroyed || threatDistanceKm < 15
                  ? 'bg-[#ff2a55] w-full'
                  : threatDistanceKm < 30
                  ? 'bg-[#ffb703]'
                  : 'bg-[#00ff66]'
              }`}
              style={{
                width: outcome === 'intercepted' ? '0%' : jetDestroyed ? '100%' : `${proximityPercent}%`,
              }}
            />
          </div>
        </div>

        {/* Metric 3: Interceptor Velocity */}
        <div className="p-2.5 rounded bg-[#060d1c] border border-[#142642]">
          <div className="flex items-center justify-between text-[11px] text-[#6d91bb] mb-1">
            <span>INTERCEPTOR VELOCITY</span>
            <Zap className="w-3 h-3 text-[#00e5ff]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span
              className={`text-base font-bold ${
                outcome === 'intercepted'
                  ? 'text-[#00ff66]'
                  : interceptorMach > 0
                  ? 'text-[#00e5ff] animate-pulse'
                  : 'text-white'
              }`}
            >
              {outcome === 'intercepted' ? 'TERMINAL HIT' : `MACH ${interceptorMach.toFixed(1)}`}
            </span>
            <span className="text-[10px] text-[#7195be]">
              {outcome === 'intercepted'
                ? 'DIRECT IMPACT'
                : interceptorMach > 0
                ? `${(interceptorMach * 6.5).toFixed(1)} G LOAD`
                : '0.0 G LOAD'}
            </span>
          </div>
          <div className="text-[10px] text-[#5980a8] mt-0.5">
            Kinetic Energy:{' '}
            <span className="text-[#00e5ff]">
              {outcome === 'intercepted' ? 'DISPERSED (KILL)' : `${(interceptorMach * 4.2).toFixed(1)} MJ`}
            </span>
          </div>
        </div>

        {/* Metric 4: ECM Jamming Noise */}
        <div className="p-2.5 rounded bg-[#060d1c] border border-[#142642]">
          <div className="flex items-center justify-between text-[11px] text-[#6d91bb] mb-1">
            <span>ECM JAMMING NOISE</span>
            <span
              className={`text-[10px] font-bold ${
                ecmNoiseDb > 25 ? 'text-[#ff2a55]' : 'text-[#00ff66]'
              }`}
            >
              {ecmNoiseDb.toFixed(1)} dB
            </span>
          </div>
          <div className="w-full bg-[#0a1527] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                ecmNoiseDb > 25 ? 'bg-[#ff2a55]' : 'bg-[#00e5ff]'
              }`}
              style={{ width: `${Math.min(100, (ecmNoiseDb / 50) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Manual Trigger */}
      <button
        onClick={onSpawnThreat}
        className="mt-2.5 w-full py-2 rounded bg-[#ff2a55]/20 hover:bg-[#ff2a55]/30 border border-[#ff2a55]/50 hover:border-[#ff2a55] text-[#ff2a55] text-xs font-mono-tech font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>SIMULATE EVASIVE THREAT SPAWN</span>
      </button>
    </div>
  );
};

