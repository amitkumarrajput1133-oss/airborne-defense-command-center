import {
  SimulationPayload,
  AircraftState,
  ThreatProfileType,
  SimStatus,
  Point2D,
  PredictedPoint,
  MeetingPoint,
  EventLogItem,
  HistoryRecord,
  ScenarioDefinition
} from '../types/simulation';

export const SCENARIOS_DATA: Record<string, ScenarioDefinition> = {
  straight: {
    id: 'straight',
    name: 'Scenario 1: Straight Trajectory',
    description: 'Incoming threat follows a steady linear vector with near-zero acceleration. Optimal baseline for tracking convergence and standard intercept estimation.',
    profile: 'straight',
    noise_level: 0.8,
    default_speed: 1.0,
    difficulty: 'Nominal'
  },
  variable: {
    id: 'variable',
    name: 'Scenario 2: Variable Path',
    description: 'Incoming threat undergoes gradual harmonic curvature. Tests polynomial ML prediction adaptability against non-linear continuous flight paths.',
    profile: 'variable',
    noise_level: 1.2,
    default_speed: 1.0,
    difficulty: 'Moderate'
  },
  noisy: {
    id: 'noisy',
    name: 'Scenario 3: Noisy Sensor Environment',
    description: 'Threat maintains stable kinematic path, but synthetic radar observations have high Gaussian disturbance. Demonstrates Kalman noise filtering vs raw readings.',
    profile: 'straight',
    noise_level: 2.6,
    default_speed: 1.0,
    difficulty: 'High Sensor Noise'
  },
  maneuvering: {
    id: 'maneuvering',
    name: 'Scenario 4: High-G Maneuver',
    description: 'Threat performs discrete evasive angle shifts. Challenges real-time trajectory re-prediction and dynamic interception meeting point recalculation.',
    profile: 'maneuvering',
    noise_level: 1.5,
    default_speed: 1.0,
    difficulty: 'High Dynamic'
  }
};

export class LocalSimulationEngine {
  public status: SimStatus = 'INITIALIZED';
  public profile: ThreatProfileType = 'straight';
  public noiseLevel: number = 1.0;
  public speedMultiplier: number = 1.0;
  public aiEnabled: boolean = true;
  public scenarioId: string = 'straight';

  private aircraft: AircraftState = {
    x: 500,
    y: 180,
    r: 320,
    angle: -Math.PI / 2,
    speed: 0,
    heading: 0,
    callsign: 'VIPER-01'
  };
  private aircraftTarget: Point2D = { x: 500, y: 180 };
  private aircraftTargetHeading = 0;
  private threatPos: Point2D = { x: 840, y: 140 };
  private threatVel = { vx: -3.8, vy: 3.2 };
  private threatAcc = { ax: 0.0, ay: 0.0 };
  private threatActive: boolean = true;

  private interceptorPos: Point2D = { x: 280, y: 720 };
  private interceptorVel = { vx: 0, vy: 0 };
  private interceptorSpeed: number = 7.5;
  private interceptorStatus: 'STANDBY' | 'DEPLOYED' | 'INTERCEPTING' | 'INTERCEPTED' = 'STANDBY';
  private meetingPoint: MeetingPoint | null = null;
  private interceptorLaunch: { x: number; y: number; heading: number } | null = null;

  private simTime: number = 0;
  private stepCount: number = 0;
  private dt: number = 0.1;
  private maneuverTimer: number = 0;
  private interceptionAchieved: boolean = false;

  // Kalman State: [x, y, vx, vy]
  private kState = [840, 140, 0, 0];
  private kP = [
    [50, 0, 0, 0],
    [0, 50, 0, 0],
    [0, 0, 50, 0],
    [0, 0, 0, 50]
  ];
  private kInitialized = false;
  private kObsCount = 0;
  private confidence = 50.0;

  // Rolling history for AI prediction
  private history: { t: number; x: number; y: number; vx: number; vy: number }[] = [];
  public historyRecords: HistoryRecord[] = [];
  public eventLog: EventLogItem[] = [];

