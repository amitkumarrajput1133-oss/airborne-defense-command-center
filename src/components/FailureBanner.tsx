import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface FailureBannerProps {
  onReEngage: () => void;
}

export const FailureBanner: React.FC<FailureBannerProps> = ({ onReEngage }) => {
  return (
    <div className="w-full bg-gradient-to-r from-[#4d0717]/95 via-[#850920]/95 to-[#4d0717]/95 border-y-2 border-[#ff2a55] px-6 py-2.5 z-40 animate-pulse text-white flex flex-wrap items-center justify-between gap-3 shadow-[0_0_30px_rgba(255,42,85,0.6)]">
      <div className="flex items-center gap-3.5">
        <div className="w-8 h-8 rounded bg-[#ff2a55] text-white flex items-center justify-center font-bold text-lg animate-bounce shrink-0 shadow-[0_0_12px_#ff2a55]">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm md:text-base font-hud font-bold tracking-widest text-white flex items-center gap-2.5 flex-wrap">
            <span>SIMULATION INTERCEPTION FAILED</span>
            <span className="text-xs px-2 py-0.5 rounded bg-black/60 text-[#ff2a55] font-mono-tech border border-[#ff2a55]">
              CODE: KIN-BREACH-9
            </span>
          </h2>
          <p className="text-xs font-mono-tech text-[#ffd1dc]">
            Threat bypassed kinetic interceptor. Mobile platform VIPER-01 destroyed by high-speed impact.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onReEngage}
          className="px-3.5 py-1.5 rounded bg-black/60 hover:bg-black/90 border border-white/40 hover:border-white text-xs font-mono-tech text-white font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-md"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#00ff66]" />
          <span>RE-ENGAGE DEFENSE GRID</span>
        </button>
      </div>
    </div>
  );
};
