'use client';

import React, { useMemo } from 'react';
import { Plus, Pin, FileText, Sparkles } from 'lucide-react';
import { NoteItem } from '../types';
import { NoteCard } from './NoteCard';

interface NotesViewProps {
  notes: NoteItem[];
  searchQuery: string;
  categories: string[];
  selectedCategory?: string;
  onCategoryChange: (category?: string) => void;
  onOpenNoteModal: () => void;
  onEditNote: (note: NoteItem) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  searchQuery,
  categories,
  selectedCategory,
  onCategoryChange,
  onOpenNoteModal,
  onEditNote,
  onDeleteNote,
  onTogglePin,
}) => {
  const filteredNotes = useMemo(() => {
    let result = notes;

    if (selectedCategory) {
      result = result.filter(n => n.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.content.toLowerCase().includes(query) ||
          n.category.toLowerCase().includes(query)
      );
    }

    return result;
  }, [notes, searchQuery, selectedCategory]);

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header bar */}
      <div className="controls-bar">
        <div className="view-heading">
          <h2 className="view-title">Notes</h2>
          <span className="view-count">{filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: 'var(--text-dim)' }}>
            <span>Category:</span>
            <select
              className="select-dropdown"
              value={selectedCategory || 'all'}
              onChange={(e) => onCategoryChange(e.target.value === 'all' ? undefined : e.target.value)}
            >
              <option value="all">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary" onClick={onOpenNoteModal}>
            <Plus size={16} />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FileText size={32} />
          </div>
          <h3 className="empty-state-title">No notes yet</h3>
          <p className="empty-state-desc">
            {searchQuery
              ? 'No notes match your search term. Try another query.'
              : 'Keep project logs, thoughts, and architectural snippets organized alongside your tasks.'}
          </p>
          <button className="btn btn-primary" onClick={onOpenNoteModal} style={{ marginTop: '8px' }}>
            <Plus size={16} />
            <span>Create First Note</span>
          </button>
        </div>
      ) : (
        <>
          {/* Pinned Notes Section */}
          {pinnedNotes.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                <Pin size={14} />
                <span>Pinned Notes ({pinnedNotes.length})</span>
              </div>
              <div className="notes-grid">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={onEditNote}
                    onDelete={onDeleteNote}
                    onTogglePin={onTogglePin}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Notes Section */}
          {otherNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  <Sparkles size={14} />
                  <span>All Notes ({otherNotes.length})</span>
                </div>
              )}
              <div className="notes-grid">
                {otherNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={onEditNote}
                    onDelete={onDeleteNote}
                    onTogglePin={onTogglePin}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
