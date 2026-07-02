/**
 * Modal Component
 * Reusable modal dialog
 */

export default function Modal({ isOpen, onClose, title, children, className = "" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className={`relative bg-white rounded-lg shadow-xl max-w-md w-11/12 ${className}`}>
        <div className="flex items-center justify-between border-b border-[#E8DFD1] px-6 py-4">
          <h2 className="text-lg font-serif font-semibold text-[#1F2E27]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#7A7A7A] hover:text-[#1F2E27] transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
