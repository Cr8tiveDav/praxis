'use client';

import React, { useState, useMemo } from 'react';
import { 
  Check, 
  Calendar, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Trash2, 
  CheckSquare2,
  Tag
} from 'lucide-react';
import { TodoItem, Priority } from '../types';

interface TodoCardProps {
  todo: TodoItem;
  onToggleComplete: (id: string) => void;
  onEdit: (todo: TodoItem) => void;
  onDelete: (id: string) => void;
  onToggleSubtask: (todoId: string, subtaskId: string) => void;
}

export const TodoCard: React.FC<TodoCardProps> = ({
  todo,
  onToggleComplete,
  onEdit,
  onDelete,
  onToggleSubtask,
}) => {
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(true);

  // Check if task is overdue or due today
  const { isOverdue, isToday } = useMemo(() => {
    if (!todo.dueDate || todo.completed) return { isOverdue: false, isToday: false };
    const today = new Date().toISOString().split('T')[0];
    return {
      isOverdue: todo.dueDate < today,
      isToday: todo.dueDate === today,
    };
  }, [todo.dueDate, todo.completed]);

  const completedSubtasksCount = todo.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = todo.subtasks.length;
  const subtasksPercent = totalSubtasks > 0 ? Math.round((completedSubtasksCount / totalSubtasks) * 100) : 0;

  const priorityBadgeClass: Record<Priority, string> = {
    high: 'badge-high',
    medium: 'badge-medium',
    low: 'badge-low',
  };

  const accentColor = todo.completed 
    ? 'var(--text-dim)' 
    : todo.color || (todo.priority === 'high' 
      ? 'var(--priority-high)' 
      : 'var(--primary)');

  return (
    <div className={`todo-card ${todo.completed ? 'completed' : ''}`}>
      {/* Accent Indicator Bar */}
      <div 
        className="todo-card-accent-bar" 
        style={{ background: accentColor }} 
      />

      <div className="todo-header-row">
        {/* Completion Checkbox */}
        <button
          className={`custom-checkbox ${todo.completed ? 'checked' : ''}`}
          onClick={() => onToggleComplete(todo.id)}
          aria-label={todo.completed ? 'Mark task incomplete' : 'Mark task complete'}
        >
          {todo.completed && <Check size={14} strokeWidth={3} />}
        </button>

        {/* Content Body */}
        <div className="todo-content-col">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
            <h3 className="todo-title">{todo.title}</h3>
            
            {/* Quick Actions */}
            <div className="todo-actions">
              <button 
                className="btn-icon" 
                style={{ width: '28px', height: '28px' }}
                onClick={() => onEdit(todo)}
                title="Edit task & details"
                aria-label="Edit task"
              >
                <Edit3 size={13} />
              </button>
              <button 
                className="btn-icon" 
                style={{ width: '28px', height: '28px', color: 'var(--priority-urgent)' }}
                onClick={() => onDelete(todo.id)}
                title="Delete task"
                aria-label="Delete task"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {todo.description && (
            <p className="todo-desc">{todo.description}</p>
          )}

          {/* Meta Information Tags */}
          <div className="todo-meta-row">
            {/* Priority Badge */}
            <span className={`badge ${priorityBadgeClass[todo.priority]}`}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
              {todo.priority}
            </span>

            {/* Category / Tag */}
            {todo.category && (
              <span className="badge badge-category">
                <Tag size={11} />
                {todo.category}
              </span>
            )}

            {/* Due Date */}
            {todo.dueDate && (
              <span className={`badge-due ${isOverdue ? 'overdue' : isToday ? 'today' : ''}`}>
                <Calendar size={13} />
                <span>{isOverdue ? 'Overdue: ' : isToday ? 'Due Today: ' : 'Due: '} {todo.dueDate}</span>
              </span>
            )}

            {/* Note Attachment Toggle Pill */}
            {todo.note && (
              <button
                onClick={() => setIsNoteExpanded(!isNoteExpanded)}
                style={{
                  background: isNoteExpanded ? 'var(--primary-glow)' : 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: isNoteExpanded ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  cursor: 'pointer'
                }}
                title="Toggle attached note"
              >
                <FileText size={12} />
                <span>Note Attached</span>
                {isNoteExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}

            {/* Subtasks Count Pill */}
            {totalSubtasks > 0 && (
              <button
                onClick={() => setIsSubtasksExpanded(!isSubtasksExpanded)}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: completedSubtasksCount === totalSubtasks ? 'var(--priority-low)' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '2px 8px',
                  cursor: 'pointer'
                }}
              >
                <CheckSquare2 size={12} />
                <span>{completedSubtasksCount}/{totalSubtasks} subtasks</span>
                {isSubtasksExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subtasks Checklist Dropdown with Progress */}
      {totalSubtasks > 0 && isSubtasksExpanded && (
        <div className="subtasks-container">
          <div className="subtasks-header">
            <span>Checklist</span>
            <span>{subtasksPercent}% completed</span>
          </div>
          <div className="subtasks-progress-bar">
            <div className="subtasks-progress-fill" style={{ width: `${subtasksPercent}%` }} />
          </div>
          {todo.subtasks.map((subtask) => (
            <div 
              key={subtask.id} 
              className={`subtask-row ${subtask.completed ? 'done' : ''}`}
              onClick={() => onToggleSubtask(todo.id, subtask.id)}
            >
              <div className={`subtask-checkbox ${subtask.completed ? 'checked' : ''}`}>
                {subtask.completed && <Check size={11} strokeWidth={3} />}
              </div>
              <span>{subtask.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Attached Context Note Section */}
      {todo.note && isNoteExpanded && (
        <div className="attached-note-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.8rem' }}>
            <FileText size={13} color="var(--primary)" />
            <span>Attached Context Note</span>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{todo.note}</div>
        </div>
      )}
    </div>
  );
};
