import React, { useState } from 'react';
import { Globe, Radio, ShieldCheck, AlertOctagon, RefreshCw } from 'lucide-react';

interface GridSector {
  id: string;
  name: string;
  code: string;
  status: 'ACTIVE' | 'ELEVATED' | 'COMPROMISED';
  coverageKm: number;
  threatsDetected: number;
  interceptorsReady: number;
  coordinates: string;
}

const SECTORS: GridSector[] = [
  {
    id: 'sec-1',
    name: 'SECTOR ALPHA // PACIFIC CORRIDOR',
    code: 'PAC-44',
    status: 'ACTIVE',
    coverageKm: 350,
    threatsDetected: 0,
    interceptorsReady: 12,
    coordinates: '34°12\'N 120°45\'W',
  },
  {
    id: 'sec-2',
    name: 'SECTOR BRAVO // VIPER AIRSPACE',
    code: 'VIPER-01',
    status: 'COMPROMISED',
    coverageKm: 65,
    threatsDetected: 1,
    interceptorsReady: 0,
    coordinates: '38°53\'N 077°02\'W',
  },
  {
    id: 'sec-3',
    name: 'SECTOR CHARLIE // ARCTIC RADAR BELT',
    code: 'NORAD-09',
    status: 'ACTIVE',
    coverageKm: 520,
    threatsDetected: 0,
    interceptorsReady: 24,
    coordinates: '64°18\'N 083°10\'W',
  },
  {
    id: 'sec-4',
    name: 'SECTOR DELTA // ATLANTIC PERIMETER',
    code: 'ATLAN-7',
    status: 'ELEVATED',
    coverageKm: 420,
    threatsDetected: 2,
    interceptorsReady: 8,
    coordinates: '32°15\'N 064°45\'W',
  },
];