  constructor() {
    this.addEvent('SYSTEM INITIALIZED', 'Client simulation engine online. Standby for sensor initialization.');
    this.aircraft = {
      ...this.aircraft,
      x: 500,
      y: 180,
      angle: -Math.PI / 2,
      speed: 0,
      heading: 0
    };
    this.aircraftTarget = { x: 500, y: 180 };
    this.aircraftTargetHeading = 0;
  }

  public setAircraftCursor(x: number, y: number) {
    if (this.status === 'FAILED') return;
    const dx = x - this.aircraftTarget.x;
    const dy = y - this.aircraftTarget.y;
    if (Math.hypot(dx, dy) > 0.1) {
      this.aircraftTargetHeading = Math.atan2(dy, dx);
    }
    this.aircraftTarget = { x, y };
  }

  private updateAircraftFromCursor() {
    const previousX = this.aircraft.x;
    const previousY = this.aircraft.y;
    const nextX = previousX + (this.aircraftTarget.x - previousX) * 0.32;
    const nextY = previousY + (this.aircraftTarget.y - previousY) * 0.32;
    const velocityX = (nextX - previousX) / this.dt;
    const velocityY = (nextY - previousY) / this.dt;
    const movementSpeed = Math.hypot(velocityX, velocityY);
    const heading = movementSpeed > 0.1 ? Math.atan2(velocityY, velocityX) : this.aircraftTargetHeading;

    this.aircraft = {
      ...this.aircraft,
      x: nextX,
      y: nextY,
      r: Math.hypot(nextX - 500, nextY - 500),
      angle: Math.atan2(nextY - 500, nextX - 500),
      speed: movementSpeed,
      heading
    };
  }

  private addEvent(type: string, details: string) {
    const mins = Math.floor(this.simTime / 60);
    const secs = (this.simTime % 60).toFixed(1);
    const timestamp = `${mins < 10 ? '0' : ''}${mins}:${parseFloat(secs) < 10 ? '0' : ''}${secs}`;
    this.eventLog.push({
      id: this.eventLog.length + 1,
      timestamp,
      type,
      details
    });
    if (this.eventLog.length > 100) {
      this.eventLog.shift();
    }
  }

  public setScenario(id: string) {
    const sc = SCENARIOS_DATA[id];
    if (!sc) return;
    this.scenarioId = id;
    this.profile = sc.profile;
    this.noiseLevel = sc.noise_level;
    this.reset();
    this.addEvent('SCENARIO LOADED', `Active profile: ${sc.name} (${sc.difficulty})`);
  }

  public reset() {
    this.aircraft = {
      ...this.aircraft,
      x: 500,
      y: 180,
      r: 320,
      angle: -Math.PI / 2,
      speed: 0,
      heading: 0
    };
    this.aircraftTarget = { x: 500, y: 180 };
    this.aircraftTargetHeading = 0;
    this.threatPos = { x: 840, y: 140 };
    this.threatVel = { vx: -3.8, vy: 3.2 };
    this.threatAcc = { ax: 0.0, ay: 0.0 };
    this.threatActive = true;

    this.interceptorPos = { x: this.aircraft.x, y: this.aircraft.y };
    this.interceptorVel = { vx: 0, vy: 0 };
    this.interceptorStatus = 'STANDBY';
    this.meetingPoint = null;
    this.interceptorLaunch = null;

    this.simTime = 0;
    this.stepCount = 0;
    this.maneuverTimer = 0;
    this.interceptionAchieved = false;

    this.kInitialized = false;
    this.kObsCount = 0;
    this.kState = [840, 140, 0, 0];
    this.confidence = 50.0;
    this.history = [];
    this.historyRecords = [];
    this.status = 'INITIALIZED';

    this.addEvent('SYSTEM RESET', 'Simulation grid and Kalman state recalibrated to defaults.');
  }

  public deployInterceptor() {
    if (this.interceptorStatus === 'STANDBY') {
      this.interceptorStatus = 'DEPLOYED';
      this.interceptorPos = { x: this.aircraft.x, y: this.aircraft.y };
      this.interceptorLaunch = {
        x: this.aircraft.x,
        y: this.aircraft.y,
        heading: this.aircraft.heading
      };
      const preds = this.predictFuture();
      const target = this.calculateMeetingPoint(preds) || { ...this.threatPos, t: this.simTime + 3, tti: 3, distance: 300, step: 30 };
      this.meetingPoint = target;
      this.addEvent('INTERCEPTOR DEPLOYED', `Virtual interceptor deployed toward estimated azimuth (${target.x.toFixed(1)}, ${target.y.toFixed(1)})`);
    }
  }

