import React, { useState } from 'react';
import {
  Layers,
  Radio,
  Cpu,
  Crosshair,
  TrendingUp,
  Shield,
  Activity,
  ArrowDown,
  ChevronRight,
  Info,
  CheckCircle2,
  Database
} from 'lucide-react';

interface ArchitectureBlock {
  id: string;
  title: string;
  category: string;
  shortDesc: string;
  inputs: string[];
  outputs: string[];
  algorithm: string;
  fullDesc: string;
  safetyNote: string;
}

const ARCHITECTURE_BLOCKS: ArchitectureBlock[] = [
  {
    id: 'sensor',
    title: '1. SIMULATED SENSOR',
    category: 'Physics & Environmental Simulation',
    shortDesc: 'Generates synthetic radar echo pulses with variable Gaussian measurement noise.',
    inputs: ['Ground Truth Kinematics (x, y, vx, vy)', 'Environmental Noise Parameter (σ)'],
    outputs: ['Raw Radar Detections (x_meas, y_meas, timestamp)'],
    algorithm: 'Gaussian Noise perturbation: x_meas = x_true + N(0, σ²)',
    fullDesc: 'Simulates high-frequency radar receiver pulses capturing spatial returns from moving airborne bodies. Incorporates adjustable atmospheric clutter, thermal noise, and measurement variance to model realistic sensor uncertainty.',
    safetyNote: 'Simulated normalized coordinates only; no real-world frequencies, radar cross-sections (RCS), or electronic countermeasure logic.'
  },
  {
    id: 'data_acq',
    title: '2. DATA ACQUISITION & INGESTION',
    category: 'Signal Conditioning',
    shortDesc: 'Samples, validates, and standardizes coordinate frames at discrete time intervals.',
    inputs: ['Continuous sensor stream', 'Sampling interval Δt = 0.1s'],
    outputs: ['Synchronized measurement frames [z_k]'],
    algorithm: 'Discrete Time Quantization and Boundary Validation',
    fullDesc: 'Buffers and conditions streaming radar pulses into uniform time steps (dt = 0.1s). Validates sanity checks, drops out-of-bounds outliers, and formats data into numerical arrays ready for state estimation.',
    safetyNote: 'Educational data pipeline running in browser/Python sandbox with zero external radar hardware interfaces.'
  },
  {
    id: 'detection',
    title: '3. OBJECT DETECTION & TRACK INITIATION',
    category: 'Target Discrimination',
    shortDesc: 'Differentiates persistent flight signatures from ambient sensor clutter.',
    inputs: ['Time-series observation buffer'],
    outputs: ['Confirmed Target Track ID (T-01) with Initial Covariance P_0'],
    algorithm: 'M-of-N Sequential Gate Validation',
    fullDesc: 'Evaluates consecutive radar hits against spatial distance thresholds. Once a cluster of consistent observations is confirmed over multiple cycles, a new track file is opened with initial high covariance uncertainty.',
    safetyNote: 'Abstract kinematic discrimination only; no classified IFF (Identification Friend or Foe) signatures or military transponder codes.'
  },
  {
    id: 'tracking',
    title: '4. TARGET TRACKING (STATE ESTIMATION)',
    category: 'Stochastic Filtering',
    shortDesc: 'Recursive Discrete Kalman Filter estimating true position, velocity, and heading.',
    inputs: ['Noisy measurements z_k = [x_m, y_m]^T', 'Previous state estimate X_(k-1)'],
    outputs: ['Filtered state X_k = [x, y, vx, vy]^T', 'Error Covariance Matrix P_k', 'Tracking Confidence %'],
    algorithm: 'Discrete Linear Kalman Filter (Predict: X=FX, P=FPF^T+Q; Correct: K=PH^T S^-1, X=X+Ky)',
    fullDesc: 'Applies discrete Bayesian state estimation to filter out sensor noise and reconstruct smooth unobserved velocity vectors (vx, vy). Continuously calculates the Kalman Gain K to dynamically balance prior kinematic expectations with fresh measurement residual innovations.',
    safetyNote: 'Standard undergraduate textbook Kalman filter formulated for 2D cartesian coordinates.'
  },
  {
    id: 'prediction',
    title: '5. TRAJECTORY PREDICTION (AI/ML)',
    category: 'Machine Learning Extrapolation',
    shortDesc: 'Scikit-Learn polynomial regression model projecting future 3-5 second spatial path.',
    inputs: ['Rolling window of N recent filtered states', 'Prediction Horizon K timesteps'],
    outputs: ['Predicted Trajectory Array [{x_i, y_i, t_i}]', 'Forecast RMSE Error Metric'],
    algorithm: 'Ridge Polynomial Regression (degree 2) with L2 regularization',
    fullDesc: 'Uses machine learning to learn non-linear acceleration curves and maneuvers from the target’s recent state history. Predicts future coordinates ahead in time, allowing the system to anticipate where the target will be before it arrives.',
    safetyNote: 'Non-classified polynomial extrapolation for smooth continuous curved flight curves.'
  },
  {
    id: 'interception_point',
    title: '6. INTERCEPTION-POINT ESTIMATION',
    category: 'Kinematic Convergence Math',
    shortDesc: 'Calculates the earliest reachable geometric meeting point in future space-time.',
    inputs: ['AI Predicted Trajectory Array', 'Interceptor launch coordinates & cruising speed'],
    outputs: ['Predicted Interception Point (x*, y*)', 'Time To Intercept (TTI)'],
    algorithm: 'Future Space-Time Geometric Intersection: dist(Origin, Target_i) / V_int <= (t_i - t_now)',
    fullDesc: 'Solves the kinematic rendezvous condition: calculates the earliest future time slice t* where the virtual interceptor, traveling at speed V_int from its current position, can arrive at the predicted threat coordinates simultaneously.',
    safetyNote: 'Purely kinematic rendezvous calculation; contains no real missile proportional navigation gains, seeker optics, or lead-angle guidance.'
  },
  {
    id: 'interceptor_sim',
    title: '7. INTERCEPTOR SIMULATION',
    category: 'Defensive Vehicle Simulation',
    shortDesc: 'Animates the virtual interceptor towards the calculated meeting point.',
    inputs: ['Target Meeting Point Coordinates', 'Command Deploy Trigger'],
    outputs: ['Interceptor position, velocity, and distance to meeting point'],
    algorithm: 'Normalized Vector Pursuit: V_int = (P_target - P_int) / ||P_target - P_int|| * Speed',
    fullDesc: 'Upon user deployment, shifts the interceptor from STANDBY to DEPLOYED. Animates its normalized position across the coordinate space towards the estimated meeting point, continuously adjusting vector heading if the threat maneuvers.',
    safetyNote: 'Strictly a virtual point moving on a screen; no propulsion, aerodynamic thrust, booster separation, or physical missile hardware.'
  },
  {
    id: 'telemetry',
    title: '8. VISUALIZATION & TELEMETRY',
    category: 'Human-Machine Interface (HMI)',
    shortDesc: 'Renders 2D radar HUD, telemetry graphs, and real-time mission status.',
    inputs: ['Simulation state snapshot, trajectory buffers, event logs'],
    outputs: ['60 FPS Radar Canvas, Recharts time-series graphs, mission alerts'],
    algorithm: 'High-DPI HTML5 Canvas Rendering with Recharts SVG charting',
    fullDesc: 'Presents a clean, high-contrast dark research dashboard displaying radar sweep, range rings, ground truth vs filtered vs predicted paths, tracking confidence gauges, and timestamped event notifications suitable for academic review.',
    safetyNote: 'Safe pedagogical visualization developed exclusively for presentation and educational research.'
  }
];

