"use client";
import { useState, useRef } from "react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file || file.type !== "application/pdf") return;

    setIsUploading(true);
    const newDoc = { name: file.name, size: file.size, status: "Uploading..." };
    setDocuments([newDoc, ...documents]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/upload/pdf", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      
      setDocuments([{ 
        ...newDoc, 
        status: `Parsed (${data.extracted_character_count} chars)`,
        text: data.full_text
      }, ...documents]);
      
      if (onContextUpdate && data.full_text) {
        onContextUpdate(data.full_text);
      }
    } catch (error) {
      setDocuments([{ ...newDoc, status: "Error" }, ...documents]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSummarize = async (doc: Document) => {
    if (!doc.text) return;
    try {
      const response = await fetch("http://localhost:8000/api/chat/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: doc.text }),
      });
      if (!response.ok) throw new Error("Summarization failed");
      const data = await response.json();
      alert(`Summary of ${doc.name}:\n\n${data.summary}`);
    } catch (error) {
      alert("Failed to summarize.");
    }
  };

  const content = (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[10px] uppercase tracking-widest text-gray-500">Knowledge</h2>
        <span className="text-[9px] font-bold text-gray-700 bg-white/[0.02] px-1.5 py-0.5 rounded border border-white/[0.04]">{documents.length}</span>
      </div>
      
      <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />

      <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 border border-dashed border-white/5 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-white/[0.01] transition-all group shrink-0">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-600 group-hover:text-white transition-colors">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span className="text-[10px] font-bold text-gray-500 group-hover:text-white transition-colors uppercase tracking-wider">Add Document</span>
      </button>

      <div className="mt-6 flex-1 overflow-y-auto space-y-3">
        {documents.map((doc, idx) => (
          <div key={idx} className="p-2.5 rounded-lg bg-white/[0.01] border border-white/[0.04] flex items-center gap-2.5 group hover:bg-white/[0.02] transition-all">
             <div className="w-7 h-7 rounded bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/5">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-500/60">
                 <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
               </svg>
             </div>
             <div className="flex flex-col overflow-hidden flex-1">
               <span className="text-[11px] font-semibold text-gray-300 truncate">{doc.name}</span>
               <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">{doc.status}</span>
             </div>
             {doc.status.startsWith('Parsed') && (
               <button onClick={() => handleSummarize(doc)} className="w-6 h-6 rounded hover:bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-600 hover:text-white">
                   <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                 </svg>
               </button>
             )}
          </div>
        ))}
      </div>
    </div>
  );

  if (isEmbedded) return content;

  return (
    <aside className="w-72 border-l border-white/[0.04] bg-[#09090b] h-full flex flex-col shrink-0">
      {content}
    </aside>
  );
}
