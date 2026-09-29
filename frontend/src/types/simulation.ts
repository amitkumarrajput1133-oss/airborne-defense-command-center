export type ThreatProfileType = 'straight' | 'variable' | 'maneuvering' | 'random_noise';

export type SimStatus = 'INITIALIZED' | 'RUNNING' | 'PAUSED' | 'INTERCEPTED' | 'FAILED' | 'COMPLETE';

export type InterceptorStatus = 'STANDBY' | 'DEPLOYED' | 'INTERCEPTING' | 'INTERCEPTED' | 'EXPIRED';

export interface Point2D {
  x: number;
  y: number;
}

export interface AircraftState extends Point2D {
  r: number;
  angle: number;
  speed: number;
  heading: number;
  callsign: string;
}

export interface PredictedPoint extends Point2D {
  t: number;
  step: number;
}

export interface ThreatState extends Point2D {
  active: boolean;
  vx: number;
  vy: number;
  speed: number;
  distance_to_base: number;
}

export interface TrackingState extends Point2D {
  vx: number;
  vy: number;
  speed: number;
  heading_deg: number;
  confidence: number;
  observations_count: number;
  covariance_trace: number;
}

export interface InterceptorState extends Point2D {
  status: InterceptorStatus;
  vx: number;
  vy: number;
  speed: number;
  distance_to_target: number;
  launch_x?: number;
  launch_y?: number;
  launch_heading?: number;
}

export interface MeetingPoint extends Point2D {
  t: number;
  tti: number;
  distance: number;
  step: number;
}

export interface EventLogItem {
  id: number;
  timestamp: string;
  type: string;
  details: string;
}

export interface HistoryRecord {
  time: number;
  step: number;
  actual_x: number;
  actual_y: number;
  observed_x: number;
  observed_y: number;
  filtered_x: number;
  filtered_y: number;
  ai_pred_x: number;
  ai_pred_y: number;
  tracking_error: number;
  confidence: number;
}

export interface SimulationPayload {
  status: SimStatus;
  sim_time: number;
  step_count: number;
  fighter: Point2D;
  aircraft: AircraftState;
  threat: ThreatState;
  observation: Point2D;
  tracking: TrackingState;
  prediction: {
    active: boolean;
    error_rmse: number;
    horizon_points: PredictedPoint[];
  };
  interceptor: InterceptorState;
  meeting_point: MeetingPoint | null;
  metrics: {
    compute_time_ms: number;
    tracking_accuracy: number;
    observations_count: number;
    noise_level: number;
    scenario: string;
  };
  latest_events: EventLogItem[];
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  profile: ThreatProfileType;
  noise_level: number;
  default_speed: number;
  difficulty: string;
}
