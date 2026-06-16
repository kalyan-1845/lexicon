"use client";
import PDFUploader from "./PDFUploader";
import SmartNotes from "./SmartNotes";

type Document = { 
  name: string; 
  size: number; 
  status: string;
  text?: string;
  thumbnail?: string;
};

type RightSidebarProps = {
  workspaceName: string;
  activeTab: "docs" | "notes";
  setActiveTab: (tab: "docs" | "notes") => void;
  documents: Document[];
  setDocuments: (action: Document[] | ((prev: Document[]) => Document[])) => void;
  onContextUpdate: (text: string | null) => void;
  onClose: () => void;
  onToggleSidebar?: () => void;
};

export default function RightSidebar({ workspaceName, activeTab, setActiveTab, documents, setDocuments, onContextUpdate, onClose, onToggleSidebar }: RightSidebarProps) {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200" 
        onClick={onClose} 
      />
      
      <aside className="fixed lg:static inset-y-0 right-0 z-50 lg:z-auto w-80 lg:w-72 border-l border-[var(--theme-border)] bg-[var(--theme-surface)]/98 lg:bg-[var(--theme-bg)] h-full flex flex-col shrink-0 shadow-2xl lg:shadow-none animate-in slide-in-from-right duration-300">
      <div className="h-12 border-b border-[var(--theme-border)] flex items-center px-4 justify-between bg-[var(--theme-bg)]/50">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab("docs")}
            className={`text-[12px] font-semibold transition-all ${
              activeTab === "docs" ? "text-[var(--theme-text)]" : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
            }`}
          >
            Knowledge
          </button>
          <button 
            onClick={() => setActiveTab("notes")}
            className={`text-[12px] font-semibold transition-all ${
              activeTab === "notes" ? "text-[var(--theme-text)]" : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
            }`}
          >
            Insights
          </button>
        </div>
        <button onClick={onClose} className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "docs" ? (
          <PDFUploader 
            documents={documents}
            setDocuments={setDocuments}
            onContextUpdate={onContextUpdate} 
            isEmbedded 
          />
        ) : (
          <SmartNotes workspaceName={workspaceName} onClose={onClose} isEmbedded />
        )}
      </div>
    </aside>
    </>
  );
}
