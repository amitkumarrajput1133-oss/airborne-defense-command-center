import React, { useState, useEffect } from 'react';
import { simService } from '../services/api';
import { Cpu, Zap, Activity, Filter, Database, TrendingUp, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';

export const AIPipelinePage: React.FC = () => {
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchInspection = async () => {
    setLoading(true);
    try {
      const data = await simService.inspectPipeline();
      setPipelineData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspection();
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto py-2">
      {/* Header Banner */}
      <div className="hud-panel rounded-xl p-5 border border-slate-800 bg-[#0c1220] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/70 border border-cyan-500/50 text-cyan-300">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold tracking-wider text-slate-100 uppercase">
              AI / ML Trajectory Prediction Pipeline
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Educational Breakdown: How Simulated Sensor Observations Transform into Future Spatial Predictions
            </p>
          </div>
        </div>

        <button
          onClick={fetchInspection}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-mono font-semibold transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Run Live Pipeline Trace
        </button>
      </div>

      {/* Step-by-Step Educational Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Step 1: Sensor Data Ingestion */}
        <div className="hud-panel rounded-xl p-4 border border-slate-800 bg-[#0c1220] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
              STAGE 01
            </span>
            <Activity className="w-4 h-4 text-red-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-100 font-mono">
            Raw Sensor Data
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The radar receiver captures positional reflections. Because real-world sensors experience thermal and atmospheric disturbance, the raw measurement contains synthetic Gaussian noise.
          </p>
          <div className="mt-auto bg-slate-900/90 p-2.5 rounded border border-slate-800 font-mono text-xs">
            <div className="text-[10px] text-slate-500 mb-1">SAMPLE READING:</div>
            <div className="text-slate-300">
              Ground Truth: ({pipelineData?.stage_1_ground_truth?.x?.toFixed(1) || '840.0'}, {pipelineData?.stage_1_ground_truth?.y?.toFixed(1) || '140.0'})
            </div>
            <div className="text-amber-400">
              Observed Echo: ({pipelineData?.stage_2_sensor_observation?.observed?.x?.toFixed(1) || '843.2'}, {pipelineData?.stage_2_sensor_observation?.observed?.y?.toFixed(1) || '138.7'})
            </div>
          </div>
        </div>

        {/* Step 2: Noise Filtering */}
        <div className="hud-panel rounded-xl p-4 border border-slate-800 bg-[#0c1220] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
              STAGE 02
            </span>
            <Filter className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-100 font-mono">
            Noise Filtering (Kalman)
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The Discrete Kalman Filter compares incoming observations with kinematic predictions. It isolates signal from random sensor chatter and yields an accurate velocity vector [Vx, Vy].
          </p>
          <div className="mt-auto bg-slate-900/90 p-2.5 rounded border border-slate-800 font-mono text-xs">
            <div className="text-[10px] text-slate-500 mb-1">FILTERED STATE:</div>
            <div className="text-emerald-400 font-semibold">
              Pos: ({pipelineData?.stage_3_noise_filter?.estimated_state?.x?.toFixed(1) || '841.1'}, {pipelineData?.stage_3_noise_filter?.estimated_state?.y?.toFixed(1) || '139.8'})
            </div>
            <div className="text-slate-300">
              Vel: ({pipelineData?.stage_3_noise_filter?.estimated_state?.vx?.toFixed(2) || '-3.7'}, {pipelineData?.stage_3_noise_filter?.estimated_state?.vy?.toFixed(2) || '3.1'})
            </div>
          </div>
        </div>

        {/* Step 3: Feature Extraction */}
        <div className="hud-panel rounded-xl p-4 border border-slate-800 bg-[#0c1220] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
              STAGE 03
            </span>
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-100 font-mono">
            Feature Extraction
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            A rolling sliding window of recent observations is maintained. We construct input vectors containing normalized time offsets, positions, instantaneous velocities, and delta displacements.
          </p>
          <div className="mt-auto bg-slate-900/90 p-2.5 rounded border border-slate-800 font-mono text-xs">
            <div className="text-[10px] text-slate-500 mb-1">FEATURE TENSOR:</div>
            <div className="text-blue-300">
              Window: {pipelineData?.stage_4_feature_extraction?.history_window_samples || 25} samples
            </div>
            <div className="text-slate-400 text-[11px]">
              Features: [t, x, y, vx, vy, Δt]
            </div>
          </div>
        </div>

        {/* Step 4: Trajectory Model */}
        <div className="hud-panel rounded-xl p-4 border border-slate-800 bg-[#0c1220] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
              STAGE 04
            </span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-100 font-mono">
            ML Trajectory Model
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            A Scikit-Learn Polynomial Regression model with Ridge L2 regularization fits continuous 2nd-degree curves over time. This captures constant acceleration and gradual turns.
          </p>
          <div className="mt-auto bg-slate-900/90 p-2.5 rounded border border-slate-800 font-mono text-xs">
            <div className="text-[10px] text-slate-500 mb-1">MODEL SPECIFICATION:</div>
            <div className="text-cyan-300">
              Algorithm: Ridge Polynomial (d=2)
            </div>
            <div className="text-slate-400">
              RMSE Error: {pipelineData?.stage_5_trajectory_prediction?.estimated_rmse?.toFixed(2) || '0.45'} u
            </div>
          </div>
        </div>

        {/* Step 5: Future Position Prediction */}
        <div className="hud-panel rounded-xl p-4 border border-slate-800 bg-[#0c1220] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
              STAGE 05
            </span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-100 font-mono">
            Future Position Extrapolation
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The trained model computes projected coordinates across future horizon steps (1.0 to 3.5 seconds ahead). These points render on the radar HUD as the dashed cyan prediction line.
          </p>
          <div className="mt-auto bg-slate-900/90 p-2.5 rounded border border-slate-800 font-mono text-xs">
            <div className="text-[10px] text-slate-500 mb-1">FUTURE POINTS (NEXT 3):</div>
            <div className="text-amber-300 text-[11px]">
              t+0.5s: ({pipelineData?.stage_5_trajectory_prediction?.next_5_points?.[0]?.x || '821.5'}, {pipelineData?.stage_5_trajectory_prediction?.next_5_points?.[0]?.y || '155.2'})
            </div>
            <div className="text-amber-300 text-[11px]">
              t+1.0s: ({pipelineData?.stage_5_trajectory_prediction?.next_5_points?.[1]?.x || '802.1'}, {pipelineData?.stage_5_trajectory_prediction?.next_5_points?.[1]?.y || '171.4'})
            </div>
          </div>
        </div>

        {/* Step 6: Simulation Decision */}
        <div className="hud-panel rounded-xl p-4 border border-slate-800 bg-[#0c1220] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
              STAGE 06
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-100 font-mono">
            Interception Decision & Rendezvous
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The interception solver finds where the defender's kinematic reach matches the threat’s arrival timestamp. The interceptor is then commanded toward this calculated meeting point.
          </p>
          <div className="mt-auto bg-slate-900/90 p-2.5 rounded border border-slate-800 font-mono text-xs">
            <div className="text-[10px] text-slate-500 mb-1">CALCULATED MEETING POINT:</div>
            <div className="text-emerald-400 font-bold">
              ({pipelineData?.stage_6_interception_decision?.meeting_point?.x?.toFixed(1) || '540.2'}, {pipelineData?.stage_6_interception_decision?.meeting_point?.y?.toFixed(1) || '380.1'})
            </div>
            <div className="text-slate-400 text-[11px]">
              Estimated TTI: {pipelineData?.stage_6_interception_decision?.meeting_point?.tti || '3.2'}s
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Flow Summary Bar */}
      <div className="hud-panel rounded-xl p-5 border border-slate-800 bg-[#0c1220]">
        <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-3">
          Data Transformation Pipeline Summary
        </h4>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="bg-slate-900 px-3 py-2 rounded border border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px]">1. INPUT</span>
            <span className="text-red-400 font-semibold">Sensor Echoes</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block" />
          <div className="bg-slate-900 px-3 py-2 rounded border border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px]">2. FILTER</span>
            <span className="text-emerald-400 font-semibold">Kalman State</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block" />
          <div className="bg-slate-900 px-3 py-2 rounded border border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px]">3. REGRESSION</span>
            <span className="text-blue-400 font-semibold">ML Fit Model</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block" />
          <div className="bg-slate-900 px-3 py-2 rounded border border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px]">4. PREDICTION</span>
            <span className="text-cyan-400 font-semibold">Future Curve</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block" />
          <div className="bg-slate-900 px-3 py-2 rounded border border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px]">5. INTERCEPTION</span>
            <span className="text-amber-400 font-semibold">Meeting Point</span>
          </div>
        </div>
      </div>
    </div>
  );
};