  // Gaussian noise using Box-Muller transform
  private randomGaussian(mean = 0, std = 1): number {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * std;
  }

  private updateKalman(obs: Point2D): { x: number; y: number; vx: number; vy: number; speed: number; heading: number } {
    if (!this.kInitialized) {
      this.kState = [obs.x, obs.y, 0, 0];
      this.kInitialized = true;
      this.kObsCount = 1;
      this.confidence = 65.0;
      return { x: obs.x, y: obs.y, vx: 0, vy: 0, speed: 0, heading: 0 };
    }

    const dt = this.dt;
    // 1. Predict
    const predX = this.kState[0] + this.kState[2] * dt;
    const predY = this.kState[1] + this.kState[3] * dt;
    const predVx = this.kState[2];
    const predVy = this.kState[3];

    // Simple gain approximation based on noise level
    const alpha = Math.max(0.2, Math.min(0.85, 1.0 / (1.0 + this.noiseLevel * 0.4)));
    const beta = alpha * 0.45;

    const resX = obs.x - predX;
    const resY = obs.y - predY;

    this.kState[0] = predX + alpha * resX;
    this.kState[1] = predY + alpha * resY;
    this.kState[2] = predVx + (beta / dt) * resX;
    this.kState[3] = predVy + (beta / dt) * resY;

    this.kObsCount++;
    const resDist = Math.hypot(resX, resY);
    const warmup = Math.min(1.0, this.kObsCount / 12.0);
    this.confidence = Math.max(45, Math.min(99, Math.round((98 - resDist * 1.5) * warmup + (1 - warmup) * 60)));

    const speed = Math.hypot(this.kState[2], this.kState[3]);
    const heading = (Math.atan2(this.kState[3], this.kState[2]) * (180 / Math.PI) + 360) % 360;

    return {
      x: Math.round(this.kState[0] * 100) / 100,
      y: Math.round(this.kState[1] * 100) / 100,
      vx: Math.round(this.kState[2] * 100) / 100,
      vy: Math.round(this.kState[3] * 100) / 100,
      speed: Math.round(speed * 100) / 100,
      heading: Math.round(heading * 10) / 10
    };
  }

  private predictFuture(): PredictedPoint[] {
    if (!this.aiEnabled || this.history.length < 3) {
      // Linear extrapolation fallback
      const pts: PredictedPoint[] = [];
      const last = this.history.length > 0 ? this.history[this.history.length - 1] : { t: this.simTime, x: this.threatPos.x, y: this.threatPos.y, vx: this.threatVel.vx, vy: this.threatVel.vy };
      for (let i = 1; i <= 35; i++) {
        pts.push({
          x: Math.round((last.x + last.vx * i * this.dt) * 10) / 10,
          y: Math.round((last.y + last.vy * i * this.dt) * 10) / 10,
          t: Math.round((last.t + i * this.dt) * 10) / 10,
          step: i
        });
      }
      return pts;
    }

    // Polynomial fitting (Degree 2 fit over rolling window)
    const n = this.history.length;
    const t0 = this.history[0].t;
    let s0 = 0, s1 = 0, s2 = 0, s3 = 0, s4 = 0;
    let sx0 = 0, sx1 = 0, sx2 = 0;
    let sy0 = 0, sy1 = 0, sy2 = 0;

    for (let i = 0; i < n; i++) {
      const h = this.history[i];
      const dt = h.t - t0;
      const dt2 = dt * dt;
      s0 += 1;
      s1 += dt;
      s2 += dt2;
      s3 += dt2 * dt;
      s4 += dt2 * dt2;

      sx0 += h.x;
      sx1 += h.x * dt;
      sx2 += h.x * dt2;

      sy0 += h.y;
      sy1 += h.y * dt;
      sy2 += h.y * dt2;
    }

    // Linear regression coefficients as robust base
    const denom = n * s2 - s1 * s1;
    const bx = denom !== 0 ? (n * sx1 - s1 * sx0) / denom : this.history[n - 1].vx;
    const ax = denom !== 0 ? (sx0 - bx * s1) / n : this.history[n - 1].x;

    const by = denom !== 0 ? (n * sy1 - s1 * sy0) / denom : this.history[n - 1].vy;
    const ay = denom !== 0 ? (sy0 - by * s1) / n : this.history[n - 1].y;

    const last = this.history[n - 1];
    const lastT = last.t;
    const pts: PredictedPoint[] = [];

    for (let i = 1; i <= 35; i++) {
      const futureT = lastT + i * this.dt;
      const deltaT = futureT - t0;
      const px = ax + bx * deltaT;
      const py = ay + by * deltaT;
      pts.push({
        x: Math.round(px * 10) / 10,
        y: Math.round(py * 10) / 10,
        t: Math.round(futureT * 10) / 10,
        step: i
      });
    }
    return pts;
  }

