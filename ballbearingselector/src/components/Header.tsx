import React from 'react';
import { Moon, Sun, FileSpreadsheet, BookOpen } from 'lucide-react';
import { BallBearingIcon } from './BallBearingIcon';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenInterchangeModal: () => void;
  onOpenReportModal: () => void;
  activeSection: string;
  onSelectSection: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenInterchangeModal,
  onOpenReportModal,
  activeSection,
  onSelectSection,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <BallBearingIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-50 whitespace-nowrap">
              SKF / FAG Bearing Selector
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 -mt-0.5">
              ISO 281 Engineering Engine
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onSelectSection('selector')}
            className={`transition-colors whitespace-nowrap hover:text-blue-600 dark:hover:text-blue-400 ${
              activeSection === 'selector' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
            }`}
          >
            Bearing Selection
          </button>
          <button
            onClick={() => onSelectSection('catalogue')}
            className={`transition-colors whitespace-nowrap hover:text-blue-600 dark:hover:text-blue-400 ${
              activeSection === 'catalogue' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
            }`}
          >
            Catalogue Database
          </button>
          <button
            onClick={onOpenInterchangeModal}
            className="flex items-center gap-1.5 transition-colors whitespace-nowrap hover:text-blue-600 dark:hover:text-blue-400 text-slate-600 dark:text-slate-300"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Interchange Guide</span>
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>
    </header>
  );
};
