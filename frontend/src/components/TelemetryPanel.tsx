import React from 'react';
import { SimulationPayload } from '../types/simulation';
import { Activity, Shield, Crosshair, Zap, Compass, Gauge, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface TelemetryPanelProps {
  payload: SimulationPayload | null;
  onDeploy: () => void;
  onOpenInterceptorOverview: () => void;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ payload, onDeploy, onOpenInterceptorOverview }) => {
  if (!payload) {
    return (
      <div className="hud-panel rounded-xl p-5 border border-slate-800 text-slate-400 text-sm flex items-center justify-center">
        Awaiting telemetry telemetry stream...
      </div>
    );
  }

  const {
    status,
    threat,
    tracking,
    prediction,
    interceptor,
    meeting_point,
    metrics,
    sim_time
  } = payload;

  const isDeployable = interceptor.status === 'STANDBY' && threat.active && prediction.active;

  return (
    <div className="flex flex-col gap-3 hud-panel hud-panel-accent rounded-xl p-4 border border-slate-800 bg-[#0c1220] h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h2 className="text-xs font-bold tracking-widest text-slate-200 uppercase font-mono">
            System Telemetry & Tracking
          </h2>
        </div>
        <span className="text-[11px] font-mono text-cyan-400/80 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/50">
          T+{sim_time.toFixed(1)}s
        </span>
      </div>

      {/* Primary Status Card Grid */}
      <div className="grid grid-cols-2 gap-2 font-mono text-xs">
        {/* Threat Status */}
        <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Threat Status
          </div>
          <div className="mt-1 font-bold text-sm text-red-400">
            {!threat.active ? (status === 'FAILED' ? 'PLATFORM COMPROMISED' : 'INTERCEPTED') : status === 'INITIALIZED' ? 'DETECTED' : 'TRACKING'}
          </div>
        </div>

        {/* Tracking Confidence */}
        <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Tracking Confidence
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-bold text-sm text-emerald-400">
              {tracking.confidence.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-500">
              ({tracking.observations_count} obs)
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, tracking.confidence)}%` }}
            />
          </div>
        </div>

        {/* AI Prediction Status */}
        <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${prediction.active ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
            AI Prediction
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className={`font-bold text-sm ${prediction.active ? 'text-cyan-300' : 'text-slate-500'}`}>
              {prediction.active ? 'ACTIVE' : 'OFFLINE'}
            </span>
            <span className="text-[10px] text-cyan-400/80">
              {prediction.horizon_points.length} pts
            </span>
          </div>
        </div>

        {/* Interceptor Status */}
        <button
          onClick={onOpenInterceptorOverview}
          title="Open Interceptor System Overview"
          className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between text-left transition-colors hover:border-cyan-500/60 hover:bg-cyan-950/20 focus:outline-none focus:ring-1 focus:ring-cyan-400"
        >
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                interceptor.status === 'DEPLOYED'
                  ? 'bg-blue-400 animate-pulse'
                  : interceptor.status === 'INTERCEPTED'
                  ? 'bg-emerald-400'
                  : 'bg-slate-500'
              }`}
            />
            Interceptor
          </div>
          <div className="mt-1 font-bold text-sm text-blue-400">
            {interceptor.status}
          </div>
        </button>
      </div>

      {/* Meeting Point & Interception Geometry */}
      <div className="bg-slate-900/70 border border-slate-800/90 p-3 rounded-lg flex flex-col gap-2 font-mono text-xs">
        <div className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-amber-400" />
            Predicted Interception Point
          </span>
          {meeting_point && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              ESTIMATED
            </span>
          )}
        </div>

        {meeting_point ? (
          <div className="grid grid-cols-2 gap-2 text-slate-300">
            <div>
              <div className="text-[10px] text-slate-500">COORDINATES (X, Y)</div>
              <div className="font-semibold text-slate-200">
                ({meeting_point.x.toFixed(1)}, {meeting_point.y.toFixed(1)})
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">TIME TO INTERCEPT (TTI)</div>
              <div className="font-semibold text-amber-400">
                ~{meeting_point.tti.toFixed(1)} s
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">DISTANCE TO POINT</div>
              <div className="font-semibold text-slate-200">
                {meeting_point.distance.toFixed(1)} units
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">ENGAGEMENT WINDOW</div>
              <div className="font-semibold text-emerald-400">
                OPTIMAL
              </div>
            </div>
          </div>
        ) : (
          <div className="text-slate-500 text-center py-2 text-[11px] italic">
            Gathering sensor observations for trajectory convergence...
          </div>
        )}

        {/* Tactical Deploy Button */}
        {interceptor.status === 'STANDBY' && (
          <button
            onClick={onDeploy}
            disabled={!isDeployable}
            className={`w-full mt-2 py-2 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
              isDeployable
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-[0_0_16px_rgba(37,99,235,0.4)] cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Shield className="w-4 h-4" />
            Deploy Interceptor
          </button>
        )}

        {interceptor.status === 'DEPLOYED' && (
          <div className="mt-2 py-1.5 px-3 rounded-lg bg-blue-950/70 border border-blue-600/50 text-blue-200 text-center font-semibold text-xs flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-cyan-300 animate-pulse" />
            INTERCEPTOR IN PURSUIT // VECTOR ACTIVE
          </div>
        )}

        {interceptor.status === 'INTERCEPTED' && (
          <div className="mt-2 py-1.5 px-3 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-center font-semibold text-xs flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            SIMULATION INTERCEPTION ACHIEVED
          </div>
        )}
      </div>

      {/* Target Kinematics Breakdown */}
      <div className="bg-slate-900/70 border border-slate-800/90 p-3 rounded-lg flex flex-col gap-2 font-mono text-xs">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          Target Tracking Kinematics
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-slate-300">
          <div>
            <span className="text-[10px] text-slate-500 block">FILTERED POSITION</span>
            <span className="font-semibold text-slate-200">
              ({tracking.x.toFixed(1)}, {tracking.y.toFixed(1)})
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">ESTIMATED SPEED</span>
            <span className="font-semibold text-cyan-300">
              {tracking.speed.toFixed(2)} u/s
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">EST. VELOCITY (Vx, Vy)</span>
            <span className="font-semibold text-slate-200">
              ({tracking.vx.toFixed(2)}, {tracking.vy.toFixed(2)})
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">HEADING AZIMUTH</span>
            <span className="font-semibold text-slate-200">
              {tracking.heading_deg.toFixed(1)}°
            </span>
          </div>
        </div>
      </div>

      {/* Performance Mini-Stats */}
      <div className="mt-auto pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1">
          <Gauge className="w-3.5 h-3.5 text-slate-500" />
          <span>Compute: {metrics.compute_time_ms.toFixed(1)} ms</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Tracking Acc: {metrics.tracking_accuracy}%</span>
        </div>
      </div>
    </div>
  );
};
