import React, { useState, useMemo } from 'react';
import { Bearing, BearingCategory, OperatingConditions } from '../types/bearing';
import { evaluateBearing } from '../utils/iso281Calculator';
import { Search, CheckCircle2, XCircle, ArrowUpDown, Filter } from 'lucide-react';

interface CatalogueGridProps {
  bearings: Bearing[];
  conditions: OperatingConditions;
  selectedBearingId: string;
  onSelectBearing: (bearing: Bearing) => void;
}

export const CatalogueGrid: React.FC<CatalogueGridProps> = ({
  bearings,
  conditions,
  selectedBearingId,
  onSelectBearing,
}) => {
  const [activeCategory, setActiveCategory] = useState<BearingCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSufficientOnly, setFilterSufficientOnly] = useState(false);
  const [applyBoreFilter, setApplyBoreFilter] = useState(false);
  const [sortField, setSortField] = useState<'d' | 'D' | 'C' | 'life'>('d');
  const [sortAsc, setSortAsc] = useState(true);

  // Compute evaluation results for all bearings
  const evaluatedBearings = useMemo(() => {
    return bearings.map((b) => {
      const evalRes = evaluateBearing(b, conditions);
      return {
        bearing: b,
        evalRes,
      };
    });
  }, [bearings, conditions]);

  const hasWorkspaceBore = conditions.minBore !== undefined || conditions.maxBore !== undefined;

  // Apply filters
  const filteredBearings = useMemo(() => {
    return evaluatedBearings.filter(({ bearing, evalRes }) => {
      // Category filter
      if (activeCategory !== 'all' && bearing.category !== activeCategory) {
        return false;
      }

      // Search query (SKF, FAG, series, bore)
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchesDesignation =
          bearing.skfDesignation.toLowerCase().includes(q) ||
          bearing.fagDesignation.toLowerCase().includes(q) ||
          bearing.series.toLowerCase().includes(q) ||
          bearing.d.toString().includes(q);
        if (!matchesDesignation) return false;
      }

      // Bore range constraints (only if explicitly enabled)
      if (applyBoreFilter) {
        if (conditions.minBore !== undefined && bearing.d < conditions.minBore) {
          return false;
        }
        if (conditions.maxBore !== undefined && bearing.d > conditions.maxBore) {
          return false;
        }
      }

      // Sufficient life toggle
      if (filterSufficientOnly && !evalRes.isLifeSufficient) {
        return false;
      }

      return true;
    });
  }, [evaluatedBearings, activeCategory, searchQuery, applyBoreFilter, conditions.minBore, conditions.maxBore, filterSufficientOnly]);

  const handleClearFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setFilterSufficientOnly(false);
    setApplyBoreFilter(false);
  };

  const hasActiveFilters =
    activeCategory !== 'all' ||
    searchQuery.trim() !== '' ||
    filterSufficientOnly ||
    applyBoreFilter;

  // Sort
  const sortedBearings = useMemo(() => {
    return [...filteredBearings].sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortField === 'd') {
        valA = a.bearing.d;
        valB = b.bearing.d;
      } else if (sortField === 'D') {
        valA = a.bearing.D;
        valB = b.bearing.D;
      } else if (sortField === 'C') {
        valA = a.bearing.C;
        valB = b.bearing.C;
      } else if (sortField === 'life') {
        valA = a.evalRes.achievedL10h;
        valB = b.evalRes.achievedL10h;
      }

      if (valA === valB) {
        return a.bearing.D - b.bearing.D;
      }
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [filteredBearings, sortField, sortAsc]);

  const handleSort = (field: 'd' | 'D' | 'C' | 'life') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const categories: Array<{ id: BearingCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All Families' },
    { id: 'deep_groove', label: 'Deep Groove' },
    { id: 'angular_contact', label: 'Angular Contact' },
    { id: 'spindle', label: 'Super-Precision Spindle' },
    { id: 'self_aligning', label: 'Self-Aligning' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
      {/* Category Tabs & Controls */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick Counter */}
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Showing <span className="font-bold text-slate-900 dark:text-slate-100">{sortedBearings.length}</span> of{' '}
            {bearings.length} candidates
          </div>
        </div>

        {/* Search & Toggles */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by designation (e.g. 6205, 7208, B7010) or bore..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hasWorkspaceBore && (
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={applyBoreFilter}
                  onChange={(e) => setApplyBoreFilter(e.target.checked)}
                  className="rounded-sm border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  Bore Filter ({conditions.minBore ?? 0}–{conditions.maxBore ?? '∞'}mm)
                </span>
              </label>
            )}

            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterSufficientOnly}
                onChange={(e) => setFilterSufficientOnly(e.target.checked)}
                className="rounded-sm border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
              />
              <span>Sufficient Life Only (L10h ≥ Target)</span>
            </label>
          </div>
        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-lg px-3 py-1.5 text-blue-900 dark:text-blue-300">
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Active Filters:</span>
              {activeCategory !== 'all' && (
                <span className="font-semibold">{categories.find((c) => c.id === activeCategory)?.label}</span>
              )}
              {searchQuery && (
                <span>Query: &ldquo;{searchQuery}&rdquo;</span>
              )}
              {filterSufficientOnly && (
                <span>Life ≥ {conditions.targetLifeHours.toLocaleString()}h</span>
              )}
              {applyBoreFilter && hasWorkspaceBore && (
                <span>Bore {conditions.minBore ?? 0}–{conditions.maxBore ?? '∞'}mm</span>
              )}
            </div>
            <button
              onClick={handleClearFilters}
              className="font-semibold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer ml-3 whitespace-nowrap"
            >
              Clear All Filters (Show All {bearings.length})
            </button>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">
            <tr>
              <th className="py-2.5 px-4 font-semibold">SKF Part</th>
              <th className="py-2.5 px-4 font-semibold">FAG Equivalent</th>
              <th
                onClick={() => handleSort('d')}
                className="py-2.5 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
              >
                <div className="flex items-center gap-1">
                  <span>d × D × B (mm)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('C')}
                className="py-2.5 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
              >
                <div className="flex items-center gap-1">
                  <span>C / C0 (kN)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-4 font-semibold">Speed Limit</th>
              <th
                onClick={() => handleSort('life')}
                className="py-2.5 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
              >
                <div className="flex items-center gap-1">
                  <span>Achieved L10h</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-4 font-semibold text-center">Status</th>
              <th className="py-2.5 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {sortedBearings.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-500 dark:text-slate-400">
                  <p className="mb-2">No bearing candidates match the current filters.</p>
                  <button
                    onClick={handleClearFilters}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  >
                    Reset All Filters (Show All {bearings.length} Models)
                  </button>
                </td>
              </tr>
            ) : (
              sortedBearings.map(({ bearing, evalRes }) => {
                const isSelected = bearing.id === selectedBearingId;
                return (
                  <tr
                    key={bearing.id}
                    onClick={() => onSelectBearing(bearing)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 text-slate-900 dark:text-slate-100 font-medium'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {/* SKF Designation */}
                    <td className="py-2.5 px-4 font-mono font-bold whitespace-nowrap">
                      {bearing.skfDesignation}
                    </td>

                    {/* FAG Designation */}
                    <td className="py-2.5 px-4 font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {bearing.fagDesignation}
                    </td>

                    {/* Dimensions */}
                    <td className="py-2.5 px-4 font-mono tabular-nums whitespace-nowrap">
                      Ø{bearing.d} × Ø{bearing.D} × {bearing.B}
                    </td>

                    {/* Ratings */}
                    <td className="py-2.5 px-4 font-mono tabular-nums whitespace-nowrap">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {bearing.C.toFixed(1)}
                      </span>{' '}
                      / <span className="text-slate-400">{bearing.C0.toFixed(1)}</span>
                    </td>

                    {/* Speed Limit */}
                    <td className="py-2.5 px-4 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                      {(conditions.lubrication === 'oil'
                        ? bearing.limitingSpeedOil
                        : bearing.limitingSpeedGrease
                      ).toLocaleString()}{' '}
                      rpm
                    </td>

                    {/* Achieved Life */}
                    <td className="py-2.5 px-4 font-mono tabular-nums whitespace-nowrap">
                      <span
                        className={
                          evalRes.isLifeSufficient
                            ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'text-rose-600 dark:text-rose-400'
                        }
                      >
                        {evalRes.achievedL10h > 500000
                          ? '>500,000h'
                          : `${Math.round(evalRes.achievedL10h).toLocaleString()}h`}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      {evalRes.isLifeSufficient ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Suitable</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Deficient</span>
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBearing(bearing);
                        }}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isSelected ? 'Inspecting' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
