// src/components/ConfirmModal.js
import { useEffect } from 'react';

export default function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
  icon = 'warning',
  customBody = null, // ← NEW: optional JSX to render between message and actions
}) {
  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, loading, onCancel]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const iconSvg = {
    warning: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    trash: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    info: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    // NEW icons for posting
    megaphone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l18-8v18l-18-8z" />
        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
      </svg>
    ),
    calendar: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    clock: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  };

  return (
    <div className="confirm-overlay" onClick={() => !loading && onCancel()}>
      <div
        className={`confirm-modal confirm-${variant} ${customBody ? 'has-custom-body' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Decorative arch top */}
        <div className="confirm-arch" aria-hidden="true">
          <svg viewBox="0 0 400 60" preserveAspectRatio="none">
            <path d="M0,60 Q200,-40 400,60" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M40,60 Q200,-10 360,60" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
          </svg>
        </div>

        {/* Icon in ring */}
        <div className="confirm-icon-wrap">
          <div className="confirm-icon-ring"></div>
          <div className="confirm-icon">
            <span className="confirm-icon-svg">
              {iconSvg[icon] || iconSvg.warning}
            </span>
          </div>
        </div>

        {/* Eyebrow label */}
        <p className="confirm-eyebrow">
          {variant === 'danger' && 'Destructive Action'}
          {variant === 'warning' && 'Please Confirm'}
          {variant === 'primary' && 'Confirmation Required'}
          {variant === 'success' && 'All Set'}
        </p>

        {/* Title */}
        <h3 className="confirm-title">{title}</h3>

        {/* Message */}
        <p className="confirm-message">{message}</p>

        {/* NEW: Custom preview body */}
        {customBody && <div className="confirm-custom-body">{customBody}</div>}

        {/* Divider with gold accent */}
        <div className="confirm-divider" aria-hidden="true">
          <span className="confirm-divider-line"></span>
          <span className="confirm-divider-diamond"></span>
          <span className="confirm-divider-line"></span>
        </div>

        {/* Actions */}
        <div className="confirm-actions">
          <button
            className="confirm-btn confirm-cancel"
            onClick={onCancel}
            disabled={loading}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className={`confirm-btn confirm-${variant}`}
            onClick={onConfirm}
            disabled={loading}
            type="button"
          >
            {loading ? (
              <>
                <span className="confirm-btn-spinner"></span>
                Processing…
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}