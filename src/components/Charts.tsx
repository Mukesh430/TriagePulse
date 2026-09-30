import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { SystemMetrics, Alert } from '../types/alert';

interface ChartsProps {
  metrics: SystemMetrics;
  rawAlerts: Alert[];
  filteredAlerts: Alert[];
}

export const Charts: React.FC<ChartsProps> = ({ metrics, rawAlerts, filteredAlerts }) => {
  // 1. Before vs After Volume Data
  const volumeData = [
    { name: 'Raw Stream', count: metrics.totalRawAlerts, fill: '#f59e0b' },
    { name: 'Filtered Stream', count: metrics.totalFilteredAlerts, fill: '#10b981' },
    { name: 'Consolidated Noise', count: metrics.duplicatesConsolidated, fill: '#06b6d4' },
  ];

  // 2. Priority Distribution Data (Raw vs Filtered)
  const priorityData = [
    {
      priority: 'CRITICAL',
      Raw: rawAlerts.filter(a => a.priority === 'CRITICAL').length,
      Filtered: filteredAlerts.filter(a => a.priority === 'CRITICAL').length,
    },
    {
      priority: 'HIGH',
      Raw: rawAlerts.filter(a => a.priority === 'HIGH').length,
      Filtered: filteredAlerts.filter(a => a.priority === 'HIGH').length,
    },
    {
      priority: 'MEDIUM',
      Raw: rawAlerts.filter(a => a.priority === 'MEDIUM').length,
      Filtered: filteredAlerts.filter(a => a.priority === 'MEDIUM').length,
    },
    {
      priority: 'LOW',
      Raw: rawAlerts.filter(a => a.priority === 'LOW').length,
      Filtered: filteredAlerts.filter(a => a.priority === 'LOW').length,
    },
  ];

  // 3. Error Analysis Data
  const errorData = [
    { name: 'False Positives (Noise Retained)', count: metrics.falsePositives, fill: '#f59e0b' },
    { name: 'False Negatives (Unsafe Hidden)', count: metrics.falseNegatives, fill: '#ef4444' },
    { name: 'Correct Decisions', count: metrics.totalRawAlerts - (metrics.falsePositives + metrics.falseNegatives), fill: '#10b981' },
  ];



  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Before vs After Alert Volume Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <h3 className="text-sm font-bold text-slate-200">Raw vs Filtered Alert Volume Comparison</h3>
        <p className="text-xs text-slate-400">Quantifies total noise reduction achieved by sliding-window consolidation.</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {volumeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Priority Breakdown Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <h3 className="text-sm font-bold text-slate-200">Alert Volume by Priority (Raw vs Filtered)</h3>
        <p className="text-xs text-slate-400">Confirms 100% retention for CRITICAL priority alerts while low/med noise is reduced.</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="priority" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              <Bar dataKey="Raw" fill="#f59e0b" name="Raw Stream" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Filtered" fill="#06b6d4" name="Filtered Feed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Error Analysis Distribution */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 lg:col-span-2">
        <h3 className="text-sm font-bold text-slate-200">System Accuracy & Error Distribution (Ground Truth)</h3>
        <p className="text-xs text-slate-400">Compares actual system decisions against synthetic ground truth labels.</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={errorData} layout="vertical" margin={{ top: 10, right: 30, left: 140, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} width={130} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {errorData.map((entry, index) => (
                  <Cell key={`error-cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
