import React, { useState } from 'react';
import {
  Crosshair,
  ShieldCheck,
  Zap,
  Radio,
  Cpu,
  Flame,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  X,
  Layers,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { BlueprintNodeData, BlueprintNodeKey, InterceptionOutcome, ThreatLevel } from '../types';
import { playBeep } from '../utils/audio';

export interface InterceptorSubsystemSpec extends BlueprintNodeData {
  id: BlueprintNodeKey;
  subsystemName: string;
  engineeringMaterial: string;
  highAltitudeRole: string;
  altitudeBand: string;
  iconName: 'seeker' | 'dacs' | 'ai' | 'casing' | 'motor';
}

export const SUBSYSTEM_SPECS: Record<BlueprintNodeKey, InterceptorSubsystemSpec> = {
  seeker: {
    id: 'seeker',
    title: 'NODE 1: SEEKER / RADOME ASSEMBLY',
    subsystemName: 'Seeker / Radome Assembly',
    code: 'KA-BAND // Si3N4 CERAMIC',
    desc: 'High-Mach ogive radome housing active millimeter-wave monopulse phased array radar. Penetrates electronic jamming, aerosol screens, and atmospheric plasma blackout.',
    engineeringMaterial: 'Silicon Nitride (Si3N4) Ceramic Radome & Ka-Band Monopulse AESA',
    highAltitudeRole: 'Zero-dielectric degradation and hypersonic RF-transparency under 1,400°C thermal shock at Mach 4.5+; provides high-resolution terminal targeting lock at near-vacuum altitudes (25–45 km).',
    altitudeBand: '25 – 45 KM (Stratosphere / Mesosphere)',
    iconName: 'seeker',
    material: 'Silicon Nitride (Si3N4) Ceramic',
    role: 'Aerothermal RF-transparency and Ka-band terminal acquisition',
    specs: {
      Frequency: '35.0 GHz Ka-Band Monopulse',
      TrackingRange: '18.5 km Active Lock',
      BeamSlew: '600°/s Electronic AESA Slew',
      ThermalRating: '1,400°C Aerothermal Shock',
    },
  },
  dacs: {
    id: 'dacs',
    title: 'NODE 2: MINI-DACS THRUSTERS (FORWARD RING)',
    subsystemName: 'Mini-DACS Thrusters (Forward Ring)',
    code: '8-THRUSTER RING // TITANIUM-TUNGSTEN',
    desc: 'Divert and Attitude Control System forward collar with 8 radial solid-propellant pulse thrusters providing rapid transverse divert for direct kinetic collision.',
    engineeringMaterial: 'Tungsten-Rhenium Hot Gas Nozzles & Titanium High-Pressure Manifold',
    highAltitudeRole: 'Sub-millisecond lateral attitude and divert impulses in rarefied upper atmosphere where conventional aerodynamic fins produce zero aerodynamic steering authority.',
    altitudeBand: '20 – 45 KM (Thin Upper Atmosphere)',
    iconName: 'dacs',
    material: 'Tungsten-Rhenium & Grade-5 Titanium',
    role: 'Sub-millisecond lateral diversion in thin atmosphere',
    specs: {
      ThrusterArray: '8x Radial Solid Pulse Nozzles',
      ValveResponse: '< 1.2 ms Fast-Acting Slew',
      PeakDivert: '850 N Lateral Thrust / Nozzle',
      ManifoldPSI: '4,800 PSI Gas Generator',
    },
  },
  ai: {
    id: 'ai',
    title: 'NODE 3: AI GUIDANCE SYSTEM-ON-CHIP (SoC)',
    subsystemName: 'AI Guidance System-on-Chip (SoC)',
    code: 'RAD-HARD SOI // 400 TFLOPS',
    desc: 'Shock-mounted tactical coprocessor running augmented proportional navigation (APN) and Kalman trajectory filters to outmaneuver hypersonic evasive vectors.',
    engineeringMaterial: 'Radiation-Hardened Silicon-on-Insulator (SOI) with Beryllium-Copper Shock Suspension',
    highAltitudeRole: 'Performs 1,200 Hz real-time multi-agent trajectory prediction, line-of-sight rate estimation, and guidance corrections under high vibration and high radiation flux.',
    altitudeBand: 'All Altitudes (High-Altitude Hardened)',
    iconName: 'ai',
    material: 'Radiation-Hardened SOI & Beryllium-Copper Suspension',
    role: '1,200 Hz real-time Kalman trajectory prediction and APN guidance',
    specs: {
      ComputeCapacity: '400 TFLOPS FP16 Neural Core',
      LoopFrequency: '1,200 Hz Closed-Loop Guidance',
      HorizonPrediction: '3.5 s Predictive Hypersonic Arc',
      GShockTolerance: '45g Shock-Isolated IMU Gimbal',
    },
  },
  casing: {
    id: 'casing',
    title: 'NODE 4: CARBON COMPOSITE CASING',
    subsystemName: 'Carbon Composite Casing',
    code: 'T1100 COMPOSITE // 30G RATED',
    desc: 'Filament-wound carbon-fiber pressure vessel and aerodynamic fuselage designed to withstand extreme lateral G-loads without structural deformation.',
    engineeringMaterial: 'Filament-Wound Toray T1100 Carbon-Fiber with Toughened Cyanate Ester Matrix',
    highAltitudeRole: 'Maintains critical airframe rigidity under 30g sustained lateral acceleration and aerodynamic shearing forces during terminal hypersonic interception maneuvers.',
    altitudeBand: 'Sea Level – 50 KM (Vacuum Structural Stability)',
    iconName: 'casing',
    material: 'Filament-Wound T1100 Carbon-Fiber & Cyanate Ester',
    role: 'Ultra-high stiffness airframe rated for 30g sustained lateral load',
    specs: {
      StructuralRating: '30g Sustained Acceleration',
      TensileStrength: '7.0 GPa High-Modulus Carbon',
      AblationLiner: 'Kevlar / EPDM Thermal Barrier',
      AirframeWeight: '14.2 kg Structural Mass',
    },
  },
  motor: {
    id: 'motor',
    title: 'NODE 5: SOLID ROCKET MOTOR',
    subsystemName: 'Solid Rocket Motor',
    code: 'HTPB / AP GRAIN // 18.4kN BOOST',
    desc: 'Boost-sustain solid rocket motor delivering rapid breakout acceleration to Mach 4.5+ with carbon-phenolic expansion nozzle optimized for high-altitude vacuum expansion.',
    engineeringMaterial: 'HTPB / AP Composite Propellant & Carbon-Phenolic Expansion Nozzle',
    highAltitudeRole: 'Optimized nozzle expansion ratio (38:1) delivers maximum vacuum thrust efficiency and rapid kinetic energy injection at high altitudes up to 45 km.',
    altitudeBand: '10 – 45 KM (Vacuum-Optimized Expansion)',
    iconName: 'motor',
    material: 'HTPB Propellant & Carbon-Phenolic Nozzle',
    role: 'Mach 4.5+ boost-sustain kinetic thrust at high altitude',
    specs: {
      BoostThrust: '18.4 kN (0.0 – 1.8s Initial Boost)',
      SustainThrust: '4.2 kN (1.8 – 4.8s Sustain)',
      SpecificImpulse: '268 s High-Altitude Isp',
      ChamberPressure: '12.8 MPa Burst Margin 2.4x',
    },
  },
  fins: {
    id: 'fins',
    title: 'NODE 6: HIGH-ANGLE GRID FINS',
    subsystemName: 'High-Angle Grid Fins',
    code: 'TITANIUM-AEROSPACE // ACT-4',
    desc: 'Electromechanical actuated grid fins for atmospheric stabilization and high angle-of-attack recovery.',
    engineeringMaterial: 'Titanium-Aerospace Alloy & Dual Brushless High-Torque Servos',
    highAltitudeRole: 'Supplementary aerodynamic pitch/yaw control during mid-altitude climb phase before entering near-vacuum regime.',
    altitudeBand: '0 – 25 KM (Dense to Mid Atmosphere)',
    iconName: 'casing',
    material: 'Titanium-Aerospace Alloy',
    role: 'Supplementary pitch/yaw stabilization during climb',
    specs: {
      Deflection: '±38° Slew Rate 420°/s',
      Actuation: 'Dual Brushless 28V Servo',
      ThermalCoat: 'Zirconia Plasma Spray',
      Weight: '2.8 kg Total Fin Array',
    },
  },
};

interface InterceptorSchematicProps {
  audioEnabled: boolean;
  onOpenFullBlueprint?: () => void;
  interceptorActive?: boolean;
  jetDestroyed?: boolean;
  outcome?: InterceptionOutcome;
  threatLevel?: ThreatLevel;
}

export const InterceptorSchematic: React.FC<InterceptorSchematicProps> = ({
  audioEnabled,
  onOpenFullBlueprint,
  interceptorActive = false,
  jetDestroyed = false,
  outcome = 'idle',
  threatLevel = 'CLEAR',
}) => {
  const [selectedNode, setSelectedNode] = useState<BlueprintNodeKey>('seeker');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleSelectNode = (key: BlueprintNodeKey) => {
    setSelectedNode(key);
    playBeep(1200, 'sine', 0.05, audioEnabled);

    // Auto-pan slightly to center the selected hotspot when zoomed in
    if (zoomLevel > 1) {
      switch (key) {
        case 'seeker':
          setPanX(-90);
          break;
        case 'dacs':
          setPanX(-50);
          break;
        case 'ai':
          setPanX(0);
          break;
        case 'casing':
          setPanX(60);
          break;
        case 'motor':
          setPanX(120);
          break;
        default:
          setPanX(0);
      }
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.35, 2.4));
    playBeep(1400, 'sine', 0.04, audioEnabled);
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.35, 1);
      if (next === 1) setPanX(0);
      return next;
    });
    playBeep(900, 'sine', 0.04, audioEnabled);
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanX(0);
    playBeep(1000, 'sine', 0.04, audioEnabled);
  };

  const currentSpec = SUBSYSTEM_SPECS[selectedNode] || SUBSYSTEM_SPECS.seeker;

  // Real-time Subsystem Health Calculation based on simulation events
  const getSubsystemHealth = (nodeKey: BlueprintNodeKey) => {
    if (outcome === 'intercepted') {
      switch (nodeKey) {
        case 'seeker':
          return {
            badge: 'SEEKER: TERMINAL KILL',
            detail: 'DIRECT KINETIC IMPACT',
            status: 'success',
            color: '#00ff66',
            dotClass: 'bg-[#00ff66] shadow-[0_0_8px_#00ff66]',
          };
        case 'dacs':
          return {
            badge: 'DACS: DIVERT SUCCESS',
            detail: 'LINE-OF-SIGHT LOCKED',
            status: 'success',
            color: '#00ff66',
            dotClass: 'bg-[#00ff66]',
          };
        case 'ai':
          return {
            badge: 'AI SOC: 0.0M MISS KILL',
            detail: 'APN ZERO-MISS SOLUTION',
            status: 'success',
            color: '#00ff66',
            dotClass: 'bg-[#00ff66]',
          };
        case 'casing':
          return {
            badge: 'HULL: INTEGRITY OK',
            detail: 'STRUCTURAL STABILITY HELD',
            status: 'success',
            color: '#00ff66',
            dotClass: 'bg-[#00ff66]',
          };
        case 'motor':
          return {
            badge: 'MOTOR: EXPENDED (SUCCESS)',
            detail: 'FULL IMPULSE DELIVERED',
            status: 'success',
            color: '#00ff66',
            dotClass: 'bg-[#00ff66]',
          };
        default:
          return {
            badge: 'NOMINAL',
            detail: 'STANDBY',
            status: 'success',
            color: '#00ff66',
            dotClass: 'bg-[#00ff66]',
          };
      }
    }

    if (jetDestroyed) {
      switch (nodeKey) {
        case 'seeker':
          return {
            badge: 'SEEKER: LOSS OF LOCK',
            detail: 'TARGET EVASION DETECTED',
            status: 'danger',
            color: '#ff2a55',
            dotClass: 'bg-[#ff2a55] shadow-[0_0_8px_#ff2a55]',
          };
        case 'dacs':
          return {
            badge: 'DACS: EXHAUSTED',
            detail: 'MAX DIVERGENT G EXCEEDED',
            status: 'danger',
            color: '#ff2a55',
            dotClass: 'bg-[#ff2a55]',
          };
        case 'ai':
          return {
            badge: 'AI SOC: TARGET BYPASS',
            detail: 'OFF-BORESIGHT EXCURSION',
            status: 'danger',
            color: '#ff2a55',
            dotClass: 'bg-[#ff2a55]',
          };
        case 'casing':
          return {
            badge: 'HULL: INTEGRITY OK',
            detail: 'PEAK LOAD 32.4g RECORDED',
            status: 'danger',
            color: '#ffb703',
            dotClass: 'bg-[#ffb703]',
          };
        case 'motor':
          return {
            badge: 'MOTOR: BURNOUT',
            detail: '0 kN RESIDUAL THRUST',
            status: 'muted',
            color: '#6e8bb3',
            dotClass: 'bg-[#6e8bb3]',
          };
        default:
          return {
            badge: 'FAILURE',
            detail: 'DISENGAGED',
            status: 'danger',
            color: '#ff2a55',
            dotClass: 'bg-[#ff2a55]',
          };
      }
    }

    if (interceptorActive) {
      switch (nodeKey) {
        case 'seeker':
          return {
            badge: 'SEEKER: LOCKED',
            detail: '35.0 GHz MONOPULSE ACTIVE',
            status: 'active-cyan',
            color: '#00e5ff',
            dotClass: 'bg-[#00e5ff] animate-ping',
          };
        case 'dacs':
          return {
            badge: 'DACS: FIRING',
            detail: 'LATERAL PULSE DIVERT ENGAGED',
            status: 'active-amber',
            color: '#ffb703',
            dotClass: 'bg-[#ffb703] animate-pulse',
          };
        case 'ai':
          return {
            badge: 'AI SOC: APN PURSUIT',
            detail: '1,200 Hz HOMING ITERATION',
            status: 'active-cyan',
            color: '#00e5ff',
            dotClass: 'bg-[#00e5ff]',
          };
        case 'casing':
          return {
            badge: 'HULL: INTEGRITY OK',
            detail: '24.6g DYNAMIC LOAD OK',
            status: 'active-green',
            color: '#00ff66',
            dotClass: 'bg-[#00ff66]',
          };
        case 'motor':
          return {
            badge: 'MOTOR: IGNITED',
            detail: '18.4 kN PEAK BOOST ACTIVE',
            status: 'active-orange',
            color: '#ff7700',
            dotClass: 'bg-[#ff7700] animate-pulse',
          };
        default:
          return {
            badge: 'ACTIVE',
            detail: 'PURSUIT MODE',
            status: 'active-green',
            color: '#00ff66',
            dotClass: 'bg-[#00ff66]',
          };
      }
    }

    // Default standby status
    switch (nodeKey) {
      case 'seeker':
        return {
          badge: 'SEEKER: STANDBY',
          detail: 'AESA CALIBRATED',
          status: 'ready',
          color: '#00ff66',
          dotClass: 'bg-[#00ff66]',
        };
      case 'dacs':
        return {
          badge: 'DACS: READY',
          detail: '4,800 PSI CHARGED',
          status: 'ready',
          color: '#00ff66',
          dotClass: 'bg-[#00ff66]',
        };
      case 'ai':
        return {
          badge: 'AI SOC: ONLINE',
          detail: 'KALMAN READY (99.8%)',
          status: 'ready',
          color: '#00e5ff',
          dotClass: 'bg-[#00e5ff]',
        };
      case 'casing':
        return {
          badge: 'HULL: INTEGRITY OK',
          detail: '30g TOLERANCE CERTIFIED',
          status: 'ready',
          color: '#00ff66',
          dotClass: 'bg-[#00ff66]',
        };
      case 'motor':
        return {
          badge: 'MOTOR: ARMED',
          detail: 'HTPB GRAIN TEMP 21°C',
          status: 'ready',
          color: '#00ff66',
          dotClass: 'bg-[#00ff66]',
        };
      default:
        return {
          badge: 'STANDBY',
          detail: 'READY',
          status: 'ready',
          color: '#00ff66',
          dotClass: 'bg-[#00ff66]',
        };
    }
  };

  const currentHealth = getSubsystemHealth(selectedNode);

  // Hotspot pin list strictly covering the 5 requested subsystems
  // Normalized percentage coordinates relative to the 680x210 viewBox
  const HOTSPOT_PINS: Array<{
    key: BlueprintNodeKey;
    label: string;
    pinNumber: number;
    pinLeftPercent: string;
    pinTopPercent: string;
    title: string;
    color: string;
  }> = [
    {
      key: 'seeker',
      label: 'SEEKER / RADOME',
      pinNumber: 1,
      pinLeftPercent: '88%',
      pinTopPercent: '50%',
      title: 'Seeker / Radome (Silicon Nitride / Ka-Band MMW)',
      color: '#00e5ff',
    },
    {
      key: 'dacs',
      label: 'MINI-DACS THRUSTERS',
      pinNumber: 2,
      pinLeftPercent: '76%',
      pinTopPercent: '34%',
      title: 'Mini-DACS Thrusters (Forward Ring / Rapid Attitude Control)',
      color: '#ffb703',
    },
    {
      key: 'ai',
      label: 'AI GUIDANCE SOC',
      pinNumber: 3,
      pinLeftPercent: '64%',
      pinTopPercent: '50%',
      title: 'AI Guidance SoC (Shock-mounted Trajectory Computer)',
      color: '#00e5ff',
    },
    {
      key: 'casing',
      label: 'CARBON CASING',
      pinNumber: 4,
      pinLeftPercent: '46%',
      pinTopPercent: '66%',
      title: 'Carbon Composite Casing (Filament-wound 30g structural tolerance)',
      color: '#00ff66',
    },
    {
      key: 'motor',
      label: 'SOLID MOTOR',
      pinNumber: 5,
      pinLeftPercent: '22%',
      pinTopPercent: '50%',
      title: 'Solid Motor (HTPB Propellant Engine)',
      color: '#ff7700',
    },
  ];

  // Render SVG Cutaway Wireframe
  const renderCutawaySVG = (isEnlarged = false) => (
    <svg
      viewBox="0 0 680 210"
      className={`w-full h-full relative z-10 transition-transform duration-300 filter drop-shadow-[0_0_10px_rgba(0,229,255,0.45)]`}
      style={{
        transform: !isEnlarged && zoomLevel > 1 ? `scale(${zoomLevel}) translateX(${panX}px)` : undefined,
      }}
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="bodyCutawayGradLarge" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#09182d" />
          <stop offset="35%" stopColor="#122a4d" />
          <stop offset="70%" stopColor="#18365f" />
          <stop offset="90%" stopColor="#1f4b82" />
          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.85" />
        </linearGradient>

        <linearGradient id="motorGrainGradLarge" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2e1405" />
          <stop offset="40%" stopColor="#66330b" />
          <stop offset="80%" stopColor="#a34a0a" />
          <stop offset="100%" stopColor="#d96614" />
        </linearGradient>

        <linearGradient id="starCoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffb703" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#ff7700" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffee55" stopOpacity="0.8" />
        </linearGradient>

        <linearGradient id="carbonCasingGradLarge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#081423" />
          <stop offset="50%" stopColor="#102540" />
          <stop offset="100%" stopColor="#0c1b2f" />
        </linearGradient>

        <linearGradient id="radomeGlowGradLarge" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#193c68" />
          <stop offset="55%" stopColor="#255e96" />
          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.95" />
        </linearGradient>

        <pattern id="carbonWeaveLarge" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M 0 3 L 6 3 M 3 0 L 3 6" stroke="#00e5ff" strokeWidth="0.7" opacity="0.22" />
        </pattern>

        <pattern id="cutawayHatchLarge" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 0 8 L 8 0 M -2 2 L 2 -2 M 6 10 L 10 6" stroke="#00e5ff" strokeWidth="0.75" opacity="0.28" />
        </pattern>
      </defs>

      {/* Centerline Reference */}
      <line
        x1="20"
        y1="110"
        x2="655"
        y2="110"
        stroke="#00e5ff"
        strokeWidth="1"
        strokeDasharray="10,4,2,4"
        opacity="0.5"
      />

      {/* Dimension Line & Measurement Callout at Bottom */}
      <line x1="45" y1="192" x2="635" y2="192" stroke="#255288" strokeWidth="1.2" strokeDasharray="4,4" />
      <line x1="45" y1="186" x2="45" y2="198" stroke="#00e5ff" strokeWidth="1.5" />
      <line x1="635" y1="186" x2="635" y2="198" stroke="#00e5ff" strokeWidth="1.5" />
      <text
        x="340"
        y="203"
        fill="#77a5dc"
        fontSize="10"
        fontWeight="bold"
        fontFamily="'JetBrains Mono', monospace"
        textAnchor="middle"
        letterSpacing="0.8"
      >
        OVERALL LENGTH: 1.80 METERS // CALIBER: 160 MM // MASS: 14.2 KG
      </text>

      {/* 1. TAIL SECTION & EXHAUST NOZZLE (X: 18 - 50) */}
      <path
        d="M 18 90 L 50 96 L 50 124 L 18 130 Z"
        fill="#0b1726"
        stroke={selectedNode === 'motor' ? '#ff7700' : '#00e5ff'}
        strokeWidth={selectedNode === 'motor' ? '2' : '1.3'}
      />
      {/* Tungsten Throat Ring */}
      <line x1="28" y1="92" x2="28" y2="128" stroke="#ff7700" strokeWidth="1.8" opacity="0.9" />

      {/* Dynamic Motor Rocket Plume (when interceptor is ignited) */}
      {interceptorActive && !jetDestroyed && (
        <g className="animate-pulse">
          <polygon points="18,97 -15,110 18,123" fill="#ff7700" opacity="0.85" />
          <polygon points="18,102 0,110 18,118" fill="#ffe100" opacity="0.95" />
        </g>
      )}

      {/* Titanium Grid Fins (Top and Bottom) */}
      <polygon
        points="50,96 15,48 72,56 86,96"
        fill="#091728"
        stroke="#00e5ff"
        strokeWidth="1.4"
        opacity="0.9"
      />
      <polygon
        points="50,124 15,172 72,164 86,124"
        fill="#091728"
        stroke="#00e5ff"
        strokeWidth="1.4"
        opacity="0.9"
      />
      {/* Grid Fin Internal Matrix */}
      <line x1="36" y1="68" x2="62" y2="78" stroke="#00e5ff" strokeWidth="0.9" opacity="0.75" />
      <line x1="36" y1="152" x2="62" y2="142" stroke="#00e5ff" strokeWidth="0.9" opacity="0.75" />

      {/* 2. SOLID ROCKET MOTOR CUTAWAY (X: 50 - 230) */}
      <rect
        x="50"
        y="82"
        width="180"
        height="56"
        fill="url(#motorGrainGradLarge)"
        stroke={selectedNode === 'motor' ? '#ff7700' : '#00e5ff'}
        strokeWidth={selectedNode === 'motor' ? '2.4' : '1.5'}
        rx="2"
      />
      {/* Propellant Star-Grain Geometry Core */}
      <path
        d="M 52 110 L 75 102 L 105 110 L 135 102 L 165 110 L 195 102 L 225 110 L 195 118 L 165 110 L 135 118 L 105 110 L 75 118 Z"
        fill="url(#starCoreGrad)"
        stroke="#ffaa00"
        strokeWidth="1"
        opacity="0.85"
      />
      {/* Grain Chamber Internal Rings */}
      <line x1="88" y1="82" x2="88" y2="138" stroke="#ffaa00" strokeWidth="1" opacity="0.5" />
      <line x1="130" y1="82" x2="130" y2="138" stroke="#ffaa00" strokeWidth="1" opacity="0.5" />
      <line x1="172" y1="82" x2="172" y2="138" stroke="#ffaa00" strokeWidth="1" opacity="0.5" />
      <line x1="214" y1="82" x2="214" y2="138" stroke="#ffaa00" strokeWidth="1" opacity="0.5" />
      {/* Igniter Squib */}
      <circle cx="224" cy="110" r="4.5" fill="#ff7700" stroke="#fff" strokeWidth="0.8" />

      {/* Leader Callout: Motor */}
      <polyline points="140,82 140,44 75,44" fill="none" stroke="#ff7700" strokeWidth="1.2" strokeDasharray="3,2" />
      <circle cx="140" cy="82" r="2.5" fill="#ff7700" />
      <rect x="25" y="32" width="115" height="18" fill="#140902" stroke="#ff7700" strokeWidth="1" rx="2" />
      <text x="82" y="45" fill="#ff9933" fontSize="8.5" fontFamily="'JetBrains Mono'" fontWeight="bold" textAnchor="middle">
        5. SOLID MOTOR (18.4kN)
      </text>

      {/* Inter-Stage Titanium Bulkhead Ring (X: 230 - 240) */}
      <rect x="230" y="80" width="10" height="60" fill="#1e3b63" stroke="#00e5ff" strokeWidth="1.3" rx="1" />

      {/* 3. CARBON COMPOSITE CASING MID-AIRFRAME (X: 240 - 390) */}
      <rect
        x="240"
        y="82"
        width="150"
        height="56"
        fill="url(#carbonCasingGradLarge)"
        stroke={selectedNode === 'casing' ? '#00ff66' : '#00e5ff'}
        strokeWidth={selectedNode === 'casing' ? '2.4' : '1.5'}
        rx="2"
      />
      {/* Carbon Fiber Texture Overlay */}
      <rect x="240" y="82" width="150" height="56" fill="url(#carbonWeaveLarge)" />
      {/* 30G Structural Rib Stiffeners */}
      <line x1="275" y1="82" x2="275" y2="138" stroke="#00ff66" strokeWidth="1.3" opacity="0.75" />
      <line x1="315" y1="82" x2="315" y2="138" stroke="#00ff66" strokeWidth="1.3" opacity="0.75" />
      <line x1="355" y1="82" x2="355" y2="138" stroke="#00ff66" strokeWidth="1.3" opacity="0.75" />
      <text x="315" y="114" fill="#00ff66" fontSize="9" fontWeight="bold" fontFamily="'JetBrains Mono'" textAnchor="middle" opacity="0.85">
        [30G RATED HULL]
      </text>

      {/* Mid-Body Canard Control Fins (X: 370) */}
      <polygon points="375,82 345,58 385,68 395,82" fill="#0c1e33" stroke="#00e5ff" strokeWidth="1.2" />
      <polygon points="375,138 345,162 385,152 395,138" fill="#0c1e33" stroke="#00e5ff" strokeWidth="1.2" />

      {/* Leader Callout: Carbon Casing */}
      <polyline points="315,138 315,174 250,174" fill="none" stroke="#00ff66" strokeWidth="1.2" strokeDasharray="3,2" />
      <circle cx="315" cy="138" r="2.5" fill="#00ff66" />
      <rect x="210" y="165" width="110" height="18" fill="#02140a" stroke="#00ff66" strokeWidth="1" rx="2" />
      <text x="265" y="178" fill="#00ff66" fontSize="8.5" fontFamily="'JetBrains Mono'" fontWeight="bold" textAnchor="middle">
        4. CARBON CASING (30G)
      </text>

      {/* 4. AI GUIDANCE SYSTEM-ON-CHIP BAY (X: 390 - 490) */}
      <rect
        x="390"
        y="82"
        width="100"
        height="56"
        fill="#07172b"
        stroke={selectedNode === 'ai' ? '#00e5ff' : '#1d4878'}
        strokeWidth={selectedNode === 'ai' ? '2.4' : '1.5'}
        rx="2"
      />
      {/* Shock Suspension Coils */}
      <path d="M 393 86 L 400 94 L 393 102 L 400 110 L 393 118 L 400 126 L 393 134" fill="none" stroke="#00e5ff" strokeWidth="1.2" opacity="0.8" />
      <path d="M 487 86 L 480 94 L 487 102 L 480 110 L 487 118 L 480 126 L 487 134" fill="none" stroke="#00e5ff" strokeWidth="1.2" opacity="0.8" />
      {/* Central AI Processor Micro-Die with circuit traces */}
      <rect x="410" y="90" width="60" height="40" fill="#0d2e54" stroke="#00e5ff" strokeWidth="1.5" rx="3" />
      <circle cx="425" cy="110" r="3.5" fill="#00e5ff" className="animate-pulse" />
      <circle cx="455" cy="110" r="3.5" fill="#00ff66" />
      <line x1="425" y1="110" x2="455" y2="110" stroke="#00e5ff" strokeWidth="1.2" strokeDasharray="3,3" />
      <text x="440" y="125" fill="#88c0f7" fontSize="7.5" fontFamily="'JetBrains Mono'" textAnchor="middle">
        APN 1200Hz
      </text>

      {/* Leader Callout: AI SoC */}
      <polyline points="440,82 440,44 485,44" fill="none" stroke="#00e5ff" strokeWidth="1.2" strokeDasharray="3,2" />
      <circle cx="440" cy="82" r="2.5" fill="#00e5ff" />
      <rect x="480" y="32" width="115" height="18" fill="#041324" stroke="#00e5ff" strokeWidth="1" rx="2" />
      <text x="537" y="45" fill="#00e5ff" fontSize="8.5" fontFamily="'JetBrains Mono'" fontWeight="bold" textAnchor="middle">
        3. AI GUIDANCE SOC
      </text>

      {/* 5. MINI-DACS FORWARD THRUSTER COLLAR (X: 490 - 550) */}
      <rect
        x="490"
        y="76"
        width="60"
        height="68"
        fill="#142c4c"
        stroke={selectedNode === 'dacs' ? '#ffb703' : '#ffb703'}
        strokeWidth={selectedNode === 'dacs' ? '2.5' : '1.5'}
        rx="2"
      />
      {/* Upper Divert Nozzles */}
      <polygon points="498,76 504,66 514,66 520,76" fill="#ffb703" stroke="#ffb703" strokeWidth="1" />
      <polygon points="526,76 532,66 542,66 548,76" fill="#ffb703" stroke="#ffb703" strokeWidth="1" />
      {/* Lower Divert Nozzles */}
      <polygon points="498,144 504,154 514,154 520,144" fill="#ffb703" stroke="#ffb703" strokeWidth="1" />
      <polygon points="526,144 532,154 542,154 548,144" fill="#ffb703" stroke="#ffb703" strokeWidth="1" />
      {/* Titanium Manifold Solenoid Centerline */}
      <line x1="520" y1="76" x2="520" y2="144" stroke="#ffb703" strokeWidth="1.4" strokeDasharray="3,3" />

      {/* DACS Attitude Firing Animation */}
      {interceptorActive && !jetDestroyed && (
        <g className="animate-pulse">
          <polygon points="509,66 506,54 512,54" fill="#ffb703" opacity="0.95" />
          <polygon points="537,66 534,54 540,54" fill="#ffb703" opacity="0.95" />
          <polygon points="509,154 506,166 512,166" fill="#ffb703" opacity="0.95" />
          <polygon points="537,154 534,166 540,166" fill="#ffb703" opacity="0.95" />
        </g>
      )}

      {/* Leader Callout: DACS */}
      <polyline points="520,144 520,174 460,174" fill="none" stroke="#ffb703" strokeWidth="1.2" strokeDasharray="3,2" />
      <circle cx="520" cy="144" r="2.5" fill="#ffb703" />
      <rect x="420" y="165" width="105" height="18" fill="#191102" stroke="#ffb703" strokeWidth="1" rx="2" />
      <text x="472" y="178" fill="#ffb703" fontSize="8.5" fontFamily="'JetBrains Mono'" fontWeight="bold" textAnchor="middle">
        2. MINI-DACS (8-RING)
      </text>

      {/* 6. SEEKER / RADOME ASSEMBLY OGIVE NOSE (X: 550 - 640) */}
      <path
        d="M 550 82 C 585 82 625 96 640 110 C 625 124 585 138 550 138 Z"
        fill="url(#radomeGlowGradLarge)"
        stroke={selectedNode === 'seeker' ? '#00e5ff' : '#00e5ff'}
        strokeWidth={selectedNode === 'seeker' ? '2.5' : '1.6'}
      />
      {/* Internal Planar AESA Antenna Disc */}
      <line x1="570" y1="88" x2="570" y2="132" stroke="#ffffff" strokeWidth="2.2" />
      <circle cx="570" cy="110" r="2.5" fill="#00e5ff" />
      {/* Waveguide Feed */}
      <path d="M 552 110 L 568 110" stroke="#00e5ff" strokeWidth="1.5" />
      {/* Radome Nose Apex Tip */}
      <circle cx="640" cy="110" r="3.5" fill="#00e5ff" stroke="#fff" strokeWidth="1" />

      {/* Seeker Active RF Wave Emissions */}
      {interceptorActive && !jetDestroyed && (
        <g className="animate-pulse">
          <path d="M 645 102 C 655 106 655 114 645 118" fill="none" stroke="#00e5ff" strokeWidth="1.5" />
          <path d="M 652 95 C 668 102 668 118 652 125" fill="none" stroke="#00e5ff" strokeWidth="1.5" strokeDasharray="3,3" />
        </g>
      )}

      {/* Leader Callout: Seeker */}
      <polyline points="595,82 595,44 635,44" fill="none" stroke="#00e5ff" strokeWidth="1.2" strokeDasharray="3,2" />
      <circle cx="595" cy="82" r="2.5" fill="#00e5ff" />
      <rect x="560" y="32" width="112" height="18" fill="#031626" stroke="#00e5ff" strokeWidth="1" rx="2" />
      <text x="616" y="45" fill="#00e5ff" fontSize="8.5" fontFamily="'JetBrains Mono'" fontWeight="bold" textAnchor="middle">
        1. MMW SEEKER (Si3N4)
      </text>

      {/* Cutaway Hatch Texture on upper & lower walls */}
      <rect x="50" y="82" width="500" height="6" fill="url(#cutawayHatchLarge)" />
      <rect x="50" y="132" width="500" height="6" fill="url(#cutawayHatchLarge)" />
    </svg>
  );

  return (
    <div className="hud-panel corner-bracket rounded-lg p-3.5 flex flex-col select-none flex-1 min-h-[480px]">
      {/* Header with Title and Control Action Buttons */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#142642] mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#00e5ff]/10 text-[#00e5ff]">
            <Crosshair className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-hud font-bold tracking-wider text-white flex items-center gap-2">
              INTERCEPTOR SCHEMATIC (1.8M)
              <span className="text-[9px] font-mono-tech px-1.5 py-0.2 rounded bg-[#00ff66]/15 text-[#00ff66] border border-[#00ff66]/30">
                SCALE 1:15
              </span>
            </h2>
            <span className="text-[9px] font-mono-tech text-[#688eb6]">
              SINGLE-BODY KINETIC INTERCEPTOR // HIGH-RES CUTAWAY
            </span>
          </div>
        </div>

        {/* Viewport Control Bar: Zoom In, Zoom Out, Reset, Fullscreen */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-[#050d1a] border border-[#142a48] rounded p-0.5">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-1 text-[#6b95c2] hover:text-[#00e5ff] disabled:opacity-30 disabled:hover:text-[#6b95c2] cursor-pointer rounded hover:bg-[#00e5ff]/10 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[9px] font-mono-tech px-1 text-[#85a9d2] min-w-[34px] text-center font-bold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2.4}
              className="p-1 text-[#6b95c2] hover:text-[#00e5ff] disabled:opacity-30 disabled:hover:text-[#6b95c2] cursor-pointer rounded hover:bg-[#00e5ff]/10 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoomLevel > 1 && (
              <button
                onClick={handleResetZoom}
                className="p-1 text-[#ffb703] hover:text-white cursor-pointer rounded hover:bg-[#ffb703]/10 transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Enlarge / Fullscreen Modal Button */}
          <button
            onClick={() => {
              setIsModalOpen(true);
              playBeep(1300, 'sine', 0.05, audioEnabled);
            }}
            className="flex items-center gap-1 text-[10px] font-mono-tech text-[#00e5ff] bg-[#00e5ff]/15 hover:bg-[#00e5ff]/25 border border-[#00e5ff]/40 px-2 py-1 rounded transition-all cursor-pointer shadow-[0_0_8px_rgba(0,229,255,0.2)]"
            title="Expand to Fullscreen Blueprint Modal"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="font-bold">ENLARGE</span>
          </button>
        </div>
      </div>

      {/* Blueprint Viewport & Cutaway Schematic Wireframe (LARGE & PROMINENT) */}
      <div className="relative w-full h-64 sm:h-72 rounded-lg bg-[#020610] border-2 border-[#16355d] overflow-hidden flex items-center justify-center p-2 group shadow-[inset_0_0_28px_rgba(0,12,32,0.9)]">
        {/* Engineering Blueprint Grid Background */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#00e5ff 1px, transparent 1px), linear-gradient(90deg, #00e5ff 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Diagonal Blueprint Watermark & Measurement Legend */}
        <div className="absolute top-2 left-3 z-10 pointer-events-none flex items-center gap-2 text-[9px] font-mono-tech text-[#416896]">
          <span>CAD-WIRE // KIN-1800</span>
          <span>|</span>
          <span>CALIBER: 160MM</span>
          <span>|</span>
          <span>ORTHO PROJECTION</span>
        </div>

        <div className="absolute bottom-2 left-3 z-10 pointer-events-none flex items-center gap-2 text-[9px] font-mono-tech text-[#416896]">
          <span>DATUM A: NOSE APEX (0.00m)</span>
          <span>|</span>
          <span>DATUM B: EXHAUST EXIT (1.80m)</span>
        </div>

        {/* The Detailed SVG */}
        {renderCutawaySVG(false)}

        {/* 5 INTERACTIVE SUBSYSTEM HOTSPOT PINS (OVERLAY) */}
        {HOTSPOT_PINS.map((pin) => {
          const isSelected = selectedNode === pin.key;
          const pinHealth = getSubsystemHealth(pin.key);

          return (
            <button
              key={pin.key}
              type="button"
              onClick={() => handleSelectNode(pin.key)}
              onMouseEnter={() => handleSelectNode(pin.key)}
              style={{
                left: pin.pinLeftPercent,
                top: pin.pinTopPercent,
                transform: `translate(-50%, -50%) ${
                  zoomLevel > 1 ? `translateX(${panX * (zoomLevel - 1)}px)` : ''
                }`,
              }}
              className="absolute z-20 cursor-pointer p-2 group/pin outline-none focus:outline-none transition-transform duration-200"
              aria-label={`Inspect ${pin.title}`}
              title={`${pin.pinNumber}. ${pin.title} - Click or hover to inspect`}
            >
              {/* Pulsing Beacon Wave */}
              <span
                className={`absolute w-8 h-8 -top-1 -left-1 rounded-full pointer-events-none transition-opacity ${
                  isSelected ? 'animate-ping opacity-80' : 'opacity-35 group-hover/pin:opacity-70'
                }`}
                style={{ backgroundColor: pin.color }}
              />

              {/* Pin Core Button */}
              <div
                className={`relative w-6 h-6 rounded-full bg-[#050f1d] border-2 flex items-center justify-center text-[11px] font-mono-tech font-bold transition-all duration-200 ${
                  isSelected
                    ? 'scale-125 shadow-[0_0_16px_rgba(0,229,255,0.9)] z-30'
                    : 'scale-100 hover:scale-115 opacity-90 hover:opacity-100'
                }`}
                style={{
                  borderColor: isSelected ? pin.color : `${pin.color}99`,
                  color: isSelected ? '#ffffff' : pin.color,
                }}
              >
                {pin.pinNumber}

                {/* Subsystem Health Live Dot Indicator on Pin */}
                <span
                  className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-[#040914] ${pinHealth.dotClass}`}
                />
              </div>

              {/* Floating Pin Label Tooltip on hover/active */}
              <div
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 rounded text-[9px] font-mono-tech tracking-wider whitespace-nowrap pointer-events-none transition-all duration-150 ${
                  isSelected
                    ? 'opacity-100 bg-[#07162d] border border-[#00e5ff] text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.5)]'
                    : 'opacity-0 group-hover/pin:opacity-100 bg-[#060e1d]/95 border border-[#173359] text-[#8cb1da]'
                }`}
              >
                {pin.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* 5-Subsystem Quick Selector Nav Tabs with Live Health Badges */}
      <div className="grid grid-cols-5 gap-1.5 my-2.5">
        {HOTSPOT_PINS.map((pin) => {
          const isSelected = selectedNode === pin.key;
          const pinHealth = getSubsystemHealth(pin.key);

          return (
            <button
              key={pin.key}
              onClick={() => handleSelectNode(pin.key)}
              className={`px-1.5 py-1.5 rounded text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 border ${
                isSelected
                  ? 'bg-[#0c2444] border-[#00e5ff] text-white shadow-[0_0_8px_rgba(0,229,255,0.3)]'
                  : 'bg-[#050d1a] border-[#132744] text-[#6388b0] hover:text-[#9ec4eb] hover:bg-[#071324]'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono-tech font-bold">#{pin.pinNumber}</span>
                <span className={`w-2 h-2 rounded-full ${pinHealth.dotClass}`} />
              </div>
              <span className="text-[8.5px] font-mono-tech truncate max-w-full font-bold tracking-tight">
                {pin.key.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>

      {/* DYNAMIC SPEC INSPECTOR: Glassmorphism Spec Card Directly Beneath */}
      <div className="relative rounded-lg p-3 font-mono-tech backdrop-blur-md bg-[#050d1c]/90 border border-[#1b3e6b]/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_4px_16px_rgba(0,0,0,0.6)] flex flex-col justify-between flex-1">
        {/* Card Header & Live Subsystem Health Badge */}
        <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#142d50]">
          <div>
            <div className="flex items-center gap-2">
              {currentSpec.iconName === 'seeker' && <Radio className="w-4 h-4 text-[#00e5ff]" />}
              {currentSpec.iconName === 'dacs' && <Zap className="w-4 h-4 text-[#ffb703]" />}
              {currentSpec.iconName === 'ai' && <Cpu className="w-4 h-4 text-[#00e5ff]" />}
              {currentSpec.iconName === 'casing' && <ShieldCheck className="w-4 h-4 text-[#00ff66]" />}
              {currentSpec.iconName === 'motor' && <Flame className="w-4 h-4 text-[#ff7700]" />}
              <span className="text-xs font-bold text-white tracking-wide">
                {currentSpec.subsystemName}
              </span>
            </div>
            <span className="text-[9.5px] text-[#00e5ff] font-bold block mt-0.5">
              {currentSpec.code}
            </span>
          </div>

          {/* Live Subsystem Health Badge */}
          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border ${
                currentHealth.status === 'success'
                  ? 'bg-[#00ff66]/15 text-[#00ff66] border-[#00ff66]/40 shadow-[0_0_8px_rgba(0,255,102,0.3)]'
                  : currentHealth.status === 'danger'
                  ? 'bg-[#ff2a55]/15 text-[#ff2a55] border-[#ff2a55]/40 shadow-[0_0_8px_rgba(255,42,85,0.3)] animate-pulse'
                  : currentHealth.status === 'active-amber'
                  ? 'bg-[#ffb703]/20 text-[#ffb703] border-[#ffb703]/50 shadow-[0_0_8px_rgba(255,183,3,0.3)] animate-pulse'
                  : currentHealth.status === 'active-orange'
                  ? 'bg-[#ff7700]/20 text-[#ff7700] border-[#ff7700]/50 shadow-[0_0_8px_rgba(255,119,0,0.3)] animate-pulse'
                  : currentHealth.status === 'active-cyan'
                  ? 'bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff]/50 shadow-[0_0_8px_rgba(0,229,255,0.3)] animate-pulse'
                  : 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${currentHealth.dotClass}`} />
              {currentHealth.badge}
            </span>
            <div className="text-[8.5px] text-[#6387af] mt-0.5">{currentHealth.detail}</div>
          </div>
        </div>

        {/* Selected Engineering Material */}
        <div className="my-2 p-2 rounded bg-[#030914]/90 border border-[#142c4c]">
          <div className="text-[9px] text-[#557eab] uppercase tracking-wider mb-0.5 flex items-center justify-between font-bold">
            <span>SELECTED ENGINEERING MATERIAL</span>
            <span className="text-[#00ff66]">100% FLIGHT CERTIFIED</span>
          </div>
          <div className="text-xs font-bold text-white leading-snug">
            {currentSpec.engineeringMaterial}
          </div>
        </div>

        {/* High-Altitude Performance Role */}
        <div className="mb-2 p-2 rounded bg-[#030914]/90 border border-[#142c4c]">
          <div className="text-[9px] text-[#557eab] uppercase tracking-wider mb-0.5 flex items-center justify-between font-bold">
            <span>HIGH-ALTITUDE PERFORMANCE ROLE</span>
            <span className="text-[#00e5ff] text-[8.5px]">{currentSpec.altitudeBand}</span>
          </div>
          <p className="text-[10.5px] text-[#8db1da] leading-relaxed">
            {currentSpec.highAltitudeRole}
          </p>
        </div>

        {/* Technical Specs Key-Value Matrix */}
        <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#122744]">
          {Object.entries(currentSpec.specs).map(([key, val]) => (
            <div
              key={key}
              className="p-1.5 rounded bg-[#040c19] border border-[#11243e] flex flex-col justify-between"
            >
              <span className="text-[8.5px] text-[#5277a1] uppercase truncate">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-[10.5px] font-bold text-[#b6d5f7] truncate">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* EXPANDED BLUEPRINT MODAL (CINEMATIC FULL-WIDTH INSPECTION) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#010611]/90 backdrop-blur-md flex items-center justify-center p-4 lg:p-8 animate-fadeIn">
          <div className="relative w-full max-w-5xl bg-[#030a17] border-2 border-[#00e5ff]/60 rounded-xl p-5 shadow-[0_0_50px_rgba(0,229,255,0.25)] flex flex-col max-h-[92vh] overflow-y-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#142f56] mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-hud font-bold tracking-wider text-white flex items-center gap-2">
                    1.8M SINGLE-BODY KINETIC INTERCEPTOR // HIGH-RES ENGINEERING CAD
                    <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/40">
                      LIVE CAD VIEW
                    </span>
                  </h2>
                  <span className="text-xs font-mono-tech text-[#6b92be]">
                    Direct kinetic kill vehicle // 1:15 scale orthogonal cutaway wireframe
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded bg-[#0a182d] hover:bg-[#ff2a55]/20 text-[#6d94c0] hover:text-[#ff2a55] border border-[#17345b] hover:border-[#ff2a55]/50 transition-colors cursor-pointer"
                title="Close Enlarged View"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Massive Blueprint Cutaway Canvas */}
            <div className="relative w-full h-80 sm:h-96 rounded-xl bg-[#02050e] border border-[#1b3d68] overflow-hidden flex items-center justify-center p-3 mb-4 shadow-[inset_0_0_40px_rgba(0,15,40,0.95)]">
              {/* Grid Background */}
              <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(#00e5ff 1px, transparent 1px), linear-gradient(90deg, #00e5ff 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Watermarks */}
              <div className="absolute top-3 left-4 z-10 pointer-events-none flex items-center gap-3 text-[10px] font-mono-tech text-[#4a72a0]">
                <span>CAD-WIRE // KIN-1800-4K</span>
                <span>|</span>
                <span>CALIBER: 160MM</span>
                <span>|</span>
                <span>BOOST: 18.4kN</span>
                <span>|</span>
                <span>ALTITUDE: 45KM</span>
              </div>

              {/* Render Cutaway SVG */}
              {renderCutawaySVG(true)}

              {/* Interactive Hotspot Pins (Modal Size) */}
              {HOTSPOT_PINS.map((pin) => {
                const isSelected = selectedNode === pin.key;
                const pinHealth = getSubsystemHealth(pin.key);

                return (
                  <button
                    key={pin.key}
                    type="button"
                    onClick={() => handleSelectNode(pin.key)}
                    style={{
                      left: pin.pinLeftPercent,
                      top: pin.pinTopPercent,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className="absolute z-20 cursor-pointer p-2 group/pin outline-none focus:outline-none"
                    aria-label={`Inspect ${pin.title}`}
                  >
                    <span
                      className={`absolute w-9 h-9 -top-1 -left-1 rounded-full pointer-events-none transition-opacity ${
                        isSelected ? 'animate-ping opacity-85' : 'opacity-40 group-hover/pin:opacity-75'
                      }`}
                      style={{ backgroundColor: pin.color }}
                    />
                    <div
                      className={`relative w-7 h-7 rounded-full bg-[#050f1d] border-2 flex items-center justify-center text-xs font-mono-tech font-bold transition-all duration-200 ${
                        isSelected
                          ? 'scale-125 shadow-[0_0_20px_rgba(0,229,255,0.9)] z-30'
                          : 'scale-100 hover:scale-115 opacity-90 hover:opacity-100'
                      }`}
                      style={{
                        borderColor: isSelected ? pin.color : `${pin.color}99`,
                        color: isSelected ? '#ffffff' : pin.color,
                      }}
                    >
                      {pin.pinNumber}
                      <span
                        className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-[#040914] ${pinHealth.dotClass}`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Subsystem Selector Buttons & Full Specs Grid in Modal */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {HOTSPOT_PINS.map((pin) => {
                const isSelected = selectedNode === pin.key;
                const pinHealth = getSubsystemHealth(pin.key);

                return (
                  <button
                    key={pin.key}
                    onClick={() => handleSelectNode(pin.key)}
                    className={`p-2 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 border ${
                      isSelected
                        ? 'bg-[#0f2c52] border-[#00e5ff] text-white shadow-[0_0_10px_rgba(0,229,255,0.35)]'
                        : 'bg-[#050e1b] border-[#162c4b] text-[#6d92bc] hover:text-white hover:bg-[#09172c]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono-tech font-bold">NODE {pin.pinNumber}</span>
                      <span className={`w-2 h-2 rounded-full ${pinHealth.dotClass}`} />
                    </div>
                    <span className="text-[10px] font-mono-tech font-bold tracking-tight truncate max-w-full">
                      {pin.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Comprehensive Detail Sheet for the Selected Subsystem */}
            <div className="p-4 rounded-lg bg-[#040c19] border border-[#16355d] grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-white font-hud">
                    {currentSpec.subsystemName}
                  </span>
                  <span className="text-[10px] font-mono-tech text-[#00e5ff] bg-[#00e5ff]/15 px-2 py-0.5 rounded border border-[#00e5ff]/40">
                    {currentSpec.code}
                  </span>
                </div>
                <p className="text-xs text-[#8cb1da] font-mono-tech leading-relaxed mb-3">
                  {currentSpec.desc}
                </p>

                <div className="p-2.5 rounded bg-[#061122] border border-[#132d4e] mb-2 font-mono-tech">
                  <span className="text-[9px] text-[#5580af] uppercase block font-bold mb-0.5">
                    SELECTED ENGINEERING MATERIAL
                  </span>
                  <span className="text-xs text-white font-bold">{currentSpec.engineeringMaterial}</span>
                </div>

                <div className="p-2.5 rounded bg-[#061122] border border-[#132d4e] font-mono-tech">
                  <span className="text-[9px] text-[#5580af] uppercase block font-bold mb-0.5">
                    HIGH-ALTITUDE PERFORMANCE ROLE ({currentSpec.altitudeBand})
                  </span>
                  <span className="text-xs text-[#8db1da] leading-relaxed">{currentSpec.highAltitudeRole}</span>
                </div>
              </div>

              <div className="flex flex-col justify-between font-mono-tech">
                <div>
                  <div className="text-[10px] text-[#5580af] uppercase font-bold mb-2 pb-1 border-b border-[#142c4b]">
                    TECHNICAL PARAMETERS & SPECIFICATIONS
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(currentSpec.specs).map(([k, v]) => (
                      <div key={k} className="p-2 rounded bg-[#061122] border border-[#132d4e]">
                        <span className="text-[9px] text-[#5580af] uppercase block truncate">
                          {k.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-xs font-bold text-[#00e5ff]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 p-2.5 rounded bg-[#07162b] border border-[#183963] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#00ff66]" />
                    <span className="text-xs font-bold text-white">LIVE SIMULATION STATE</span>
                  </div>
                  <span className="text-xs font-bold text-[#00ff66] bg-[#00ff66]/15 px-2 py-0.5 rounded border border-[#00ff66]/30">
                    {currentHealth.badge}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
