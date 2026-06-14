"use client";

type ClearHistoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ClearHistoryModal({ isOpen, onClose, onConfirm }: ClearHistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-500/5 blur-[60px] pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-black tracking-tight text-[var(--theme-text)] uppercase">Clear Chat History</h3>
            <p className="text-[10px] text-[var(--theme-text-muted)] font-bold tracking-tight">This action cannot be undone</p>
          </div>
        </div>

        <p className="text-xs text-[var(--theme-text-muted)] font-medium leading-relaxed mb-6">
          Are you sure you want to clear all messages in this research workspace? Your documents and memory profiles will remain intact.
        </p>

        <div className="flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg bg-white/[0.02] border border-[var(--theme-border)] text-xs font-bold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-white/[0.06] transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-3.5 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
          >
            Clear Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