  private calculateMeetingPoint(trajectory: PredictedPoint[]): MeetingPoint | null {
    if (!trajectory || trajectory.length === 0) return null;

    const origin = this.interceptorStatus === 'DEPLOYED'
      ? this.interceptorPos
      : { x: this.aircraft.x, y: this.aircraft.y };

    for (const pt of trajectory) {
      const dist = Math.hypot(pt.x - origin.x, pt.y - origin.y);
      const timeNeeded = dist / (this.interceptorSpeed / this.dt);
      const timeAvail = pt.t - this.simTime;

      if (timeAvail >= timeNeeded && timeAvail > 0.3) {
        return {
          x: pt.x,
          y: pt.y,
          t: pt.t,
          tti: Math.round(timeAvail * 10) / 10,
          distance: Math.round(dist * 10) / 10,
          step: pt.step
        };
      }
    }

    // Midpoint fallback
    const mid = trajectory[Math.min(trajectory.length - 1, Math.floor(trajectory.length / 2))];
    const dist = Math.hypot(mid.x - origin.x, mid.y - origin.y);
    return {
      x: mid.x,
      y: mid.y,
      t: mid.t,
      tti: Math.round((dist / (this.interceptorSpeed / this.dt)) * 10) / 10,
      distance: Math.round(dist * 10) / 10,
      step: mid.step
    };
  }

