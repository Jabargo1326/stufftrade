import { useEffect } from 'react';

// variant "dialog" = small centered box (confirmations)
// variant "sheet"  = slides up from the bottom on phones, centered on bigger screens
export default function Modal({ open, onClose, variant = 'dialog', children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={`modal-backdrop ${variant}`} onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal ${variant}`} role="dialog" aria-modal="true">{children}</div>
    </div>
  );
}

export function ConfirmDialog({ open, title, text, cancelLabel = 'Cancel', confirmLabel, danger, busy, onCancel, onConfirm }) {
  return (
    <Modal open={open} onClose={onCancel}>
      <h3 className="dialog-title">{title}</h3>
      <p className="dialog-text">{text}</p>
      <div className="row gap">
        <button className="btn btn-soft" onClick={onCancel}>{cancelLabel}</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={busy}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}
