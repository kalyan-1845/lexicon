"use client";
import { useState, useRef } from "react";

type Document = { name: string; size: number; status: string };

export default function PDFUploader() {
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
        doc.name === file.name ? { ...doc, status: `Parsed (${data.extracted_character_count} chars)` } : doc
      ));
    } catch (error) {
      console.error("Error uploading file:", error);
      setDocuments(prev => prev.map(doc => 
        doc.name === file.name ? { ...doc, status: "Error" } : doc
      ));
    } finally {
      setIsUploading(false);
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
    <aside aria-label="Document Sources" className="w-80 border-l border-white/5 bg-[#0a0a0b] h-full flex flex-col hidden lg:flex p-4">
      <h2 className="font-semibold text-gray-200 mb-4">Document Sources</h2>
      
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
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer ${
          isDragging ? "border-indigo-500 bg-indigo-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mb-3">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 ${isUploading ? 'animate-pulse' : ''}`}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-200 mb-1">{isUploading ? "Uploading..." : "Upload a PDF"}</p>
        <p className="text-xs text-gray-500 mb-4">Drag and drop or click to browse</p>
        <button tabIndex={-1} aria-hidden="true" className="px-4 py-2 rounded-lg text-xs font-semibold bg-white text-[#0a0a0b] hover:bg-gray-200 transition-colors pointer-events-none">
          Browse Files
        </button>
      </div>

      {/* Active Documents List */}
      <nav aria-label="Active Documents" className="mt-6 flex-1 overflow-y-auto pr-2">
        <h3 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Active Documents</h3>
        <ul className="space-y-2">
          {documents.map((doc, idx) => (
            <li key={idx} className="p-3 rounded-lg bg-gray-900 border border-white/5 flex items-center gap-3">
               <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`${doc.status === 'Error' ? 'text-red-500' : 'text-red-400'} shrink-0`}>
                 <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                 <polyline points="14 2 14 8 20 8"></polyline>
               </svg>
               <div className="flex flex-col overflow-hidden w-full">
                 <span className="text-sm text-gray-200 truncate" title={doc.name}>{doc.name}</span>
                 <span className={`text-xs ${doc.status === 'Error' ? 'text-red-400' : 'text-gray-500'}`}>
                   {formatSize(doc.size)} • {doc.status}
                 </span>
               </div>
               {doc.status.startsWith('Parsed') && (
                 <button 
                   onClick={() => alert(`Summarizing ${doc.name}... (Backend Hook Pending)`)}
                   className="p-1.5 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                   aria-label={`Summarize ${doc.name}`}
                   title="Summarize Document"
                 >
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                     <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                     <line x1="9" y1="10" x2="15" y2="10"></line>
                     <line x1="12" y1="7" x2="12" y2="13"></line>
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
