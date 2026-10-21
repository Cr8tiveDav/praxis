'use client';

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  itemName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  zIndex?: number;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'Confirm Deletion',
  message,
  itemName,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
  zIndex = 150,
}) => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Auto-focus cancel button for safety against accidental presses
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // Note: No onClick on modal-overlay so clicking outside does NOT close it.
    <div
      className="modal-overlay"
      style={{ zIndex }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="modal-dialog"
        style={{
          maxWidth: '440px',
          borderTop: '3px solid var(--priority-urgent)',
          animation: 'slideUp 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-md)',
                background: 'var(--priority-urgent-bg)',
                color: 'var(--priority-urgent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <h3
              id="confirm-modal-title"
              className="modal-title"
              style={{ fontSize: '1.05rem', margin: 0 }}
            >
              {title}
            </h3>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Close dialog"
            title="Close"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '18px 20px', gap: '10px' }}>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {message}
          </p>

          {itemName && (
            <div
              style={{
                padding: '10px 14px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: 600,
                wordBreak: 'break-word',
              }}
            >
              &ldquo;{itemName}&rdquo;
            </div>
          )}

          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '0.78rem',
              color: 'var(--priority-urgent)',
              fontWeight: 500,
            }}
          >
            This action cannot be undone.
          </p>
        </div>

        <div className="modal-footer" style={{ padding: '14px 20px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ padding: '8px 16px', fontSize: '0.875rem' }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            className="btn btn-danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              padding: '8px 16px',
              fontSize: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Trash2 size={14} />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
