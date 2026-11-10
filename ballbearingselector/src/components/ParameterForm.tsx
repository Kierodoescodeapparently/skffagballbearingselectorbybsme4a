import React from 'react';
import { OperatingConditions } from '../types/bearing';
import { APPLICATION_PRESETS } from '../data/bearingDatabase';
import { calculateRequiredC } from '../utils/iso281Calculator';
import { Sliders, Activity, Info, RotateCcw } from 'lucide-react';

interface ParameterFormProps {
  conditions: OperatingConditions;
  onChange: (conditions: OperatingConditions) => void;
  onReset: () => void;
}

export const ParameterForm: React.FC<ParameterFormProps> = ({
  conditions,
  onChange,
  onReset,
}) => {
  const handlePresetChange = (presetId: string) => {
    const preset = APPLICATION_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    onChange({
      ...conditions,
      machineType: preset.name,
      serviceFactor: preset.serviceFactor,
      targetLifeHours: preset.typicalLifeHours,
      speed: preset.typicalSpeed,
    });
  };

  const handleNumericChange = (field: keyof OperatingConditions, value: string) => {
    const parsed = parseFloat(value);
    onChange({
      ...conditions,
      [field]: isNaN(parsed) ? 0 : parsed,
    });
  };

  // Quick estimation: assume average X=0.56, Y=1.5 for combined load approximation in banner
  const loadRatio = conditions.Fr > 0 ? conditions.Fa / conditions.Fr : 0;
  const approxP = conditions.Fa > 0
    ? Math.max(conditions.Fr, 0.56 * conditions.Fr + 1.4 * conditions.Fa)
    : conditions.Fr;
  const approxCreq = calculateRequiredC(
    approxP,
    conditions.speed,
    conditions.targetLifeHours,
    conditions.serviceFactor
  );
  const totalMillionRevs = (60 * conditions.speed * conditions.targetLifeHours) / 1_000_000;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-6">
      {/* Header and Reset */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Operating Parameters (ISO 281)
          </h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          title="Reset to default values"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Application Presets */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Machine Duty Application
        </label>
        <select
          value={APPLICATION_PRESETS.find((p) => p.name === conditions.machineType)?.id || ''}
          onChange={(e) => handlePresetChange(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
        >
          <option value="">Custom Application</option>
          {APPLICATION_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name} (fs = {preset.serviceFactor.toFixed(1)}, {preset.typicalLifeHours.toLocaleString()}h)
            </option>
          ))}
        </select>
      </div>

      {/* Loads & Speed Grids */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Radial Load Fr */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Radial Force <span className="font-mono text-blue-600 dark:text-blue-400">Fr</span>
            </label>
            <span className="text-[11px] font-mono text-slate-400 uppercase">kN</span>
          </div>
          <input
            type="number"
            step="0.1"
            min="0"
            value={conditions.Fr}
            onChange={(e) => handleNumericChange('Fr', e.target.value)}
            className="w-full px-3 py-1.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        {/* Axial Load Fa */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Axial Thrust <span className="font-mono text-blue-600 dark:text-blue-400">Fa</span>
            </label>
            <span className="text-[11px] font-mono text-slate-400 uppercase">kN</span>
          </div>
          <input
            type="number"
            step="0.1"
            min="0"
            value={conditions.Fa}
            onChange={(e) => handleNumericChange('Fa', e.target.value)}
            className="w-full px-3 py-1.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        {/* Speed n */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Speed <span className="font-mono text-blue-600 dark:text-blue-400">n</span>
            </label>
            <span className="text-[11px] font-mono text-slate-400 uppercase">rpm</span>
          </div>
          <input
            type="number"
            step="50"
            min="10"
            value={conditions.speed}
            onChange={(e) => handleNumericChange('speed', e.target.value)}
            className="w-full px-3 py-1.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        {/* Target Life L10h */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Design Life <span className="font-mono text-blue-600 dark:text-blue-400">L10h</span>
            </label>
            <span className="text-[11px] font-mono text-slate-400 uppercase">hours</span>
          </div>
          <input
            type="number"
            step="1000"
            min="100"
            value={conditions.targetLifeHours}
            onChange={(e) => handleNumericChange('targetLifeHours', e.target.value)}
            className="w-full px-3 py-1.5 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Service Factor & Lubrication */}
      <div className="grid grid-cols-2 gap-3.5 pt-1">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Duty Factor <span className="font-mono text-blue-600 dark:text-blue-400">fs</span>
            </label>
            <span className="text-[11px] font-mono text-slate-400">{conditions.serviceFactor.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="2.5"
            step="0.1"
            value={conditions.serviceFactor}
            onChange={(e) => handleNumericChange('serviceFactor', e.target.value)}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Lubrication
          </label>
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => onChange({ ...conditions, lubrication: 'grease' })}
              className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                conditions.lubrication === 'grease'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Grease
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...conditions, lubrication: 'oil' })}
              className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                conditions.lubrication === 'oil'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Oil
            </button>
          </div>
        </div>
      </div>

      {/* Shaft Bore Constraints (Optional) */}
      <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Shaft Bore Filter (mm)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min d (e.g. 20)"
            value={conditions.minBore ?? ''}
            onChange={(e) =>
              onChange({
                ...conditions,
                minBore: e.target.value === '' ? undefined : parseFloat(e.target.value),
              })
            }
            className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
          <input
            type="number"
            placeholder="Max d (e.g. 50)"
            value={conditions.maxBore ?? ''}
            onChange={(e) =>
              onChange({
                ...conditions,
                maxBore: e.target.value === '' ? undefined : parseFloat(e.target.value),
              })
            }
            className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Calculated Baseline Target Ribbon */}
      <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3.5 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Dynamic Requirement Threshold</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Load Ratio Fa / Fr</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {loadRatio.toFixed(3)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Duty Revolutions</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {totalMillionRevs.toFixed(1)} M revs
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-baseline justify-between">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Min. Dynamic Rating <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">Creq</span>
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
              {approxCreq.toFixed(2)}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400">kN</span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" />
        <p>
          ISO 281 computes exact X and Y factors iteratively for each bearing series depending on contact angle α and relative axial load Fa / (f0 · C0).
        </p>
      </div>
    </div>
  );
};
