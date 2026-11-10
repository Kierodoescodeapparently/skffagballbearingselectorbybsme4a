import React from 'react';
import { Bearing } from '../types/bearing';

interface BearingCrossSectionProps {
  bearing: Bearing;
  Fr: number;
  Fa: number;
}

export const BearingCrossSection: React.FC<BearingCrossSectionProps> = ({
  bearing,
  Fr,
  Fa,
}) => {
  const { d, D, B, contactAngle, da_min, Da_max, ra_max } = bearing;

  // Viewbox coordinates setup: 400 x 280
  const width = 400;
  const height = 280;
  const centerX = width / 2;
  const centerY = height / 2;

  // Scaling factor based on D and B
  const scale = Math.min(180 / D, 90 / B);

  // Scaled dimensions
  const r_in = (d / 2) * scale;
  const r_out = (D / 2) * scale;
  const w_half = (B / 2) * scale;
  const ballRadius = Math.max(8, (r_out - r_in) * 0.28);
  const pitchRadius = (r_in + r_out) / 2;

  // Cross section coordinates
  // Top half: Y from centerY - r_out to centerY - r_in
  const topOuterY = centerY - r_out;
  const topInnerY = centerY - r_in;
  const topCenterY = (topOuterY + topInnerY) / 2;

  // Bottom half: Y from centerY + r_in to centerY + r_out
  const botInnerY = centerY + r_in;
  const botOuterY = centerY + r_out;
  const botCenterY = (botOuterY + botInnerY) / 2;

  const leftX = centerX - w_half;
  const rightX = centerX + w_half;

  // Contact angle angle in radians
  const angleRad = (contactAngle * Math.PI) / 180;
  const lineLen = ballRadius * 2.2;
  const dx = Math.sin(angleRad) * lineLen;
  const dy = Math.cos(angleRad) * lineLen;

  return (
    <div className="w-full bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 shadow-inner flex flex-col items-center">
      <div className="w-full flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2 mb-2 font-mono">
        <span>2D Mechanical Cross-Section Schematic</span>
        <span>Contact Angle α = {contactAngle}°</span>
      </div>

      <div className="relative w-full max-w-[400px] aspect-[4/3] flex items-center justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none"
        >
          <defs>
            {/* Centerline Dash Pattern */}
            <pattern id="hatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#475569" strokeWidth="1" />
            </pattern>
            {/* Arrow Marker */}
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>
            <marker id="forceArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" />
            </marker>
          </defs>

          {/* Shaft Centerline (CL) */}
          <line
            x1="20"
            y1={centerY}
            x2={width - 20}
            y2={centerY}
            stroke="#94a3b8"
            strokeWidth="1.2"
            strokeDasharray="14,4,3,4"
          />
          <text x="25" y={centerY - 6} fill="#94a3b8" fontSize="10" fontFamily="monospace">
            CL Shaft
          </text>

          {/* Shaft Profile (Gray) */}
          <rect
            x={leftX - 25}
            y={centerY - r_in}
            width={w_half * 2 + 50}
            height={r_in * 2}
            fill="#1e293b"
            opacity="0.4"
          />

          {/* Shaft Abutment Shoulder Line */}
          <line
            x1={leftX - 15}
            y1={centerY - (da_min / 2) * scale}
            x2={leftX}
            y2={centerY - (da_min / 2) * scale}
            stroke="#64748b"
            strokeWidth="1.5"
            strokeDasharray="2,2"
          />
          <line
            x1={leftX}
            y1={centerY - (da_min / 2) * scale}
            x2={leftX}
            y2={centerY - r_in}
            stroke="#64748b"
            strokeWidth="1.5"
          />

          {/* TOP SECTION: Outer Ring */}
          <rect
            x={leftX}
            y={topOuterY}
            width={w_half * 2}
            height={(topCenterY - topOuterY) * 0.75}
            fill="#334155"
            stroke="#94a3b8"
            strokeWidth="1.5"
            rx="2"
          />
          {/* Outer Raceway Arc */}
          <path
            d={`M ${leftX + w_half * 0.3} ${topCenterY - ballRadius * 0.65} Q ${centerX} ${topCenterY - ballRadius * 0.95} ${rightX - w_half * 0.3} ${topCenterY - ballRadius * 0.65}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1.5"
          />

          {/* TOP SECTION: Inner Ring */}
          <rect
            x={leftX}
            y={topCenterY + (topInnerY - topCenterY) * 0.25}
            width={w_half * 2}
            height={(topInnerY - topCenterY) * 0.75}
            fill="#334155"
            stroke="#94a3b8"
            strokeWidth="1.5"
            rx="2"
          />
          {/* Inner Raceway Arc */}
          <path
            d={`M ${leftX + w_half * 0.3} ${topCenterY + ballRadius * 0.65} Q ${centerX} ${topCenterY + ballRadius * 0.95} ${rightX - w_half * 0.3} ${topCenterY + ballRadius * 0.65}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1.5"
          />

          {/* TOP SECTION: Ball */}
          <circle
            cx={centerX}
            cy={topCenterY}
            r={ballRadius}
            fill="#cbd5e1"
            stroke="#f8fafc"
            strokeWidth="1.5"
          />
          {/* Ball Specular Highlight */}
          <ellipse
            cx={centerX - ballRadius * 0.3}
            cy={topCenterY - ballRadius * 0.3}
            rx={ballRadius * 0.3}
            ry={ballRadius * 0.2}
            fill="#ffffff"
            opacity="0.8"
          />

          {/* Contact Line Vector if Angular/Spindle */}
          {contactAngle > 0 && (
            <line
              x1={centerX - dx}
              y1={topCenterY + dy}
              x2={centerX + dx}
              y2={topCenterY - dy}
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="3,2"
            />
          )}

          {/* BOTTOM SECTION: Outer Ring */}
          <rect
            x={leftX}
            y={botCenterY + (botOuterY - botCenterY) * 0.25}
            width={w_half * 2}
            height={(botOuterY - botCenterY) * 0.75}
            fill="#334155"
            stroke="#94a3b8"
            strokeWidth="1.5"
            rx="2"
          />
          {/* BOTTOM SECTION: Inner Ring */}
          <rect
            x={leftX}
            y={botInnerY}
            width={w_half * 2}
            height={(botCenterY - botInnerY) * 0.75}
            fill="#334155"
            stroke="#94a3b8"
            strokeWidth="1.5"
            rx="2"
          />
          {/* BOTTOM SECTION: Ball */}
          <circle
            cx={centerX}
            cy={botCenterY}
            r={ballRadius}
            fill="#cbd5e1"
            stroke="#f8fafc"
            strokeWidth="1.5"
          />

          {/* DIMENSION LINES & ANNOTATIONS */}
          {/* Width B Dimension (Top) */}
          <line x1={leftX} y1={topOuterY - 14} x2={rightX} y2={topOuterY - 14} stroke="#38bdf8" strokeWidth="1.2" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
          <line x1={leftX} y1={topOuterY - 20} x2={leftX} y2={topOuterY} stroke="#475569" strokeWidth="1" />
          <line x1={rightX} y1={topOuterY - 20} x2={rightX} y2={topOuterY} stroke="#475569" strokeWidth="1" />
          <text x={centerX} y={topOuterY - 18} fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle">
            B = {B}mm
          </text>

          {/* Outside Diameter D (Right) */}
          <line x1={rightX + 18} y1={topOuterY} x2={rightX + 18} y2={botOuterY} stroke="#38bdf8" strokeWidth="1.2" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
          <line x1={rightX} y1={topOuterY} x2={rightX + 24} y2={topOuterY} stroke="#475569" strokeWidth="1" />
          <line x1={rightX} y1={botOuterY} x2={rightX + 24} y2={botOuterY} stroke="#475569" strokeWidth="1" />
          <text x={rightX + 28} y={centerY + 3} fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="start">
            Ø D = {D}mm
          </text>

          {/* Bore Diameter d (Left) */}
          <line x1={leftX - 16} y1={centerY - r_in} x2={leftX - 16} y2={centerY + r_in} stroke="#38bdf8" strokeWidth="1.2" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
          <line x1={leftX - 22} y1={centerY - r_in} x2={leftX} y2={centerY - r_in} stroke="#475569" strokeWidth="1" />
          <line x1={leftX - 22} y1={centerY + r_in} x2={leftX} y2={centerY + r_in} stroke="#475569" strokeWidth="1" />
          <text x={leftX - 22} y={centerY + 3} fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="end">
            Ø d = {d}mm
          </text>

          {/* Load Vectors if active */}
          {Fr > 0 && (
            <g>
              <line
                x1={centerX}
                y1={topOuterY - 45}
                x2={centerX}
                y2={topOuterY - 2}
                stroke="#f43f5e"
                strokeWidth="2"
                markerEnd="url(#forceArrow)"
              />
              <text x={centerX + 6} y={topOuterY - 35} fill="#f43f5e" fontSize="9" fontFamily="monospace" fontWeight="bold">
                Fr = {Fr} kN
              </text>
            </g>
          )}

          {Fa > 0 && (
            <g>
              <line
                x1={leftX - 45}
                y1={topCenterY}
                x2={leftX - 2}
                y2={topCenterY}
                stroke="#f43f5e"
                strokeWidth="2"
                markerEnd="url(#forceArrow)"
              />
              <text x={leftX - 45} y={topCenterY - 6} fill="#f43f5e" fontSize="9" fontFamily="monospace" fontWeight="bold">
                Fa = {Fa} kN
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Mounting Abutment Tolerances Footnote */}
      <div className="w-full grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
        <div>
          <span className="text-slate-500 block">Shaft Shoulder da:</span>
          <span className="text-slate-200">≥ {da_min} mm</span>
        </div>
        <div>
          <span className="text-slate-500 block">Housing Shoulder Da:</span>
          <span className="text-slate-200">≤ {Da_max} mm</span>
        </div>
        <div>
          <span className="text-slate-500 block">Max Fillet ra:</span>
          <span className="text-slate-200">≤ {ra_max} mm</span>
        </div>
      </div>
    </div>
  );
};
