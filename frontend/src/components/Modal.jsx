import React, { useEffect, useId, useRef } from "react";

/**
 * Modal Component
 * Reusable modal dialog
 */

export default function Modal({ isOpen, onClose, title, children, className = "" }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return undefined;

    const previouslyFocused = document.activeElement;
    if (!dialog.open) dialog.showModal();

    return () => {
      if (dialog.open) dialog.close();
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={`fixed inset-0 z-50 m-auto max-h-[90vh] w-11/12 max-w-md overflow-y-auto rounded-lg bg-white p-0 shadow-xl backdrop:bg-black/50 backdrop:backdrop-blur-sm ${className}`}
    >
      <div className="relative">
        <div className="flex items-center justify-between border-b border-[#E8DFD1] px-6 py-4">
          <h2 id={titleId} className="text-lg font-serif font-semibold text-[#1F2E27]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-2 text-[#5F5A53] transition-colors hover:text-[#1F2E27] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C4A03]"
            aria-label="Close modal"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </dialog>
  );
}
