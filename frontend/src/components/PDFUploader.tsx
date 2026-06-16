"use client";
import { useState, useRef } from "react";
import PDFMetadataModal from "@/components/PDFMetadataModal";
import { showToast } from "@/components/Toast";
import { getApiUrl } from "@/utils/api";

type Document = { 
  name: string; 
  size: number; 
  status: string;
  text?: string;
  thumbnail?: string;
};

type PDFUploaderProps = {
  documents: Document[];
  setDocuments: (action: Document[] | ((prev: Document[]) => Document[])) => void;
  onContextUpdate?: (text: string | null) => void;
  isEmbedded?: boolean;
};

export default function PDFUploader({ documents, setDocuments, onContextUpdate, isEmbedded }: PDFUploaderProps) {
  console.log("DOCUMENTS =", documents);
console.log("IS ARRAY =", Array.isArray(documents));
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const [summaryData, setSummaryData] = useState<{name: string; summary: string} | null>(null);

  const handleExportCitations = () => {
    window.open(getApiUrl("/api/citations/export"), "_blank");
  };

  const handleUpload = (file: File) => {
    if (!file || file.type !== "application/pdf") return;

    setIsUploading(true);
    setUploadProgress(0);
    const newDoc = { name: file.name, size: file.size, status: "Uploading (0%)..." };
    setDocuments(prev => {
  const safePrev = Array.isArray(prev) ? prev : [];

  return [
    newDoc,
    ...safePrev
  ];
});
    showToast(`Uploading document: ${file.name}`, "info");

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    // Track upload progress dynamically
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
        setDocuments(prev => {
          const safePrev = Array.isArray(prev) ? prev : [];
          return safePrev.map(d =>
            d.name === file.name
              ? { ...d, status: `Uploading (${percent}%)...` }
              : d
          );
        });
      }
    };

    xhr.onload = ()=> {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          setDocuments(prev => {
            const safePrev = Array.isArray(prev) ? prev : [];
            return safePrev.map(d =>
              d.name === file.name
                ? {
                    ...d,
                    status: `Parsed (${data.extracted_character_count} chars)`,
                    text: data.full_text,
                    thumbnail: data.thumbnail
                  }
                : d
            );
          });
          if (onContextUpdate && data.full_text) {
            onContextUpdate(data.full_text);
          }
          showToast(`Successfully parsed and indexed: ${file.name}`, "success");
        } catch {
          handleError();
        }
      }
      else {
        handleError();
      }
      cleanup();
    };

    xhr.onerror = () => {
      handleError();
      cleanup();
    };

    xhr.onabort = () => {
    setDocuments(prev => {
  const safePrev = Array.isArray(prev) ? prev : [];
  return safePrev.filter(d => d.name !== file.name);
});
      showToast(`Upload cancelled: ${file.name}`, "warning");
      cleanup();
    };

    const handleError = () => {
     setDocuments(prev => {
  const safePrev = Array.isArray(prev) ? prev : [];

  return safePrev.map(d =>
    d.name === file.name
      ? { ...d, status: "Upload Failed" }
      : d
  );
});
    };

    const cleanup = () => {
      setIsUploading(false);
      setUploadProgress(null);
      xhrRef.current = null;
    };

    xhr.open("POST", getApiUrl("/api/upload/pdf"));
    xhr.send(formData);
  };

  const cancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
    }
  };

  const handleSummarize = async (doc: Document) => {
    if (!doc.text) return;
    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: doc.text }),
      });
      if (!response.ok) throw new Error("Summarization failed");
      const data = await response.json();
      setSummaryData({ name: doc.name, summary: data.summary });
    } catch (err) {
      console.error("Summarization error:", err);
      showToast("Failed to summarize document.", "error");
    }
  };

  const content = (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-[12px] text-[var(--theme-text-muted)]">Knowledge Base</h2>
        <div className="flex items-center gap-2">
          {documents.length > 0 && (
            <button 
              onClick={handleExportCitations}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer transition-all"
              title="Export Citations (BibTeX)"
            >
              Export BibTeX
            </button>
          )}
          <span className="text-[11px] font-bold text-[var(--theme-text-muted)] bg-white/[0.02] px-2 py-0.5 rounded border border-[var(--theme-border)]">{documents.length}</span>
        </div>
      </div>
      
      <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />

      <button 
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()} 
        className={`w-full py-3.5 border border-dashed border-[var(--theme-border)] rounded-xl flex flex-col items-center justify-center gap-1 transition-all group shrink-0 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/[0.01]'}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-[var(--theme-text-muted)] transition-colors ${isUploading ? 'animate-spin' : 'group-hover:text-[var(--theme-text)]'}`}>
          {isUploading ? (
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          ) : (
            <>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </>
          )}
        </svg>
        <span className="text-[12px] font-semibold text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)] transition-colors">
          {isUploading ? 'Uploading...' : 'Add Document'}
        </span>
      </button>

      <div className="mt-5 flex-1 overflow-y-auto">
        {(Array.isArray(documents) ? documents : []).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="text-5xl mb-4">📄</div>

            <h3 className="text-gray-300 font-semibold">
              No Documents Yet
            </h3>

            <p className="text-gray-500 text-sm mt-2 max-w-[220px]">
              Upload a PDF to start building your knowledge base.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(Array.isArray(documents) ? documents : []).map((doc, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white/[0.01] border border-[var(--theme-border)] flex items-center gap-3 group hover:bg-white/[0.02] transition-all">
             <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-500/60">
                   <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                </svg>
             </div>
             <div className="flex flex-col overflow-hidden flex-1">
                <span className="text-[12px] font-semibold text-[var(--theme-text)] truncate">{doc.name}</span>
                <span className="text-[10px] font-semibold text-[var(--theme-text-muted)]">{doc.status}</span>
               {doc.status.startsWith('Uploading') && uploadProgress !== null && (
                 <div className="w-full bg-[var(--theme-border)] rounded-full h-1 mt-1.5 overflow-hidden">
                   <div 
                     className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                     style={{ width: `${uploadProgress}%` }}
                   />
                 </div>
               )}
             </div>
             {doc.status.startsWith('Uploading') && (
               <div className="flex gap-1 shrink-0">
                 <button 
                   onClick={cancelUpload} 
                   className="w-6 h-6 rounded hover:bg-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text-muted)] hover:text-red-400 transition-colors"
                   title="Cancel Upload"
                 >
                   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                     <line x1="18" y1="6" x2="6" y2="18"></line>
                     <line x1="6" y1="6" x2="18" y2="18"></line>
                   </svg>
                 </button>
               </div>
             )}
             {doc.status.startsWith('Parsed') && (
               <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                 <button onClick={() => setSelectedDoc(doc)} className="w-6 h-6 rounded hover:bg-[var(--theme-border)] flex items-center justify-center">
                   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-600 hover:text-[var(--theme-text)]">
                     <circle cx="12" cy="12" r="10"></circle>
                     <line x1="12" y1="16" x2="12" y2="12"></line>
                     <line x1="12" y1="8" x2="12.01" y2="8"></line>
                   </svg>
                 </button>
                 <button onClick={() => handleSummarize(doc)} className="w-6 h-6 rounded hover:bg-[var(--theme-border)] flex items-center justify-center">
                   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-600 hover:text-[var(--theme-text)]">
                     <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                   </svg>
                 </button>
               </div>
             )}
          </div>
        ))}
      </div>
    )}
      </div>
      
      <PDFMetadataModal isOpen={selectedDoc !== null} onClose={() => setSelectedDoc(null)} document={selectedDoc || { name: '', size: 0, status: '' }} />
      {summaryData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400">AI Summary</h3>
              <button onClick={() => setSummaryData(null)} className="p-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <p className="text-[11px] font-semibold text-[var(--theme-text-muted)] mb-3">{summaryData.name}</p>
            <div className="flex-1 overflow-y-auto text-[13px] text-[var(--theme-text)] leading-relaxed whitespace-pre-wrap">
              {summaryData.summary}
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setSummaryData(null)} className="px-4 py-1.5 rounded-lg bg-white/[0.05] border border-[var(--theme-border)] text-[11px] font-bold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isEmbedded) return content;

  return (
    <aside className="w-72 border-l border-[var(--theme-border)] bg-[var(--theme-bg)] h-full flex flex-col shrink-0">
      {content}
    </aside>
  );
}
