import React from 'react';
import { SimulationPayload, HistoryRecord, ThreatProfileType, SimStatus } from '../types/simulation';
import { RadarCanvas } from '../components/RadarCanvas';
import { TelemetryPanel } from '../components/TelemetryPanel';
import { ControlPanel } from '../components/ControlPanel';
import { TrajectoryCharts } from '../components/TrajectoryCharts';
import { EventLog } from '../components/EventLog';

interface DashboardPageProps {
  payload: SimulationPayload | null;
  history: HistoryRecord[];
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
  onOpenInterceptorOverview: () => void;
  onAircraftMove: (x: number, y: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  payload,
  history,
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
  onOpenInterceptorOverview,
  onAircraftMove
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Top Section: Radar (Left/Center) + Telemetry (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Radar Simulator (8 cols) */}
        <div className="lg:col-span-8 flex flex-col">
          <RadarCanvas
            payload={payload}
            history={history}
            onDeploy={onDeploy}
            onOpenInterceptorOverview={onOpenInterceptorOverview}
            onAircraftMove={onAircraftMove}
          />
        </div>

        {/* Telemetry & Kinematics (4 cols) */}
        <div className="lg:col-span-4 flex flex-col">
          <TelemetryPanel
            payload={payload}
            onDeploy={onDeploy}
            onOpenInterceptorOverview={onOpenInterceptorOverview}
          />
        </div>
      </div>

      {/* Mid Section: Control Panel */}
      <ControlPanel
        status={status}
        profile={profile}
        noiseLevel={noiseLevel}
        speedMultiplier={speedMultiplier}
        aiEnabled={aiEnabled}
        selectedScenario={selectedScenario}
        onStart={onStart}
        onPause={onPause}
        onReset={onReset}
        onDeploy={onDeploy}
        onProfileChange={onProfileChange}
        onNoiseChange={onNoiseChange}
        onSpeedChange={onSpeedChange}
        onAiToggle={onAiToggle}
        onScenarioSelect={onScenarioSelect}
        interceptorStatus={payload?.interceptor.status || 'STANDBY'}
      />

      {/* Bottom Section: Trajectory Graphs (Left 7 cols) + Event Log (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-7">
          <TrajectoryCharts history={history} />
        </div>
        <div className="lg:col-span-5">
          <EventLog events={payload?.latest_events || []} />
        </div>
      </div>
    </div>
  );
};
