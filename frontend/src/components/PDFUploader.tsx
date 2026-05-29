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
};

type PDFUploaderProps = {
  documents: Document[];
  setDocuments: (docs: Document[]) => void;
  onContextUpdate?: (text: string | null) => void;
  isEmbedded?: boolean;
};

export default function PDFUploader({ documents, setDocuments, onContextUpdate, isEmbedded }: PDFUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const handleExportCitations = () => {
    window.open(getApiUrl("/api/citations/export"), "_blank");
  };

  const handleUpload = (file: File) => {
    if (!file || file.type !== "application/pdf") return;

    setIsUploading(true);
    setUploadProgress(0);
    const newDoc = { name: file.name, size: file.size, status: "Uploading (0%)..." };
    setDocuments([newDoc, ...documents]);
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
        setDocuments(documents.map(d => 
          d.name === file.name 
            ? { ...d, status: `Uploading (${percent}%)...` } 
            : d
        ));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          setDocuments(documents.map(d => 
            d.name === file.name 
              ? { 
                  ...d, 
                  status: `Parsed (${data.extracted_character_count} chars)`,
                  text: data.full_text
                } 
              : d
          ));
          if (onContextUpdate && data.full_text) {
            onContextUpdate(data.full_text);
          }
          showToast(`Successfully parsed and indexed: ${file.name}`, "success");
        } catch {
          handleError();
        }
      } else {
        handleError();
      }
      cleanup();
    };

    xhr.onerror = () => {
      handleError();
      cleanup();
    };

    xhr.onabort = () => {
      setDocuments(documents.filter(d => d.name !== file.name));
      showToast(`Upload cancelled: ${file.name}`, "warning");
      cleanup();
    };

    const handleError = () => {
      setDocuments(documents.map(d => 
        d.name === file.name ? { ...d, status: "Upload Failed" } : d
      ));
      showToast(`Failed to upload: ${file.name}`, "error");
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
      const response = await fetch(getApiUrl("/api/chat/summarize"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: doc.text }),
      });
      if (!response.ok) throw new Error("Summarization failed");
      const data = await response.json();
      alert(`Summary of ${doc.name}:\n\n${data.summary}`);
    } catch (err) {
      console.error("Summarization error:", err);
      alert("Failed to summarize.");
    }
  };

  const content = (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-[12px] text-gray-400">Knowledge Base</h2>
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
          <span className="text-[11px] font-bold text-gray-500 bg-white/[0.02] px-2 py-0.5 rounded border border-white/[0.04]">{documents.length}</span>
        </div>
      </div>
      
      <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />

      <button 
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()} 
        className={`w-full py-3.5 border border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group shrink-0 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/[0.01]'}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-gray-500 transition-colors ${isUploading ? 'animate-spin' : 'group-hover:text-white'}`}>
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
        <span className="text-[12px] font-semibold text-gray-400 group-hover:text-white transition-colors">
          {isUploading ? 'Uploading...' : 'Add Document'}
        </span>
      </button>

      <div className="mt-5 flex-1 overflow-y-auto space-y-3">
        {documents.map((doc, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-white/[0.01] border border-white/[0.04] flex items-center gap-3 group hover:bg-white/[0.02] transition-all">
             <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-500/60">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                </svg>
             </div>
             <div className="flex flex-col overflow-hidden flex-1">
                <span className="text-[12px] font-semibold text-gray-300 truncate">{doc.name}</span>
                <span className="text-[10px] font-semibold text-gray-500">{doc.status}</span>
               {doc.status.startsWith('Uploading') && uploadProgress !== null && (
                 <div className="w-full bg-white/5 rounded-full h-1 mt-1.5 overflow-hidden">
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
                   className="w-6 h-6 rounded hover:bg-white/5 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"
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
                 <button onClick={() => setSelectedDoc(doc)} className="w-6 h-6 rounded hover:bg-white/5 flex items-center justify-center">
                   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-600 hover:text-white">
                     <circle cx="12" cy="12" r="10"></circle>
                     <line x1="12" y1="16" x2="12" y2="12"></line>
                     <line x1="12" y1="8" x2="12.01" y2="8"></line>
                   </svg>
                 </button>
                 <button onClick={() => handleSummarize(doc)} className="w-6 h-6 rounded hover:bg-white/5 flex items-center justify-center">
                   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-600 hover:text-white">
                     <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                   </svg>
                 </button>
               </div>
             )}
          </div>
        ))}
      </div>
      <PDFMetadataModal isOpen={selectedDoc !== null} onClose={() => setSelectedDoc(null)} document={selectedDoc || { name: '', size: 0, status: '' }} />
    </div>
  );

  if (isEmbedded) return content;

  return (
    <aside className="w-72 border-l border-white/[0.04] bg-[#09090b] h-full flex flex-col shrink-0">
      {content}
    </aside>
  );
}
