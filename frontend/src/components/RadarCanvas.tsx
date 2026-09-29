import React, { useRef, useEffect, useState } from 'react';
import { SimulationPayload, HistoryRecord } from '../types/simulation';
import { Eye, EyeOff, Radio, Maximize2, Shield, AlertTriangle } from 'lucide-react';

interface RadarCanvasProps {
  payload: SimulationPayload | null;
  history: HistoryRecord[];
  onDeploy: () => void;
  onOpenInterceptorOverview: () => void;
  onAircraftMove: (x: number, y: number) => void;
}

export const RadarCanvas: React.FC<RadarCanvasProps> = ({ payload, history, onDeploy, onOpenInterceptorOverview, onAircraftMove }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showSweep, setShowSweep] = useState(true);
  const [showNoiseCloud, setShowNoiseCloud] = useState(true);
  const [showFilteredPath, setShowFilteredPath] = useState(true);
  const [showPredictionLine, setShowPredictionLine] = useState(true);
  const sweepAngleRef = useRef(0);
  const interceptionPulseRef = useRef(0);

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    const x = Math.max(30, Math.min(970, ((event.clientX - bounds.left) / bounds.width) * 1000));
    const y = Math.max(30, Math.min(970, ((event.clientY - bounds.top) / bounds.height) * 1000));
    onAircraftMove(x, y);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!payload || payload.interceptor.status !== 'DEPLOYED') return;

    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * canvas.width;
    const y = ((event.clientY - bounds.top) / bounds.height) * canvas.height;
    const interceptorX = (payload.interceptor.x / 1000) * canvas.width;
    const interceptorY = (payload.interceptor.y / 1000) * canvas.height;

    if (Math.hypot(x - interceptorX, y - interceptorY) <= 30) {
      onOpenInterceptorOverview();
    }
  };

  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const center = { x: width / 2, y: height / 2 };
      const radius = Math.min(width, height) * 0.44;

      // Coordinate scaling: maps 0..1000 space to canvas coordinates
      const scaleX = (val: number) => (val / 1000) * width;
      const scaleY = (val: number) => (val / 1000) * height;

      // 1. Clear background with deep tactical radar hue
      ctx.fillStyle = '#060911';
      ctx.fillRect(0, 0, width, height);

      // Radar Circular Scope Background
      ctx.save();
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(7, 24, 20, 0.45)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(21, 128, 61, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.clip();

      // Background subtle grid
      ctx.strokeStyle = 'rgba(21, 128, 61, 0.1)';
      ctx.lineWidth = 1;
      const gridSpacing = width / 20;
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Concentric Range Rings (e.g., 5 rings)
      const ringCount = 5;
      for (let i = 1; i <= ringCount; i++) {
        const r = (radius / ringCount) * i;
        ctx.beginPath();
        ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = i === ringCount ? 'rgba(34, 197, 94, 0.6)' : 'rgba(34, 197, 94, 0.2)';
        ctx.setLineDash(i % 2 === 0 ? [4, 4] : []);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);

        // Range Label
        ctx.fillStyle = 'rgba(34, 197, 94, 0.55)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(`${i * 100} KM`, center.x + 6, center.y - r + 12);
      }

      // Crosshairs & Azimuth Spokes (Every 45 degrees)
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.25)';
      ctx.lineWidth = 1;
      for (let deg = 0; deg < 360; deg += 45) {
        const rad = (deg * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(center.x + Math.cos(rad) * radius, center.y + Math.sin(rad) * radius);
        ctx.stroke();

        // Azimuth degree label at edge
        const labelR = radius - 14;
        const lx = center.x + Math.cos(rad) * labelR;
        const ly = center.y + Math.sin(rad) * labelR;
        ctx.fillStyle = 'rgba(34, 197, 94, 0.7)';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const azText = `${deg < 100 ? '0' : ''}${deg < 10 ? '0' : ''}${deg}°`;
        ctx.fillText(azText, lx, ly);
      }

      // Rotating Radar Sweep Beam
      if (showSweep) {
        sweepAngleRef.current = (sweepAngleRef.current + 0.02) % (Math.PI * 2);
        const angle = sweepAngleRef.current;

        const sweepGrad = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius);
        sweepGrad.addColorStop(0, 'rgba(34, 197, 94, 0.2)');
        sweepGrad.addColorStop(1, 'rgba(34, 197, 94, 0.0)');

        // Sweep Cone
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.arc(center.x, center.y, radius, angle - 0.35, angle, false);
        ctx.closePath();
        ctx.fillStyle = 'rgba(34, 197, 94, 0.12)';
        ctx.fill();

        // Leading Beam Line
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(center.x + Math.cos(angle) * radius, center.y + Math.sin(angle) * radius);
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // -------------------------------------------------------------
      // 2. TRAJECTORY PATHS (Ground Truth, Noisy Cloud, Filtered, AI)
      // -------------------------------------------------------------

      if (history.length > 1) {
        // A. Noisy Sensor Observation Cloud (Yellowish dots)
        if (showNoiseCloud) {
          ctx.fillStyle = 'rgba(234, 179, 8, 0.45)';
          for (let i = 0; i < history.length; i += 2) {
            const h = history[i];
            ctx.beginPath();
            ctx.arc(scaleX(h.observed_x), scaleY(h.observed_y), 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // B. Ground Truth Trajectory (Subtle red line)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < history.length; i++) {
          const h = history[i];
          if (i === 0) ctx.moveTo(scaleX(h.actual_x), scaleY(h.actual_y));
          else ctx.lineTo(scaleX(h.actual_x), scaleY(h.actual_y));
        }
        ctx.stroke();

        // C. Kalman Filtered Trajectory (Solid bright green line)
        if (showFilteredPath) {
          ctx.beginPath();
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 2.2;
          for (let i = 0; i < history.length; i++) {
            const h = history[i];
            if (i === 0) ctx.moveTo(scaleX(h.filtered_x), scaleY(h.filtered_y));
            else ctx.lineTo(scaleX(h.filtered_x), scaleY(h.filtered_y));
          }
          ctx.stroke();
        }
      }

      // D. AI Predicted Trajectory (Cyan Dashed Line into the Future)
      if (showPredictionLine && payload?.prediction.active && payload.prediction.horizon_points.length > 0) {
        const preds = payload.prediction.horizon_points;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 5]);

        // Connect from current filtered state to predictions
        ctx.moveTo(scaleX(payload.tracking.x), scaleY(payload.tracking.y));
        for (let i = 0; i < preds.length; i++) {
          ctx.lineTo(scaleX(preds[i].x), scaleY(preds[i].y));
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Small nodes along predicted line
        ctx.fillStyle = '#06b6d4';
        for (let i = 4; i < preds.length; i += 5) {
          ctx.beginPath();
          ctx.arc(scaleX(preds[i].x), scaleY(preds[i].y), 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // E. Solid interceptor ejection vector from the aircraft nose to the target vector
      if (payload?.interceptor.status === 'DEPLOYED' && payload.meeting_point) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.8)';
        ctx.lineWidth = 2.5;
        const launchPoint = payload.aircraft || payload.fighter;
        const launchHeading = payload.aircraft?.heading ?? payload.interceptor.launch_heading ?? 0;
        const noseOffset = 18;
        ctx.moveTo(scaleX(launchPoint.x + Math.cos(launchHeading) * noseOffset), scaleY(launchPoint.y + Math.sin(launchHeading) * noseOffset));
        ctx.lineTo(scaleX(payload.meeting_point.x), scaleY(payload.meeting_point.y));
        ctx.stroke();
      }

      // -------------------------------------------------------------
      // 3. OBJECT MARKERS
      // -------------------------------------------------------------

      // A. Moving airborne fighter platform
      if (payload) {
        const aircraft = payload.aircraft || { ...payload.fighter, heading: 0, callsign: 'VIPER-01' };
        const fx = scaleX(aircraft.x);
        const fy = scaleY(aircraft.y);

        // Aircraft position ring
        ctx.beginPath();
        ctx.arc(fx, fy, 24, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Vector-drawn stealth fighter, oriented to its live heading
        ctx.save();
        ctx.translate(fx, fy);
        ctx.rotate(aircraft.heading);
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#00e5ff';
        ctx.strokeStyle = '#b6f6ff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(2, -4);
        ctx.lineTo(-11, -13);
        ctx.lineTo(-7, -2);
        ctx.lineTo(-16, -5);
        ctx.lineTo(-10, 0);
        ctx.lineTo(-16, 5);
        ctx.lineTo(-7, 2);
        ctx.lineTo(-11, 13);
        ctx.lineTo(2, 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Live aircraft callsign label
        ctx.fillStyle = '#00e5ff';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${aircraft.callsign} [F-35]`, fx, fy + 36);
      }

      // B. Incoming Threat Object
      if (payload && payload.threat.active) {
        const tx = scaleX(payload.threat.x);
        const ty = scaleY(payload.threat.y);

        // Ping ring animation
        const pingR = 12 + (Date.now() % 1200) / 75;
        ctx.beginPath();
        ctx.arc(tx, ty, pingR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(239, 68, 68, ${Math.max(0, 1 - pingR / 28)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Threat Marker (Diamond)
        ctx.save();
        ctx.translate(tx, ty);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(0, -9);
        ctx.lineTo(9, 0);
        ctx.lineTo(0, 9);
        ctx.lineTo(-9, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Velocity vector needle
        const speed = Math.hypot(payload.threat.vx, payload.threat.vy);
        if (speed > 0) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(payload.threat.vx * 6, payload.threat.vy * 6);
          ctx.strokeStyle = '#fca5a5';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.restore();

        // Threat ID Tag
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`THREAT [T-01]`, tx + 14, ty - 6);
        ctx.fillStyle = '#fca5a5';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(`SPD: ${payload.threat.speed}u`, tx + 14, ty + 6);
      }

      // C. Interceptor (Virtual Defender)
      if (payload && payload.interceptor.status === 'DEPLOYED') {
        const ix = scaleX(payload.interceptor.x);
        const iy = scaleY(payload.interceptor.y);

        // Interceptor Marker (Arrowhead)
        const angle = Math.atan2(payload.interceptor.vy, payload.interceptor.vx);
        ctx.save();
        ctx.translate(ix, iy);
        ctx.rotate(angle);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(11, 0);
        ctx.lineTo(-7, -6);
        ctx.lineTo(-4, 0);
        ctx.lineTo(-7, 6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();

        // Interceptor Label
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`INTERCEPTOR [DEF-1]`, ix + 12, iy - 6);
      }

      // D. Predicted Interception Point (Meeting Point)
      if (payload?.meeting_point && payload.threat.active) {
        const mx = scaleX(payload.meeting_point.x);
        const my = scaleY(payload.meeting_point.y);

        // Pulsing Reticle Crosshair
        const pulse = Math.sin(Date.now() / 200) * 3 + 12;
        ctx.beginPath();
        ctx.arc(mx, my, pulse, 0, Math.PI * 2);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Crosshair ticks
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(mx - pulse - 6, my);
        ctx.lineTo(mx - pulse + 2, my);
        ctx.moveTo(mx + pulse - 2, my);
        ctx.lineTo(mx + pulse + 6, my);
        ctx.moveTo(mx, my - pulse - 6);
        ctx.lineTo(mx, my - pulse + 2);
        ctx.moveTo(mx, my + pulse - 2);
        ctx.lineTo(mx, my + pulse + 6);
        ctx.stroke();

        // Meeting Point Tag
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PREDICTED INTERCEPTION POINT', mx, my - pulse - 8);
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(`TTI: ${payload.meeting_point.tti}s | DIST: ${payload.meeting_point.distance}u`, mx, my + pulse + 16);
      }

      // E. Interception outcome pulse
      if (payload?.status === 'INTERCEPTED') {
        interceptionPulseRef.current += 1.5;
        const shockRadius = 15 + (interceptionPulseRef.current % 90);
        const alpha = Math.max(0, 1 - shockRadius / 90);

        const ix = scaleX(payload.interceptor.x);
        const iy = scaleY(payload.interceptor.y);

        ctx.save();
        ctx.beginPath();
        ctx.arc(ix, iy, shockRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ix, iy, shockRadius * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34, 197, 94, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      if (payload?.status === 'FAILED') {
        const impactX = scaleX(payload.aircraft.x);
        const impactY = scaleY(payload.aircraft.y);
        const impactPulse = 18 + (Date.now() % 1000) / 22;
        const impactAlpha = Math.max(0, 1 - impactPulse / 64);

        ctx.save();
        ctx.beginPath();
        ctx.arc(impactX, impactY, impactPulse, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(248, 113, 113, ${impactAlpha})`;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(impactX, impactY, impactPulse * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(239, 68, 68, ${Math.max(0, impactAlpha * 0.55)})`;
        ctx.fill();
        ctx.strokeStyle = '#fecaca';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('BREACH POINT // VIPER-01', impactX, impactY - impactPulse - 10);
        ctx.restore();
      }

      ctx.restore(); // Scope clip restore

      // Scope Border Accent Rim
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [payload, history, showSweep, showNoiseCloud, showFilteredPath, showPredictionLine]);

  return (
    <div className="relative flex flex-col items-center justify-center hud-panel rounded-xl p-3 border border-slate-800 bg-[#090e1a]">
      {/* Top Banner overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/90 border border-slate-700/70 px-3 py-1.5 rounded-lg text-xs font-mono">
        <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
        <span className="text-slate-300 font-semibold">RADAR SCOPE: AZ-360 // SECTOR ALPHA</span>
      </div>

      {/* Interception Overlay Banner when Intercepted */}
      {payload?.status === 'INTERCEPTED' && (
        <div className="absolute top-16 z-20 flex items-center gap-3 bg-emerald-950/90 border-2 border-emerald-500/80 px-5 py-2.5 rounded-xl shadow-[0_0_24px_rgba(16,185,129,0.5)] animate-bounce">
          <Shield className="w-5 h-5 text-emerald-300" />
          <div>
            <div className="text-sm font-bold tracking-wider text-emerald-200">
              SIMULATION INTERCEPTION SUCCESS
            </div>
            <div className="text-xs text-emerald-300/80">
              Virtual interceptor vector intersected target at predicted coordinates.
            </div>
          </div>
        </div>
      )}

      {payload?.status === 'FAILED' && (
        <div className="absolute top-16 z-20 flex items-center gap-3 rounded-xl border-2 border-red-500/80 bg-red-950/95 px-5 py-2.5 shadow-[0_0_28px_rgba(239,68,68,0.55)]">
          <AlertTriangle className="h-5 w-5 text-red-300" />
          <div>
            <div className="text-sm font-bold tracking-wider text-red-200">SIMULATION INTERCEPTION FAILED</div>
            <div className="text-xs text-red-300/90">Threat bypassed kinetic interceptor. Mobile platform destroyed.</div>
          </div>
        </div>
      )}

      {/* Canvas Element */}
      <canvas
        ref={canvasRef}
        width={720}
        height={580}
        onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
        title={payload?.interceptor.status === 'DEPLOYED' ? 'Select INTERCEPTOR [DEF-1] to open the system overview' : 'Radar scope'}
        className={`max-w-full h-auto rounded-lg shadow-inner ${payload?.interceptor.status === 'DEPLOYED' ? 'cursor-pointer' : 'cursor-crosshair'}`}
      />

      {/* Radar Overlay Controls and Legend */}
      <div className="w-full mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Trajectory Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSweep(!showSweep)}
            className={`px-2.5 py-1 rounded border text-[11px] font-mono transition-colors ${
              showSweep
                ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            Sweep Beam: {showSweep ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setShowNoiseCloud(!showNoiseCloud)}
            className={`px-2.5 py-1 rounded border text-[11px] font-mono transition-colors ${
              showNoiseCloud
                ? 'bg-amber-950/60 border-amber-700/60 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            Sensor Noise Cloud: {showNoiseCloud ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setShowFilteredPath(!showFilteredPath)}
            className={`px-2.5 py-1 rounded border text-[11px] font-mono transition-colors ${
              showFilteredPath
                ? 'bg-green-950/60 border-green-700/60 text-green-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            Kalman Track: {showFilteredPath ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setShowPredictionLine(!showPredictionLine)}
            className={`px-2.5 py-1 rounded border text-[11px] font-mono transition-colors ${
              showPredictionLine
                ? 'bg-cyan-950/60 border-cyan-700/60 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            AI Trajectory: {showPredictionLine ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Visual Legend */}
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />
            <span>Threat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
            <span>Airborne Fighter</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block" />
            <span>Interceptor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-cyan-400 inline-block" />
            <span>AI Prediction</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-amber-400 inline-block" />
            <span>Meeting Point</span>
          </div>
        </div>
      </div>
    </div>
  );
};