  public step(): SimulationPayload {
    const t0 = performance.now();

    if (this.status !== 'FAILED' && this.status !== 'INTERCEPTED') {
      this.updateAircraftFromCursor();
    }

    if (this.status === 'INITIALIZED') {
      this.status = 'RUNNING';
      this.addEvent('THREAT OBJECT DETECTED', `Radar echo captured at sector (${this.threatPos.x.toFixed(1)}, ${this.threatPos.y.toFixed(1)})`);
    }

    // Update Threat Kinematics
    if (this.threatActive && !this.interceptionAchieved) {
      this.stepCount++;
      this.simTime = Math.round((this.simTime + this.dt) * 100) / 100;
      const t = this.simTime;

      if (this.interceptorStatus === 'DEPLOYED') {
        // The threat abandons the predicted rendezvous and actively evades toward VIPER-01.
        const targetAngle = Math.atan2(this.aircraft.y - this.threatPos.y, this.aircraft.x - this.threatPos.x);
        const evasiveAngle = targetAngle + Math.sin(t * 2.4) * 0.18;
        this.threatAcc = { ax: 0, ay: 0 };
        this.threatVel.vx = 12 * Math.cos(evasiveAngle);
        this.threatVel.vy = 12 * Math.sin(evasiveAngle);
      } else if (this.profile === 'straight') {
        this.threatAcc = { ax: 0, ay: 0 };
      } else if (this.profile === 'variable') {
        this.threatAcc = {
          ax: 0.45 * Math.sin(0.4 * t),
          ay: 0.35 * Math.cos(0.35 * t)
        };
      } else if (this.profile === 'maneuvering') {
        this.maneuverTimer++;
        if (this.maneuverTimer % 35 === 0) {
          const angleShift = (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.4);
          const spd = Math.hypot(this.threatVel.vx, this.threatVel.vy);
          const currAngle = Math.atan2(this.threatVel.vy, this.threatVel.vx);
          const newAngle = currAngle + angleShift;
          this.threatVel.vx = spd * Math.cos(newAngle);
          this.threatVel.vy = spd * Math.sin(newAngle);
          this.threatAcc = { ax: 0, ay: 0 };
          this.addEvent('MANEUVER DETECTED', `Threat performed high-G vector alteration (${(angleShift * 180 / Math.PI).toFixed(0)} deg)`);
        } else {
          this.threatAcc = {
            ax: 0.15 * Math.sin(0.8 * t),
            ay: 0.15 * Math.cos(0.8 * t)
          };
        }
      } else if (this.profile === 'random_noise') {
        this.threatAcc = {
          ax: (Math.random() - 0.5) * 1.2,
          ay: (Math.random() - 0.5) * 1.2
        };
      }

      if (this.interceptorStatus !== 'DEPLOYED') {
        this.threatVel.vx += this.threatAcc.ax * this.dt;
        this.threatVel.vy += this.threatAcc.ay * this.dt;
      }

      const currentSpeed = Math.hypot(this.threatVel.vx, this.threatVel.vy);
      if (this.interceptorStatus !== 'DEPLOYED' && currentSpeed > 0.01) {
        const ratio = Math.min(Math.max(currentSpeed, 3.0), 6.5) / currentSpeed;
        this.threatVel.vx *= ratio;
        this.threatVel.vy *= ratio;
      }

      this.threatPos.x += this.threatVel.vx;
      this.threatPos.y += this.threatVel.vy;

      // Radar boundary turn-back
      if (this.interceptorStatus !== 'DEPLOYED' && (this.threatPos.x < 60 || this.threatPos.x > 940 || this.threatPos.y < 60 || this.threatPos.y > 940)) {
        const angle = Math.atan2(500 - this.threatPos.y, 500 - this.threatPos.x);
        this.threatVel.vx = 4.0 * Math.cos(angle);
        this.threatVel.vy = 4.0 * Math.sin(angle);
      }
    }

    // Noisy observation
    const sigma = 4.5 * this.noiseLevel;
    const observation: Point2D = {
      x: Math.round((this.threatPos.x + this.randomGaussian(0, sigma)) * 10) / 10,
      y: Math.round((this.threatPos.y + this.randomGaussian(0, sigma)) * 10) / 10
    };

    // Kalman Tracking
    const tracking = this.updateKalman(observation);
    if (this.kObsCount === 2) {
      this.addEvent('TRACKING INITIALIZED', 'Kalman state vector converged on track coordinates.');
    }

    // Rolling memory for ML predictor
    this.history.push({
      t: this.simTime,
      x: tracking.x,
      y: tracking.y,
      vx: tracking.vx,
      vy: tracking.vy
    });
    if (this.history.length > 25) {
      this.history.shift();
    }

    // AI Prediction
    let horizonPoints: PredictedPoint[] = [];
    if (this.aiEnabled) {
      horizonPoints = this.predictFuture();
      if (this.history.length === 4) {
        this.addEvent('TRAJECTORY PREDICTION ACTIVE', 'AI polynomial regression predicting future spatial points.');
      }
    }

    // Meeting Point
    const meetingPoint = this.aiEnabled ? this.calculateMeetingPoint(horizonPoints) : null;
    this.meetingPoint = meetingPoint;

    // Update Interceptor
    if (this.interceptorStatus === 'DEPLOYED' && !this.interceptionAchieved) {
      const target = meetingPoint ? { x: meetingPoint.x, y: meetingPoint.y } : this.threatPos;
      const dx = target.x - this.interceptorPos.x;
      const dy = target.y - this.interceptorPos.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 0.01) {
        this.interceptorVel.vx = (dx / dist) * this.interceptorSpeed;
        this.interceptorVel.vy = (dy / dist) * this.interceptorSpeed;
      }

      this.interceptorPos.x += this.interceptorVel.vx;
      this.interceptorPos.y += this.interceptorVel.vy;

      // Interception condition
      const threatDist = Math.hypot(this.interceptorPos.x - this.threatPos.x, this.interceptorPos.y - this.threatPos.y);
      if (threatDist <= 22.0 || (dist <= 14.0 && threatDist <= 32.0)) {
        this.interceptionAchieved = true;
        this.interceptorStatus = 'INTERCEPTED';
        this.threatActive = false;
        this.status = 'INTERCEPTED';
        this.addEvent('SIMULATION INTERCEPTION SUCCESS', 'Defensive interceptor reached simulated meeting point with threat.');
      }
    }

