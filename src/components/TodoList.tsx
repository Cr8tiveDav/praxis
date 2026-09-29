'use client';

import React, { useState } from 'react';
import { Plus, ListFilter, CheckCircle2, Sparkles } from 'lucide-react';
import { TodoItem, Priority, ActiveView } from '../types';
import { TodoCard } from './TodoCard';

interface TodoListProps {
  todos: TodoItem[];
  activeView: ActiveView;
  selectedCategory?: string;
  selectedPriority?: Priority;
  onPriorityChange: (priority?: Priority) => void;
  searchQuery: string;
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'alphabetical';
  onSortChange: (sort: 'dueDate' | 'priority' | 'createdAt' | 'alphabetical') => void;
  onToggleComplete: (id: string) => void;
  onEdit: (todo: TodoItem) => void;
  onDelete: (id: string) => void;
  onToggleSubtask: (todoId: string, subtaskId: string) => void;
  onQuickAdd: (title: string, priority: Priority, category: string) => void;
  onOpenTaskModal: () => void;
  categories: string[];
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  activeView,
  selectedCategory,
  selectedPriority,
  onPriorityChange,
  searchQuery,
  sortBy,
  onSortChange,
  onToggleComplete,
  onEdit,
  onDelete,
  onToggleSubtask,
  onQuickAdd,
  onOpenTaskModal,
  categories,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<Priority>('medium');
  const [quickCategory, setQuickCategory] = useState(categories[0] || 'General');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onQuickAdd(quickTitle.trim(), quickPriority, quickCategory);
    setQuickTitle('');
  };

  // Determine section title
  const getSectionTitle = () => {
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    if (selectedCategory) return `Category: ${selectedCategory}`;
    if (selectedPriority) return `Priority: ${selectedPriority.toUpperCase()}`;
    switch (activeView) {
      case 'today': return "Today's Tasks";
      case 'upcoming': return 'Upcoming Deadlines';
      case 'completed': return 'Completed Archive';
      default: return 'All Tasks';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Quick Add Input Bar */}
      <form onSubmit={handleQuickSubmit} className="quick-add-box">
        <Sparkles size={18} color="var(--primary)" />
        <input
          type="text"
          className="quick-add-input"
          placeholder="Add a new task... (type title and press Enter)"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
        />
        
        {/* Quick Priority Select */}
        <select 
          className="select-dropdown" 
          value={quickPriority} 
          onChange={(e) => setQuickPriority(e.target.value as Priority)}
          style={{ width: '105px' }}
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Quick Category Select */}
        <select 
          className="select-dropdown" 
          value={quickCategory} 
          onChange={(e) => setQuickCategory(e.target.value)}
          style={{ maxWidth: '125px' }}
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
          <option value="General">General</option>
        </select>

        <button type="submit" className="btn btn-secondary" style={{ height: '34px', padding: '0 14px', border: '1px solid var(--border-main)', color: 'var(--text-main)' }}>
          <Plus size={15} />
          <span>Add</span>
        </button>
      </form>

      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="view-heading">
          <h2 className="view-title">{getSectionTitle()}</h2>
          <span className="view-count">{todos.length} {todos.length === 1 ? 'task' : 'tasks'}</span>
        </div>

        <div className="controls-right">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: 'var(--text-dim)' }}>
            <ListFilter size={14} />
            <span>Sort by:</span>
          </div>
          <select 
            className="select-dropdown" 
            value={sortBy} 
            onChange={(e) => onSortChange(e.target.value as 'dueDate' | 'priority' | 'createdAt' | 'alphabetical')}
          >
            <option value="priority">Priority Level</option>
            <option value="dueDate">Due Date</option>
            <option value="createdAt">Date Created</option>
            <option value="alphabetical">Title (A-Z)</option>
          </select>

          <div style={{ width: '1px', height: '16px', background: 'var(--border-subtle)', margin: '0 4px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: 'var(--text-dim)' }}>
            <span>Priority:</span>
          </div>
          <select 
            className="select-dropdown" 
            value={selectedPriority || 'all'} 
            onChange={(e) => onPriorityChange(e.target.value === 'all' ? undefined : e.target.value as Priority)}
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Todo List Stack */}
      {todos.length > 0 ? (
        <div className="todo-list-stack">
          {todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleSubtask={onToggleSubtask}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="empty-state-title">No tasks found</h3>
          <p className="empty-state-desc">
            {searchQuery 
              ? 'No tasks match your search filter. Try clearing the search or checking another view.' 
              : 'Workspace is clear! Create a new task with due dates, checklist subtasks, and markdown notes.'}
          </p>
          <button className="btn btn-primary" onClick={onOpenTaskModal} style={{ marginTop: '8px' }}>
            <Plus size={16} />
            <span>Create New Task</span>
          </button>
        </div>
      )}
    </div>
  );
};
