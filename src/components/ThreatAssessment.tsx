import React from 'react';
import { Activity } from 'lucide-react';
import { ThreatLevel } from '../types';

interface ThreatAssessmentProps {
  threatLevel: ThreatLevel;
  onSetThreatLevel: (level: ThreatLevel) => void;
  jetDestroyed: boolean;
}

export const ThreatAssessment: React.FC<ThreatAssessmentProps> = ({
  threatLevel,
  onSetThreatLevel,
  jetDestroyed,
}) => {
  const getDefconLabel = () => {
    if (jetDestroyed || threatLevel === 'CRITICAL BREACH') return 'DEFCON 1';
    if (threatLevel === 'TRACKING') return 'DEFCON 2';
    return 'DEFCON 4';
  };

  const getStatusText = () => {
    if (jetDestroyed || threatLevel === 'CRITICAL BREACH') return 'CRITICAL BREACH // IMPACT';
    if (threatLevel === 'TRACKING') return 'RADAR TARGET LOCKED';
    return 'ACTIVE SURVEILLANCE';
  };

  return (
    <div
      className={`hud-panel corner-bracket rounded-lg p-3.5 flex flex-col transition-all duration-300 ${
        jetDestroyed || threatLevel === 'CRITICAL BREACH' ? 'hud-danger-glow' : ''
      }`}
    >
      <div className="flex items-center justify-between pb-2 border-b border-[#142642] mb-3">
        <div className="flex items-center gap-2">
          <Activity
            className={`w-4 h-4 ${
              jetDestroyed || threatLevel === 'CRITICAL BREACH'
                ? 'text-[#ff2a55] animate-pulse'
                : threatLevel === 'TRACKING'
                ? 'text-[#ffb703]'
                : 'text-[#00ff66]'
            }`}
          />
          <h2 className="text-xs font-hud font-bold tracking-wider text-white">
            THREAT LEVEL ASSESSMENT
          </h2>
        </div>
        <span
          className={`text-[10px] font-mono-tech px-2 py-0.5 rounded border ${
            jetDestroyed || threatLevel === 'CRITICAL BREACH'
              ? 'text-[#ff2a55] bg-[#ff2a55]/20 border-[#ff2a55]/50 animate-pulse font-bold'
              : threatLevel === 'TRACKING'
              ? 'text-[#ffb703] bg-[#ffb703]/10 border-[#ffb703]/30'
              : 'text-[#00ff66] bg-[#00ff66]/10 border-[#00ff66]/30'
          }`}
        >
          {getDefconLabel()}
        </span>
      </div>

      {/* Stepped Assessment Buttons */}
      <div className="grid grid-cols-3 gap-1.5 mb-2 font-mono-tech text-[10px] font-bold text-center">
        <button
          onClick={() => onSetThreatLevel('CLEAR')}
          className={`py-1.5 rounded transition-all cursor-pointer ${
            threatLevel === 'CLEAR' && !jetDestroyed
              ? 'bg-[#00ff66]/20 border border-[#00ff66]/50 text-[#00ff66]'
              : 'bg-[#091526] border border-[#162e4f] text-[#527499] hover:text-white'
          }`}
        >
          CLEAR
        </button>

        <button
          onClick={() => onSetThreatLevel('TRACKING')}
          className={`py-1.5 rounded transition-all cursor-pointer ${
            threatLevel === 'TRACKING' && !jetDestroyed
              ? 'bg-[#ffb703]/20 border border-[#ffb703]/50 text-[#ffb703]'
              : 'bg-[#091526] border border-[#162e4f] text-[#527499] hover:text-white'
          }`}
        >
          TRACKING
        </button>

        <button
          onClick={() => onSetThreatLevel('CRITICAL BREACH')}
          className={`py-1.5 rounded transition-all cursor-pointer ${
            threatLevel === 'CRITICAL BREACH' || jetDestroyed
              ? 'bg-[#ff2a55]/25 border border-[#ff2a55]/70 text-[#ff2a55] animate-pulse font-bold'
              : 'bg-[#091526] border border-[#162e4f] text-[#527499] hover:text-white'
          }`}
        >
          CRITICAL BREACH
        </button>
      </div>

      {/* Threat Status Description Box */}
      <div className="p-2 rounded bg-[#050c18] border border-[#162947] text-[11px] font-mono-tech flex items-center justify-between">
        <span className="text-[#7297c2]">RADAR LOCK STATUS:</span>
        <span
          className={`font-bold ${
            jetDestroyed || threatLevel === 'CRITICAL BREACH'
              ? 'text-[#ff2a55] animate-pulse'
              : threatLevel === 'TRACKING'
              ? 'text-[#ffb703]'
              : 'text-[#00ff66]'
          }`}
        >
          {getStatusText()}
        </span>
      </div>
    </div>
  );
};
