import React, { useState, useEffect, useMemo } from 'react';
import { OperatingConditions, Bearing } from './types/bearing';
import { BEARING_DATABASE } from './data/bearingDatabase';
import { evaluateBearing } from './utils/iso281Calculator';
import { Header } from './components/Header';
import { ParameterForm } from './components/ParameterForm';
import { BearingInspector } from './components/BearingInspector';
import { CatalogueGrid } from './components/CatalogueGrid';
import { InterchangeModal } from './components/InterchangeModal';
import { ReportModal } from './components/ReportModal';
import { ListFilter, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

const DEFAULT_CONDITIONS: OperatingConditions = {
  Fr: 4.5,
  Fa: 1.2,
  speed: 1750,
  targetLifeHours: 20000,
  serviceFactor: 1.1,
  lubrication: 'grease',
  machineType: 'Electric Motor (Standard)',
  minBore: undefined,
  maxBore: undefined,
};

export default function App() {
  const [conditions, setConditions] = useState<OperatingConditions>(DEFAULT_CONDITIONS);
  const [selectedBearingId, setSelectedBearingId] = useState<string>('dgbb-6205');
  const [activeSection, setActiveSection] = useState<string>('selector');
  const [isInterchangeOpen, setIsInterchangeOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Sync dark class on document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Find selected bearing object
  const selectedBearing = useMemo(() => {
    const found = BEARING_DATABASE.find((b) => b.id === selectedBearingId);
    return found || BEARING_DATABASE[0];
  }, [selectedBearingId]);

  // Calculate current evaluation for selected bearing
  const currentCalculation = useMemo(() => {
    return evaluateBearing(selectedBearing, conditions);
  }, [selectedBearing, conditions]);

  // Candidates list ranked by life
  const rankedCandidates = useMemo(() => {
    return BEARING_DATABASE.map((b) => ({
      bearing: b,
      evalRes: evaluateBearing(b, conditions),
    })).sort((a, b) => {
      // Prioritize suitable bearings, then closer bore diameter
      if (a.evalRes.isLifeSufficient && !b.evalRes.isLifeSufficient) return -1;
      if (!a.evalRes.isLifeSufficient && b.evalRes.isLifeSufficient) return 1;
      return a.bearing.d - b.bearing.d;
    });
  }, [conditions]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* 3-Zone Top Bar */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenInterchangeModal={() => setIsInterchangeOpen(true)}
        onOpenReportModal={() => setIsReportOpen(true)}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
      />

      {/* Main Workspace Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Section View Tabs for Mobile/Desktop */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setActiveSection('selector')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeSection === 'selector'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Selection & Verification Workspace
            </button>
            <button
              onClick={() => setActiveSection('catalogue')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeSection === 'catalogue'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Unified Catalogue Browser ({BEARING_DATABASE.length} Models)
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>Operating Point:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              Fr={conditions.Fr}kN · Fa={conditions.Fa}kN · {conditions.speed}rpm
            </span>
          </div>
        </div>

        {activeSection === 'selector' ? (
          /* Asymmetric Split Layout: Left Parameter Controls + Right Inspector & Candidates */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: 4 Cols */}
            <div className="lg:col-span-4 space-y-6">
              <ParameterForm
                conditions={conditions}
                onChange={setConditions}
                onReset={() => setConditions(DEFAULT_CONDITIONS)}
              />

              {/* Quick Candidates Drawer */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <ListFilter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                      Recommended Candidates
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveSection('catalogue')}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                  {rankedCandidates.slice(0, 7).map(({ bearing, evalRes }) => {
                    const isSelected = bearing.id === selectedBearingId;
                    return (
                      <button
                        key={bearing.id}
                        onClick={() => setSelectedBearingId(bearing.id)}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 dark:border-blue-700'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-baseline gap-2 font-mono">
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              SKF {bearing.skfDesignation}
                            </span>
                            <span className="text-[11px] text-blue-600 dark:text-blue-400">
                              FAG {bearing.fagDesignation}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                            Ø{bearing.d} × Ø{bearing.D} × {bearing.B} mm · C = {bearing.C.toFixed(1)} kN
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-right">
                          <div className="text-right">
                            <span
                              className={`text-[11px] font-bold font-mono block ${
                                evalRes.isLifeSufficient
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {evalRes.achievedL10h > 300000
                                ? '>300k h'
                                : `${Math.round(evalRes.achievedL10h).toLocaleString()} h`}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {evalRes.isLifeSufficient ? 'Target OK' : 'Under target'}
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: 8 Cols Detailed Bearing Inspector */}
            <div className="lg:col-span-8">
              <BearingInspector
                bearing={selectedBearing}
                conditions={conditions}
                calculation={currentCalculation}
                onOpenInterchangeModal={() => setIsInterchangeOpen(true)}
              />
            </div>
          </div>
        ) : (
          /* Full Catalogue View */
          <div className="space-y-6">
            <CatalogueGrid
              bearings={BEARING_DATABASE}
              conditions={conditions}
              selectedBearingId={selectedBearingId}
              onSelectBearing={(b) => {
                setSelectedBearingId(b.id);
                setActiveSection('selector');
              }}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <InterchangeModal
        isOpen={isInterchangeOpen}
        onClose={() => setIsInterchangeOpen(false)}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        bearing={selectedBearing}
        conditions={conditions}
        calculation={currentCalculation}
      />
    </div>
  );
}
