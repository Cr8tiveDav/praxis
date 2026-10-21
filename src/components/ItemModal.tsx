'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  ListTodo,
  FileText,
  Calendar,
  Tag,
  CheckSquare,
} from 'lucide-react';
import { TodoItem, Priority, SubTask } from '../types';
import { ConfirmModal } from './ConfirmModal';

// ─── Priority Metadata ──────────────────────────────────────────────────────

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

const PRIORITY_META: Record<
  Priority,
  {
    label: string;
    badgeClass: string;
    accentColor: string;
  }
> = {
  high: {
    label: 'High',
    badgeClass: 'badge-high',
    accentColor: 'var(--priority-high)',
  },
  medium: {
    label: 'Medium',
    badgeClass: 'badge-medium',
    accentColor: 'var(--priority-medium)',
  },
  low: {
    label: 'Low',
    badgeClass: 'badge-low',
    accentColor: 'var(--priority-low)',
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

// ─── Component Props ────────────────────────────────────────────────────────

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (todo: Partial<TodoItem>) => void;
  initialTodo?: TodoItem | null;
  categories: string[];
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTodo,
  categories,
}) => {
  const isEditing = Boolean(initialTodo);

  // Form State
  const [title, setTitle] = useState(initialTodo?.title ?? '');
  const [titleTouched, setTitleTouched] = useState(false);
  const [description, setDescription] = useState(initialTodo?.description ?? '');
  const [priority, setPriority] = useState<Priority>(initialTodo?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(
    initialTodo?.dueDate ?? new Date().toISOString().split('T')[0]
  );
  const [category, setCategory] = useState(
    initialTodo?.category ?? categories[0] ?? 'General'
  );
  const [customCategory, setCustomCategory] = useState('');
  const [subtasks, setSubtasks] = useState<SubTask[]>(initialTodo?.subtasks ?? []);
  const [newSubtask, setNewSubtask] = useState('');
  const [subtasksOpen, setSubtasksOpen] = useState(true);
  const [subtaskToDelete, setSubtaskToDelete] = useState<{ id: string; title: string } | null>(null);

  // Refs
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const newSubtaskRef = useRef<HTMLInputElement>(null);

  // Body Scroll Lock
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    if (!isOpen) return;

    requestAnimationFrame(() => titleRef.current?.focus());

    const handleKeyDown = (e: KeyboardEvent) => {
      if (subtaskToDelete) return;

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        const form = document.getElementById('task-modal-form') as HTMLFormElement | null;
        form?.requestSubmit();
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, subtaskToDelete]);

  // Subtask handlers
  const handleAddSubtask = useCallback(() => {
    const trimmed = newSubtask.trim();
    if (!trimmed) return;
    setSubtasks((prev) => [
      ...prev,
      { id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, title: trimmed, completed: false },
    ]);
    setNewSubtask('');
    requestAnimationFrame(() => newSubtaskRef.current?.focus());
  }, [newSubtask]);

  const handleToggleSubtask = useCallback((id: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  }, []);

  const handleRemoveSubtask = useCallback((id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleTouched(true);
      titleRef.current?.focus();
      return;
    }

    const finalCategory = category === 'custom' ? customCategory.trim() || 'General' : category;

    onSave({
      ...(initialTodo ?? {}),
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      category: finalCategory,
      dueDate: dueDate || undefined,
      subtasks,
    });
    onClose();
  };

  if (!isOpen) return null;

  const meta = PRIORITY_META[priority];
  const doneCount = subtasks.filter((s) => s.completed).length;
  const pct = subtasks.length > 0 ? Math.round((doneCount / subtasks.length) * 100) : 0;

  return (
    <div className="modal-overlay" aria-modal="true" role="dialog">
      <div
        ref={dialogRef}
        className="modal-dialog"
        style={{ maxWidth: '640px' }}
      >
        {/* Dynamic Priority Top Accent Stripe */}
        <div
          className="modal-accent-bar"
          style={{ background: meta.accentColor }}
        />

        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className={`badge ${meta.badgeClass}`}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
              {meta.label}
            </span>
            <h2 className="modal-title">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h2>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Close dialog (Escape)"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form
          id="task-modal-form"
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
        >
          <div className="modal-body">
            {/* 1. Task Title */}
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label htmlFor="task-title" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckSquare size={12} color="var(--primary)" />
                  Task Title <span style={{ color: 'var(--priority-urgent)' }}>*</span>
                </label>
                {titleTouched && !title.trim() && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--priority-urgent)', fontWeight: 600 }}>
                    Title is required
                  </span>
                )}
              </div>
              <input
                ref={titleRef}
                id="task-title"
                type="text"
                className="form-input"
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderColor: titleTouched && !title.trim() ? 'var(--priority-urgent)' : undefined,
                }}
                placeholder="Enter task title..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleTouched) setTitleTouched(false);
                }}
                onBlur={() => setTitleTouched(true)}
                required
              />
            </div>

            {/* 2. Side-by-Side: Priority & Due Date */}
            <div className="form-row">
              {/* Priority Selector */}
              <div className="form-group">
                <label htmlFor="task-priority" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.accentColor }} />
                  Priority Level
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    id="task-priority"
                    className="form-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    style={{ fontWeight: 600 }}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {PRIORITY_META[p].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Due Date Picker with Presets */}
              <div className="form-group">
                <label htmlFor="task-due-date" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={12} color="var(--primary)" />
                  Due Date
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
                {/* Date Quick Preset Chips */}
                <div className="date-preset-chips">
                  <button
                    type="button"
                    className="chip-btn"
                    onClick={() => setDueDate(formatDateOffset(0))}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    className="chip-btn"
                    onClick={() => setDueDate(formatDateOffset(1))}
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    className="chip-btn"
                    onClick={() => setDueDate(formatDateOffset(7))}
                  >
                    +1 Wk
                  </button>
                  {dueDate && (
                    <button
                      type="button"
                      className="chip-btn clear"
                      onClick={() => setDueDate('')}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Category Selector */}
            <div className="form-group">
              <label htmlFor="task-category" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={12} color="var(--primary)" />
                Category
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  id="task-category"
                  className="form-select"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (e.target.value !== 'custom') setCustomCategory('');
                  }}
                  style={{ flex: 1 }}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="custom">+ Add New Category…</option>
                </select>
                {category === 'custom' && (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter category name…"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    style={{ flex: 1 }}
                    autoFocus
                  />
                )}
              </div>
            </div>

            {/* 4. Description */}
            <div className="form-group">
              <label htmlFor="task-description" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={12} color="var(--primary)" />
                Description
              </label>
              <textarea
                id="task-description"
                className="form-textarea"
                placeholder="Add a short description for this task (optional)..."
                value={description}
                rows={3}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* 5. Collapsible Checklist & Subtasks Section */}
            <div className="modal-checklist-card">
              {/* Expand / Collapse Header */}
              <button
                type="button"
                className="checklist-toggle-btn"
                aria-expanded={subtasksOpen}
                onClick={() => setSubtasksOpen((v) => !v)}
              >
                <div className="checklist-header-title">
                  <ListTodo size={14} color="var(--primary)" />
                  <span>Subtasks Checklist</span>
                  {subtasks.length > 0 && (
                    <span className="checklist-progress-badge">
                      {doneCount}/{subtasks.length} ({pct}%)
                    </span>
                  )}
                </div>
                <ChevronDown
                  size={15}
                  style={{
                    color: 'var(--text-dim)',
                    transform: subtasksOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform var(--transition-fast)',
                  }}
                />
              </button>

              {/* Progress bar line */}
              {subtasks.length > 0 && (
                <div className="checklist-progress-bar-wrap">
                  <div
                    className="checklist-progress-bar-fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}

              {/* Collapsible Content */}
              {subtasksOpen && (
                <div className="checklist-body">
                  {/* Add Subtask Row */}
                  <div className="checklist-add-row">
                    <input
                      ref={newSubtaskRef}
                      type="text"
                      className="form-input"
                      style={{ fontSize: '0.82rem', padding: '7px 10px' }}
                      placeholder="Add subtask item… (Press Enter)"
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubtask();
                        }
                      }}
                      aria-label="New checklist item title"
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '7px 12px', flexShrink: 0 }}
                      onClick={handleAddSubtask}
                      disabled={!newSubtask.trim()}
                      aria-label="Add item"
                    >
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Subtask Items List */}
                  {subtasks.length > 0 ? (
                    <ul className="checklist-items-list" role="list">
                      {subtasks.map((st) => (
                        <li
                          key={st.id}
                          className={`checklist-item ${st.completed ? 'done' : ''}`}
                        >
                          {/* Checkbox button */}
                          <button
                            type="button"
                            className={`custom-checkbox ${st.completed ? 'checked' : ''}`}
                            style={{ width: 16, height: 16 }}
                            onClick={() => handleToggleSubtask(st.id)}
                            aria-label={st.completed ? `Mark "${st.title}" incomplete` : `Mark "${st.title}" complete`}
                          >
                            {st.completed && <Check size={11} strokeWidth={3} />}
                          </button>

                          {/* Title */}
                          <span className="checklist-item-title">{st.title}</span>

                          {/* Delete Item */}
                          <button
                            type="button"
                            className="checklist-delete-btn"
                            onClick={() => setSubtaskToDelete({ id: st.id, title: st.title })}
                            aria-label={`Delete "${st.title}"`}
                            title="Remove subtask"
                          >
                            <Trash2 size={13} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ margin: 0, textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-dim)', padding: '6px 0' }}>
                      No subtasks yet. Break this task into smaller steps.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <div className="modal-shortcuts" style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginRight: 'auto' }}>
              <span className="header-kbd">Esc</span> cancel • <span className="header-kbd">⌘ Enter</span> save
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!title.trim()}
              style={{
                background: priority === 'high'
                  ? 'var(--priority-high)'
                  : priority === 'low'
                  ? 'var(--priority-low)'
                  : 'var(--primary)',
              }}
            >
              {isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal for Subtask deletion */}
      <ConfirmModal
        isOpen={!!subtaskToDelete}
        title="Delete Subtask"
        message="Are you sure you want to delete this subtask?"
        itemName={subtaskToDelete?.title}
        confirmLabel="Delete Subtask"
        onConfirm={() => {
          if (subtaskToDelete) {
            handleRemoveSubtask(subtaskToDelete.id);
            setSubtaskToDelete(null);
          }
        }}
        onClose={() => setSubtaskToDelete(null)}
        zIndex={160}
      />
    </div>
  );
};
