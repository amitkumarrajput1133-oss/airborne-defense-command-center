/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  ControlMode,
  DefenseMode,
  Explosion,
  InterceptionOutcome,
  InterceptorState,
  JetState,
  ScreenMode,
  TerminalLog,
  ThreatLevel,
  ThreatState,
} from './types';
import { Header } from './components/Header';
import { FailureBanner } from './components/FailureBanner';
import { SuccessBanner } from './components/SuccessBanner';
import { InterceptorSchematic } from './components/InterceptorSchematic';
import { SubsystemTelemetry } from './components/SubsystemTelemetry';
import { RadarScope } from './components/RadarScope';
import { ThreatAssessment } from './components/ThreatAssessment';
import { FlightTelemetry } from './components/FlightTelemetry';
import { MissionTerminal } from './components/MissionTerminal';
import { BlueprintScreen } from './components/BlueprintScreen';
import { GridMapScreen } from './components/GridMapScreen';
import { BlackBoxScreen } from './components/BlackBoxScreen';
import {
  playBeep,
  playExplosionSfx,
  playLaunchSfx,
  playTacticalVoice,
} from './utils/audio';

const INITIAL_LOGS: TerminalLog[] = [
  {
    id: 'log-1',
    timeStr: '21:30:35.012',
    type: 'SYS',
    text: 'Tactical defense grid initialized. Sensor array calibrated to 65KM radius.',
  },
  {
    id: 'log-2',
    timeStr: '21:30:38.115',
    type: 'PATROL',
    text: 'VIPER-01 airborne platform locked on waypoint Bravo-4. Interceptor armed.',
  },
  {
    id: 'log-3',
    timeStr: '21:30:40.330',
    type: 'SYS',
    text: 'Active Proportional Navigation (APN) homing core calibrated for direct kinetic interception.',
  },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenMode>('radar');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [controlMode, setControlMode] = useState<ControlMode>('patrol');
  const [defenseMode, setDefenseMode] = useState<DefenseMode>('failure_simulation');
  const [autoLaunch, setAutoLaunch] = useState<boolean>(false);
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>('CLEAR');
  const [outcome, setOutcome] = useState<InterceptionOutcome>('idle');
  const [interceptDistanceKm, setInterceptDistanceKm] = useState<number>(31.4);
  const [showSuccessBanner, setShowSuccessBanner] = useState<boolean>(false);
  const [scenarioName, setScenarioName] = useState<string>(
    'EVASIVE-BYPASS (FAILURE REPLICATION)'
  );

  const [jet, setJet] = useState<JetState>({
    x: 250,
    y: 355,
    vx: 0,
    vy: 0,
    targetX: 250,
    targetY: 355,
    angle: 0,
    speed: 1.35,
    destroyed: false,
    autoPilot: true,
  });

  const [interceptor, setInterceptor] = useState<InterceptorState>({
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    trail: [],
    speed: 2.5,
    mach: 0,
    launchedAt: 0,
  });

  const [threat, setThreat] = useState<ThreatState>({
    active: false,
    x: 120,
    y: 90,
    vx: 0,
    vy: 0,
    trail: [],
    speed: 1.5,
    evaded: false,
    spawnTime: 0,
    destroyed: false,
  });

  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [logs, setLogs] = useState<TerminalLog[]>(INITIAL_LOGS);

  const [flightTelemetry, setFlightTelemetry] = useState({
    jetX: 250,
    jetY: 355,
    jetAngle: 0,
    threatDistanceKm: 58.5,
    interceptorMach: 0,
    ecmNoiseDb: 0,
    closureRate: 1200,
  });

  // Logging utility
  const addLog = useCallback(
    (type: TerminalLog['type'], text: string) => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(
        now.getMilliseconds()
      ).padStart(3, '0')}`;

      setLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}-${Math.random()}`,
          timeStr,
          type,
          text,
        },
      ]);
    },
    []
  );

  // Spawn threat at outer perimeter
  const spawnThreat = useCallback(() => {
    const angle = Math.random() * Math.PI * 0.6 + 0.2;
    const dist = 228; // Outer perimeter ~58.5 KM
    const center = 250;

    setThreat({
      active: true,
      x: center + Math.cos(angle) * dist,
      y: center - Math.sin(angle) * dist,
      vx: 0,
      vy: 0,
      trail: [],
      speed: 1.5, // Cinematic slow speed ~1.5 pixels/frame
      evaded: false,
      spawnTime: Date.now(),
      destroyed: false,
    });

    setInterceptor({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      trail: [],
      speed: 2.5,
      mach: 0,
      launchedAt: 0,
      overshot: false,
    });

    setThreatLevel('TRACKING');
    setOutcome('tracking');
    setShowSuccessBanner(false);

    addLog(
      'ALERT',
      `Inbound BOGEY-X hypersonic threat detected on radar perimeter (58.5 KM). Homing on VIPER-01.`
    );
    playTacticalVoice('Target Locked. Inbound Threat.', audioEnabled);
    playBeep(440, 'triangle', 0.25, audioEnabled);
  }, [addLog, audioEnabled]);

  // Launch interceptor directly from VIPER-01 live nose coordinates
  const handleLaunchInterceptor = useCallback(() => {
    if (jet.destroyed) {
      addLog('WARN', 'Launch rejected: VIPER-01 platform compromised.');
      return;
    }
    if (interceptor.active) {
      addLog('WARN', 'Interceptor round already in flight homing onto target.');
      return;
    }
    if (!threat.active || threat.destroyed) {
      addLog('WARN', 'No active airborne threat locks available for engagement.');
      return;
    }

    // Eject directly from VIPER-01's live nose coordinates
    const noseX = jet.x + Math.cos(jet.angle) * 18;
    const noseY = jet.y + Math.sin(jet.angle) * 18;
    const launchVx = Math.cos(jet.angle) * 2.5;
    const launchVy = Math.sin(jet.angle) * 2.5;

    setInterceptor({
      active: true,
      x: noseX,
      y: noseY,
      vx: launchVx,
      vy: launchVy,
      trail: [{ x: noseX, y: noseY, time: 0 }],
      speed: 2.5, // ~2.5 pixels/frame, slightly faster than threat (1.5)
      mach: 1.8,
      launchedAt: Date.now(),
      overshot: false,
    });

    addLog(
      'LAUNCH',
      `Kinetic Interceptor ejected from VIPER-01 nose at live coordinates (${noseX.toFixed(0)}, ${noseY.toFixed(0)}). Proportional homing engaged (2.5 px/frame).`
    );
    playLaunchSfx(audioEnabled);
    playTacticalVoice('Kinetic Interceptor Dispatched. Tracking Moving Threat.', audioEnabled);
  }, [addLog, audioEnabled, interceptor.active, jet.angle, jet.destroyed, jet.x, jet.y, threat.active, threat.destroyed]);

  // Threat evasion handler (when interceptor < 40px)
  const handleEvasionTriggered = useCallback(() => {
    setThreat((prev) => ({ ...prev, evaded: true }));
    addLog(
      'WARN',
      'Range < 40px: Inbound threat executed 35G evasive thrust maneuver! Kinetic interceptor overshot.'
    );
    playTacticalVoice('Target Jink Detected. Interceptor Overshot.', audioEnabled);
  }, [addLog, audioEnabled]);

  // Threat intercepted in mid-air (for successful interception mode)
  const handleThreatIntercepted = useCallback(
    (_x: number, _y: number, distToJetKm: number) => {
      setOutcome('intercepted');
      setThreatLevel('CLEAR');
      setInterceptDistanceKm(distToJetKm);
      setShowSuccessBanner(true);

      addLog(
        'SUCCESS',
        `KINETIC INTERCEPTION SUCCESSFUL! Direct hit on BOGEY-X at ${distToJetKm.toFixed(
          1
        )} KM range from VIPER-01.`
      );
      addLog(
        'SUCCESS',
        'Threat missile obliterated in mid-air. Airborne platform VIPER-01 100% undamaged. Airspace secured.'
      );
    },
    [addLog]
  );

  // Threat hit jet upon collision (distance < 15px)
  const handleThreatHitJet = useCallback(() => {
    setJet((prev) => ({ ...prev, destroyed: true }));
    setThreat((prev) => ({ ...prev, active: false }));
    setThreatLevel('CRITICAL BREACH');
    setOutcome('breached');
    setShowSuccessBanner(false);

    setExplosions((prev) => [
      ...prev,
      {
        x: jet.x,
        y: jet.y,
        radius: 8,
        maxRadius: 75,
        alpha: 1,
        color: '#ff2a55',
      },
      {
        x: jet.x + 6,
        y: jet.y - 4,
        radius: 4,
        maxRadius: 45,
        alpha: 1,
        color: '#ffb703',
      },
    ]);

    playExplosionSfx(audioEnabled);
    playTacticalVoice('Alert: Mobile Platform Compromised. Interception Failed.', audioEnabled);

    addLog('ALERT', 'IMPACT: Distance to VIPER-01 < 15px. Motion loops frozen.');
    addLog(
      'BREACH',
      'SIMULATION INTERCEPTION FAILED: Mobile platform VIPER-01 destroyed by high-speed kinetic impact.'
    );
  }, [addLog, audioEnabled, jet.x, jet.y]);

  // Reset simulation
  const resetSimulation = useCallback(
    (autoSpawn = true) => {
      setJet({
        x: 250,
        y: 355,
        vx: 0,
        vy: 0,
        targetX: 250,
        targetY: 355,
        angle: 0,
        speed: 1.35,
        destroyed: false,
        autoPilot: true,
      });

      setInterceptor({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        trail: [],
        speed: 2.5,
        mach: 0,
        launchedAt: 0,
        overshot: false,
      });

      setThreat({
        active: false,
        x: 120,
        y: 90,
        vx: 0,
        vy: 0,
        trail: [],
        speed: 1.5,
        evaded: false,
        spawnTime: 0,
        destroyed: false,
      });

      setExplosions([]);
      setThreatLevel('CLEAR');
      setOutcome('idle');
      setShowSuccessBanner(false);

      addLog(
        'SYS',
        'Defense grid re-engaged. VIPER-01 autonomous figure-8 patrol corridor resumed. Interceptor reloaded.'
      );

      if (autoSpawn) {
        setTimeout(spawnThreat, 900);
      }
    },
    [addLog, spawnThreat]
  );

  // Initial trigger after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      spawnThreat();
    }, 1000);
    return () => clearTimeout(timer);
  }, [spawnThreat]);

  // Telemetry callback
  const handleUpdateTelemetry = useCallback(
    (data: {
      jetX: number;
      jetY: number;
      jetAngle: number;
      threatDistanceKm: number;
      interceptorMach: number;
      ecmNoiseDb: number;
      closureRate: number;
    }) => {
      setFlightTelemetry(data);
    },
    []
  );

  return (
    <div className="min-h-screen bg-[#040811] text-[#9fc0e2] relative overflow-hidden flex flex-col justify-between scanlines">
      {/* Header */}
      <Header
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled((prev) => !prev)}
        controlMode={controlMode}
        onToggleControlMode={setControlMode}
        threatLevel={threatLevel}
        jetDestroyed={jet.destroyed}
        outcome={outcome}
      />

      {/* Success Banner when interceptor destroys missile in mid-air */}
      {showSuccessBanner && (
        <SuccessBanner
          interceptDistanceKm={interceptDistanceKm}
          onSpawnNext={spawnThreat}
          onDismiss={() => setShowSuccessBanner(false)}
        />
      )}

      {/* Failure Banner when jet is destroyed */}
      {jet.destroyed && (
        <FailureBanner onReEngage={() => resetSimulation(true)} />
      )}

      {/* Screen Views */}
      {currentScreen === 'radar' && (
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3.5 p-3.5 overflow-hidden">
          {/* Left Panel: Schematic Blueprint & Subsystems */}
          <section className="lg:col-span-4 xl:col-span-4 flex flex-col gap-3 h-full overflow-y-auto pr-0.5 custom-scrollbar">
            <InterceptorSchematic
              audioEnabled={audioEnabled}
              onOpenFullBlueprint={() => setCurrentScreen('blueprint')}
              interceptorActive={interceptor.active}
              jetDestroyed={jet.destroyed}
              outcome={outcome}
              threatLevel={threatLevel}
            />
            <SubsystemTelemetry
              threatLevel={threatLevel}
              interceptorActive={interceptor.active}
              jetDestroyed={jet.destroyed}
              outcome={outcome}
            />
          </section>

          {/* Center Panel: Radar Scope */}
          <section className="lg:col-span-5 xl:col-span-5 flex flex-col gap-2.5 h-full">
            <RadarScope
              controlMode={controlMode}
              defenseMode={defenseMode}
              onToggleDefenseMode={(mode) => {
                setDefenseMode(mode);
                addLog('SYS', `Defense mode changed to: ${mode.toUpperCase()}`);
                if (mode === 'interception') {
                  setScenarioName('DIRECT KINETIC INTERCEPTION (AIR DEFENSE)');
                } else {
                  setScenarioName('EVASIVE-BYPASS (FAILURE REPLICATION)');
                }
              }}
              audioEnabled={audioEnabled}
              autoLaunch={autoLaunch}
              onToggleAutoLaunch={() => {
                setAutoLaunch((prev) => {
                  const next = !prev;
                  addLog('SYS', `Automated Defense Grid Fire: ${next ? 'ENABLED' : 'MANUAL'}`);
                  return next;
                });
              }}
              jet={jet}
              setJet={setJet}
              interceptor={interceptor}
              setInterceptor={setInterceptor}
              threat={threat}
              setThreat={setThreat}
              explosions={explosions}
              setExplosions={setExplosions}
              onLaunchInterceptor={handleLaunchInterceptor}
              onResetSimulation={resetSimulation}
              onSpawnThreat={spawnThreat}
              onThreatHitJet={handleThreatHitJet}
              onThreatIntercepted={handleThreatIntercepted}
              onEvasionTriggered={handleEvasionTriggered}
              onLogEvent={addLog}
              onUpdateTelemetry={handleUpdateTelemetry}
            />
          </section>

          {/* Right Panel: Threat Assessment & Flight Telemetry */}
          <section className="lg:col-span-3 flex flex-col gap-3 h-full overflow-hidden">
            <ThreatAssessment
              threatLevel={threatLevel}
              onSetThreatLevel={setThreatLevel}
              jetDestroyed={jet.destroyed}
            />
            <FlightTelemetry
              jetX={flightTelemetry.jetX}
              jetY={flightTelemetry.jetY}
              jetAngle={flightTelemetry.jetAngle}
              threatDistanceKm={flightTelemetry.threatDistanceKm}
              interceptorMach={flightTelemetry.interceptorMach}
              ecmNoiseDb={flightTelemetry.ecmNoiseDb}
              closureRate={flightTelemetry.closureRate}
              jetDestroyed={jet.destroyed}
              outcome={outcome}
              onSpawnThreat={spawnThreat}
            />
          </section>
        </main>
      )}

      {currentScreen === 'blueprint' && <BlueprintScreen />}

      {currentScreen === 'grid' && <GridMapScreen />}

      {currentScreen === 'blackbox' && (
        <BlackBoxScreen
          onReEngage={() => {
            resetSimulation(true);
            setCurrentScreen('radar');
          }}
        />
      )}

      {/* Bottom Terminal */}
      <MissionTerminal
        logs={logs}
        onClearLogs={() => {
          setLogs([]);
          addLog('SYS', 'Terminal display log purged by operator.');
        }}
        scenarioName={scenarioName}
        onSelectScenario={(scen) => {
          setScenarioName(scen);
          if (scen.includes('EVASIVE-BYPASS')) {
            setDefenseMode('failure_simulation');
          } else {
            setDefenseMode('interception');
          }
          addLog('SYS', `Engagement scenario switched to: ${scen}`);
        }}
      />
    </div>
  );
}
