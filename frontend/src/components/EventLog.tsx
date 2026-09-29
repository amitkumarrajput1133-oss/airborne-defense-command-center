import React, { useEffect, useRef, useState } from 'react';
import { EventLogItem } from '../types/simulation';
import { Terminal, Shield, CheckCircle, Crosshair, AlertCircle, Sparkles } from 'lucide-react';

interface EventLogProps {
  events: EventLogItem[];
}

export const EventLog: React.FC<EventLogProps> = ({ events }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'TRACKING' | 'AI' | 'INTERCEPTOR'>('ALL');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const filteredEvents = events.filter((ev) => {
    if (filter === 'ALL') return true;
    if (filter === 'TRACKING') return ev.type.includes('TRACK') || ev.type.includes('SENSOR') || ev.type.includes('MANEUVER');
    if (filter === 'AI') return ev.type.includes('PREDICT') || ev.type.includes('POINT') || ev.type.includes('ML');
    if (filter === 'INTERCEPTOR') return ev.type.includes('INTERCEPT') || ev.type.includes('DEPLOY');
    return true;
  });

  const getBadgeStyle = (type: string) => {
    if (type.includes('SUCCESS') || type.includes('INTERCEPTED')) {
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
    }
    if (type.includes('PREDICT')) {
      return 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60';
    }
    if (type.includes('DEPLOY') || type.includes('POINT')) {
      return 'bg-blue-950/80 text-blue-300 border-blue-700/60';
    }
    if (type.includes('DETECT') || type.includes('MANEUVER')) {
      return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
    }
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="hud-panel rounded-xl p-4 border border-slate-800 bg-[#0c1220] flex flex-col gap-2 font-mono text-xs h-full">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold tracking-widest text-slate-200 uppercase">
            Chronological Mission Event Log
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 text-[10px]">
          {(['ALL', 'TRACKING', 'AI', 'INTERCEPTOR'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2 py-0.5 rounded transition-colors ${
                filter === cat
                  ? 'bg-slate-700 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scrolling Log Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto max-h-56 pr-2 flex flex-col gap-1.5 scrollbar-thin"
      >
        {filteredEvents.length === 0 ? (
          <div className="text-slate-500 py-4 text-center italic">
            No events registered under current filter.
          </div>
        ) : (
          filteredEvents.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-2.5 p-1.5 rounded bg-slate-900/60 border border-slate-800/50 hover:bg-slate-850 transition-colors"
            >
              <span className="text-[10px] text-slate-500 shrink-0 font-mono mt-0.5">
                {item.timestamp}
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold shrink-0 uppercase ${getBadgeStyle(
                  item.type
                )}`}
              >
                {item.type}
              </span>
              <span className="text-[11px] text-slate-300 leading-snug">
                {item.details}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
