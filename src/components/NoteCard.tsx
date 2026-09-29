'use client';

import React from 'react';
import { Pin, Tag, Edit3, Trash2, Calendar, Link as LinkIcon } from 'lucide-react';
import { NoteItem } from '../types';

interface NoteCardProps {
  note: NoteItem;
  onEdit: (note: NoteItem) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}) => {
  return (
    <div 
      className="todo-card"
      onClick={() => onEdit(note)}
      style={{ cursor: 'pointer' }}
    >
      <div 
        className="todo-card-accent-bar" 
        style={{ background: note.color || 'var(--primary)' }} 
      />

      <div className="todo-header-row" style={{ alignItems: 'center' }}>
        <h3 className="todo-title" style={{ margin: 0 }}>{note.title}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(note.id);
          }}
          className="btn-icon"
          style={{
            width: '28px',
            height: '28px',
            background: note.isPinned ? 'var(--primary-glow)' : 'transparent',
            color: note.isPinned ? 'var(--primary)' : 'var(--text-dim)',
            borderColor: note.isPinned ? 'var(--border-focus)' : 'transparent',
            marginLeft: 'auto'
          }}
          title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
          aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
        >
          <Pin size={13} style={{ transform: note.isPinned ? 'rotate(45deg)' : 'none' }} />
        </button>
      </div>

      <p className="todo-desc" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {note.content.replace(/<[^>]*>?/gm, '')}
      </p>

      <div className="todo-meta-row" style={{ marginTop: 'auto', paddingTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {note.category && (
            <span className="badge badge-category">
              <Tag size={11} />
              {note.category}
            </span>
          )}

          {note.linkedTodoId && (
            <span className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
              <LinkIcon size={11} />
              Task Linked
            </span>
          )}

          <span className="badge-due">
            <Calendar size={11} />
            {new Date(note.updatedAt).toLocaleDateString()}
          </span>
        </div>

        <div 
          className="todo-actions"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="btn-icon" 
            style={{ width: '28px', height: '28px' }}
            onClick={() => onEdit(note)}
            title="Edit note"
            aria-label="Edit note"
          >
            <Edit3 size={13} />
          </button>
          <button 
            className="btn-icon" 
            style={{ width: '28px', height: '28px', color: 'var(--priority-urgent)' }}
            onClick={() => onDelete(note.id)}
            title="Delete note"
            aria-label="Delete note"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
