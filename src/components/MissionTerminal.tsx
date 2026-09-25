import React from 'react';
import { TerminalLog } from '../types';

interface MissionTerminalProps {
  logs: TerminalLog[];
  onClearLogs: () => void;
  scenarioName: string;
  onSelectScenario: (name: string) => void;
}

export const MissionTerminal: React.FC<MissionTerminalProps> = ({
  logs,
  onClearLogs,
  scenarioName,
  onSelectScenario,
}) => {
  return (
    <footer className="w-full border-t border-[#142642] bg-[#050b16]/95 backdrop-blur px-4 py-2 z-30 flex flex-col md:flex-row items-stretch md:items-center gap-3">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 border-r border-[#142642] pr-4 shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-[#00ff66] animate-pulse" />
        <div>
          <h4 className="text-xs font-hud font-bold tracking-wider text-white">MISSION TERMINAL</h4>
          <span className="text-[9px] font-mono-tech text-[#587ea5]">EVENT TELEMETRY LOG</span>
        </div>
      </div>

      {/* Scrolling Log Stream */}
      <div className="flex-1 max-h-20 md:max-h-12 overflow-y-auto font-mono-tech text-[11px] space-y-0.5 pr-2">
        {logs.map((log) => {
          let colorClass = 'text-[#7ea3cd]';
          if (log.type === 'WARN') colorClass = 'text-[#ffb703]';
          if (log.type === 'ALERT' || log.type === 'BREACH') colorClass = 'text-[#ff2a55] font-bold';
          if (log.type === 'SUCCESS') colorClass = 'text-[#00ff66]';
          if (log.type === 'LAUNCH') colorClass = 'text-[#00e5ff] font-semibold';
          if (log.type === 'PATROL') colorClass = 'text-[#5e82a8]';

          return (
            <div key={log.id} className={`${colorClass} leading-tight animate-fade-in`}>
              [{log.timeStr}] [{log.type}] {log.text}
            </div>
          );
        })}
      </div>

      {/* Scenario & Clear */}
      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 text-[10px] font-mono-tech text-[#5e84ad]">
        <div className="hidden lg:flex items-center gap-1.5">
          <span>INTERCEPTION SCENARIO:</span>
          <select
            value={scenarioName}
            onChange={(e) => onSelectScenario(e.target.value)}
            className="bg-[#091322] border border-[#1b3456] rounded text-[#ff2a55] font-bold px-1.5 py-0.5 cursor-pointer outline-none hover:border-[#00e5ff]"
          >
            <option value="EVASIVE-BYPASS (FAILURE REPLICATION)">
              EVASIVE-BYPASS (FAILURE REPLICATION)
            </option>
            <option value="BALLISTIC ARROWHEAD LOCK">BALLISTIC ARROWHEAD LOCK</option>
            <option value="LOW-ALTITUDE CRUISE PENETRATION">LOW-ALTITUDE CRUISE PENETRATION</option>
          </select>
        </div>
        <button
          onClick={onClearLogs}
          className="px-2 py-1 rounded bg-[#091322] hover:bg-[#11233d] border border-[#162d4e] text-[#81a6ce] hover:text-white transition-colors cursor-pointer"
        >
          CLEAR LOG
        </button>
      </div>
    </footer>
  );
};
