export type ScreenMode = 'radar' | 'blueprint' | 'grid' | 'blackbox';

export type ControlMode = 'patrol' | 'mouse' | 'wasd';

export type ThreatLevel = 'CLEAR' | 'TRACKING' | 'CRITICAL BREACH';

export type DefenseMode = 'interception' | 'failure_simulation';

export type InterceptionOutcome = 'idle' | 'tracking' | 'intercepted' | 'breached';

export interface JetState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  angle: number;
  speed: number;
  destroyed: boolean;
  autoPilot: boolean;
  waypointAngle?: number;
}

export interface InterceptorState {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: Array<{ x: number; y: number; time: number }>;
  speed: number;
  mach: number;
  launchedAt: number;
  targetOffset?: { x: number; y: number };
  overshot?: boolean;
}

export interface ThreatState {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: Array<{ x: number; y: number; time: number }>;
  speed: number;
  evaded: boolean;
  evading?: boolean;
  spawnTime: number;
  destroyed: boolean;
  maneuverPhase?: number;
  maneuverType?: 'weave' | 'corkscrew' | 'dogleg' | 'direct';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
}

export interface Explosion {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  isMidAirKill?: boolean;
  particles?: Particle[];
}

export interface TerminalLog {
  id: string;
  timeStr: string;
  type: 'SYS' | 'WARN' | 'ALERT' | 'BREACH' | 'SUCCESS' | 'LAUNCH' | 'PATROL';
  text: string;
}

export type BlueprintNodeKey = 'seeker' | 'dacs' | 'ai' | 'casing' | 'motor' | 'fins';

export interface BlueprintNodeData {
  title: string;
  subsystemName: string;
  code: string;
  desc: string;
  engineeringMaterial: string;
  highAltitudeRole: string;
  material?: string;
  role?: string;
  specs: { [key: string]: string };
}