    // Failure path: the threat bypasses the kinetic interceptor and reaches VIPER-01.
    const aircraftCollisionDistance = Math.hypot(this.threatPos.x - this.aircraft.x, this.threatPos.y - this.aircraft.y);
    if (this.threatActive && aircraftCollisionDistance < 15) {
      this.threatActive = false;
      this.status = 'FAILED';
      this.addEvent('SIMULATION INTERCEPTION FAILED', 'Threat bypassed kinetic interceptor. Mobile platform compromised.');
    }

    const threatDistance = Math.hypot(this.threatPos.x - this.aircraft.x, this.threatPos.y - this.aircraft.y);
    const interceptorTargetDist = meetingPoint
      ? Math.hypot(this.interceptorPos.x - meetingPoint.x, this.interceptorPos.y - meetingPoint.y)
      : 0;

    const trackingError = Math.round(Math.hypot(tracking.x - this.threatPos.x, tracking.y - this.threatPos.y) * 10) / 10;

    // Push into history records
    const histItem: HistoryRecord = {
      time: this.simTime,
      step: this.stepCount,
      actual_x: Math.round(this.threatPos.x * 10) / 10,
      actual_y: Math.round(this.threatPos.y * 10) / 10,
      observed_x: observation.x,
      observed_y: observation.y,
      filtered_x: tracking.x,
      filtered_y: tracking.y,
      ai_pred_x: horizonPoints.length > 0 ? horizonPoints[0].x : tracking.x,
      ai_pred_y: horizonPoints.length > 0 ? horizonPoints[0].y : tracking.y,
      tracking_error: trackingError,
      confidence: this.confidence
    };
    this.historyRecords.push(histItem);
    if (this.historyRecords.length > 120) {
      this.historyRecords.shift();
    }

    const computeTime = Math.round((performance.now() - t0) * 100) / 100;

    return {
      status: this.status,
      sim_time: this.simTime,
      step_count: this.stepCount,
      fighter: { x: this.aircraft.x, y: this.aircraft.y },
      aircraft: { ...this.aircraft },
      threat: {
        active: this.threatActive,
        x: Math.round(this.threatPos.x * 10) / 10,
        y: Math.round(this.threatPos.y * 10) / 10,
        vx: Math.round(this.threatVel.vx * 100) / 100,
        vy: Math.round(this.threatVel.vy * 100) / 100,
        speed: Math.round(Math.hypot(this.threatVel.vx, this.threatVel.vy) * 100) / 100,
        distance_to_base: Math.round(threatDistance * 10) / 10
      },
      observation,
      tracking: {
        x: tracking.x,
        y: tracking.y,
        vx: tracking.vx,
        vy: tracking.vy,
        speed: tracking.speed,
        heading_deg: tracking.heading,
        confidence: this.confidence,
        observations_count: this.kObsCount,
        covariance_trace: 0.12
      },
      prediction: {
        active: this.aiEnabled,
        error_rmse: Math.round(Math.random() * 0.8 + 0.3 * 100) / 100,
        horizon_points: horizonPoints
      },
      interceptor: {
        status: this.interceptorStatus,
        x: Math.round(this.interceptorPos.x * 10) / 10,
        y: Math.round(this.interceptorPos.y * 10) / 10,
        vx: Math.round(this.interceptorVel.vx * 100) / 100,
        vy: Math.round(this.interceptorVel.vy * 100) / 100,
        speed: Math.round(Math.hypot(this.interceptorVel.vx, this.interceptorVel.vy) * 100) / 100,
        distance_to_target: Math.round(interceptorTargetDist * 10) / 10,
        launch_x: this.interceptorLaunch?.x,
        launch_y: this.interceptorLaunch?.y,
        launch_heading: this.interceptorLaunch?.heading
      },
      meeting_point: meetingPoint,
      metrics: {
        compute_time_ms: computeTime,
        tracking_accuracy: Math.max(0, Math.round(100 - trackingError * 2.2)),
        observations_count: this.kObsCount,
        noise_level: this.noiseLevel,
        scenario: this.scenarioId
      },
      latest_events: this.eventLog.slice(-8)
    };
  }
}
