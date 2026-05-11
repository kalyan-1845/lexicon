"use client";
import { useState, useRef } from "react";

type Document = { 
  name: string; 
  size: number; 
  status: string;
  text?: string;
};

type PDFUploaderProps = {
  onContextUpdate?: (text: string | null) => void;
};

export default function PDFUploader({ onContextUpdate }: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }

    setIsUploading(true);
    const newDoc = { name: file.name, size: file.size, status: "Uploading..." };
    setDocuments(prev => [newDoc, ...prev]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/upload/pdf", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error("Upload failed");
      
      const data = await response.json();
      
      setDocuments(prev => prev.map(doc => 
        doc.name === file.name ? { 
          ...doc, 
          status: `Parsed (${data.extracted_character_count} chars)`,
          text: data.full_text
        } : doc
      ));
      
      if (onContextUpdate && data.full_text) {
        onContextUpdate(data.full_text);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setDocuments(prev => prev.map(doc => 
        doc.name === file.name ? { ...doc, status: "Error" } : doc
      ));
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
      console.error("Summarization error:", error);
      alert("Failed to summarize document.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
  };

  const formatSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <aside className="w-80 border-l border-white/[0.04] bg-[#09090b] h-full flex flex-col p-6 shrink-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-xs uppercase tracking-widest text-gray-400">Context</h2>
        <span className="text-[10px] font-bold text-gray-600 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.05]">{documents.length}</span>
      </div>
      
      <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

      <button 
        onClick={() => fileInputRef.current?.click()}
        className="w-full py-6 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/[0.01] transition-all group"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 group-hover:text-white transition-colors">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span className="text-xs font-semibold text-gray-400 group-hover:text-white transition-colors">Add Document</span>
      </button>

      <div className="mt-8 flex-1 overflow-y-auto space-y-4">
        {documents.map((doc, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-white/[0.01] border border-white/[0.04] flex items-center gap-3 group">
             <div className="w-8 h-8 rounded-md bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/10">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500/60">
                 <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
               </svg>
             </div>
             <div className="flex flex-col overflow-hidden flex-1">
               <span className="text-xs font-semibold text-gray-300 truncate">{doc.name}</span>
               <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">{doc.status}</span>
             </div>
             {doc.status.startsWith('Parsed') && (
               <button 
                 onClick={() => handleSummarize(doc)}
                 className="w-6 h-6 rounded-md hover:bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
               >
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-500">
                   <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                 </svg>
               </button>
             )}
          </div>
        ))}
      </div>
    </aside>
  );
}
