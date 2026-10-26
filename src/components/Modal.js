import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';
import './Modal.css';

// Accessible overlay shared by the video player and the photo lightbox:
// Esc closes, arrow keys step through items, focus stays inside while open
// and returns to the opener afterwards.
function Modal({ label, onClose, onPrev, onNext, counter, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const opener = document.activeElement;
    document.body.classList.add('scroll-locked');
    dialogRef.current?.querySelector('[data-autofocus]')?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && onPrev) onPrev();
      else if (e.key === 'ArrowRight' && onNext) onNext();
      else if (e.key === 'Tab') {
        const focusable = dialogRef.current.querySelectorAll('button, iframe, a[href]');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('scroll-locked');
      if (opener && opener.focus) opener.focus();
    };
  }, [onClose, onPrev, onNext]);

  return createPortal(
    <div className="modal" role="dialog" aria-modal="true" aria-label={label} ref={dialogRef}>
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__bar">
        {counter && <span className="modal__counter">{counter}</span>}
        <button className="modal__btn" onClick={onClose} aria-label="Close" data-autofocus>
          <Icon name="close" size={22} />
        </button>
      </div>
      <div className="modal__stage">{children}</div>
      {onPrev && (
        <button className="modal__btn modal__nav modal__nav--prev" onClick={onPrev} aria-label="Previous">
          <Icon name="prev" size={22} />
        </button>
      )}
      {onNext && (
        <button className="modal__btn modal__nav modal__nav--next" onClick={onNext} aria-label="Next">
          <Icon name="next" size={22} />
        </button>
      )}
    </div>,
    document.body
  );
}

export default Modal;
