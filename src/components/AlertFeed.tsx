import React, { useState, useMemo } from 'react';
import { Alert, Category, Priority } from '../types/alert';
import { AlertCard } from './AlertCard';
import { Filter, Search, SlidersHorizontal, Layers, ShieldCheck } from 'lucide-react';

interface AlertFeedProps {
  rawAlerts: Alert[];
  filteredAlerts: Alert[];
  isRawMode: boolean;
  onToggleRawModeView: (viewRaw: boolean) => void;
  onOpenEvidence: (alert: Alert) => void;
  onOpenOverride: (alert: Alert) => void;
}

export const AlertFeed: React.FC<AlertFeedProps> = ({
  rawAlerts,
  filteredAlerts,
  isRawMode,
  onToggleRawModeView,
  onOpenEvidence,
  onOpenOverride,
}) => {
  const [viewRawStream, setViewRawStream] = useState<boolean>(false);
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isShowingRaw = isRawMode || viewRawStream;
  const currentStream = isShowingRaw ? rawAlerts : filteredAlerts;

  const displayAlerts = useMemo(() => {
    return currentStream.filter(alert => {
      if (selectedPriority !== 'ALL' && alert.priority !== selectedPriority) return false;
      if (selectedCategory !== 'ALL' && alert.category !== selectedCategory) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchMsg = alert.message.toLowerCase().includes(q);
        const matchPat = alert.patientId.toLowerCase().includes(q);
        const matchSrc = alert.source.toLowerCase().includes(q);
        if (!matchMsg && !matchPat && !matchSrc) return false;
      }
      return true;
    });
  }, [currentStream, selectedPriority, selectedCategory, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Control Bar: Toggle Raw/Filtered & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Toggle Raw vs Filtered Feed */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => {
              setViewRawStream(false);
              onToggleRawModeView(false);
            }}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              !isShowingRaw
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Consolidated Feed ({filteredAlerts.length})</span>
          </button>

          <button
            onClick={() => {
              setViewRawStream(true);
              onToggleRawModeView(true);
            }}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              isShowingRaw
                ? 'bg-amber-950 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Raw Stream ({rawAlerts.length})</span>
          </button>
        </div>

        {/* Filter Dropdowns & Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search patient, alert, source..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48 sm:w-64"
            />
          </div>

          {/* Priority Filter */}
          <div className="flex items-center space-x-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value as Priority | 'ALL')}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-1 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value as Category | 'ALL')}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Categories</option>
              <option value="VITAL_SIGN">Vital Signs</option>
              <option value="LAB">Lab Results</option>
              <option value="PHARMACY">Pharmacy</option>
              <option value="WORKFLOW">Workflow</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mode Banner Indicator */}
      <div className="flex items-center justify-between text-xs px-2 text-slate-400 font-mono">
        <span>Showing {displayAlerts.length} of {currentStream.length} alerts in {isShowingRaw ? 'RAW UNFILTERED' : 'CONSOLIDATED'} mode</span>
        {!isShowingRaw && (
          <span className="text-emerald-400 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
            Rule 1 & Rule 2 Safety Bypasses Active
          </span>
        )}
      </div>

      {/* Alert Feed List */}
      <div className="space-y-3">
        {displayAlerts.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
            <p className="text-base font-semibold mb-1">No alerts match the current filter criteria</p>
            <p className="text-xs text-slate-500">Try adjusting your priority, category, or search filters above.</p>
          </div>
        ) : (
          displayAlerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onOpenEvidence={onOpenEvidence}
              onOpenOverride={onOpenOverride}
            />
          ))
        )}
      </div>
    </div>
  );
};
