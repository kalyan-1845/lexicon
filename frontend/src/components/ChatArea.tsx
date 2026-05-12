"use client";
import { useState, useRef, useEffect } from "react";
import ShareModal from "@/components/ShareModal";
import AgentWorkflow from "@/components/AgentWorkflow";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatAreaProps = {
  workspaceName?: string;
  messages: Message[];
  setMessages: (msgs: Message[]) => void;
  onToggleNotes?: () => void;
  showNotes?: boolean;
  onToggleDocuments?: () => void;
  showDocuments?: boolean;
  documentContext?: string | null;
  onContextUpdate?: (text: string | null) => void;
};

export default function ChatArea({ 
  workspaceName,
  messages,
  setMessages,
  onToggleNotes, 
  showNotes, 
  onToggleDocuments, 
  showDocuments, 
  documentContext,
  onContextUpdate 
}: ChatAreaProps) {
  const [query, setQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!query.trim()) return;
    const userMessage: Message = { id: Date.now().toString(), role: "user", content: query.trim() };
    setMessages([...messages, userMessage]);
    setQuery("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content, document_context: documentContext }),
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setMessages([...messages, userMessage, { id: (Date.now() + 1).toString(), role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages([...messages, userMessage, { id: Date.now().toString(), role: "assistant", content: "⚠️ Connection error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file || file.type !== "application/pdf") return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("http://localhost:8000/api/upload/pdf", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      if (onContextUpdate && data.full_text) {
        onContextUpdate(data.full_text);
        setMessages([...messages, { id: Date.now().toString(), role: "assistant", content: `Parsed **${file.name}**.` }]);
      }
    } catch (error) {
      alert("Upload failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  return (
    <div 
      className="flex-1 flex flex-col h-full bg-[#09090b] relative"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-white/[0.02] backdrop-blur-sm border-2 border-dashed border-white/10 flex items-center justify-center pointer-events-none transition-all">
          <p className="text-xs font-bold text-white">Drop to analyze</p>
        </div>
      )}

      <div className="h-10 border-b border-white/[0.04] flex items-center justify-between px-4 bg-[#09090b]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <input 
            type="text"
            value={workspaceName || 'General'}
            onChange={(e) => {
              // Implementation of renaming logic here
            }}
            className="bg-transparent border-none p-0 text-[10px] font-bold text-gray-500 uppercase tracking-widest focus:ring-0 focus:text-white transition-colors cursor-edit"
          />
          <div className="w-1 h-1 rounded-full bg-green-500/50" />
        </div>

        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => {
              const content = messages.map(m => `### ${m.role.toUpperCase()}\n${m.content}\n`).join("\n");
              const blob = new Blob([content], { type: "text/markdown" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${workspaceName || 'research'}-export.md`;
              a.click();
            }} 
            className="px-2 py-0.5 text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase"
          >
            Export
          </button>
          <button onClick={() => setShowShareModal(true)} className="px-2 py-0.5 text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase">Share</button>

          <button onClick={onToggleDocuments} className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors uppercase ${showDocuments ? 'text-white' : 'text-gray-500 hover:text-white'}`}>Docs</button>
          <button onClick={onToggleNotes} className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors uppercase ${showNotes ? 'text-white' : 'text-gray-500 hover:text-white'}`}>Notes</button>
        </div>
      </div>

      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}

      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6 max-w-2xl mx-auto w-full">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3">
            <div className={`w-5 h-5 rounded bg-gray-800 flex items-center justify-center shrink-0 mt-0.5 ${msg.role === 'user' ? 'bg-white text-black' : 'text-white'}`}>
              <span className="text-[9px] font-black">{msg.role === 'user' ? 'U' : 'L'}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{msg.role === 'user' ? 'You' : 'Lexicon'}</span>
              <div className="text-[13px] leading-relaxed text-gray-300">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-5 h-5 rounded bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[9px] font-black">L</span>
            </div>
            <div className="flex gap-1 items-center h-4">
              <span className="w-1 h-1 bg-gray-700 rounded-full animate-pulse" />
              <span className="w-1 h-1 bg-gray-700 rounded-full animate-pulse delay-75" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-1">
        <AgentWorkflow />
      </div>

      <div className="px-4 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative flex items-center gap-1.5 p-1.5 bg-[#18181b] border border-white/5 rounded-lg focus-within:border-white/10 transition-all shadow-xl">
            <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} accept=".pdf" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="w-7 h-7 rounded hover:bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
            </button>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask..." className="flex-1 bg-transparent border-none text-[13px] text-white placeholder-gray-700 focus:ring-0 px-0.5" />
            <button onClick={() => setIsListening(!isListening)} className={`w-7 h-7 rounded transition-all ${isListening ? 'text-red-500' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path></svg>
            </button>
            <button onClick={handleSendMessage} disabled={isLoading || !query.trim()} className="w-7 h-7 rounded bg-white text-black hover:bg-gray-200 disabled:opacity-20 transition-all flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
          {isListening && <div className="mt-1 flex items-center justify-center gap-1"><div className="w-0.5 h-2 bg-red-500/50 rounded-full animate-bounce" /></div>}
        </div>
      </div>
    </div>
  );
}