export const SystemArchitecturePage: React.FC = () => {
  const [selectedBlock, setSelectedBlock] = useState<ArchitectureBlock>(ARCHITECTURE_BLOCKS[0]);

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto py-2">
      {/* Overview Banner */}
      <div className="hud-panel rounded-xl p-5 border border-slate-800 bg-[#0c1220]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/70 border border-cyan-500/50 text-cyan-300">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold tracking-wider text-slate-100 uppercase">
              System Architecture & Data Flow
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              End-to-End Pipeline from Simulated Sensor Ingestion to AI Prediction and Interception Point Estimation.
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Architecture Flow Blocks */}
        <div className="lg:col-span-6 flex flex-col gap-2.5">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase px-1">
            Data Processing Pipeline (Click to inspect component)
          </div>

          {ARCHITECTURE_BLOCKS.map((block, idx) => {
            const isSelected = selectedBlock.id === block.id;
            return (
              <React.Fragment key={block.id}>
                <div
                  onClick={() => setSelectedBlock(block)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-500 shadow-[0_0_16px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                        isSelected
                          ? 'bg-cyan-500 text-black'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-slate-200">
                          {block.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-800 text-cyan-400 border border-slate-700">
                          {block.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {block.shortDesc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected ? 'text-cyan-400 translate-x-1' : 'text-slate-600'
                    }`}
                  />
                </div>

                {idx < ARCHITECTURE_BLOCKS.length - 1 && (
                  <div className="flex justify-center py-0.5 text-slate-600">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right Column: Detailed Block Inspector */}
        <div className="lg:col-span-6 sticky top-20">
          <div className="hud-panel hud-panel-accent rounded-xl p-5 border border-slate-800 bg-[#0c1220] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-mono font-semibold text-cyan-400 uppercase tracking-widest">
                  {selectedBlock.category}
                </span>
                <h3 className="text-base font-bold text-slate-100 font-mono mt-0.5">
                  {selectedBlock.title}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-cyan-300 font-mono text-xs border border-slate-700">
                ACTIVE COMPONENT
              </span>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase mb-1">
                Technical Purpose
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedBlock.fullDesc}
              </p>
            </div>

            {/* Mathematical Algorithm */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
              <h4 className="text-[11px] font-mono font-bold text-cyan-400 uppercase mb-1">
                Core Algorithm & Equation
              </h4>
              <code className="text-xs font-mono text-emerald-400 block bg-black/40 p-2 rounded border border-slate-800/80 overflow-x-auto">
                {selectedBlock.algorithm}
              </code>
            </div>

            {/* Inputs & Outputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800">
                <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase mb-2">
                  Input Parameters
                </h4>
                <ul className="flex flex-col gap-1.5 text-xs text-slate-300 font-mono">
                  {selectedBlock.inputs.map((inp, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-cyan-400">•</span>
                      <span>{inp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800">
                <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase mb-2">
                  Output Parameters
                </h4>
                <ul className="flex flex-col gap-1.5 text-xs text-slate-300 font-mono">
                  {selectedBlock.outputs.map((out, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>{out}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Safety Boundary Callout */}
            <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/50 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-blue-200/90 leading-relaxed">
                <strong className="text-blue-300">Safe Educational Model:</strong> {selectedBlock.safetyNote}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
