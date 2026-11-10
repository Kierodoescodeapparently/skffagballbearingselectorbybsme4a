import React from 'react';
import { Bearing, CalculationResult, OperatingConditions } from '../types/bearing';
import { BearingCrossSection } from './BearingCrossSection';
import { LifeSensitivityChart } from './LifeSensitivityChart';
import { getInterchangeAdvice, DESIGNATION_SUFFIX_COMPARISON } from '../utils/interchangeRules';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRightLeft, Layers, ShieldCheck, Zap } from 'lucide-react';

interface BearingInspectorProps {
  bearing: Bearing;
  conditions: OperatingConditions;
  calculation: CalculationResult;
  onOpenInterchangeModal: () => void;
}

export const BearingInspector: React.FC<BearingInspectorProps> = ({
  bearing,
  conditions,
  calculation,
  onOpenInterchangeModal,
}) => {
  const {
    skfDesignation,
    fagDesignation,
    category,
    series,
    d,
    D,
    B,
    C,
    C0,
    mass,
    cageMaterial,
    sealingOptions,
    contactAngle,
  } = bearing;

  const {
    P,
    X,
    Y,
    e,
    Fa_over_Fr,
    achievedL10,
    achievedL10h,
    isLifeSufficient,
    P0,
    S0,
    isStaticSafe,
    speedLimit,
    isSpeedPermissible,
    requiredC,
  } = calculation;

  const interchangeAdvice = getInterchangeAdvice('SKF', skfDesignation);

  // Relevant suffixes from comparison table
  const relevantSuffixes = DESIGNATION_SUFFIX_COMPARISON.filter((item) => {
    if (category === 'angular_contact' && item.category === 'Contact Angle') return true;
    if (category === 'spindle' && (item.category === 'Contact Angle' || item.category === 'Tolerance Class' || item.category === 'Spindle Preload')) return true;
    if (item.category === 'Shields & Seals' || item.category === 'Radial Clearance') return true;
    return false;
  }).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Banner: Designation & Quick Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">
              <span className="uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">
                {category.replace('_', ' ')}
              </span>
              <span>·</span>
              <span>ISO Series {series}</span>
              <span>·</span>
              <span>Contact Angle {contactAngle}°</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                SKF {skfDesignation}
              </h1>
              <span className="text-slate-400 dark:text-slate-500 font-mono text-sm">⇄</span>
              <h2 className="text-2xl font-bold tracking-tight text-blue-700 dark:text-blue-400">
                FAG {fagDesignation}
              </h2>
            </div>
          </div>

          {/* Life Verification Status */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold ${
                isLifeSufficient
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {isLifeSufficient ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Rating Life Meets Target ({Math.round(achievedL10h).toLocaleString()} h)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>Life Deficient ({Math.round(achievedL10h).toLocaleString()} h &lt; {conditions.targetLifeHours.toLocaleString()} h)</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Key Dimension Strips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-4">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-mono text-slate-500 block">Shaft Bore (d)</span>
            <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {d} <span className="text-xs font-normal text-slate-400">mm</span>
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-mono text-slate-500 block">Outer Dia (D)</span>
            <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {D} <span className="text-xs font-normal text-slate-400">mm</span>
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-mono text-slate-500 block">Width (B)</span>
            <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {B} <span className="text-xs font-normal text-slate-400">mm</span>
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-mono text-slate-500 block">Dynamic (C)</span>
            <span className="text-base font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
              {C.toFixed(1)} <span className="text-xs font-normal text-slate-400">kN</span>
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-mono text-slate-500 block">Static (C0)</span>
            <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {C0.toFixed(1)} <span className="text-xs font-normal text-slate-400">kN</span>
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-mono text-slate-500 block">Weight</span>
            <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {mass.toFixed(3)} <span className="text-xs font-normal text-slate-400">kg</span>
            </span>
          </div>
        </div>
      </div>

      {/* Engineering Calculations Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Dynamic Life Evaluation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              ISO 281 Dynamic Rating Life
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* Load Ratio & Factors */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Axial / Radial Ratio (Fa / Fr)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {Fa_over_Fr.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Limit Factor (e)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {e.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">ISO Radial Factor (X)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {X.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">ISO Thrust Factor (Y)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {Y.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Equivalent Load P */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Equivalent Dynamic Load (P = X·Fr + Y·Fa):</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {P.toFixed(2)} kN
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Required Rating (Creq for {conditions.targetLifeHours.toLocaleString()}h):</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {requiredC.toFixed(2)} kN
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Actual Bearing Rating (C):</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {C.toFixed(2)} kN
                </span>
              </div>
            </div>

            {/* Result L10h */}
            <div className="mt-3 p-3 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-lg">
              <span className="text-[11px] font-semibold text-blue-800 dark:text-blue-300 block">
                Achieved Service Life (L10h)
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold font-mono text-blue-700 dark:text-blue-300 tabular-nums">
                  {achievedL10h > 1_000_000 ? '> 1,000,000' : Math.round(achievedL10h).toLocaleString()}
                </span>
                <span className="text-xs font-mono uppercase text-blue-600 dark:text-blue-400">hours</span>
              </div>
              <div className="text-[11px] text-blue-700 dark:text-blue-300/80 mt-1">
                = {achievedL10.toFixed(1)} million revolutions at {conditions.speed} rpm
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Static Safety & Speed Limit */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Static Safety & Speed Capacity
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Static Load Safety */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Equivalent Static Load (P0)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {P0.toFixed(2)} kN
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500 dark:text-slate-400">Static Safety Factor (S0 = C0 / P0)</span>
                <span className={`text-base font-bold font-mono tabular-nums ${isStaticSafe ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {S0.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                {isStaticSafe ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                )}
                <span className="text-slate-600 dark:text-slate-400">
                  {isStaticSafe
                    ? 'Static safety exceeds ISO minimum (S0 ≥ 1.5)'
                    : 'Low static safety; risk of permanent raceway indentation'}
                </span>
              </div>
            </div>

            {/* Rotational Speed Check */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Current Operating Speed</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {conditions.speed} rpm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Permissible Speed ({conditions.lubrication})
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {speedLimit.toLocaleString()} rpm
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                {isSpeedPermissible ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                )}
                <span className="text-slate-600 dark:text-slate-400">
                  {isSpeedPermissible
                    ? `Operating within thermal limit (${((conditions.speed / speedLimit) * 100).toFixed(0)}% of limit)`
                    : 'Speed exceeds permissible catalog limit; risk of overheating'}
                </span>
              </div>
            </div>

            {/* Construction & Caging */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Cage Material:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">{cageMaterial}</span>
              </div>
              <div className="flex justify-between">
                <span>Sealing Variants:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  {sealingOptions.join(', ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: SKF <-> FAG Interchange */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                SKF ⇄ FAG Interchange
              </h3>
            </div>
            <button
              onClick={onOpenInterchangeModal}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Full Suffix Guide
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg space-y-1.5 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">SKF Designation:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{skfDesignation}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-700 dark:text-blue-400">FAG Equivalent:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{fagDesignation}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {interchangeAdvice.notes}
            </p>

            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Suffix Cross-Reference
              </span>
              {relevantSuffixes.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80 text-[11px]"
                >
                  <span className="text-slate-500 dark:text-slate-400">{s.meaning}:</span>
                  <div className="font-mono font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">{s.skfCode}</span>
                    <span className="text-slate-400 mx-1.5">⇄</span>
                    <span className="text-blue-600 dark:text-blue-400">{s.fagCode}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Visual & Graphic Schematics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2D Engineering Cross-Section */}
        <BearingCrossSection bearing={bearing} Fr={conditions.Fr} Fa={conditions.Fa} />

        {/* Speed vs Life Sensitivity Curve */}
        <LifeSensitivityChart
          bearing={bearing}
          conditions={conditions}
          achievedLifeHours={achievedL10h}
        />
      </div>
    </div>
  );
};
