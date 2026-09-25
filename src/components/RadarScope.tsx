import React, { useRef, useEffect, useCallback, useState } from 'react';
import { ControlMode, DefenseMode, Explosion, InterceptorState, JetState, Particle, ThreatState } from '../types';
import { playExplosionSfx, playLaunchSfx, playTacticalVoice, playBeep, playRadarPingSfx } from '../utils/audio';
import { Play, Pause, Gauge, Crosshair, FastForward } from 'lucide-react';

export interface ThreatPing {
  id: string;
  x: number;
  y: number;
  startTime: number;
  duration: number;
  maxRadius: number;
  bearingDeg: number;
}

interface RadarScopeProps {
  controlMode: ControlMode;
  defenseMode: DefenseMode;
  onToggleDefenseMode: (mode: DefenseMode) => void;
  audioEnabled: boolean;
  autoLaunch: boolean;
  onToggleAutoLaunch: () => void;
  jet: JetState;
  setJet: React.Dispatch<React.SetStateAction<JetState>>;
  interceptor: InterceptorState;
  setInterceptor: React.Dispatch<React.SetStateAction<InterceptorState>>;
  threat: ThreatState;
  setThreat: React.Dispatch<React.SetStateAction<ThreatState>>;
  explosions: Explosion[];
  setExplosions: React.Dispatch<React.SetStateAction<Explosion[]>>;
  onLaunchInterceptor: () => void;
  onResetSimulation: (autoSpawn?: boolean) => void;
  onSpawnThreat?: () => void;
  onThreatHitJet: () => void;
  onThreatIntercepted: (x: number, y: number, distToJetKm: number) => void;
  onEvasionTriggered: () => void;
  onLogEvent: (type: 'SYS' | 'WARN' | 'ALERT' | 'BREACH' | 'SUCCESS' | 'LAUNCH' | 'PATROL', text: string) => void;
  onUpdateTelemetry: (data: {
    jetX: number;
    jetY: number;
    jetAngle: number;
    threatDistanceKm: number;
    interceptorMach: number;
    ecmNoiseDb: number;
    closureRate: number;
  }) => void;
}

