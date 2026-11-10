import React, { useState } from 'react';
import { Bearing, CalculationResult, OperatingConditions } from '../types/bearing';
import { X, Printer, Copy, Check, FileCheck, CheckCircle2, XCircle } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bearing: Bearing;
  conditions: OperatingConditions;
  calculation: CalculationResult;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  bearing,
  conditions,
  calculation,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const reportText = `========================================================================
SKF / FAG ROLLING BEARING SELECTION & ISO 281 CALCULATION REPORT
Date: ${new Date().toLocaleDateString()} | Standards: ISO 281 / DIN ISO 76
========================================================================

1. OPERATING DESIGN PARAMETERS
------------------------------------------------------------------------
Application Duty:           ${conditions.machineType}
Radial Load (Fr):           ${conditions.Fr} kN
Axial Thrust Load (Fa):     ${conditions.Fa} kN
Load Ratio (Fa / Fr):       ${calculation.Fa_over_Fr.toFixed(3)}
Rotational Speed (n):       ${conditions.speed} rpm
Target Design Life (L10h):  ${conditions.targetLifeHours.toLocaleString()} hours
Service Factor (fs):        ${conditions.serviceFactor.toFixed(1)}
Lubrication Method:         ${conditions.lubrication.toUpperCase()}

2. SELECTED BEARING SPECIFICATION
------------------------------------------------------------------------
Primary Manufacturer:       SKF ${bearing.skfDesignation}
Direct Interchange:         FAG ${bearing.fagDesignation}
Bearing Family:             ${bearing.category.replace('_', ' ').toUpperCase()} (Series ${bearing.series})
Dimensions (d x D x B):     Ø${bearing.d} mm x Ø${bearing.D} mm x ${bearing.B} mm
Contact Angle (α):          ${bearing.contactAngle}°
Basic Dynamic Rating (C):   ${bearing.C.toFixed(2)} kN
Basic Static Rating (C0):   ${bearing.C0.toFixed(2)} kN
Limiting Speed:             ${conditions.lubrication === 'oil' ? bearing.limitingSpeedOil : bearing.limitingSpeedGrease} rpm
Cage Construction:          ${bearing.cageMaterial}
Mass:                       ${bearing.mass} kg

3. ISO 281 DYNAMIC RATING VERIFICATION
------------------------------------------------------------------------
ISO 281 Limit Factor (e):   ${calculation.e.toFixed(3)}
Radial Factor (X):          ${calculation.X.toFixed(2)}
Thrust Factor (Y):          ${calculation.Y.toFixed(2)}
Equivalent Dynamic Load (P):
  Formula: P = X · Fr + Y · Fa
  P = (${calculation.X.toFixed(2)} · ${conditions.Fr}) + (${calculation.Y.toFixed(2)} · ${conditions.Fa})
  P = ${calculation.P.toFixed(2)} kN
Required Dynamic Rating Creq: ${calculation.requiredC.toFixed(2)} kN
Actual Bearing Rating C:      ${bearing.C.toFixed(2)} kN (${bearing.C >= calculation.requiredC ? 'SUFFICIENT' : 'DEFICIENT'})

Rating Life (L10):          ${calculation.achievedL10.toFixed(2)} million revolutions
Rating Life (L10h):         ${Math.round(calculation.achievedL10h).toLocaleString()} hours
Design Life Requirement:    ${conditions.targetLifeHours.toLocaleString()} hours
Life Margin:                ${((calculation.achievedL10h / conditions.targetLifeHours) * 100).toFixed(0)}%

4. STATIC SAFETY & SPEED CHECK
------------------------------------------------------------------------
Equivalent Static Load (P0):${calculation.P0.toFixed(2)} kN
Static Safety Factor (S0):  ${calculation.S0.toFixed(2)} (Min required: 1.50)
Static Safety Status:       ${calculation.isStaticSafe ? 'VERIFIED (SAFE)' : 'DEFICIENT'}
Permissible Speed Margin:   ${((conditions.speed / calculation.speedLimit) * 100).toFixed(0)}% of limit (${conditions.speed} / ${calculation.speedLimit} rpm)

5. FINAL ENGINEERING SIGN-OFF
------------------------------------------------------------------------
Verdict:                    ${calculation.isLifeSufficient && calculation.isStaticSafe && calculation.isSpeedPermissible ? 'APPROVED FOR SERVICE' : 'REJECTED - SELECT LARGER BEARING'}
Reviewed By: __________________________    Date: ______________
========================================================================`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isApproved =
    calculation.isLifeSufficient &&
    calculation.isStaticSafe &&
    calculation.isSpeedPermissible;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:p-0 print:border-none print:shadow-none">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              ISO 281 Engineering Calculation Datasheet
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-xs print:p-8">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-4 flex justify-between items-start">
            <div>
              <span className="text-[10px] tracking-widest uppercase text-slate-500 block">
                TECHNICAL CALCULATION REPORT
              </span>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-0.5">
                BALL BEARING SELECTION & LIFE VERIFICATION
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Standard: ISO 281 / DIN ISO 76 / SKF & FAG Manufacturer Catalogues
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              <div>Date: {new Date().toLocaleDateString()}</div>
              <div>Status: {isApproved ? 'VERIFIED' : 'REJECTED'}</div>
            </div>
          </div>

          {/* Section 1: Operating Conditions */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1">
              1. OPERATING DESIGN CONDITIONS
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Machine Duty Application:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{conditions.machineType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Application Duty Factor (fs):</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{conditions.serviceFactor.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Radial Force (Fr):</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{conditions.Fr} kN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Axial Thrust Force (Fa):</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{conditions.Fa} kN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Operating Speed (n):</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{conditions.speed} rpm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Required Design Life (L10h):</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{conditions.targetLifeHours.toLocaleString()} hours</span>
              </div>
            </div>
          </div>

          {/* Section 2: Selected Bearing Specifications */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1">
              2. SELECTED BEARING SPECIFICATIONS
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">SKF Designation:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">SKF {bearing.skfDesignation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">FAG Equivalent:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">FAG {bearing.fagDesignation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Envelope Dimensions:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">Ø{bearing.d} × Ø{bearing.D} × {bearing.B} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Angle (α):</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{bearing.contactAngle}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Basic Dynamic Rating (C):</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{bearing.C.toFixed(2)} kN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Basic Static Rating (C0):</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{bearing.C0.toFixed(2)} kN</span>
              </div>
            </div>
          </div>

          {/* Section 3: Calculation & Evaluation Breakdown */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1">
              3. ISO 281 DYNAMIC RATING VERIFICATION
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg space-y-1.5 text-[11px]">
              <div>Equivalent Dynamic Load: P = X · Fr + Y · Fa</div>
              <div className="text-slate-500">
                Fa/Fr = {calculation.Fa_over_Fr.toFixed(3)} | Limit e = {calculation.e.toFixed(3)} | X = {calculation.X.toFixed(2)} | Y = {calculation.Y.toFixed(2)}
              </div>
              <div className="font-bold">
                P = ({calculation.X.toFixed(2)} · {conditions.Fr}) + ({calculation.Y.toFixed(2)} · {conditions.Fa}) = {calculation.P.toFixed(2)} kN
              </div>
              <div>Effective Design Load with Duty Factor (fs = {conditions.serviceFactor}): {(calculation.P * conditions.serviceFactor).toFixed(2)} kN</div>
              <div>Required Dynamic Rating Creq for {conditions.targetLifeHours.toLocaleString()}h: {calculation.requiredC.toFixed(2)} kN</div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 font-bold flex justify-between">
                <span>Achieved Rating Life L10h:</span>
                <span className={calculation.isLifeSufficient ? 'text-emerald-600' : 'text-rose-600'}>
                  {Math.round(calculation.achievedL10h).toLocaleString()} hours ({calculation.achievedL10.toFixed(1)} M revs)
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Static Safety & Speed Limit */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1">
              4. STATIC LOAD SAFETY & SPEED LIMIT
            </h3>
            <div className="grid grid-cols-2 gap-4 text-[11px]">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <span className="text-slate-500 block">Static Safety Factor:</span>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                  S0 = {calculation.S0.toFixed(2)}
                </div>
                <span className="text-[10px] text-slate-500">ISO Min Recommended: 1.50</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <span className="text-slate-500 block">Operating Speed vs Limit:</span>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {conditions.speed} / {calculation.speedLimit} rpm
                </div>
                <span className="text-[10px] text-slate-500">
                  {((conditions.speed / calculation.speedLimit) * 100).toFixed(0)}% of permissible thermal rating
                </span>
              </div>
            </div>
          </div>

          {/* Section 5: Engineering Verdict Block */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              isApproved
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {isApproved ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              )}
              <div>
                <span className="text-xs uppercase font-bold tracking-wider block">
                  Design Verification Verdict
                </span>
                <span className="text-base font-bold">
                  {isApproved
                    ? 'APPROVED: Bearing satisfies all ISO 281 life, static safety, and speed requirements.'
                    : 'REJECTED: Bearing fails design criteria. Select a larger series or reduce operating loads.'}
                </span>
              </div>
            </div>
          </div>

          {/* Signoff lines */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-8 text-[11px] text-slate-500">
            <div>
              <span>Calculated By: Mechanical Design Engineer</span>
              <div className="border-b border-slate-300 dark:border-slate-700 mt-6" />
            </div>
            <div>
              <span>Approved By: Chief Technical Officer</span>
              <div className="border-b border-slate-300 dark:border-slate-700 mt-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
