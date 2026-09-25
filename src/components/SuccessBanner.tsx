import React from 'react';
import { ShieldCheck, Crosshair, PlusCircle } from 'lucide-react';

interface SuccessBannerProps {
  interceptDistanceKm: number;
  onSpawnNext: () => void;
  onDismiss: () => void;
}

export const SuccessBanner: React.FC<SuccessBannerProps> = ({
  interceptDistanceKm,
  onSpawnNext,
  onDismiss,
}) => {
  return (
    <div className="w-full bg-gradient-to-r from-[#042818]/95 via-[#063e26]/95 to-[#042818]/95 border-y-2 border-[#00ff66] px-6 py-2.5 z-40 animate-fade-in text-white flex flex-wrap items-center justify-between gap-3 shadow-[0_0_30px_rgba(0,255,102,0.4)]">
      <div className="flex items-center gap-3.5">
        <div className="w-8 h-8 rounded bg-[#00ff66] text-black flex items-center justify-center font-bold text-lg shrink-0 shadow-[0_0_15px_#00ff66]">
          <ShieldCheck className="w-5 h-5 text-black" />
        </div>
        <div>
          <h2 className="text-sm md:text-base font-hud font-bold tracking-widest text-white flex items-center gap-2.5 flex-wrap">
            <span>AIRBORNE THREAT NEUTRALIZED // DIRECT KINETIC INTERCEPTION</span>
            <span className="text-xs px-2 py-0.5 rounded bg-black/60 text-[#00ff66] font-mono-tech border border-[#00ff66]">
              CODE: KIN-KILL-SUCCESS
            </span>
          </h2>
          <p className="text-xs font-mono-tech text-[#c2fadc]">
            Direct terminal kinetic collision with BOGEY-X at {interceptDistanceKm.toFixed(1)} KM slant range. Target destroyed in mid-air. Mobile platform VIPER-01 completely intact.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onSpawnNext}
          className="px-3.5 py-1.5 rounded bg-[#00ff66]/20 hover:bg-[#00ff66]/30 border border-[#00ff66] text-xs font-mono-tech text-[#00ff66] hover:text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>SPAWN NEXT THREAT</span>
        </button>

        <button
          onClick={onDismiss}
          className="px-2.5 py-1.5 rounded bg-black/60 hover:bg-black/80 border border-white/20 text-xs font-mono-tech text-[#82b49d] hover:text-white transition-all cursor-pointer"
        >
          DISMISS
        </button>
      </div>
    </div>
  );
};
