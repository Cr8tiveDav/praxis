'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Pin,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  List,
  ListOrdered,
} from 'lucide-react';
import { NoteItem } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Partial<NoteItem>) => void;
  initialNote?: NoteItem | null;
  categories: string[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COLOR_OPTIONS = [
  { value: '#F5A623', label: 'Amber' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#dc143c', label: 'Crimson' },
  { value: '#9CA3AF', label: 'Slate' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialNote,
  categories,
}) => {
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [category, setCategory] = useState(initialNote?.category || categories[0] || 'Ideas');
  const [customCategory, setCustomCategory] = useState('');
  const [color, setColor] = useState(initialNote?.color || COLOR_OPTIONS[0].value);
  const [isPinned, setIsPinned] = useState(initialNote?.isPinned || false);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});

  const editorRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens with new note
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(initialNote?.title || '');
      setContent(initialNote?.content || '');
      setCategory(initialNote?.category || categories[0] || 'Ideas');
      setCustomCategory('');
      setColor(initialNote?.color || COLOR_OPTIONS[0].value);
      setIsPinned(initialNote?.isPinned || false);
      if (editorRef.current) {
        editorRef.current.innerHTML = initialNote?.content || '';
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialNote?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const checkFormatting = useCallback(() => {
    if (!editorRef.current) return;
    const formats: Record<string, boolean> = {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
    };
    
    // Check if inside a code block
    let isCode = false;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      let node = selection.anchorNode;
      while (node && node !== editorRef.current) {
        if (node.nodeName === 'CODE') {
          isCode = true;
          break;
        }
        node = node.parentNode;
      }
    }
    formats.code = isCode;

    setActiveFormats(formats);
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => {
      if (document.activeElement === editorRef.current) {
        checkFormatting();
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [checkFormatting]);

  const execCmd = (command: string, value?: string) => {
    document.execCommand(command, false, value || undefined);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      editorRef.current.focus();
      checkFormatting();
    }
  };

  const applyInlineCode = () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    const range = selection.getRangeAt(0);

    if (activeFormats.code) {
      let node = selection.anchorNode;
      while (node && node !== editorRef.current) {
        if (node.nodeName === 'CODE') {
          const textNode = document.createTextNode(node.textContent || '');
          node.parentNode?.replaceChild(textNode, node);
          
          // Reselect the text
          const newRange = document.createRange();
          newRange.selectNodeContents(textNode);
          selection.removeAllRanges();
          selection.addRange(newRange);
          
          if (editorRef.current) setContent(editorRef.current.innerHTML);
          checkFormatting();
          return;
        }
        node = node.parentNode;
      }
      return;
    }

    if (range.collapsed) return; // Need to select text to make it code
    const codeNode = document.createElement('code');
    codeNode.style.background = 'rgba(0,0,0,0.3)';
    codeNode.style.color = 'var(--primary)';
    codeNode.style.padding = '2px 4px';
    codeNode.style.borderRadius = '3px';
    codeNode.style.fontFamily = 'monospace';
    try {
      range.surroundContents(codeNode);
      if (editorRef.current) setContent(editorRef.current.innerHTML);
      checkFormatting();
    } catch {
      // Ignore complex selections that can't be surrounded
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    const finalCategory = customCategory.trim() || (category === 'custom' ? 'Ideas' : category);
    onSave({
      ...(initialNote || {}),
      title: title.trim(),
      content: content.trim(),
      category: finalCategory,
      color,
      isPinned,
    });
    onClose();
  };

  const toolbarButtons = [
    { id: 'bold', icon: <Bold size={14} />, action: () => execCmd('bold'), title: 'Bold (Cmd+B)' },
    { id: 'italic', icon: <Italic size={14} />, action: () => execCmd('italic'), title: 'Italic (Cmd+I)' },
    { id: 'underline', icon: <Underline size={14} />, action: () => execCmd('underline'), title: 'Underline (Cmd+U)' },
    { id: 'strikeThrough', icon: <Strikethrough size={14} />, action: () => execCmd('strikeThrough'), title: 'Strikethrough' },
    { id: 'code', icon: <Code size={14} />, action: applyInlineCode, title: 'Inline Code' },
    { icon: null, divider: true },
    { id: 'insertUnorderedList', icon: <List size={14} />, action: () => execCmd('insertUnorderedList'), title: 'Bullet List' },
    { id: 'insertOrderedList', icon: <ListOrdered size={14} />, action: () => execCmd('insertOrderedList'), title: 'Numbered List' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: '680px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Color accent bar */}
        <div style={{ height: 4, background: color, borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', margin: '-1px -1px 0 -1px' }} />

        <div className="modal-header">
          <h2 className="modal-title">{initialNote ? 'Edit Note' : 'New Note'}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Note Title *</label>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '1rem', fontWeight: 600 }}
                placeholder="Enter note title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Category + Pin row */}
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label">Category / Tag</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setCustomCategory('');
                    }}
                    style={{ flex: 1 }}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="custom">+ New Category...</option>
                  </select>
                  {category === 'custom' && (
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter category..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      style={{ flex: 1 }}
                      autoFocus
                    />
                  )}
                </div>
              </div>

              {/* Pin toggle */}
              <div className="form-group">
                <label className="form-label">Pin</label>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsPinned(!isPinned)}
                  style={{
                    height: '38px',
                    borderColor: isPinned ? color : 'var(--border-subtle)',
                    background: isPinned ? `${color}20` : 'transparent',
                    color: isPinned ? color : 'var(--text-muted)',
                    gap: '6px',
                  }}
                >
                  <Pin size={14} style={{ transform: isPinned ? 'rotate(45deg)' : 'none', transition: 'transform 200ms ease' }} />
                  <span>{isPinned ? 'Pinned' : 'Unpin'}</span>
                </button>
              </div>
            </div>

            {/* Color swatches */}
            <div className="form-group">
              <label className="form-label">Accent Color</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: c.value,
                      border: color === c.value ? '2px solid white' : '2px solid transparent',
                      boxShadow: color === c.value ? `0 0 0 2px ${c.value}` : 'none',
                      cursor: 'pointer',
                      transition: 'transform 150ms ease',
                      transform: color === c.value ? 'scale(1.2)' : 'scale(1)',
                    }}
                    title={c.label}
                    aria-label={`Select color: ${c.label}`}
                  />
                ))}
              </div>
            </div>

            {/* Markdown editor */}
            <div className="markdown-editor-card" style={{ padding: '0', overflow: 'hidden', background: '#161616', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div className="editor-header" style={{ borderBottom: '1px solid var(--border-subtle)', padding: '10px 14px', background: 'var(--bg-surface-elevated)' }}>
                <span className="form-label" style={{ marginBottom: 0, fontWeight: 600 }}>
                  Note Content *
                </span>
              </div>
              <div className="editor-toolbar" style={{ padding: '8px 14px', background: 'var(--bg-glass-card)' }}>
                {/* eslint-disable-next-line react-hooks/refs */}
                {toolbarButtons.map((btn, i) =>
                  btn.divider ? (
                    <span
                      key={`divider-${i}`}
                      style={{ width: 1, height: 16, background: 'var(--border-subtle)', margin: '0 4px' }}
                    />
                  ) : (
                    <button
                      key={i}
                      type="button"
                      className="toolbar-btn"
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        background: btn.id && activeFormats[btn.id] ? 'rgba(245, 166, 35, 0.15)' : 'transparent',
                        color: btn.id && activeFormats[btn.id] ? '#F5A623' : 'var(--text-muted)',
                        border: btn.id && activeFormats[btn.id] ? '1px solid rgba(245, 166, 35, 0.3)' : '1px solid transparent',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!(btn.id && activeFormats[btn.id])) {
                          e.currentTarget.style.background = '#222222';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!(btn.id && activeFormats[btn.id])) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                      onClick={btn.action}
                      onMouseDown={(e) => e.preventDefault()}
                      title={btn.title}
                    >
                      {btn.icon}
                    </button>
                  )
                )}
              </div>
              <div
                ref={editorRef}
                className="outline-none"
                contentEditable
                onInput={(e) => {
                  setContent(e.currentTarget.innerHTML);
                  checkFormatting();
                }}
                onBlur={(e) => setContent(e.currentTarget.innerHTML)}
                onKeyUp={checkFormatting}
                onMouseUp={checkFormatting}
                onFocus={checkFormatting}
                style={{
                  minHeight: '220px',
                  padding: '16px',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  color: 'var(--text-main)',
                  background: 'transparent',
                  border: 'none',
                  overflowY: 'auto'
                }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {initialNote ? 'Save Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
