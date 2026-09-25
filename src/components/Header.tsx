import React, { useEffect, useState } from 'react';
import { ShieldAlert, Volume2, VolumeX, Radio, Compass, Cpu, Activity, ShieldCheck } from 'lucide-react';
import { ControlMode, InterceptionOutcome, ScreenMode, ThreatLevel } from '../types';

interface HeaderProps {
  currentScreen: ScreenMode;
  onSelectScreen: (screen: ScreenMode) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  controlMode: ControlMode;
  onToggleControlMode: (mode: ControlMode) => void;
  threatLevel: ThreatLevel;
  jetDestroyed: boolean;
  outcome?: InterceptionOutcome;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onSelectScreen,
  audioEnabled,
  onToggleAudio,
  controlMode,
  onToggleControlMode,
  threatLevel,
  jetDestroyed,
  outcome,
}) => {
  const [utcTime, setUtcTime] = useState<string>('00:00:00 UTC');
  const [simSeconds, setSimSeconds] = useState<number>(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, '0');
      const m = String(now.getUTCMinutes()).padStart(2, '0');
      const s = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${h}:${m}:${s} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSimSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSimTime = (totalSec: number) => {
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `+${h}:${m}:${s}`;
  };

  return (
    <header className="w-full border-b border-[#142642] bg-[#070e1c]/95 backdrop-blur px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-30 shadow-lg">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded bg-[#00e5ff]/10 border border-[#00e5ff]/40 text-[#00e5ff] relative shrink-0">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#00ff66] ring-4 ring-[#070e1c]" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-white font-hud tracking-wider text-base md:text-lg font-bold flex items-center gap-2">
              AEGIS DEFENSE COMMAND
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#00e5ff]/15 border border-[#00e5ff]/40 text-[#00e5ff] font-mono-tech tracking-normal">
                SYS.VER.4.8
              </span>
            </h1>
            <span className="text-[11px] text-[#00ff66] bg-[#00ff66]/10 px-2 py-0.5 rounded border border-[#00ff66]/30 font-mono-tech flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-ping" /> SECURE LINK
            </span>
          </div>
          <p className="text-[11px] text-[#5e82a8] font-mono-tech hidden sm:block">
            AIRBORNE THREAT INTERCEPTION SIMULATION ENGINE // 1.8M SINGLE-BODY INTERCEPTOR
          </p>
        </div>
      </div>

      {/* Screen Mode Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-[#050c18] p-1 rounded-lg border border-[#162a49]">
        <button
          onClick={() => onSelectScreen('radar')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono-tech transition-all cursor-pointer ${
            currentScreen === 'radar'
              ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/50 font-bold shadow-[0_0_10px_rgba(0,229,255,0.2)]'
              : 'text-[#6e92ba] hover:text-white hover:bg-[#0c182c]'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>TACTICAL RADAR</span>
        </button>

        <button
          onClick={() => onSelectScreen('blueprint')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono-tech transition-all cursor-pointer ${
            currentScreen === 'blueprint'
              ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/50 font-bold shadow-[0_0_10px_rgba(0,229,255,0.2)]'
              : 'text-[#6e92ba] hover:text-white hover:bg-[#0c182c]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>INTERCEPTOR SCHEMATIC</span>
        </button>

        <button
          onClick={() => onSelectScreen('grid')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono-tech transition-all cursor-pointer ${
            currentScreen === 'grid'
              ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/50 font-bold shadow-[0_0_10px_rgba(0,229,255,0.2)]'
              : 'text-[#6e92ba] hover:text-white hover:bg-[#0c182c]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>DEFENSE GRID</span>
        </button>

        <button
          onClick={() => onSelectScreen('blackbox')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono-tech transition-all cursor-pointer ${
            currentScreen === 'blackbox'
              ? 'bg-[#ff2a55]/20 text-[#ff2a55] border border-[#ff2a55]/50 font-bold shadow-[0_0_10px_rgba(255,42,85,0.2)]'
              : 'text-[#6e92ba] hover:text-white hover:bg-[#0c182c]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>BLACK BOX // BREACH</span>
        </button>
      </nav>

      {/* Center Dynamic Status Pill */}
      <div
        className={`hidden xl:flex items-center px-3.5 py-1.5 rounded border transition-all duration-300 gap-3 min-w-[320px] justify-between ${
          outcome === 'intercepted'
            ? 'border-[#00ff66]/60 bg-[#062416] text-[#00ff66]'
            : jetDestroyed
            ? 'border-[#ff2a55]/60 bg-[#2b0812] text-[#ff2a55]'
            : threatLevel === 'TRACKING'
            ? 'border-[#ffb703]/50 bg-[#1e1506] text-[#ffb703]'
            : 'border-[#1b3a62] bg-[#0b172a] text-[#00e5ff]'
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              outcome === 'intercepted'
                ? 'bg-[#00ff66] animate-ping'
                : jetDestroyed
                ? 'bg-[#ff2a55] animate-ping'
                : threatLevel === 'TRACKING'
                ? 'bg-[#ffb703] animate-ping'
                : 'bg-[#00ff66] animate-pulse'
            }`}
          />
          <span className="text-xs font-hud font-bold tracking-wider">
            {outcome === 'intercepted'
              ? 'TARGET NEUTRALIZED // SPLASH ONE'
              : jetDestroyed
              ? 'ALERT: PLATFORM COMPROMISED'
              : threatLevel === 'TRACKING'
              ? 'THREAT INBOUND: CLOSING'
              : 'DEFENSE GRID: STANDBY'}
          </span>
        </div>
        <span className="text-[11px] font-mono-tech opacity-80">
          {outcome === 'intercepted'
            ? 'MID-AIR KINETIC KILL CONFIRMED'
            : jetDestroyed
            ? 'INTERCEPTION MISSED // CATASTROPHIC HIT'
            : threatLevel === 'TRACKING'
            ? 'ENGAGE KINETIC COUNTERMEASURE'
            : 'VIPER-01 PATROL LOCK NORMAL'}
        </span>
      </div>

      {/* Right Controls & Timestamps */}
      <div className="flex items-center gap-2.5">
        {/* Audio Toggle */}
        <button
          onClick={onToggleAudio}
          className={`flex items-center gap-1.5 text-xs font-mono-tech px-2.5 py-1.5 rounded border transition-colors cursor-pointer ${
            audioEnabled
              ? 'border-[#1b3a62] bg-[#091322] hover:border-[#00e5ff]/60 text-[#a0c5ea]'
              : 'border-[#ff2a55]/50 bg-[#16060c] text-[#ff2a55]'
          }`}
          title="Toggle Tactical Audio & Synthesized Voice"
        >
          {audioEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-[#00e5ff]" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-[#ff2a55]" />
          )}
          <span>{audioEnabled ? 'AUDIO: ON' : 'AUDIO: OFF'}</span>
        </button>

        {/* Jet Auto-Patrol Status Badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#091322] border border-[#1b3a62] text-xs font-mono-tech">
          <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse" />
          <span className="text-[#658cb4]">PATROL:</span>
          <span className="text-[#00e5ff] font-bold">FIGURE-8 LOOP</span>
        </div>

        {/* Live Clocks */}
        <div className="hidden sm:flex flex-col text-right font-mono-tech pl-2 border-l border-[#162947]">
          <span className="text-xs text-white font-bold tracking-wider">{utcTime}</span>
          <span className="text-[10px] text-[#00ff66]">T-SIM: {formatSimTime(simSeconds)}</span>
        </div>
      </div>
    </header>
  );
};

