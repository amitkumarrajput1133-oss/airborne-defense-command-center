import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SimulationPayload,
  HistoryRecord,
  ThreatProfileType,
  SimStatus,
} from './types/simulation';
import {
  ControlMode,
  InterceptionOutcome,
  ScreenMode,
  ThreatLevel,
} from './types/tactical';
import { simService } from './services/api';
import { Header } from './components/Header';
import { InterceptorOverviewModal } from './components/InterceptorOverviewModal';
import { TacticalDefenseCommandPage } from './pages/TacticalDefenseCommandPage';
import { BlueprintScreen } from './components/tactical/BlueprintScreen';
import { GridMapScreen } from './components/tactical/GridMapScreen';
import { BlackBoxScreen } from './components/tactical/BlackBoxScreen';
import { DashboardPage } from './pages/DashboardPage';
import { SystemArchitecturePage } from './pages/SystemArchitecturePage';
import { AIPipelinePage } from './pages/AIPipelinePage';
import { PerformanceMetricsPage } from './pages/PerformanceMetricsPage';
import { Sparkles, Shield, Radio, Volume2 } from 'lucide-react';

export const App: React.FC = () => {
  // Screen and Mode States
  const [activeTab, setActiveTab] = useState<ScreenMode>('radar');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [controlMode, setControlMode] = useState<ControlMode>('patrol');
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>('CLEAR');
  const [jetDestroyed, setJetDestroyed] = useState<boolean>(false);
  const [outcome, setOutcome] = useState<InterceptionOutcome>('idle');

  // Simulation Lab States
  const [payload, setPayload] = useState<SimulationPayload | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [status, setStatus] = useState<SimStatus>('INITIALIZED');
  const [profile, setProfile] = useState<ThreatProfileType>('straight');
  const [noiseLevel, setNoiseLevel] = useState<number>(1.0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [aiEnabled, setAiEnabled] = useState<boolean>(true);
  const [selectedScenario, setSelectedScenario] = useState<string>('straight');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [demoStepMessage, setDemoStepMessage] = useState<string | null>(null);
  const [isInterceptorOverviewOpen, setIsInterceptorOverviewOpen] = useState(false);

  const timerRef = useRef<number | null>(null);
  const demoTimeoutRef = useRef<any[]>([]);

  // Periodically check backend connection
  useEffect(() => {
    const checkConn = async () => {
      const connected = await simService.checkBackend();
      setIsBackendConnected(connected);
    };
    checkConn();
    const interval = setInterval(checkConn, 5000);
    return () => clearInterval(interval);
  }, []);

  // Main simulation tick loop for kinematics lab
  const tickSimulation = useCallback(async () => {
    try {
      const newPayload = await simService.getSimulationStep();
      setPayload(newPayload);
      setStatus(newPayload.status);
      setHistory([...simService.getHistoryRecords()]);
    } catch (e) {
      console.error('Simulation tick error:', e);
    }
  }, []);

  // Timer loop driven by simulation speed
  useEffect(() => {
    if (status === 'RUNNING') {
      const intervalMs = Math.max(25, Math.floor(100 / speedMultiplier));
      timerRef.current = window.setInterval(tickSimulation, intervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status, speedMultiplier, tickSimulation]);

  // Initial step to populate data
  useEffect(() => {
    tickSimulation();
  }, [tickSimulation]);

  // Handlers for Kinematics Lab
  const handleStart = async () => {
    await simService.sendControl({ action: 'start' });
    setStatus('RUNNING');
  };

  const handlePause = async () => {
    await simService.sendControl({ action: 'pause' });
    setStatus('PAUSED');
  };

  const handleReset = async () => {
    clearDemoSequence();
    await simService.sendControl({ action: 'reset' });
    setStatus('INITIALIZED');
    setDemoStepMessage(null);
    setIsDemoRunning(false);
    tickSimulation();
  };

  const handleDeploy = async () => {
    await simService.sendControl({ action: 'deploy' });
    tickSimulation();
  };

  const handleProfileChange = async (p: ThreatProfileType) => {
    setProfile(p);
    await simService.sendControl({ profile: p });
    tickSimulation();
  };

  const handleNoiseChange = async (n: number) => {
    setNoiseLevel(n);
    await simService.sendControl({ noise_level: n });
  };

  const handleSpeedChange = async (s: number) => {
    setSpeedMultiplier(s);
    await simService.sendControl({ speed_multiplier: s });
  };

  const handleAiToggle = async (enabled: boolean) => {
    setAiEnabled(enabled);
    await simService.sendControl({ ai_enabled: enabled });
    tickSimulation();
  };

  const handleScenarioSelect = async (scId: string) => {
    clearDemoSequence();
    setSelectedScenario(scId);
    await simService.sendControl({ scenario_id: scId });
    if (scId === 'straight') {
      setProfile('straight');
      setNoiseLevel(0.8);
    } else if (scId === 'variable') {
      setProfile('variable');
      setNoiseLevel(1.2);
    } else if (scId === 'noisy') {
      setProfile('straight');
      setNoiseLevel(2.6);
    } else if (scId === 'maneuvering') {
      setProfile('maneuvering');
      setNoiseLevel(1.5);
    }
    tickSimulation();
  };

  const clearDemoSequence = () => {
    demoTimeoutRef.current.forEach((t) => clearTimeout(t));
    demoTimeoutRef.current = [];
  };

  // Automated 30-45s Demo Sequence
  const handleRunDemo = () => {
    clearDemoSequence();
    setIsDemoRunning(true);
    setActiveTab('dashboard');

    // 1. Reset
    handleReset();
    setDemoStepMessage('Demo Step 1/6: Calibrating Radar & Initializing Defense Grid...');

    // 2. Start simulation (Threat detection & Tracking)
    const t1 = setTimeout(() => {
      handleStart();
      setDemoStepMessage('Demo Step 2/6: Threat Object Detected. Sensor Echoes Streaming to Kalman Filter...');
    }, 1800);

    // 3. AI Prediction lock
    const t2 = setTimeout(() => {
      setDemoStepMessage('Demo Step 3/6: AI Model Locked Trajectory. Projecting 3.5s Future Flight Path...');
    }, 6000);

    // 4. Meeting point calculation & deploy interceptor
    const t3 = setTimeout(() => {
      setDemoStepMessage('Demo Step 4/6: Predicted Interception Point Computed. Deploying Virtual Interceptor...');
      handleDeploy();
    }, 9500);

    // 5. Interceptor pursuit
    const t4 = setTimeout(() => {
      setDemoStepMessage('Demo Step 5/6: Virtual Interceptor En Route to Predicted Rendezvous Coordinates...');
    }, 14000);

    // 6. Complete
    const t5 = setTimeout(() => {
      setDemoStepMessage('Demo Step 6/6: Interception Vector Rendezvous Successful. Reviewing Performance Metrics...');
    }, 21000);

    const t6 = setTimeout(() => {
      setIsDemoRunning(false);
      setDemoStepMessage(null);
    }, 28000);

    demoTimeoutRef.current.push(t1, t2, t3, t4, t5, t6);
  };

  return (
    <div className="min-h-screen bg-[#040811] text-[#9fc0e2] flex flex-col justify-between scanlines selection:bg-[#00e5ff] selection:text-black">
      {/* Tactical Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled((prev) => !prev)}
        controlMode={controlMode}
        onToggleControlMode={setControlMode}
        threatLevel={threatLevel}
        jetDestroyed={jetDestroyed}
        outcome={outcome}
        status={status}
        isBackendConnected={isBackendConnected}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
        onRunDemo={handleRunDemo}
        isDemoRunning={isDemoRunning}
        onDeploy={handleDeploy}
        interceptorStatus={payload?.interceptor.status || 'STANDBY'}
      />

      {/* Demo Mode Notification Banner */}
      {isDemoRunning && demoStepMessage && (
        <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-950 border-b border-purple-500/50 px-4 py-2 text-xs font-mono text-center flex items-center justify-center gap-2 text-purple-200 shadow-md animate-pulse">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="font-bold">{demoStepMessage}</span>
        </div>
      )}

      {/* Main Screen Content */}
      <main className="flex-1 max-w-[1780px] w-full mx-auto p-3.5">
        {/* Flagship Tactical Radar & SIL Defense Command Page */}
        {activeTab === 'radar' && (
          <TacticalDefenseCommandPage
            audioEnabled={audioEnabled}
            onNavigateToBlueprint={() => setActiveTab('blueprint')}
            controlMode={controlMode}
            setControlMode={setControlMode}
            threatLevel={threatLevel}
            setThreatLevel={setThreatLevel}
            jetDestroyed={jetDestroyed}
            setJetDestroyed={setJetDestroyed}
            outcome={outcome}
            setOutcome={setOutcome}
          />
        )}

        {/* Detailed CAD Blueprint & Aerospace Specification */}
        {activeTab === 'blueprint' && <BlueprintScreen />}

        {/* Strategic Theater Defense Grid Network */}
        {activeTab === 'grid' && <GridMapScreen />}

        {/* Post-Mortem Flight Data Recorder (Black Box) */}
        {activeTab === 'blackbox' && (
          <BlackBoxScreen
            onReEngage={() => {
              setActiveTab('radar');
            }}
          />
        )}

        {/* Interactive AI Kinematics & Tracking Lab */}
        {activeTab === 'dashboard' && (
          <DashboardPage
            payload={payload}
            history={history}
            status={status}
            profile={profile}
            noiseLevel={noiseLevel}
            speedMultiplier={speedMultiplier}
            aiEnabled={aiEnabled}
            selectedScenario={selectedScenario}
            onStart={handleStart}
            onPause={handlePause}
            onReset={handleReset}
            onDeploy={handleDeploy}
            onProfileChange={handleProfileChange}
            onNoiseChange={handleNoiseChange}
            onSpeedChange={handleSpeedChange}
            onAiToggle={handleAiToggle}
            onScenarioSelect={handleScenarioSelect}
            onOpenInterceptorOverview={() => setIsInterceptorOverviewOpen(true)}
            onAircraftMove={(x, y) => simService.setAircraftCursor(x, y)}
          />
        )}

        {/* System Architecture */}
        {activeTab === 'architecture' && <SystemArchitecturePage />}

        {/* AI / ML Pipeline */}
        {activeTab === 'pipeline' && <AIPipelinePage />}

        {/* Performance Metrics */}
        {activeTab === 'metrics' && (
          <PerformanceMetricsPage payload={payload} history={history} />
        )}
      </main>

      {/* Modal for Legacy Interceptor Overview */}
      {isInterceptorOverviewOpen && (
        <InterceptorOverviewModal onClose={() => setIsInterceptorOverviewOpen(false)} />
      )}

      {/* Tactical Footer / Safety & Research Boundary Notice */}
      <footer className="border-t border-[#142642] bg-[#050b16] px-4 py-2.5 text-[11px] font-mono-tech text-[#5c81a8]">
        <div className="max-w-[1780px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse" />
            <span>
              AEGIS COMMAND // SOFTWARE-IN-THE-LOOP (SIL) DIGITAL TWIN // UNIFIED SINGLE-BODY KINETIC INTERCEPTOR (USBI)
            </span>
          </div>
          <div className="text-[#496a8e] flex items-center gap-3">
            <span>Ka-Band MMW AESA • 8-Channel DACS Pulse • 1,200Hz APN Guidance</span>
            <span className="text-[#00ff66] font-bold">DEFENSE GRADE SIL-TWIN</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
