import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Radio,
  Layers,
  Globe,
  AlertTriangle,
  Activity,
  Cpu,
  Workflow,
  BarChart3,
  Volume2,
  VolumeX,
  Compass,
  Crosshair,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { SimStatus } from '../types/simulation';
import { ControlMode, InterceptionOutcome, ScreenMode, ThreatLevel } from '../types/tactical';

interface HeaderProps {
  activeTab: ScreenMode;
  setActiveTab: (tab: ScreenMode) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  controlMode: ControlMode;
  onToggleControlMode: (mode: ControlMode) => void;
  threatLevel: ThreatLevel;
  jetDestroyed: boolean;
  outcome?: InterceptionOutcome;
  status: SimStatus;
  isBackendConnected: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onRunDemo: () => void;
  isDemoRunning: boolean;
  onDeploy: () => void;
  interceptorStatus: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  audioEnabled,
  onToggleAudio,
  controlMode,
  onToggleControlMode,
  threatLevel,
  jetDestroyed,
  outcome,
  status,
  isBackendConnected,
  onStart,
  onPause,
  onReset,
  onRunDemo,
  isDemoRunning,
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
    <header className="border-b border-[#142642] bg-[#070e1c]/95 backdrop-blur px-4 py-2.5 sticky top-0 z-40 shadow-lg">
      <div className="max-w-[1780px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-3">
        {/* Title and System Badge */}
        <div className="flex items-center gap-3 w-full xl:w-auto justify-between xl:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded bg-[#00e5ff]/10 border border-[#00e5ff]/40 text-[#00e5ff] relative shrink-0">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#00ff66] ring-4 ring-[#070e1c]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-white font-hud tracking-wider text-base md:text-lg font-bold flex items-center gap-2">
                  AEGIS DEFENSE COMMAND
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00e5ff]/15 border border-[#00e5ff]/40 text-[#00e5ff] font-mono-tech tracking-normal">
                    SIL-TWIN v4.8
                  </span>
                </h1>
                <span className="text-[10px] text-[#00ff66] bg-[#00ff66]/10 px-2 py-0.5 rounded border border-[#00ff66]/30 font-mono-tech flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-ping" />
                  {isBackendConnected ? 'FASTAPI LIVE' : 'CLIENT ENGINE'}
                </span>
              </div>
              <p className="text-[10px] text-[#6d91bb] font-mono-tech hidden sm:block">
                HIGH-ALTITUDE AIRBORNE KINETIC INTERCEPTOR SYSTEM // SOFTWARE-IN-THE-LOOP DIGITAL TWIN
              </p>
            </div>
          </div>

          {/* Mobile Clock */}
          <div className="xl:hidden flex flex-col text-right font-mono-tech text-xs">
            <span className="text-white font-bold">{utcTime}</span>
            <span className="text-[10px] text-[#00ff66]">{formatSimTime(simSeconds)}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#050c18] p-1 rounded-lg border border-[#162a49] overflow-x-auto max-w-full">
          {/* Primary Tactical Views */}
          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono-tech transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'radar'
                ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/50 font-bold shadow-[0_0_10px_rgba(0,229,255,0.25)]'
                : 'text-[#6e92ba] hover:text-white hover:bg-[#0c182c]'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>TACTICAL RADAR</span>
          </button>

          <button
            onClick={() => setActiveTab('blueprint')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono-tech transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'blueprint'
                ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/50 font-bold shadow-[0_0_10px_rgba(0,229,255,0.25)]'
                : 'text-[#6e92ba] hover:text-white hover:bg-[#0c182c]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>CAD BLUEPRINT</span>
          </button>

          <button
            onClick={() => setActiveTab('grid')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono-tech transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'grid'
                ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/50 font-bold shadow-[0_0_10px_rgba(0,229,255,0.25)]'
                : 'text-[#6e92ba] hover:text-white hover:bg-[#0c182c]'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>THEATER GRID</span>
          </button>

          <button
            onClick={() => setActiveTab('blackbox')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono-tech transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'blackbox'
                ? 'bg-[#ff2a55]/20 text-[#ff2a55] border border-[#ff2a55]/50 font-bold shadow-[0_0_10px_rgba(255,42,85,0.25)]'
                : 'text-[#6e92ba] hover:text-white hover:bg-[#0c182c]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#ff2a55]" />
            <span>BLACK BOX FDR</span>
          </button>

          <span className="w-[1px] h-4 bg-[#1b3456] mx-0.5" />

          {/* Research & Lab Views */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono-tech transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/50 font-bold'
                : 'text-[#6e92ba] hover:text-white hover:bg-[#0c182c]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>KINEMATICS LAB</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono-tech transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/50 font-bold'
                : 'text-[#6e92ba] hover:text-white hover:bg-[#0c182c]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>ARCHITECTURE</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono-tech transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/50 font-bold'
                : 'text-[#6e92ba] hover:text-white hover:bg-[#0c182c]'
            }`}
          >
            <Workflow className="w-3.5 h-3.5 text-purple-400" />
            <span>AI PIPELINE</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono-tech transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'metrics'
                ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/50 font-bold'
                : 'text-[#6e92ba] hover:text-white hover:bg-[#0c182c]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>METRICS</span>
          </button>
        </nav>

        {/* Global Controls & Status Badges */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Audio Toggle */}
          <button
            onClick={onToggleAudio}
            className={`flex items-center gap-1.5 text-xs font-mono-tech px-2.5 py-1.5 rounded border transition-colors cursor-pointer ${
              audioEnabled
                ? 'border-[#1b3a62] bg-[#091322] hover:border-[#00e5ff]/60 text-[#a0c5ea]'
                : 'border-[#ff2a55]/50 bg-[#16060c] text-[#ff2a55]'
            }`}
            title="Toggle Tactical Audio & Synthesized Voice Engine"
          >
            {audioEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#00e5ff]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-[#ff2a55]" />
            )}
            <span className="hidden sm:inline">{audioEnabled ? 'AUDIO: ON' : 'AUDIO: OFF'}</span>
          </button>

          {/* Flight Control Mode Toggle */}
          <div className="flex items-center bg-[#050c18] border border-[#162a49] rounded p-0.5 font-mono-tech text-[11px]">
            <span className="px-1.5 text-[#5e82a8] text-[10px]">JET:</span>
            {(['patrol', 'mouse', 'wasd'] as ControlMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onToggleControlMode(mode)}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer uppercase ${
                  controlMode === mode
                    ? 'bg-[#00e5ff]/20 text-[#00e5ff] font-bold border border-[#00e5ff]/40 shadow-sm'
                    : 'text-[#6285ad] hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Threat Defcon Badge */}
          <div
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono-tech font-bold border ${
              jetDestroyed || threatLevel === 'CRITICAL BREACH'
                ? 'bg-[#ff2a55]/20 text-[#ff2a55] border-[#ff2a55]/60 animate-pulse'
                : threatLevel === 'TRACKING'
                ? 'bg-[#ffb703]/20 text-[#ffb703] border-[#ffb703]/50'
                : 'bg-[#00ff66]/15 text-[#00ff66] border-[#00ff66]/40'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                jetDestroyed || threatLevel === 'CRITICAL BREACH'
                  ? 'bg-[#ff2a55]'
                  : threatLevel === 'TRACKING'
                  ? 'bg-[#ffb703]'
                  : 'bg-[#00ff66]'
              }`}
            />
            <span>{jetDestroyed ? 'DEFCON 1' : threatLevel}</span>
          </div>

          {/* Clocks */}
          <div className="hidden lg:flex flex-col text-right font-mono-tech pl-2 border-l border-[#162947]">
            <span className="text-xs text-white font-bold tracking-wider">{utcTime}</span>
            <span className="text-[10px] text-[#00ff66]">T-SIM: {formatSimTime(simSeconds)}</span>
          </div>

          {/* Quick Simulation controls if in Kinematics Lab */}
          {activeTab === 'dashboard' && (
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
              {status === 'RUNNING' ? (
                <button
                  onClick={onPause}
                  title="Pause Simulation"
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors"
                >
                  <Pause className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={onStart}
                  title="Start Simulation"
                  className="p-1 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-emerald-300" />
                </button>
              )}

              <button
                onClick={onReset}
                title="Reset Simulation"
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onRunDemo}
                disabled={isDemoRunning}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider transition-all ${
                  isDemoRunning
                    ? 'bg-purple-900/60 text-purple-300 border border-purple-500 animate-pulse'
                    : 'bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700/50 hover:border-purple-500'
                }`}
              >
                <Sparkles className="w-3 h-3 text-purple-300" />
                <span>{isDemoRunning ? 'Running' : 'Demo'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
