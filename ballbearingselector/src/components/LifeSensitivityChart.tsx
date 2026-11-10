import React from 'react';
import { Bearing, OperatingConditions } from '../types/bearing';
import { generateLifeCurve } from '../utils/iso281Calculator';

interface LifeSensitivityChartProps {
  bearing: Bearing;
  conditions: OperatingConditions;
  achievedLifeHours: number;
}

export const LifeSensitivityChart: React.FC<LifeSensitivityChartProps> = ({
  bearing,
  conditions,
  achievedLifeHours,
}) => {
  const points = generateLifeCurve(bearing, conditions, 14);
  if (points.length < 2) return null;

  const width = 420;
  const height = 180;
  const padLeft = 52;
  const padRight = 20;
  const padTop = 15;
  const padBottom = 28;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const minSpeed = points[0].speed;
  const maxSpeed = points[points.length - 1].speed;

  // Max life for scaling (clamp to reasonable display max e.g. 150,000h)
  const maxDisplayLife = Math.max(
    conditions.targetLifeHours * 2.2,
    achievedLifeHours * 1.5,
    50000
  );

  const getX = (speed: number) => {
    const clamped = Math.max(minSpeed, Math.min(maxSpeed, speed));
    return padLeft + ((clamped - minSpeed) / (maxSpeed - minSpeed)) * chartW;
  };

  const getY = (life: number) => {
    const clamped = Math.max(0, Math.min(maxDisplayLife, life));
    return padTop + chartH - (clamped / maxDisplayLife) * chartH;
  };

  // Build SVG path
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.speed).toFixed(1)} ${getY(p.lifeHours).toFixed(1)}`)
    .join(' ');

  // Current operating point
  const curX = getX(conditions.speed);
  const curY = getY(achievedLifeHours);

  // Target life line
  const targetY = getY(conditions.targetLifeHours);

  // Speed limit
  const speedLim = conditions.lubrication === 'oil' ? bearing.limitingSpeedOil : bearing.limitingSpeedGrease;
  const speedLimX = getX(speedLim);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-inner text-slate-100 flex flex-col">
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
        <span>Speed vs. Rating Life Sensitivity Curve (ISO 281)</span>
        <span className="text-blue-400">L10h ∝ 1/n</span>
      </div>

      <div className="relative w-full aspect-[2.3/1]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
          {/* Grid lines horizontal */}
          {[0.25, 0.5, 0.75, 1.0].map((ratio) => {
            const val = maxDisplayLife * ratio;
            const y = padTop + chartH - chartH * ratio;
            return (
              <g key={ratio}>
                <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="#334155" strokeWidth="0.8" strokeDasharray="2,2" />
                <text x={padLeft - 6} y={y + 3} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">
                  {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toFixed(0)}h
                </text>
              </g>
            );
          })}

          {/* Grid lines vertical (Speed ticks) */}
          {[0, 0.33, 0.66, 1.0].map((ratio) => {
            const spd = Math.round(minSpeed + (maxSpeed - minSpeed) * ratio);
            const x = padLeft + chartW * ratio;
            return (
              <g key={ratio}>
                <line x1={x} y1={padTop} x2={x} y2={padTop + chartH} stroke="#334155" strokeWidth="0.8" strokeDasharray="2,2" />
                <text x={x} y={height - 8} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">
                  {spd}
                </text>
              </g>
            );
          })}

          {/* Target Life horizontal marker line */}
          <line
            x1={padLeft}
            y1={targetY}
            x2={width - padRight}
            y2={targetY}
            stroke="#f59e0b"
            strokeWidth="1.2"
            strokeDasharray="4,3"
          />
          <text x={width - padRight} y={targetY - 3} fill="#f59e0b" fontSize="8" fontFamily="monospace" textAnchor="end">
            Target: {conditions.targetLifeHours.toLocaleString()}h
          </text>

          {/* Limiting speed boundary line if within chart */}
          {speedLim <= maxSpeed && speedLim >= minSpeed && (
            <g>
              <line
                x1={speedLimX}
                y1={padTop}
                x2={speedLimX}
                y2={padTop + chartH}
                stroke="#ef4444"
                strokeWidth="1.2"
                strokeDasharray="3,3"
              />
              <text x={speedLimX - 4} y={padTop + 10} fill="#ef4444" fontSize="8" fontFamily="monospace" textAnchor="end">
                Lim. Speed
              </text>
            </g>
          )}

          {/* Theoretical Life Curve */}
          <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="2" />

          {/* Operating Point Cursor */}
          <line x1={curX} y1={padTop} x2={curX} y2={padTop + chartH} stroke="#60a5fa" strokeWidth="1" strokeDasharray="2,2" />
          <circle cx={curX} cy={curY} r="4" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />

          {/* Operating Point Badge */}
          <g transform={`translate(${Math.min(curX + 8, width - 120)}, ${Math.max(curY - 25, padTop + 10)})`}>
            <rect x="0" y="0" width="112" height="22" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
            <text x="6" y="14" fill="#f8fafc" fontSize="8" fontFamily="monospace">
              {conditions.speed} rpm · {achievedLifeHours > 100000 ? '>100k' : Math.round(achievedLifeHours).toLocaleString()}h
            </text>
          </g>
        </svg>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-800">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 bg-sky-400 inline-block" /> Theoretical Life Curve
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 bg-amber-500 inline-block" /> Required Design Life
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Operating Condition
        </span>
      </div>
    </div>
  );
};
