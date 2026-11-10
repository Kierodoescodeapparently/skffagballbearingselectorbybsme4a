import React, { useState } from 'react';
import { DESIGNATION_SUFFIX_COMPARISON, getInterchangeAdvice } from '../utils/interchangeRules';
import { X, ArrowRightLeft, Search, BookOpen } from 'lucide-react';

interface InterchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InterchangeModal: React.FC<InterchangeModalProps> = ({ isOpen, onClose }) => {
  const [sourceMfg, setSourceMfg] = useState<'SKF' | 'FAG'>('SKF');
  const [inputCode, setInputCode] = useState('6205-2Z/C3');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  if (!isOpen) return null;

  const translation = getInterchangeAdvice(sourceMfg, inputCode);

  const categories = ['All', 'Shields & Seals', 'Radial Clearance', 'Contact Angle', 'Cage Design', 'Spindle Preload', 'Tolerance Class'];

  const filteredSuffixes = DESIGNATION_SUFFIX_COMPARISON.filter((item) => {
    if (filterCategory === 'All') return true;
    return item.category === filterCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                SKF ⇄ FAG Designation & Suffix Interchange Guide
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cross-referencing rules for deep groove, angular contact, and spindle ball bearings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Designation Converter Box */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Interactive Designation Translator
          </span>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setSourceMfg('SKF')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  sourceMfg === 'SKF'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                SKF Input
              </button>
              <button
                onClick={() => setSourceMfg('FAG')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  sourceMfg === 'FAG'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                FAG Input
              </button>
            </div>

            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Enter designation (e.g. 6205-2Z/C3, 7208 BEP, 7010 CD/P4ADGA)..."
                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono text-slate-400 block">Translated {translation.targetMfg} Counterpart:</span>
              <span className="text-base font-bold font-mono text-blue-600 dark:text-blue-400">
                {translation.targetMfg} {translation.targetDesignation}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm">
              {translation.notes}
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-5 pt-3 flex flex-wrap gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filterCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Suffix Comparison Table */}
        <div className="flex-1 overflow-y-auto p-5">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 font-mono uppercase text-slate-400">
              <tr>
                <th className="pb-2 font-semibold">Category</th>
                <th className="pb-2 font-semibold">SKF Suffix</th>
                <th className="pb-2 font-semibold">FAG Equivalent</th>
                <th className="pb-2 font-semibold">Technical Meaning</th>
                <th className="pb-2 font-semibold">Application Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredSuffixes.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {s.category}
                  </td>
                  <td className="py-2.5 font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {s.skfCode}
                  </td>
                  <td className="py-2.5 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                    {s.fagCode}
                  </td>
                  <td className="py-2.5 text-slate-700 dark:text-slate-300 font-medium">
                    {s.meaning}
                  </td>
                  <td className="py-2.5 text-slate-500 dark:text-slate-400 text-[11px]">
                    {s.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
