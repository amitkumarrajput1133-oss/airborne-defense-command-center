import { SimulationPayload, ScenarioDefinition } from '../types/simulation';
import { LocalSimulationEngine, SCENARIOS_DATA } from './localSimulation';

const API_BASE_URL = 'http://localhost:8000/api';

class SimulationService {
  private localEngine = new LocalSimulationEngine();
  private backendAvailable: boolean | null = null;
  private checkPromise: Promise<boolean> | null = null;

  public isUsingBackend(): boolean {
    return this.backendAvailable === true;
  }

  public async checkBackend(): Promise<boolean> {
    if (this.checkPromise) return this.checkPromise;

    this.checkPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/status`, {
          method: 'GET',
          signal: AbortSignal.timeout(1500)
        });
        if (res.ok) {
          this.backendAvailable = true;
          return true;
        }
      } catch (e) {
        // Backend not reachable
      }
      this.backendAvailable = false;
      return false;
    })();

    const result = await this.checkPromise;
    this.checkPromise = null;
    return result;
  }

  public async getScenarios(): Promise<Record<string, ScenarioDefinition>> {
    try {
      const res = await fetch(`${API_BASE_URL}/scenarios`, { signal: AbortSignal.timeout(1000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return SCENARIOS_DATA;
  }

  public async getSimulationStep(): Promise<SimulationPayload> {
    if (this.backendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/sim/step`, {
          method: 'POST',
          signal: AbortSignal.timeout(1500)
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        this.backendAvailable = false;
      }
    }
    return this.localEngine.step();
  }

  public async sendControl(params: {
    action?: 'start' | 'pause' | 'reset' | 'deploy';
    profile?: string;
    noise_level?: number;
    speed_multiplier?: number;
    ai_enabled?: boolean;
    scenario_id?: string;
  }): Promise<void> {
    // Apply to local engine immediately
    if (params.action === 'start') {
      if (this.localEngine.status === 'INTERCEPTED') this.localEngine.reset();
      this.localEngine.status = 'RUNNING';
    } else if (params.action === 'pause') {
      this.localEngine.status = 'PAUSED';
    } else if (params.action === 'reset') {
      this.localEngine.reset();
    } else if (params.action === 'deploy') {
      this.localEngine.deployInterceptor();
    }

    if (params.scenario_id) {
      this.localEngine.setScenario(params.scenario_id);
    }
    if (params.profile) {
      this.localEngine.profile = params.profile as any;
    }
    if (params.noise_level !== undefined) {
      this.localEngine.noiseLevel = params.noise_level;
    }
    if (params.speed_multiplier !== undefined) {
      this.localEngine.speedMultiplier = params.speed_multiplier;
    }
    if (params.ai_enabled !== undefined) {
      this.localEngine.aiEnabled = params.ai_enabled;
    }

    // Also forward to FastAPI if available
    if (this.backendAvailable) {
      try {
        await fetch(`${API_BASE_URL}/sim/control`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
          signal: AbortSignal.timeout(1000)
        });
      } catch {
        // quiet fallback
      }
    }
  }

  public getHistoryRecords() {
    return this.localEngine.historyRecords;
  }

  public setAircraftCursor(x: number, y: number) {
    this.localEngine.setAircraftCursor(x, y);
  }

  public getEventLog() {
    return this.localEngine.eventLog;
  }

  public async inspectPipeline(): Promise<any> {
    if (this.backendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/pipeline/inspect`, {
          method: 'POST',
          signal: AbortSignal.timeout(1500)
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // fallback
      }
    }

    // Local diagnostic generator
    const payload = this.localEngine.step();
    return {
      stage_1_ground_truth: { x: payload.threat.x, y: payload.threat.y },
      stage_2_sensor_observation: {
        observed: payload.observation,
        noise_added: {
          dx: Math.round((payload.observation.x - payload.threat.x) * 100) / 100,
          dy: Math.round((payload.observation.y - payload.threat.y) * 100) / 100
        }
      },
      stage_3_noise_filter: {
        algorithm: 'Discrete Linear Kalman Filter',
        estimated_state: payload.tracking,
        residual_correction: Math.round(Math.hypot(payload.tracking.x - payload.observation.x, payload.tracking.y - payload.observation.y) * 10) / 10
      },
      stage_4_feature_extraction: {
        features: ['t_norm', 'pos_x', 'pos_y', 'vel_x', 'vel_y', 'dt'],
        history_window_samples: 25
      },
      stage_5_trajectory_prediction: {
        algorithm: 'Ridge Polynomial Regression (degree=2)',
        prediction_horizon_steps: payload.prediction.horizon_points.length,
        estimated_rmse: payload.prediction.error_rmse,
        next_5_points: payload.prediction.horizon_points.slice(0, 5)
      },
      stage_6_interception_decision: {
        meeting_point: payload.meeting_point,
        interceptor_status: payload.interceptor.status,
        ready_to_engage: payload.meeting_point !== null
      }
    };
  }
}

export const simService = new SimulationService();