export const RadarScope: React.FC<RadarScopeProps> = ({
  controlMode,
  defenseMode,
  onToggleDefenseMode,
  audioEnabled,
  autoLaunch,
  onToggleAutoLaunch,
  jet,
  setJet,
  interceptor,
  setInterceptor,
  threat,
  setThreat,
  explosions,
  setExplosions,
  onLaunchInterceptor,
  onResetSimulation,
  onSpawnThreat,
  onThreatHitJet,
  onThreatIntercepted,
  onEvasionTriggered,
  onLogEvent,
  onUpdateTelemetry,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Simulation playback speed factor: 0.5x, 1.0x, 1.5x
  const [simSpeed, setSimSpeed] = useState<number>(1.0);
  const [sensorPingActive, setSensorPingActive] = useState<boolean>(false);
  const [guidanceInfo, setGuidanceInfo] = useState<{
    threatWeave: string;
    interceptorSlew: string;
    interceptorLead: string;
  }>({
    threatWeave: 'HOMING ON VIPER-01 // CINEMATIC TRACK',
    interceptorSlew: 'STANDBY IN JET BAY',
    interceptorLead: 'APN PROPORTIONAL HOMING ARMED',
  });

  const sweepAngleRef = useRef<number>(0);
  const simTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const radarRadiusRef = useRef<number>(240);
  const splashMarkerRef = useRef<{ x: number; y: number; text: string; timer: number } | null>(null);

  // Motion freeze ref when collision occurs
  const motionFrozenRef = useRef<boolean>(false);
  // Dedicated parametric time for the figure-8 auto-patrol loop
  const patrolTimeRef = useRef<number>(0);
  // Evasive failure and overshoot tracking
  const interceptorOvershotRef = useRef<boolean>(false);
  const evasionTimerRef = useRef<number>(0);
  // Telemetry throttling timer (steady 4Hz update for judges to read comfortably)
  const telemetryTimerRef = useRef<number>(0);

  // Tactical sensor ping animation records (radial ripple wave on threat spawn)
  const threatPingsRef = useRef<ThreatPing[]>([]);
  const lastSpawnTimeRef = useRef<number>(0);

  // Jet flight history trail
  const jetTrailRef = useRef<Array<{ x: number; y: number }>>([]);

  // Spacebar launch listener (mouse cursor listeners for jet movement are completely removed)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !interceptor.active && !jet.destroyed && !motionFrozenRef.current) {
        e.preventDefault();
        onLaunchInterceptor();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [interceptor.active, jet.destroyed, onLaunchInterceptor]);

  // Main canvas animation loop with balanced, observable speeds & real-time path adapting
  useEffect(() => {
    let animId: number;

    const render = (currentTime: number) => {
      const rawDt = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = currentTime;

      // Apply the user's simulation speed multiplier
      const dt = motionFrozenRef.current ? 0 : rawDt * simSpeed;
      simTimeRef.current += rawDt * simSpeed;

      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(render);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const center = rect.width / 2;
      const radius = rect.width / 2 - 8;
      radarRadiusRef.current = radius;

      // Normalized 60fps frame delta for standard pixel/frame calculations
      const dtFrames = dt * 60;

      // =====================================================================
      // 1. JET AUTO-PATROL ENGINE (VIPER-01): PARAMETRIC FIGURE-8 LOOP
      // =====================================================================
      let currentJetX = jet.x;
      let currentJetY = jet.y;
      let currentJetAngle = jet.angle;

      if (!jet.destroyed) {
        if (!motionFrozenRef.current) {
          patrolTimeRef.current += dt;
        }
        const t = patrolTimeRef.current;

        // Smooth parametric figure-8 (Lemniscate) loop across the lower radar sector
        const centerX = center;
        const lowerCenterY = center + 105; // lower sector center (~355px)
        const A = 95; // horizontal amplitude
        const B = 32; // vertical height amplitude
        const omega = 0.35; // rad/sec (~18 seconds per full majestic loop)

        currentJetX = centerX + A * Math.sin(omega * t);
        currentJetY = lowerCenterY + B * Math.sin(2 * omega * t);

        // Exact dynamic tangent velocity derivative along active flight path
        const jetVx = A * omega * Math.cos(omega * t);
        const jetVy = 2 * B * omega * Math.cos(2 * omega * t);

        // Dynamic rotation heading so stealth jet icon turns smoothly along active path
        currentJetAngle = Math.atan2(jetVy, jetVx);

        if (!motionFrozenRef.current) {
          jetTrailRef.current.push({ x: currentJetX, y: currentJetY });
          if (jetTrailRef.current.length > 80) jetTrailRef.current.shift();

          setJet((prev) => ({
            ...prev,
            x: currentJetX,
            y: currentJetY,
            vx: jetVx,
            vy: jetVy,
            angle: currentJetAngle,
            destroyed: false,
          }));
        }
      }

      // Auto-launch trigger check (auto-dispatches after threat is detected in sensor array)
      if (
        autoLaunch &&
        threat.active &&
        !threat.destroyed &&
        !interceptor.active &&
        !jet.destroyed &&
        !motionFrozenRef.current
      ) {
        if (threat.spawnTime > 0 && Date.now() - threat.spawnTime > 1400) {
          onLaunchInterceptor();
        }
      }

      // =====================================================================
      // 1.5 SENSOR PING DETECTION (ON INBOUND THREAT SPAWN)
      // =====================================================================
      if (
        threat.active &&
        !threat.destroyed &&
        threat.spawnTime > 0 &&
        threat.spawnTime !== lastSpawnTimeRef.current
      ) {
        lastSpawnTimeRef.current = threat.spawnTime;
        const dx = threat.x - center;
        const dy = threat.y - center;
        const bearing = Math.round(((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360);

        threatPingsRef.current.push({
          id: `ping-${threat.spawnTime}-${Date.now()}`,
          x: threat.x,
          y: threat.y,
          startTime: currentTime,
          duration: 2400,
          maxRadius: 66,
          bearingDeg: bearing,
        });

        setSensorPingActive(true);
        setTimeout(() => setSensorPingActive(false), 2400);

        playRadarPingSfx(audioEnabled);
      }

      if (!threat.active || threat.spawnTime === 0) {
        lastSpawnTimeRef.current = 0;
      }

      // =====================================================================
      // 2. SLOW-MOTION THREAT HOMING PHYSICS (~1.5 PIXELS/FRAME)
      // =====================================================================
      let threatDistKm = 58.5;
      let nextThreatX = threat.x;
      let nextThreatY = threat.y;
      let nextThreatVx = threat.vx;
      let nextThreatVy = threat.vy;

      if (threat.active && !threat.destroyed && !jet.destroyed && !motionFrozenRef.current) {
        const tdx = currentJetX - threat.x;
        const tdy = currentJetY - threat.y;
        const distToJet = Math.hypot(tdx, tdy);
        threatDistKm = distToJet * 0.25;

        if (evasionTimerRef.current > 0) {
          // Evasive thrust maneuver in progress!
          evasionTimerRef.current -= dt;
          nextThreatX = threat.x + nextThreatVx * dtFrames;
          nextThreatY = threat.y + nextThreatVy * dtFrames;
        } else {
          // Continuously turn and home in on VIPER-01 moving position
          const targetAngleToJet = Math.atan2(tdy, tdx);
          const currentThreatAngle = Math.atan2(
            threat.vy || Math.sin(targetAngleToJet),
            threat.vx || Math.cos(targetAngleToJet)
          );
          let threatDiff = targetAngleToJet - currentThreatAngle;
          while (threatDiff < -Math.PI) threatDiff += Math.PI * 2;
          while (threatDiff > Math.PI) threatDiff -= Math.PI * 2;

          // Smooth turning rate: ~0.042 rad/frame
          const threatTurnRate = 0.042 * dtFrames;
          const newThreatAngle =
            currentThreatAngle + Math.max(-threatTurnRate, Math.min(threatTurnRate, threatDiff));

          // Readable cinematic speed: ~1.5 pixels/frame
          const threatSpeed = 1.5;
          nextThreatVx = Math.cos(newThreatAngle) * threatSpeed;
          nextThreatVy = Math.sin(newThreatAngle) * threatSpeed;

          nextThreatX = threat.x + nextThreatVx * dtFrames;
          nextThreatY = threat.y + nextThreatVy * dtFrames;
        }

        const ntrail = [
          ...threat.trail,
          { x: nextThreatX, y: nextThreatY, time: simTimeRef.current },
        ];
        if (ntrail.length > 120) ntrail.shift();

        // Check collision with VIPER-01 (distance < 15px)
        if (distToJet < 15) {
          motionFrozenRef.current = true;
          onThreatHitJet();
          return;
        }

        setThreat((prev) => ({
          ...prev,
          x: nextThreatX,
          y: nextThreatY,
          vx: nextThreatVx,
          vy: nextThreatVy,
          trail: ntrail,
        }));

        setGuidanceInfo((prev) => ({
          ...prev,
          threatWeave:
            evasionTimerRef.current > 0
              ? 'EVASIVE HIGH-G THRUST // LATERAL JINK'
              : interceptorOvershotRef.current
              ? 'TERMINAL GLIDE // HOMING ON VIPER-01'
              : 'HOMING ON VIPER-01 // CINEMATIC TRACK',
        }));
      } else if (jet.destroyed || motionFrozenRef.current) {
        threatDistKm = 0;
      }

      // =====================================================================
      // 3. INTERCEPTOR TARGET PURSUIT ENGINE (~2.5 PIXELS/FRAME)
      // =====================================================================
      let currentMach = 0;
      let nextInterceptorActive = interceptor.active;
      let nextInterceptorX = interceptor.x;
      let nextInterceptorY = interceptor.y;
      let nextInterceptorVx = interceptor.vx;
      let nextInterceptorVy = interceptor.vy;
      let nextInterceptorTrail = interceptor.trail;

      if (interceptor.active && !motionFrozenRef.current) {
        const flightTime = (Date.now() - interceptor.launchedAt) / 1000;
        // Slightly higher speed (~2.5 pixels/frame) to slowly close the gap
        const speed = 2.5;
        currentMach = Math.min(1.8 + flightTime * 0.3, 3.2);

        if (!interceptorOvershotRef.current) {
          // Smooth proportional homing guidance: curves gradually toward threat's live coordinates
          const targetAngle = Math.atan2(nextThreatY - interceptor.y, nextThreatX - interceptor.x);
          const currentAngle = Math.atan2(interceptor.vy, interceptor.vx);
          let diff = targetAngle - currentAngle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;

          // Smooth gradual turn rate: ~0.052 rad/frame
          const turnRate = 0.052 * dtFrames;
          const newAngle = currentAngle + Math.max(-turnRate, Math.min(turnRate, diff));

          nextInterceptorVx = Math.cos(newAngle) * speed;
          nextInterceptorVy = Math.sin(newAngle) * speed;

          setGuidanceInfo((prev) => ({
            ...prev,
            interceptorSlew: `APN PROPORTIONAL HOMING // PURSUIT [${speed.toFixed(1)} px/fr]`,
            interceptorLead: `TRACKING THREAT VECTOR [M${currentMach.toFixed(1)}]`,
          }));
        } else {
          // Overshot! Cannot track displaced threat, maintains forward ballistic glide
          nextInterceptorVx = interceptor.vx;
          nextInterceptorVy = interceptor.vy;
          setGuidanceInfo((prev) => ({
            ...prev,
            interceptorSlew: 'MMW LOCK BROKEN // OVERSHOT PAST TARGET',
            interceptorLead: 'BALLISTIC DRIFT (MISSED)',
          }));
        }

        nextInterceptorX = interceptor.x + nextInterceptorVx * dtFrames;
        nextInterceptorY = interceptor.y + nextInterceptorVy * dtFrames;

        nextInterceptorTrail = [
          ...interceptor.trail,
          { x: nextInterceptorX, y: nextInterceptorY, time: simTimeRef.current },
        ];
        if (nextInterceptorTrail.length > 90) nextInterceptorTrail.shift();

        // 4. EVASIVE FAILURE CHECK: When interceptor gets within 40px of threat
        if (threat.active && !threat.destroyed) {
          const distToInt = Math.hypot(
            nextThreatX - nextInterceptorX,
            nextThreatY - nextInterceptorY
          );

          if (distToInt < 40 && !interceptorOvershotRef.current) {
            if (defenseMode === 'failure_simulation') {
              // Trigger evasive thrust maneuver on threat missile!
              interceptorOvershotRef.current = true;
              evasionTimerRef.current = 0.45;

              // High-G lateral thrust deflection away from interceptor line
              const threatHeading = Math.atan2(nextThreatVy, nextThreatVx);
              const jinkSide = Math.random() > 0.5 ? 1 : -1;
              const jinkAngle = threatHeading + jinkSide * (Math.PI * 0.45);
              nextThreatVx = Math.cos(jinkAngle) * 3.4;
              nextThreatVy = Math.sin(jinkAngle) * 3.4;
              nextThreatX += nextThreatVx * dtFrames * 1.8;
              nextThreatY += nextThreatVy * dtFrames * 1.8;

              setThreat((prev) => ({
                ...prev,
                x: nextThreatX,
                y: nextThreatY,
                vx: nextThreatVx,
                vy: nextThreatVy,
                evaded: true,
              }));

              onEvasionTriggered();
            } else if (distToInt <= 20) {
              // Direct kinetic interception (in interception air defense mode)
              const hitX = (nextThreatX + nextInterceptorX) / 2;
              const hitY = (nextThreatY + nextInterceptorY) / 2;
              const distFromJetKm = Math.hypot(hitX - currentJetX, hitY - currentJetY) * 0.25;

              playExplosionSfx(audioEnabled);
              playTacticalVoice('Direct Hit. Target Destroyed in Flight.', audioEnabled);

              setInterceptor((prev) => ({ ...prev, active: false }));
              setThreat((prev) => ({ ...prev, active: false, destroyed: true }));
              onThreatIntercepted(hitX, hitY, distFromJetKm);
              return;
            }
          }
        }

        // Out of bounds check
        const outDist = Math.hypot(nextInterceptorX - center, nextInterceptorY - center);
        if (outDist > radius * 1.15) {
          nextInterceptorActive = false;
          onLogEvent('WARN', 'Kinetic interceptor exited radar envelope. Auto self-destruct.');
        }

        setInterceptor((prev) => ({
          ...prev,
          active: nextInterceptorActive,
          x: nextInterceptorX,
          y: nextInterceptorY,
          vx: nextInterceptorVx,
          vy: nextInterceptorVy,
          mach: currentMach,
          trail: nextInterceptorTrail,
          overshot: interceptorOvershotRef.current,
        }));
      }

      // 5. TELEMETRY & LOG TIMING: Sync telemetry panel slowly (4Hz / 250ms)
      telemetryTimerRef.current += rawDt;
      if (telemetryTimerRef.current >= 0.25) {
        telemetryTimerRef.current = 0;
        const ecmNoise = jet.destroyed
          ? 48.5
          : threat.active && !threat.destroyed
          ? Math.min(45, 10 + (1 - threatDistKm / 60) * 32)
          : 0;
        const closureMps = jet.destroyed
          ? 0
          : threat.active && !threat.destroyed
          ? Math.round(900 + (1 - threatDistKm / 60) * 450)
          : 0;

        onUpdateTelemetry({
          jetX: currentJetX,
          jetY: currentJetY,
          jetAngle: currentJetAngle,
          threatDistanceKm: jet.destroyed ? 0 : threatDistKm,
          interceptorMach: currentMach,
          ecmNoiseDb: ecmNoise,
          closureRate: closureMps,
        });
      }

      // Update splash marker timer
      if (splashMarkerRef.current) {
        splashMarkerRef.current.timer -= dt;
        if (splashMarkerRef.current.timer <= 0) {
          splashMarkerRef.current = null;
        }
      }

      // =====================================================================
      // 4. CANVAS DRAWING PASS (HIGH CONTRAST & CLEAR VECTOR TRAILS)
      // =====================================================================
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Radial background
      const bgGrad = ctx.createRadialGradient(center, center, 10, center, center, radius);
      bgGrad.addColorStop(0, '#040b19');
      bgGrad.addColorStop(0.7, '#030814');
      bgGrad.addColorStop(1, '#02050e');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.fill();

      // Range rings
      const rings = [0.25, 0.5, 0.75, 1.0];
      const ringKm = [16, 33, 49, 65];
      rings.forEach((ratioVal, idx) => {
        const r = radius * ratioVal;
        ctx.beginPath();
        ctx.arc(center, center, r, 0, Math.PI * 2);
        ctx.strokeStyle = idx === rings.length - 1 ? '#00e5ff' : 'rgba(0, 229, 255, 0.2)';
        ctx.lineWidth = idx === rings.length - 1 ? 1.8 : 1;
        if (idx !== rings.length - 1) {
          ctx.setLineDash([4, 4]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(0, 229, 255, 0.5)';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(`${ringKm[idx]}KM`, center + 4, center - r + 11);
      });

      // Bearings and crosshairs
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(center - radius, center);
      ctx.lineTo(center + radius, center);
      ctx.moveTo(center, center - radius);
      ctx.lineTo(center + radius, center);
      ctx.stroke();

      const diag = radius * 0.7071;
      ctx.beginPath();
      ctx.moveTo(center - diag, center - diag);
      ctx.lineTo(center + diag, center + diag);
      ctx.moveTo(center + diag, center - diag);
      ctx.lineTo(center - diag, center + diag);
      ctx.setLineDash([2, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Rotating radar sweep
      sweepAngleRef.current += dt * 1.5;
      if (sweepAngleRef.current > Math.PI * 2) {
        sweepAngleRef.current -= Math.PI * 2;
      }

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(sweepAngleRef.current);

      const sweepGrad = ctx.createLinearGradient(0, 0, radius, -radius * 0.35);
      sweepGrad.addColorStop(0, 'rgba(0, 229, 255, 0.35)');
      sweepGrad.addColorStop(0.3, 'rgba(0, 229, 255, 0.1)');
      sweepGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');

      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, 0, -0.45, true);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(radius, 0);
      ctx.stroke();
      ctx.restore();

      // =====================================================================
      // 0. SENSOR CONTACT RADIAL RIPPLES / PING ANIMATION (SUBTLE TACTICAL PING)
      // =====================================================================
      if (threatPingsRef.current.length > 0) {
        threatPingsRef.current = threatPingsRef.current.filter(
          (ping) => currentTime - ping.startTime < ping.duration
        );

        threatPingsRef.current.forEach((ping) => {
          const elapsed = currentTime - ping.startTime;
          const t = Math.min(1, Math.max(0, elapsed / ping.duration));

          // A. Azimuth Strobe Beam (faint radial dashed line from radar center to contact)
          const strobeAlpha = Math.max(0, 1 - elapsed / 1200) * 0.38;
          if (strobeAlpha > 0.01) {
            ctx.save();
            ctx.strokeStyle = `rgba(255, 42, 85, ${strobeAlpha})`;
            ctx.lineWidth = 1.2;
            ctx.setLineDash([3, 4]);
            ctx.beginPath();
            ctx.moveTo(center, center);
            ctx.lineTo(ping.x, ping.y);
            ctx.stroke();
            ctx.restore();
          }

          // B. Outer Perimeter Boundary Entry Arc (glow on outer 65KM ring at ingress bearing)
          const enterAngle = Math.atan2(ping.y - center, ping.x - center);
          const arcAlpha = Math.max(0, 1 - elapsed / 1800) * 0.75;
          if (arcAlpha > 0.02) {
            ctx.save();
            ctx.strokeStyle = `rgba(255, 42, 85, ${arcAlpha})`;
            ctx.lineWidth = 3.2;
            ctx.shadowColor = '#ff2a55';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(center, center, radius, enterAngle - 0.14, enterAngle + 0.14);
            ctx.stroke();
            ctx.restore();
          }

          // C. Concentric Radial Ripple Waves (3 expanding rings)
          const waveDelays = [0, 260, 520];
          waveDelays.forEach((waveDelay, wIdx) => {
            if (elapsed >= waveDelay) {
              const waveDuration = ping.duration - waveDelay;
              const wElapsed = elapsed - waveDelay;
              const wt = Math.min(1, Math.max(0, wElapsed / waveDuration));

              // Smooth ease-out deceleration curve
              const easeOut = 1 - Math.pow(1 - wt, 2.4);
              const currentR = 5 + (ping.maxRadius - 5) * easeOut;

              // Quick fade-in, smooth quadratic fade-out
              const fadeIn = Math.min(1, wt / 0.12);
              const fadeOut = Math.pow(1 - wt, 1.4);
              const alpha = fadeIn * fadeOut * 0.88;

              if (alpha > 0.01) {
                ctx.save();

                // Soft radial gradient fill on the lead ripple
                if (wIdx === 0) {
                  const fillGrad = ctx.createRadialGradient(
                    ping.x,
                    ping.y,
                    0,
                    ping.x,
                    ping.y,
                    currentR
                  );
                  fillGrad.addColorStop(0, `rgba(255, 42, 85, ${alpha * 0.22})`);
                  fillGrad.addColorStop(0.5, `rgba(255, 65, 105, ${alpha * 0.11})`);
                  fillGrad.addColorStop(0.85, `rgba(0, 229, 255, ${alpha * 0.05})`);
                  fillGrad.addColorStop(1, 'rgba(255, 42, 85, 0)');
                  ctx.fillStyle = fillGrad;
                  ctx.beginPath();
                  ctx.arc(ping.x, ping.y, currentR, 0, Math.PI * 2);
                  ctx.fill();
                }

                // Ring strokes: Primary threat glow, secondary cyan pulse, tertiary outer shockwave
                if (wIdx === 0) {
                  ctx.strokeStyle = `rgba(255, 55, 95, ${alpha})`;
                  ctx.lineWidth = 2.0 * (1 - wt * 0.35);
                  ctx.shadowColor = '#ff2a55';
                  ctx.shadowBlur = 12 * alpha;
                  ctx.beginPath();
                  ctx.arc(ping.x, ping.y, currentR, 0, Math.PI * 2);
                  ctx.stroke();
                } else if (wIdx === 1) {
                  ctx.strokeStyle = `rgba(0, 229, 255, ${alpha * 0.8})`;
                  ctx.lineWidth = 1.4;
                  ctx.setLineDash([4, 3]);
                  ctx.shadowColor = '#00e5ff';
                  ctx.shadowBlur = 6 * alpha;
                  ctx.beginPath();
                  ctx.arc(ping.x, ping.y, currentR, 0, Math.PI * 2);
                  ctx.stroke();
                  ctx.setLineDash([]);
                } else {
                  ctx.strokeStyle = `rgba(255, 100, 130, ${alpha * 0.55})`;
                  ctx.lineWidth = 1.0;
                  ctx.beginPath();
                  ctx.arc(ping.x, ping.y, currentR, 0, Math.PI * 2);
                  ctx.stroke();
                }

                ctx.restore();
              }
            }
          });

          // D. Tactical Sensor Acquire Reticle & Brackets
          const reticleAlpha = Math.max(0, 1 - elapsed / 1900) * 0.9;
          if (reticleAlpha > 0.02) {
            ctx.save();
            ctx.strokeStyle = `rgba(255, 65, 105, ${reticleAlpha})`;
            ctx.lineWidth = 1.3;
            ctx.shadowColor = '#ff2a55';
            ctx.shadowBlur = 6 * reticleAlpha;

            // 4 cardinal tick marks expanding slightly outward
            const tickDist = 14 + t * 10;
            const tickLen = 5;
            // North
            ctx.beginPath();
            ctx.moveTo(ping.x, ping.y - tickDist);
            ctx.lineTo(ping.x, ping.y - tickDist - tickLen);
            ctx.stroke();
            // South
            ctx.beginPath();
            ctx.moveTo(ping.x, ping.y + tickDist);
            ctx.lineTo(ping.x, ping.y + tickDist + tickLen);
            ctx.stroke();
            // West
            ctx.beginPath();
            ctx.moveTo(ping.x - tickDist, ping.y);
            ctx.lineTo(ping.x - tickDist - tickLen, ping.y);
            ctx.stroke();
            // East
            ctx.beginPath();
            ctx.moveTo(ping.x + tickDist, ping.y);
            ctx.lineTo(ping.x + tickDist + tickLen, ping.y);
            ctx.stroke();

            // Corner L-brackets
            const bSize = 4.5;
            const bDist = 13 + t * 4;
            // Top-Left
            ctx.beginPath();
            ctx.moveTo(ping.x - bDist, ping.y - bDist + bSize);
            ctx.lineTo(ping.x - bDist, ping.y - bDist);
            ctx.lineTo(ping.x - bDist + bSize, ping.y - bDist);
            ctx.stroke();
            // Top-Right
            ctx.beginPath();
            ctx.moveTo(ping.x + bDist - bSize, ping.y - bDist);
            ctx.lineTo(ping.x + bDist, ping.y - bDist);
            ctx.lineTo(ping.x + bDist, ping.y - bDist + bSize);
            ctx.stroke();
            // Bottom-Left
            ctx.beginPath();
            ctx.moveTo(ping.x - bDist, ping.y + bDist - bSize);
            ctx.lineTo(ping.x - bDist, ping.y + bDist);
            ctx.lineTo(ping.x - bDist + bSize, ping.y + bDist);
            ctx.stroke();
            // Bottom-Right
            ctx.beginPath();
            ctx.moveTo(ping.x + bDist - bSize, ping.y + bDist);
            ctx.lineTo(ping.x + bDist, ping.y + bDist);
            ctx.lineTo(ping.x + bDist, ping.y + bDist - bSize);
            ctx.stroke();

            // Pulsating central ping blip dot
            const pingPulse = Math.sin(elapsed * 0.016) * 1.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${reticleAlpha * 0.95})`;
            ctx.beginPath();
            ctx.arc(ping.x, ping.y, Math.max(2, 3.5 + pingPulse), 0, Math.PI * 2);
            ctx.fill();

            // Tactical Sensor Metadata Tag (fades cleanly)
            ctx.font = 'bold 9px "JetBrains Mono", monospace';
            ctx.fillStyle = `rgba(255, 65, 105, ${reticleAlpha})`;
            ctx.fillText(
              `SENSOR CONTACT // PING [BRG ${String(ping.bearingDeg).padStart(3, '0')}°]`,
              ping.x + 18,
              ping.y - 12
            );

            ctx.font = '8px "JetBrains Mono", monospace';
            ctx.fillStyle = `rgba(0, 229, 255, ${reticleAlpha * 0.8})`;
            ctx.fillText('RADIAL RANGE: 58.5 KM', ping.x + 18, ping.y - 2);

            ctx.restore();
          }
        });
      }

      // 1. Draw jet autonomous roaming path trail (faint cyan)
      if (jetTrailRef.current.length > 2) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.22)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        jetTrailRef.current.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
        ctx.restore();
      }

      // 2. Draw threat trajectory trail with distinct red curves
      if (threat.trail.length > 1) {
        ctx.save();
        ctx.strokeStyle = '#ff2a55';
        ctx.lineWidth = 2.4;
        ctx.shadowColor = '#ff2a55';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        threat.trail.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
        ctx.restore();
      }

      // 3. Draw interceptor trajectory trail with glowing cyan curve showing its adaptation
      if (interceptor.trail.length > 1) {
        ctx.save();
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 2.4;
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        interceptor.trail.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
        ctx.restore();
      }

      // 4. Draw dynamic homing line from interceptor to twisting threat
      if (interceptor.active && threat.active && !threat.destroyed) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 255, 102, 0.6)';
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(interceptor.x, interceptor.y);
        ctx.lineTo(nextThreatX, nextThreatY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Dynamic tracking reticle around threat
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(nextThreatX - 14, nextThreatY - 14, 28, 28);
        ctx.fillStyle = '#00ff66';
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillText('HOMING LOCK: ADAPTING', nextThreatX - 25, nextThreatY - 18);
        ctx.restore();
      }

      // 5. Threat stalking line toward moving jet
      if (threat.active && !threat.destroyed && !jet.destroyed) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 42, 85, 0.28)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 5]);
        ctx.beginPath();
        ctx.moveTo(nextThreatX, nextThreatY);
        ctx.lineTo(currentJetX, currentJetY);
        ctx.stroke();
        ctx.restore();
      }

      // Draw Interceptor missile head
      if (interceptor.active) {
        ctx.save();
        ctx.translate(interceptor.x, interceptor.y);
        const intAngle = Math.atan2(interceptor.vy, interceptor.vx);
        ctx.rotate(intAngle);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(9, 0);
        ctx.lineTo(-7, -3.5);
        ctx.lineTo(-4, 0);
        ctx.lineTo(-7, 3.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#00e5ff';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(`KIN-INT [M${interceptor.mach.toFixed(1)}]`, interceptor.x + 8, interceptor.y - 6);
      }

      // Draw Threat missile head (with active maneuver tag)
      if (threat.active && !threat.destroyed) {
        ctx.save();
        ctx.translate(nextThreatX, nextThreatY);
        const tAngle = Math.atan2(nextThreatVy, nextThreatVx);
        ctx.rotate(tAngle);
        ctx.fillStyle = '#ff2a55';
        ctx.shadowColor = '#ff2a55';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-6, -4.5);
        ctx.lineTo(-3, 0);
        ctx.lineTo(-6, 4.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = 'rgba(255, 42, 85, 0.7)';
        ctx.strokeRect(nextThreatX - 10, nextThreatY - 10, 20, 20);
        ctx.fillStyle = '#ff2a55';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText('THREAT: BOGEY-X [WEAVING]', nextThreatX + 12, nextThreatY + 3);
      }

      // Draw VIPER-01 Stealth Fighter
      if (!jet.destroyed) {
        ctx.save();
        ctx.translate(currentJetX, currentJetY);
        ctx.rotate(currentJetAngle);

        ctx.fillStyle = '#07162b';
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(4, 7);
        ctx.lineTo(-8, 16);
        ctx.lineTo(-12, 14);
        ctx.lineTo(-6, 6);
        ctx.lineTo(-15, 8);
        ctx.lineTo(-14, 0);
        ctx.lineTo(-15, -8);
        ctx.lineTo(-6, -6);
        ctx.lineTo(-12, -14);
        ctx.lineTo(-8, -16);
        ctx.lineTo(4, -7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#00ff66';
        ctx.beginPath();
        ctx.ellipse(3, 0, 4, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#00e5ff';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          'VIPER-01 [FIGURE-8 PATROL]',
          currentJetX,
          currentJetY + 26
        );
        ctx.textAlign = 'left';
      }

      // Draw pulse explosion animation & frozen impact visualizer
      if (jet.destroyed || motionFrozenRef.current) {
        ctx.save();
        const pulseCycle = (currentTime * 0.0035) % (Math.PI * 2);
        const pulseR1 = 15 + (Math.sin(pulseCycle) * 0.5 + 0.5) * 55;
        const pulseR2 = 8 + (Math.cos(pulseCycle) * 0.5 + 0.5) * 36;
        const pulseAlpha = Math.max(0.35, 1 - pulseR1 / 70);

        ctx.strokeStyle = `rgba(255, 42, 85, ${pulseAlpha})`;
        ctx.lineWidth = 3.2;
        ctx.shadowColor = '#ff2a55';
        ctx.shadowBlur = 24;
        ctx.beginPath();
        ctx.arc(currentJetX, currentJetY, pulseR1, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 183, 3, ${pulseAlpha * 0.85})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ffb703';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(currentJetX, currentJetY, pulseR2, 0, Math.PI * 2);
        ctx.stroke();

        // Pulsating red ground zero impact dot
        ctx.fillStyle = '#ff2a55';
        ctx.beginPath();
        ctx.arc(currentJetX, currentJetY, 6, 0, Math.PI * 2);
        ctx.fill();

        // Warning banner box at impact site
        ctx.fillStyle = 'rgba(255, 42, 85, 0.95)';
        ctx.fillRect(currentJetX - 65, currentJetY + 26, 130, 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('MOTION FROZEN // IMPACT', currentJetX, currentJetY + 38);
        ctx.textAlign = 'left';
        ctx.restore();
      }

      // Draw explosions & debris
      if (explosions.length > 0) {
        setExplosions((prev) => {
          const next = prev
            .map((exp) => {
              const nextParticles = exp.particles
                ? exp.particles
                    .map((p) => ({
                      ...p,
                      x: p.x + p.vx * dt,
                      y: p.y + p.vy * dt,
                      alpha: p.alpha - dt * 1.4,
                    }))
                    .filter((p) => p.alpha > 0)
                : undefined;

              return {
                ...exp,
                radius: exp.radius + dt * 70,
                alpha: exp.alpha - dt * 1.1,
                particles: nextParticles,
              };
            })
            .filter((exp) => exp.alpha > 0 || (exp.particles && exp.particles.length > 0));

          return next;
        });

        explosions.forEach((exp) => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
          ctx.strokeStyle = exp.color;
          ctx.lineWidth = exp.isMidAirKill ? 3.5 : 3;
          ctx.globalAlpha = Math.max(exp.alpha, 0);
          ctx.shadowColor = exp.color;
          ctx.shadowBlur = exp.isMidAirKill ? 25 : 20;
          ctx.stroke();

          ctx.fillStyle = exp.color;
          ctx.globalAlpha = Math.max(exp.alpha * 0.28, 0);
          ctx.fill();

          if (exp.particles) {
            exp.particles.forEach((p) => {
              ctx.save();
              ctx.fillStyle = p.color;
              ctx.globalAlpha = Math.max(p.alpha, 0);
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 6;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            });
          }
          ctx.restore();
        });
      }

      // Splash marker
      if (splashMarkerRef.current) {
        const marker = splashMarkerRef.current;
        ctx.save();
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#00ff66';
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 8;
        ctx.fillText(marker.text, marker.x, marker.y - 18);
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(marker.x, marker.y, 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    controlMode,
    defenseMode,
    jet,
    setJet,
    interceptor,
    setInterceptor,
    threat,
    setThreat,
    explosions,
    setExplosions,
    simSpeed,
    audioEnabled,
    onEvasionTriggered,
    onThreatHitJet,
    onThreatIntercepted,
    onLogEvent,
    onUpdateTelemetry,
  ]);

  // Canvas size setup
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      radarRadiusRef.current = rect.width / 2 - 8;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="hud-panel corner-bracket rounded-lg p-3.5 flex flex-col flex-1 relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#142642] z-20 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] animate-ping" />
          <h2 className="text-xs md:text-sm font-hud font-bold tracking-widest text-white">
            TACTICAL RADAR SCOPE // VIPER AIRSPACE
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Simulation Speed Controls: 0.5x, 1.0x, 1.5x */}
          <div className="flex items-center bg-[#070f1e] p-0.5 rounded border border-[#173359] text-[10px] font-mono-tech">
            <span className="px-1.5 text-[#5e83ab] font-bold">SPEED:</span>
            <button
              onClick={() => setSimSpeed(0.5)}
              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                simSpeed === 0.5
                  ? 'bg-[#00e5ff]/20 text-[#00e5ff] font-bold border border-[#00e5ff]/50'
                  : 'text-[#688db3] hover:text-white'
              }`}
              title="Cinematic slow-motion: 0.5x speed to watch trajectory curves and guidance adaptations clearly"
            >
              0.5x SLOW-MO
            </button>
            <button
              onClick={() => setSimSpeed(1.0)}
              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                simSpeed === 1.0
                  ? 'bg-[#00e5ff]/20 text-[#00e5ff] font-bold border border-[#00e5ff]/50'
                  : 'text-[#688db3] hover:text-white'
              }`}
              title="Standard tactical speed: ~12-14 seconds to intercept"
            >
              1.0x TACTICAL
            </button>
            <button
              onClick={() => setSimSpeed(1.5)}
              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                simSpeed === 1.5
                  ? 'bg-[#00e5ff]/20 text-[#00e5ff] font-bold border border-[#00e5ff]/50'
                  : 'text-[#688db3] hover:text-white'
              }`}
            >
              1.5x RAPID
            </button>
          </div>

          {/* Jet Auto-Patrol Indicator Badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00e5ff]/15 border border-[#00e5ff]/40 text-[11px] font-mono-tech text-[#00e5ff]"
            title="Automated parametric figure-8 patrol flight loop active across lower radar sector"
          >
            <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse" />
            <span className="font-bold">AUTO-PATROL: FIGURE-8</span>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center bg-[#070f1e] p-0.5 rounded border border-[#173359]">
            <button
              onClick={() => onToggleDefenseMode('failure_simulation')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono-tech transition-all cursor-pointer ${
                defenseMode === 'failure_simulation'
                  ? 'bg-[#ff2a55]/20 text-[#ff2a55] font-bold border border-[#ff2a55]/50 shadow-[0_0_8px_rgba(255,42,85,0.3)]'
                  : 'text-[#6287ad] hover:text-white'
              }`}
              title="Antigravity Evasive-Bypass Failure Sequence"
            >
              FAILURE REPLICATION
            </button>
            <button
              onClick={() => onToggleDefenseMode('interception')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono-tech transition-all cursor-pointer ${
                defenseMode === 'interception'
                  ? 'bg-[#00ff66]/20 text-[#00ff66] font-bold border border-[#00ff66]/50 shadow-[0_0_8px_rgba(0,255,102,0.3)]'
                  : 'text-[#6287ad] hover:text-white'
              }`}
              title="Direct Kinetic Interception Mode"
            >
              DIRECT INTERCEPT
            </button>
          </div>

          {/* Auto Launch Toggle */}
          <button
            onClick={onToggleAutoLaunch}
            className={`px-2 py-1 rounded text-[11px] font-mono-tech transition-all cursor-pointer border ${
              autoLaunch
                ? 'bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff]/50 font-bold'
                : 'bg-[#0b1626] text-[#698eb8] border-[#183253] hover:text-white'
            }`}
            title="Automatically eject kinetic interceptor from nose when threat appears"
          >
            AUTO-ENGAGE: {autoLaunch ? 'ON' : 'OFF'}
          </button>

          {/* Launch Interceptor Button */}
          <button
            onClick={onLaunchInterceptor}
            disabled={jet.destroyed || interceptor.active || (threat.destroyed && !threat.active)}
            className={`px-3.5 py-1 rounded text-xs font-mono-tech font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 ${
              jet.destroyed || interceptor.active
                ? 'bg-[#101b2a] text-[#4d6b8c] border border-[#172a42] cursor-not-allowed'
                : 'bg-[#00e5ff]/20 hover:bg-[#00e5ff]/30 text-[#00e5ff] border border-[#00e5ff]/50 shadow-[0_0_10px_rgba(0,229,255,0.3)]'
            }`}
            title="Eject single-body interceptor from live nose coordinates (Spacebar)"
          >
            <span>🚀 LAUNCH (SPACE)</span>
          </button>

          {/* Spawn Inbound Threat Button */}
          {onSpawnThreat && (
            <button
              onClick={onSpawnThreat}
              disabled={threat.active && !threat.destroyed}
              className={`px-2.5 py-1 rounded text-xs font-mono-tech font-bold transition-all border cursor-pointer flex items-center gap-1 ${
                threat.active && !threat.destroyed
                  ? 'bg-[#0b1626] text-[#426084] border-[#152a42] cursor-not-allowed opacity-60'
                  : 'bg-[#ff2a55]/20 hover:bg-[#ff2a55]/30 text-[#ff2a55] border-[#ff2a55]/50 shadow-[0_0_10px_rgba(255,42,85,0.3)]'
              }`}
              title="Spawn an inbound airborne threat at outer radar perimeter (58.5 KM)"
            >
              <span>🎯 SPAWN THREAT</span>
            </button>
          )}

          <button
            onClick={() => {
              motionFrozenRef.current = false;
              patrolTimeRef.current = 0;
              interceptorOvershotRef.current = false;
              evasionTimerRef.current = 0;
              onResetSimulation(true);
            }}
            className="px-2.5 py-1 rounded bg-[#101e35] hover:bg-[#182c4d] text-xs font-mono-tech text-[#7da4d0] hover:text-white border border-[#1e3c66] transition-colors cursor-pointer"
            title="Reset Simulation State & Unfreeze Motion Loops"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Real-Time Guidance HUD Overlay Banner (Shows exactly how missile moves and interceptor adapts) */}
      <div className="bg-[#050d1a]/90 border border-[#142c4c] px-3 py-1.5 rounded flex items-center justify-between text-[11px] font-mono-tech my-1 z-20 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-2 h-2 rounded-full bg-[#ff2a55] animate-pulse" />
          <span className="text-[#a4c5e8]">MISSILE TELEMETRY:</span>
          <span className="text-[#ff2a55] font-bold">{guidanceInfo.threatWeave}</span>
          {sensorPingActive && (
            <span className="px-1.5 py-0.5 rounded bg-[#ff2a55]/25 border border-[#ff2a55]/60 text-[#ff2a55] text-[10px] font-bold animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff2a55] animate-ping" />
              RADIAL SENSOR PING ACQUIRED
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-ping" />
          <span className="text-[#a4c5e8]">INTERCEPTOR GUIDANCE:</span>
          <span className="text-[#00e5ff] font-bold">
            {interceptor.active ? guidanceInfo.interceptorSlew : 'STANDBY // READY IN BAY'}
          </span>
        </div>
      </div>

      {/* Radar Canvas Container (No mouse move tracking on jet) */}
      <div
        ref={containerRef}
        onClick={() => {
          if (!interceptor.active && !jet.destroyed && threat.active && !motionFrozenRef.current) {
            onLaunchInterceptor();
          }
        }}
        className="flex-1 relative w-full flex items-center justify-center my-1 select-none overflow-hidden cursor-crosshair min-h-[360px]"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full max-h-[580px] max-w-[580px] aspect-square rounded-full border-2 border-[#16365f] shadow-[0_0_50px_rgba(0,229,255,0.1)] bg-[#030711]"
        />

        {/* Compass Cardinal Bearings */}
        <div className="absolute top-2 font-mono-tech text-[11px] font-bold text-[#00e5ff]/70 pointer-events-none tracking-widest">
          N 000°
        </div>
        <div className="absolute bottom-2 font-mono-tech text-[11px] font-bold text-[#00e5ff]/70 pointer-events-none tracking-widest">
          S 180°
        </div>
        <div className="absolute left-3 font-mono-tech text-[11px] font-bold text-[#00e5ff]/70 pointer-events-none tracking-widest">
          W 270°
        </div>
        <div className="absolute right-3 font-mono-tech text-[11px] font-bold text-[#00e5ff]/70 pointer-events-none tracking-widest">
          E 090°
        </div>

        {/* Dynamic Interactive Hint */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none bg-[#050e1c]/85 backdrop-blur border border-[#173054] px-2.5 py-1.5 rounded text-[10px] font-mono-tech text-[#6c91bc] max-w-sm">
          <span className="text-[#00e5ff] font-bold">VIPER-01 PATROL:</span>{' '}
          <span className="text-[#a5c5ea]">
            Autonomous Parametric Figure-8 Flight Loop (Lower Sector)
          </span>
          <span className="text-[#00ff66] block mt-0.5">
            {!interceptor.active && threat.active && !jet.destroyed
              ? '▶ Press "SPACEBAR" or "LAUNCH" to eject interceptor from nose!'
              : jet.destroyed
              ? '▶ Simulation Breach: Interceptor overshot. VIPER-01 destroyed.'
              : '▶ Interceptor in slow proportional pursuit (~2.5 px/frame)'}
          </span>
        </div>
      </div>

      {/* Radar Bottom Metrics Legend */}
      <div className="pt-2 border-t border-[#142642] flex items-center justify-between text-xs font-mono-tech z-20 flex-wrap gap-2">
        <div className="flex items-center gap-4 text-[11px] flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00e5ff]" /> VIPER-01 ({jet.autoPilot ? 'AUTO ROAMING' : 'MANUAL'})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff2a55]" /> THREAT: BOGEY-X (HOMING + WEAVING)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00ff66]" /> KIN-INT (DYNAMIC PURSUIT ADAPTATION)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff2a55] animate-ping" /> SENSOR RADIAL PING (ACQUIRE WAVE)
          </span>
        </div>
        <div className="text-[10px] text-[#6e91ba]">
          {defenseMode === 'interception' ? (
            <span className="text-[#00ff66]">ADAPTIVE PROPORTIONAL HOMING ARMED</span>
          ) : (
            <span className="text-[#ffb703]">FAILURE REPLICATION ARMED</span>
          )}
        </div>
      </div>
    </div>
  );
};
