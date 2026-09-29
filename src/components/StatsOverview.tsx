'use client';

import React from 'react';
import { CheckCircle2, Clock, FileText, Flame } from 'lucide-react';

interface StatsOverviewProps {
  totalTasks: number;
  completedTasks: number;
  highTasks: number;
  totalNotes: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  totalTasks,
  completedTasks,
  highTasks,
  totalNotes,
}) => {
  const pendingTasks = Math.max(0, totalTasks - completedTasks);
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="stats-banner">
      {/* Completion Rate */}
      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-label">Progress Rate</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="stat-value">{completionPercentage}%</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              ({completedTasks}/{totalTasks})
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              background: '#262626',
              borderRadius: '999px',
              overflow: 'hidden',
              marginTop: '8px',
            }}
          >
            <div
              style={{
                width: `${completionPercentage}%`,
                height: '100%',
                background: 'var(--primary)',
                borderRadius: '999px',
                transition: 'width 400ms ease',
              }}
            />
          </div>
        </div>
        <div className="stat-icon-wrapper">
          <CheckCircle2 size={22} />
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-label">Pending Tasks</span>
          <span className="stat-value">{pendingTasks}</span>
          <span className="stat-sub">
            {pendingTasks === 1 ? '1 item to finish' : `${pendingTasks} items to finish`}
          </span>
        </div>
        <div className="stat-icon-wrapper">
          <Clock size={22} />
        </div>
      </div>

      {/* High Priority Tasks */}
      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-label">High Priority</span>
          <span
            className="stat-value"
            style={{ color: highTasks > 0 ? 'var(--priority-high)' : 'inherit' }}
          >
            {highTasks}
          </span>
          <span className="stat-sub">
            {highTasks > 0 ? 'Requires high attention' : 'No high priority items'}
          </span>
        </div>
        {/* High priority keeps a subtle crimson tint for urgency signalling */}
        <div
          className="stat-icon-wrapper"
          style={
            highTasks > 0
              ? { background: 'var(--priority-high-bg)', color: 'var(--priority-high)', borderColor: 'transparent' }
              : undefined
          }
        >
          <Flame size={22} />
        </div>
      </div>

      {/* Total Notes */}
      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-label">Active Notes</span>
          <span className="stat-value">{totalNotes}</span>
          <span className="stat-sub">Docs &amp; brainstorms</span>
        </div>
        <div className="stat-icon-wrapper">
          <FileText size={22} />
        </div>
      </div>
    </div>
  );
};