export const GridMapScreen: React.FC = () => {
  const [selectedSector, setSelectedSector] = useState<GridSector>(SECTORS[1]);

  return (
    <div className="flex-1 flex flex-col gap-3.5 p-3.5 overflow-y-auto">
      {/* Top Banner */}
      <div className="hud-panel corner-bracket rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#00e5ff]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-hud font-bold tracking-wider text-white flex items-center gap-2">
              AEGIS THEATER DEFENSE GRID // GLOBAL EARLY WARNING NETWORK
              <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-[#ff2a55]/20 text-[#ff2a55] border border-[#ff2a55]/50 animate-pulse font-bold">
                BREACH REPORTED: SECTOR BRAVO
              </span>
            </h2>
            <p className="text-xs text-[#6e91b8] font-mono-tech">
              Multi-tiered phased array radar network with integrated airborne kinetic interceptor wings.
            </p>
          </div>
        </div>

        <button
          onClick={() => {}}
          className="px-3 py-1.5 rounded bg-[#08172c] hover:bg-[#10294d] border border-[#173864] text-xs font-mono-tech text-[#82a9d4] hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span>RE-SYNCHRONIZE SATELLITE TELEMETRY</span>
        </button>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1">
        {/* Left Map Canvas / Tactical Overlay */}
        <div className="lg:col-span-8 hud-panel corner-bracket rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#142642]">
            <span className="text-xs font-hud font-bold tracking-wider text-white">
              STRATEGIC AIRSPACE RADAR RECONNAISSANCE
            </span>
            <span className="text-[10px] font-mono-tech text-[#00e5ff]">
              ORBITAL TRACKING: ONLINE (AEGIS-SAT 4B)
            </span>
          </div>

          {/* Stylized Tactical SVG World Grid */}
          <div className="relative w-full h-80 my-3 bg-[#030712] border border-[#162f52] rounded-lg p-3 flex items-center justify-center overflow-hidden">
            {/* World Grid Lines */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #00e5ff 1px, transparent 1px), linear-gradient(#142b4b 1px, transparent 1px), linear-gradient(90deg, #142b4b 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />

            <svg viewBox="0 0 600 320" className="w-full h-full relative z-10">
              {/* Latitude / Longitude lines */}
              <circle cx="300" cy="160" r="140" fill="none" stroke="#00e5ff" strokeWidth="0.8" opacity="0.2" />
              <circle cx="300" cy="160" r="80" fill="none" stroke="#00e5ff" strokeWidth="0.8" opacity="0.2" />
              <line x1="40" y1="160" x2="560" y2="160" stroke="#00e5ff" strokeWidth="0.8" opacity="0.2" />
              <line x1="300" y1="20" x2="300" y2="300" stroke="#00e5ff" strokeWidth="0.8" opacity="0.2" />

              {/* Sector 1: Alpha */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedSector(SECTORS[0])}
              >
                <circle cx="160" cy="140" r="45" fill="rgba(0,255,102,0.06)" stroke="#00ff66" strokeWidth="1" strokeDasharray="3,3" />
                <circle cx="160" cy="140" r="4" fill="#00ff66" />
                <text x="160" y="125" fill="#00ff66" fontSize="9" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
                  PAC-44 [ACTIVE]
                </text>
              </g>

              {/* Sector 2: Bravo (VIPER AIRSPACE - COMPROMISED) */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedSector(SECTORS[1])}
              >
                <circle cx="320" cy="180" r="55" fill="rgba(255,42,85,0.12)" stroke="#ff2a55" strokeWidth="1.8" className="animate-pulse" />
                <circle cx="320" cy="180" r="5" fill="#ff2a55" />
                <circle cx="320" cy="180" r="18" fill="none" stroke="#ff2a55" strokeWidth="1.5" strokeDasharray="2,2" />
                <text x="320" y="165" fill="#ff2a55" fontSize="10" fontFamily="'JetBrains Mono', monospace" fontWeight="bold" textAnchor="middle">
                  ⚠ VIPER-01 [BREACHED]
                </text>
                {/* Incoming threat vector */}
                <line x1="380" y1="110" x2="328" y2="175" stroke="#ff2a55" strokeWidth="2" strokeDasharray="4,2" />
                <polygon points="325,178 335,170 338,175" fill="#ff2a55" />
              </g>

              {/* Sector 3: Charlie (NORAD) */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedSector(SECTORS[2])}
              >
                <circle cx="280" cy="70" r="50" fill="rgba(0,229,255,0.06)" stroke="#00e5ff" strokeWidth="1" strokeDasharray="3,3" />
                <circle cx="280" cy="70" r="4" fill="#00e5ff" />
                <text x="280" y="55" fill="#00e5ff" fontSize="9" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
                  NORAD-09 [STANDBY]
                </text>
              </g>

              {/* Sector 4: Delta */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedSector(SECTORS[3])}
              >
                <circle cx="440" cy="190" r="40" fill="rgba(255,183,3,0.08)" stroke="#ffb703" strokeWidth="1.2" strokeDasharray="3,3" />
                <circle cx="440" cy="190" r="4" fill="#ffb703" />
                <text x="440" y="178" fill="#ffb703" fontSize="9" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
                  ATLAN-7 [ELEVATED]
                </text>
              </g>
            </svg>
          </div>

          <div className="pt-2 border-t border-[#142642] flex items-center justify-between text-xs font-mono-tech">
            <span className="text-[#6287af]">SELECT RADAR SECTOR NODE TO INSPECT AIR DEFENSE INTEGRITY</span>
            <span className="text-[#00e5ff]">DEFENSE READINESS: 78.4%</span>
          </div>
        </div>

        {/* Right Sector Status List */}
        <div className="lg:col-span-4 hud-panel corner-bracket rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#142642] mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#00e5ff]" />
                <h3 className="text-xs font-hud font-bold tracking-wider text-white">
                  SECTOR RECONNAISSANCE
                </h3>
              </div>
              <span className="text-[10px] font-mono-tech text-[#5d82aa]">4 NODES</span>
            </div>

            {/* List */}
            <div className="space-y-2.5">
              {SECTORS.map((sector) => {
                const isSelected = selectedSector.id === sector.id;
                return (
                  <div
                    key={sector.id}
                    onClick={() => setSelectedSector(sector)}
                    className={`p-2.5 rounded border transition-all cursor-pointer font-mono-tech text-xs ${
                      isSelected
                        ? 'border-[#00e5ff] bg-[#0c1c33] shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                        : 'border-[#142947] bg-[#060c18] hover:border-[#1c3a64]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-bold">{sector.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded border ${
                          sector.status === 'COMPROMISED'
                            ? 'text-[#ff2a55] bg-[#ff2a55]/20 border-[#ff2a55]/50 animate-pulse font-bold'
                            : sector.status === 'ELEVATED'
                            ? 'text-[#ffb703] bg-[#ffb703]/10 border-[#ffb703]/30'
                            : 'text-[#00ff66] bg-[#00ff66]/10 border-[#00ff66]/30'
                        }`}
                      >
                        {sector.status}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-[#6990bc]">
                      <span>COVERAGE: {sector.coverageKm} KM</span>
                      <span>INTERCEPTORS: {sector.interceptorsReady}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Sector Telemetry Detail */}
          <div className="mt-3 p-2.5 rounded bg-[#060d1d] border border-[#163359] font-mono-tech text-xs space-y-1.5">
            <div className="text-[#00e5ff] font-bold text-[11px] flex items-center justify-between">
              <span>{selectedSector.name}</span>
              <span className="text-[#7ea3cc]">{selectedSector.coordinates}</span>
            </div>
            <div className="text-[10px] text-[#86a6cf]">
              {selectedSector.status === 'COMPROMISED'
                ? 'ALERT: Mobile intercept platform VIPER-01 hull integrity lost during supersonic collision. Re-dispatch ground battery required.'
                : 'Sensor telemetry continuous. No hypersonic threat signatures currently detected within radar perimeter.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
