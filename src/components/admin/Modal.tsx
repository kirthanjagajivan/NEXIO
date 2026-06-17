import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-[#1E293B] rounded-2xl shadow-2xl shadow-black/60 w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/60">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  danger?: boolean;
}

export function ConfirmModal({ title, message, confirmLabel, onConfirm, onClose, danger = true }: ConfirmModalProps) {
  const { t } = useLanguage();
  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-slate-400 text-sm leading-relaxed mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 border border-slate-700 text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-700 transition-colors"
        >
          {t.cancel}
        </button>
        <button
          onClick={onConfirm}
          className={`flex-1 py-2.5 rounded-lg font-semibold text-sm text-white transition-colors ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-500'}`}
        >
          {confirmLabel ?? t.delete_confirm}
        </button>
      </div>
    </Modal>
  );
}
