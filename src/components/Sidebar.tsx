'use client';

import React from 'react';
import { 
  CheckSquare, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
  Tag
} from 'lucide-react';
import { ActiveView, Priority, TodoItem, NoteItem } from '../types';

interface SidebarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  selectedCategory?: string;
  onSelectCategory: (category?: string) => void;
  selectedPriority?: Priority;
  onSelectPriority: (priority?: Priority) => void;
  categories: string[];
  todos: TodoItem[];
  notes: NoteItem[];
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  selectedCategory,
  onSelectCategory,
  selectedPriority,
  onSelectPriority,
  categories,
  todos,
  notes,
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const counts = {
    all: todos.filter(t => !t.completed).length,
    today: todos.filter(t => !t.completed && t.dueDate === todayStr).length,
    upcoming: todos.filter(t => !t.completed && t.dueDate && t.dueDate > todayStr).length,
    completed: todos.filter(t => t.completed).length,
    notes: notes.length,
    high: todos.filter(t => !t.completed && t.priority === 'high').length,
    medium: todos.filter(t => !t.completed && t.priority === 'medium').length,
    low: todos.filter(t => !t.completed && t.priority === 'low').length,
  };

  const handleNavClick = (view: ActiveView) => {
    onSelectView(view);
    onSelectCategory(undefined);
    onSelectPriority(undefined);
    onCloseMobile();
  };

  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      onSelectCategory(undefined);
    } else {
      onSelectCategory(category);
    }
    onCloseMobile();
  };

  const handlePriorityClick = (p: Priority) => {
    if (selectedPriority === p) {
      onSelectPriority(undefined);
    } else {
      onSelectPriority(p);
    }
    onCloseMobile();
  };

  const categoryColors: Record<string, string> = {
    Engineering: '#F5A623',
    Product:     '#3b82f6',
    Design:      '#06b6d4',
    Personal:    '#10b981',
    Ideas:       '#f59e0b',
    Performance: '#9CA3AF',
    Shortcuts:   '#E09415',
    Architecture:'#F5A623',
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={onCloseMobile}
        />
      )}

      <aside className={`sidebar ${isMobileOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Brand Section */}
        <div className="brand-section" style={{ position: 'relative' }}>
          <div className="brand-icon-wrapper" style={{ flexShrink: 0 }}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#141414] border border-[#282828] shadow-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-4 h-4"
              >
                <path
                  d="M6 20V4h7a4.5 4.5 0 0 1 0 9H6"
                  stroke="#F5A623"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13 18l2.5 2.5 5.5-5.5"
                  stroke="#F5A623"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          {!isCollapsed && (
            <div className="brand-title-wrap">
              <span className="brand-title">Praxis</span>
              <span className="brand-tagline">Todo & Notes App</span>
            </div>
          )}

          {/* Mobile Close Button */}
          <button 
            className="btn-icon mobile-close-btn" 
            onClick={onCloseMobile}
          >
            <X size={18} />
          </button>
        </div>

      {/* Main Views Navigation */}
      <div className="nav-section">
        <span className="nav-heading">Views</span>

        <button
          className={`nav-item ${activeView === 'all' && !selectedCategory && !selectedPriority ? 'active' : ''}`}
          onClick={() => handleNavClick('all')}
          title="All Tasks"
        >
          <div className="nav-item-left">
            <CheckSquare size={17} />
            {!isCollapsed && <span>All Tasks</span>}
          </div>
          {counts.all > 0 && !isCollapsed && <span className="nav-badge">{counts.all}</span>}
        </button>

        <button
          className={`nav-item ${activeView === 'today' ? 'active' : ''}`}
          onClick={() => handleNavClick('today')}
          title="Today"
        >
          <div className="nav-item-left">
            <Clock size={17} />
            {!isCollapsed && <span>Today</span>}
          </div>
          {counts.today > 0 && !isCollapsed && <span className="nav-badge">{counts.today}</span>}
        </button>

        <button
          className={`nav-item ${activeView === 'upcoming' ? 'active' : ''}`}
          onClick={() => handleNavClick('upcoming')}
          title="Upcoming"
        >
          <div className="nav-item-left">
            <Calendar size={17} />
            {!isCollapsed && <span>Upcoming</span>}
          </div>
          {counts.upcoming > 0 && !isCollapsed && <span className="nav-badge">{counts.upcoming}</span>}
        </button>

        <button
          className={`nav-item ${activeView === 'notes' ? 'active' : ''}`}
          onClick={() => handleNavClick('notes')}
          title="Notes & Docs"
        >
          <div className="nav-item-left">
            <FileText size={17} />
            {!isCollapsed && <span>Notes & Docs</span>}
          </div>
          {!isCollapsed && <span className="nav-badge">{counts.notes}</span>}
        </button>

        <button
          className={`nav-item ${activeView === 'completed' ? 'active' : ''}`}
          onClick={() => handleNavClick('completed')}
          title="Completed"
        >
          <div className="nav-item-left">
            <CheckCircle2 size={17} />
            {!isCollapsed && <span>Completed</span>}
          </div>
          {!isCollapsed && <span className="nav-badge">{counts.completed}</span>}
        </button>
      </div>



      {/* Categories / Tags Section */}
      <div className="nav-section tags-section-wrapper" style={{ position: 'relative' }}>
        {!isCollapsed && <span className="nav-heading">Tags & Categories</span>}
        
        {isCollapsed ? (
          <div className="collapsed-tags-container" style={{ position: 'relative', borderTop: '1px solid #262626', paddingTop: '12px', marginTop: '12px' }}>
            <button className="nav-item" title="Tags & Categories">
              <div className="nav-item-left" style={{ margin: '0 auto' }}>
                <Tag size={17} />
              </div>
            </button>
            <div className="tags-flyout" style={{ 
              background: '#161616', 
              border: '1px solid #2A2A2A', 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
              borderRadius: '12px', 
              padding: '12px', 
              width: '240px', 
              backdropFilter: 'blur(12px)',
              marginLeft: '12px'
            }}>
              <div style={{ 
                fontSize: '10px', 
                fontWeight: 600, 
                color: '#A3A3A3', 
                letterSpacing: '0.05em', 
                textTransform: 'uppercase', 
                padding: '4px 8px', 
                borderBottom: '1px solid rgba(38, 38, 38, 0.8)', 
                marginBottom: '8px' 
              }}>
                Tags & Categories
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                {categories.map((cat) => {
                  const count = todos.filter(t => t.category === cat).length + notes.filter(n => n.category === cat).length;
                  const color = categoryColors[cat] || 'var(--primary)';
                  const isSelected = selectedCategory === cat;
                  
                  return (
                    <div
                      key={cat}
                      className="tag-row"
                      onClick={() => handleCategoryClick(cat)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '6px 12px', 
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        fontSize: '14px', 
                        transition: 'background-color 0.2s', 
                        marginBottom: '4px',
                        background: isSelected ? '#222222' : 'transparent',
                        color: isSelected ? 'white' : '#E5E5E5'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = '#222222';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{cat}</span>
                      </div>
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#A3A3A3', 
                        background: 'rgba(38, 38, 38, 0.6)', 
                        padding: '2px 8px', 
                        borderRadius: '6px', 
                        fontFamily: 'monospace',
                        flexShrink: 0
                      }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ overflowY: 'auto', maxHeight: '200px' }}>
            {categories.map((cat) => {
              const count = todos.filter(t => t.category === cat).length + notes.filter(n => n.category === cat).length;
              const color = categoryColors[cat] || 'var(--primary)';
              return (
                <button
                  key={cat}
                  className={`category-filter-item ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(cat)}
                  title={cat}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="category-dot" style={{ background: color, marginRight: '8px' }} />
                    <span>{cat}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        {/* Footer actions like Settings can go here */}
      </div>
    </aside>
    </>
  );
};
