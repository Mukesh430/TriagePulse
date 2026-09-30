import React from 'react';
import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'cyan' | 'emerald' | 'amber' | 'red' | 'slate';
  trend?: string;
  target?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'cyan',
  trend,
  target,
}) => {
  const colorMap = {
    cyan: 'bg-cyan-950/40 border-cyan-800/40 text-cyan-400',
    emerald: 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400',
    amber: 'bg-amber-950/40 border-amber-800/40 text-amber-400',
    red: 'bg-red-950/40 border-red-800/40 text-red-400',
    slate: 'bg-slate-900 border-slate-800 text-slate-400',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={clsx('p-2 rounded-xl border', colorMap[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-100">{value}</div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>

      {(trend || target) && (
        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          {target && <span>Target: <strong className="text-slate-200">{target}</strong></span>}
          {trend && <span className="text-emerald-400">{trend}</span>}
        </div>
      )}
    </div>
  );
};
