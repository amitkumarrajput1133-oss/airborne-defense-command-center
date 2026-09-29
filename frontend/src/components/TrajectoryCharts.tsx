import React, { useState } from 'react';
import { HistoryRecord } from '../types/simulation';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Activity, BarChart2 } from 'lucide-react';

interface TrajectoryChartsProps {
  history: HistoryRecord[];
}

export const TrajectoryCharts: React.FC<TrajectoryChartsProps> = ({ history }) => {
  const [chartMode, setChartMode] = useState<'position' | 'error'>('position');

  const chartData = history.slice(-50).map((h) => ({
    time: `${h.time.toFixed(1)}s`,
    rawTime: h.time,
    'Observed X': Math.round(h.observed_x),
    'Observed Y': Math.round(h.observed_y),
    'Filtered X': Math.round(h.filtered_x),
    'Filtered Y': Math.round(h.filtered_y),
    'AI Pred X': Math.round(h.ai_pred_x),
    'AI Pred Y': Math.round(h.ai_pred_y),
    'Tracking Error': h.tracking_error,
    'Confidence %': h.confidence
  }));

  return (
    <div className="hud-panel rounded-xl p-4 border border-slate-800 bg-[#0c1220] flex flex-col gap-2 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold tracking-widest text-slate-200 uppercase">
            Live Trajectory & Kinematic Analytics
          </h2>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 p-0.5 rounded border border-slate-800">
          <button
            onClick={() => setChartMode('position')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              chartMode === 'position'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Position (Observed vs Filtered vs AI)
          </button>
          <button
            onClick={() => setChartMode('error')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              chartMode === 'error'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tracking Error & Confidence
          </button>
        </div>
      </div>

      <div className="h-56 w-full pt-1">
        {chartData.length < 2 ? (
          <div className="h-full flex items-center justify-center text-slate-500 italic">
            Collecting simulation trajectory records...
          </div>
        ) : chartMode === 'position' ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 15, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" domain={['dataMin - 30', 'dataMax + 30']} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              {/* Observed Trajectory */}
              <Line
                type="monotone"
                dataKey="Observed X"
                stroke="#eab308"
                strokeWidth={1}
                dot={false}
                strokeDasharray="2 2"
                isAnimationActive={false}
              />
              {/* Filtered Trajectory */}
              <Line
                type="monotone"
                dataKey="Filtered X"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              {/* AI Predicted Trajectory */}
              <Line
                type="monotone"
                dataKey="AI Pred X"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={false}
                strokeDasharray="4 4"
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 15, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <Area
                type="monotone"
                dataKey="Tracking Error"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.2}
                strokeWidth={1.5}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="Confidence %"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.15}
                strokeWidth={2}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
