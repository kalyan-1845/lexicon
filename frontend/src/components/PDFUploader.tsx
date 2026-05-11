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
  const [documents, setDocuments] = useState<Document[]>([
    { name: "Machine_Learning_Ch1.pdf", size: 2.4 * 1024 * 1024, status: "Waiting..." }
  ]);
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
    <aside aria-label="Document Sources" className="w-80 border-l border-white/[0.05] bg-[#050506] h-full flex flex-col p-6 shadow-2xl z-10 shrink-0">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-bold text-gray-100 text-lg">Knowledge</h2>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/[0.03] px-2 py-1 rounded-md border border-white/5">{documents.length} Files</span>
      </div>
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        accept="application/pdf" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />

      {/* Upload Zone */}
      <div 
        role="button"
        tabIndex={0}
        aria-label="Upload a PDF. Drag and drop or click to browse."
        onClick={() => fileInputRef.current?.click()}
        className={`group relative border-2 border-dashed rounded-[32px] p-8 flex flex-col items-center justify-center text-center transition-all duration-500 overflow-hidden ${
          isDragging 
            ? "border-indigo-500 bg-indigo-500/[0.02]" 
            : "border-white/[0.05] hover:border-white/20 hover:bg-white/[0.01]"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className={`w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4 border border-white/[0.05] group-hover:scale-110 group-hover:bg-indigo-500 transition-all duration-500 ${isUploading ? 'animate-pulse' : ''}`}>
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-white transition-colors">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-200 mb-1">{isUploading ? "Uploading..." : "Import PDF"}</p>
        <p className="text-[11px] text-gray-500 px-4">Maximum file size: 50MB</p>
      </div>

      {/* Active Documents List */}
      <nav aria-label="Active Documents" className="mt-10 flex-1 overflow-y-auto space-y-3 scrollbar-hide">
        <h3 className="text-[10px] font-bold text-gray-500 mb-4 uppercase tracking-[0.2em] px-2">Active Context</h3>
        <ul className="space-y-3">
          {documents.map((doc, idx) => (
            <li key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4 group hover:bg-white/[0.04] transition-all">
               <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20 group-hover:bg-red-500 group-hover:text-white transition-all">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={doc.status === 'Error' ? 'text-red-500' : 'text-red-400 group-hover:text-white'}>
                   <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                   <polyline points="14 2 14 8 20 8"></polyline>
                 </svg>
               </div>
               <div className="flex flex-col overflow-hidden w-full">
                 <span className="text-[13px] font-semibold text-gray-200 truncate" title={doc.name}>{doc.name}</span>
                 <div className="flex items-center gap-2 mt-0.5">
                   <span className="text-[10px] font-bold text-gray-600 uppercase">{formatSize(doc.size)}</span>
                   <span className="w-1 h-1 rounded-full bg-gray-700" />
                   <span className={`text-[10px] font-bold uppercase ${doc.status === 'Error' ? 'text-red-500' : 'text-indigo-500'}`}>
                     {doc.status}
                   </span>
                 </div>
               </div>
               {doc.status.startsWith('Parsed') && (
                 <button 
                   onClick={() => handleSummarize(doc)}
                   className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100"
                   aria-label={`Summarize ${doc.name}`}
                 >
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                     <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                   </svg>
                 </button>
               )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
