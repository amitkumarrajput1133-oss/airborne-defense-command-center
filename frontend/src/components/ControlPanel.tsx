import React from 'react';
import { ThreatProfileType, SimStatus } from '../types/simulation';
import { Play, Pause, RotateCcw, Shield, Sliders, Cpu, Activity, Volume2 } from 'lucide-react';

interface ControlPanelProps {
  status: SimStatus;
  profile: ThreatProfileType;
  noiseLevel: number;
  speedMultiplier: number;
  aiEnabled: boolean;
  selectedScenario: string;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onDeploy: () => void;
  onProfileChange: (p: ThreatProfileType) => void;
  onNoiseChange: (n: number) => void;
  onSpeedChange: (s: number) => void;
  onAiToggle: (enabled: boolean) => void;
  onScenarioSelect: (scId: string) => void;
  interceptorStatus: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  status,
  profile,
  noiseLevel,
  speedMultiplier,
  aiEnabled,
  selectedScenario,
  onStart,
  onPause,
  onReset,
  onDeploy,
  onProfileChange,
  onNoiseChange,
  onSpeedChange,
  onAiToggle,
  onScenarioSelect,
  interceptorStatus
}) => {
  return (
    <div className="hud-panel rounded-xl p-4 border border-slate-800 bg-[#0c1220] flex flex-col gap-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold tracking-widest text-slate-200 uppercase">
            Simulation Control Interface
          </h2>
        </div>
        <span className="text-[10px] text-slate-400">OPERATIONAL PANEL</span>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {status === 'RUNNING' ? (
          <button
            onClick={onPause}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-700/60 text-amber-200 font-bold transition-all shadow-sm"
          >
            <Pause className="w-3.5 h-3.5" />
            Pause
          </button>
        ) : (
          <button
            onClick={onStart}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/70 text-emerald-200 font-bold transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)]"
          >
            <Play className="w-3.5 h-3.5 fill-emerald-300" />
            Start
          </button>
        )}

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>

        <button
          onClick={onDeploy}
          disabled={interceptorStatus !== 'STANDBY'}
          className={`col-span-2 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold uppercase tracking-wider transition-all ${
            interceptorStatus === 'STANDBY'
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_14px_rgba(37,99,235,0.4)]'
              : 'bg-slate-800/80 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          {interceptorStatus === 'STANDBY' ? 'Deploy Interceptor' : interceptorStatus}
        </button>
      </div>

      {/* Scenario Presets */}
      <div className="flex flex-col gap-1.5 pt-1">
        <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
          Scenario Mode
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
          {[
            { id: 'straight', label: '1. Straight' },
            { id: 'variable', label: '2. Variable' },
            { id: 'noisy', label: '3. Noisy Sensor' },
            { id: 'maneuvering', label: '4. Maneuver' }
          ].map((sc) => (
            <button
              key={sc.id}
              onClick={() => onScenarioSelect(sc.id)}
              className={`py-1.5 px-2 rounded text-[11px] font-medium border text-center transition-all ${
                selectedScenario === sc.id
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-200 font-bold shadow-sm'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Threat Profile & AI Prediction Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Threat Profile Dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Threat Kinematic Profile
          </label>
          <select
            value={profile}
            onChange={(e) => onProfileChange(e.target.value as ThreatProfileType)}
            className="bg-slate-900 border border-slate-700/80 text-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="straight">Straight Line (Linear)</option>
            <option value="variable">Variable Curvature (Harmonic)</option>
            <option value="maneuvering">High-G Evasive Maneuver</option>
            <option value="random_noise">Random Disturbance (Brownian)</option>
          </select>
        </div>

        {/* AI Prediction Toggle */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            AI Trajectory Prediction
          </label>
          <button
            onClick={() => onAiToggle(!aiEnabled)}
            className={`flex items-center justify-between px-3 py-1.5 rounded border text-xs font-semibold transition-all ${
              aiEnabled
                ? 'bg-cyan-950/70 border-cyan-600/70 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              ML Extrapolation Model
            </span>
            <span className="text-[11px] font-bold">
              {aiEnabled ? 'ENABLED' : 'DISABLED'}
            </span>
          </button>
        </div>
      </div>

      {/* Sliders for Simulation Speed and Sensor Noise */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
        {/* Speed Multiplier */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-semibold">
            <span>Simulation Clock Speed</span>
            <span className="text-cyan-400 font-bold">{speedMultiplier}x</span>
          </div>
          <div className="flex items-center gap-2">
            {[0.5, 1.0, 2.0, 5.0].map((spd) => (
              <button
                key={spd}
                onClick={() => onSpeedChange(spd)}
                className={`flex-1 py-1 rounded text-[11px] font-medium border text-center transition-all ${
                  speedMultiplier === spd
                    ? 'bg-slate-700 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Sensor Noise Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-semibold">
            <span>Sensor Noise Std Dev</span>
            <span className="text-amber-400 font-bold">{noiseLevel.toFixed(1)}σ</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.2"
            value={noiseLevel}
            onChange={(e) => onNoiseChange(parseFloat(e.target.value))}
            className="w-full accent-amber-500 bg-slate-800 rounded h-1.5 cursor-pointer mt-1"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>Low (0.2)</span>
            <span>Medium (1.5)</span>
            <span>High (3.0)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
