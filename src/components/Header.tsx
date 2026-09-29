'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Sun, Moon, FileText, X, Menu, PanelLeft, PanelLeftClose } from 'lucide-react';
import { ActiveView } from '../types';

const THEME_KEY = 'praxis-theme';

function getInitialTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeView: ActiveView;
  onOpenTaskModal: () => void;
  onOpenNoteModal: () => void;
  onToggleMobileMenu: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  activeView,
  onOpenTaskModal,
  onOpenNoteModal,
  onToggleMobileMenu,
  isSidebarCollapsed,
  onToggleSidebar,
}) => {
  // Local icon state — only this component re-renders on toggle, nothing else.
  const [isDark, setIsDark] = useState(true);

  // Sync icon with the current data-theme attribute on mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(
      document.documentElement.getAttribute('data-theme') !== 'light'
    );
  }, []);

  const handleToggleTheme = () => {
    const next = isDark ? 'light' : 'dark';

    // Pure DOM mutation — CSS variables re-resolve instantly via the data-theme
    // selector, and the universal * { transition } in globals.css makes every
    // element cross-fade. Zero React state outside this component is touched.
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(THEME_KEY, next); } catch { /* noop */ }

    setIsDark(!isDark);
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <button className="btn-icon menu-trigger" onClick={onToggleMobileMenu} aria-label="Open menu">
          <Menu size={20} />
        </button>

        <button 
          className="btn-icon desktop-sidebar-toggle" 
          onClick={onToggleSidebar} 
          aria-label="Toggle sidebar"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
        </button>

        <div className="header-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={
              activeView === 'notes'
                ? 'Search notes & tags...'
                : 'Search tasks, priorities, notes...'
            }
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          ) : (
            <span className="search-kbd header-kbd">⌘K</span>
          )}
        </div>
      </div>

      <div className="header-actions">
        {/* Theme Toggle */}
        <button
          className="btn-icon"
          onClick={handleToggleTheme}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* New Note Button */}
        <button
          className="btn btn-secondary"
          onClick={onOpenNoteModal}
          title="Create a standalone note"
        >
          <FileText size={15} />
          <span>New Note</span>
        </button>

        {/* New Task Button */}
        <button
          className="btn btn-primary"
          onClick={onOpenTaskModal}
          title="Create a new task"
        >
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
};
