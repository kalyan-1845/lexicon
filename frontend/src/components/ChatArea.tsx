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
  onToggleNotes?: () => void;
  showNotes?: boolean;
  onToggleDocuments?: () => void;
  showDocuments?: boolean;
  documentContext?: string | null;
  onContextUpdate?: (text: string | null) => void;
};

export default function ChatArea({ 
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI research assistant. You can upload a PDF document using the panel on the right, and then ask me any questions about it."
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!query.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage.content,
          document_context: documentContext
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/upload/pdf", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error("Upload failed");
      
      const data = await response.json();
      
      if (onContextUpdate && data.full_text) {
        onContextUpdate(data.full_text);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          content: `I've successfully parsed **${file.name}**. You can now ask me questions about its content!`
        }]);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload document.");
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div 
      className="flex-1 flex flex-col h-full bg-[#09090b] relative"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-white/[0.02] backdrop-blur-sm border-2 border-dashed border-white/10 flex items-center justify-center pointer-events-none transition-all duration-300">
          <div className="surface p-8 rounded-2xl flex flex-col items-center gap-4">
            <p className="text-sm font-bold text-white">Drop PDF to analyze</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="h-12 border-b border-white/[0.04] flex items-center justify-between px-6 bg-[#09090b]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xs font-bold text-gray-400 uppercase tracking-widest">General</h1>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => setShowShareModal(true)} className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-white transition-colors">Share</button>
          <button 
            onClick={onToggleDocuments}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${showDocuments ? 'bg-white/[0.08] text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Documents
          </button>
          <button 
            onClick={onToggleNotes}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${showNotes ? 'bg-white/[0.08] text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Notes
          </button>
        </div>
      </div>

      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-8 max-w-3xl mx-auto w-full">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-4">
            <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-1 ${
              msg.role === 'user' ? 'bg-white text-black' : 'bg-gray-800 text-white'
            }`}>
              <span className="text-[10px] font-black">{msg.role === 'user' ? 'U' : 'L'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                {msg.role === 'user' ? 'You' : 'Lexicon'}
              </span>
              <div className="text-[14px] leading-relaxed text-gray-300">
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4">
            <div className="w-6 h-6 rounded-md bg-gray-800 flex items-center justify-center shrink-0 mt-1">
              <span className="text-[10px] font-black">L</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">Thinking</span>
              <div className="flex gap-1 items-center h-4">
                <span className="w-1 h-1 bg-gray-600 rounded-full animate-pulse" />
                <span className="w-1 h-1 bg-gray-600 rounded-full animate-pulse delay-75" />
                <span className="w-1 h-1 bg-gray-600 rounded-full animate-pulse delay-150" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Info */}
      <div className="px-6 py-2">
        <AgentWorkflow />
      </div>

      {/* Input Area */}
      <div className="px-6 pb-6 pt-2">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-center gap-2 p-2 bg-[#18181b] border border-white/5 rounded-xl focus-within:border-white/10 transition-all shadow-xl">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              accept=".pdf"
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.03] transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </button>
            
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..." 
              className="flex-1 bg-transparent border-none text-[14px] text-white placeholder-gray-600 focus:ring-0 px-1"
            />

            <button 
              onClick={() => setIsListening(!isListening)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                isListening ? 'bg-red-500/10 text-red-500' : 'text-gray-500 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              </svg>
            </button>
            
            <button 
              onClick={handleSendMessage}
              disabled={isLoading || !query.trim()}
              className="w-8 h-8 rounded-lg bg-white text-black hover:bg-gray-200 disabled:opacity-20 transition-all flex items-center justify-center"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          {isListening && (
            <div className="mt-2 flex items-center justify-center gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-0.5 h-3 bg-red-500/50 rounded-full animate-bounce" style={{ animationDelay: `${i * 100}ms` }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
