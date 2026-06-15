"use client";

type Document = { 
  name: string; 
  size: number; 
  status: string;
  text?: string;
};

type PDFMetadataModalProps = {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
};

export default function PDFMetadataModal({ isOpen, onClose, document }: PDFMetadataModalProps) {
  if (!isOpen) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getWordCount = (text?: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).length;
  };

  const getReadingTime = (text?: string) => {
    const words = getWordCount(text);
    return Math.max(1, Math.ceil(words / 200));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#0c0c0e] border border-white/[0.06] rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[60px] pointer-events-none" />

        <header className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <div className="overflow-hidden max-w-[200px]">
              <h3 className="text-xs font-black tracking-tight text-white uppercase truncate">{document.name}</h3>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Document Metadata</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        <div className="space-y-3.5 mb-6">
          <div className="flex justify-between items-center py-2 px-3 bg-white/[0.01] border border-white/[0.03] rounded-xl">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">File Size</span>
            <span className="text-xs text-gray-200 font-semibold">{formatBytes(document.size)}</span>
          </div>

          <div className="flex justify-between items-center py-2 px-3 bg-white/[0.01] border border-white/[0.03] rounded-xl">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Character Count</span>
            <span className="text-xs text-gray-200 font-semibold">{document.text?.length || 0} chars</span>
          </div>

          <div className="flex justify-between items-center py-2 px-3 bg-white/[0.01] border border-white/[0.03] rounded-xl">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Word Count</span>
            <span className="text-xs text-gray-200 font-semibold">{getWordCount(document.text)} words</span>
          </div>

          <div className="flex justify-between items-center py-2 px-3 bg-white/[0.01] border border-white/[0.03] rounded-xl">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Reading Time</span>
            <span className="text-xs text-indigo-400 font-semibold">~{getReadingTime(document.text)} min read</span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-2 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] text-gray-300 transition-all rounded-lg text-xs font-bold uppercase tracking-wider"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
