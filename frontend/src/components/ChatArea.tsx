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
      className="flex-1 flex flex-col h-full bg-[#050506] relative"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-indigo-600/10 backdrop-blur-md border-2 border-dashed border-indigo-500/50 flex items-center justify-center pointer-events-none transition-all duration-300">
          <div className="glass p-12 rounded-[40px] flex flex-col items-center gap-6 animate-zoom-in">
            <div className="w-20 h-20 rounded-3xl bg-indigo-500 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white mb-2">Drop to Research</p>
              <p className="text-sm text-gray-400">Release to start the AI analysis engine</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="h-16 border-b border-white/[0.05] flex items-center justify-between px-8 bg-[#050506]/60 backdrop-blur-xl shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-green-400 uppercase tracking-wider">Live Agent</span>
          </div>
          <h1 className="text-sm font-semibold text-gray-100 hidden sm:block">General Workspace</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 mr-4 border-r border-white/10 pr-6">
            <div className="w-8 h-8 rounded-full border-2 border-[#050506] overflow-hidden ring-1 ring-white/5 cursor-pointer hover:scale-110 transition-transform z-20" title="Alice">
              <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold">A</div>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-[#050506] overflow-hidden ring-1 ring-white/5 cursor-pointer hover:scale-110 transition-transform z-10" title="Bob">
              <div className="w-full h-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold">B</div>
            </div>
          </div>

          <div className="flex items-center gap-2 glass p-1 rounded-xl">
            <button 
              onClick={() => setShowShareModal(true)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all"
            >
              Share
            </button>
            <button 
              onClick={onToggleDocuments}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                showDocuments 
                  ? 'bg-white text-black shadow-lg shadow-white/10' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {showDocuments ? 'Documents' : 'Show Docs'}
            </button>
            <button 
              onClick={onToggleNotes}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                showNotes 
                  ? 'bg-white text-black shadow-lg shadow-white/10' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {showNotes ? 'Notes' : 'Open Notes'}
            </button>
          </div>
        </div>
      </div>

      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}

      {/* Chat Messages */}
      <div 
        className="flex-1 overflow-y-auto px-8 py-10 flex flex-col gap-10"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-6 max-w-4xl w-full ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              msg.role === 'user' 
                ? 'bg-white/5 border border-white/10' 
                : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20'
            }`} aria-hidden="true">
              <span className="text-white text-xs font-black">{msg.role === 'user' ? 'U' : 'LX'}</span>
            </div>
            <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : ''}`}>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1">
                {msg.role === 'user' ? 'You' : 'Lexicon Engine'}
              </span>
              <div className={`text-[15px] leading-relaxed p-5 rounded-3xl ${
                msg.role === 'user' 
                  ? 'bg-white text-black font-medium rounded-tr-none shadow-2xl shadow-white/5' 
                  : 'bg-white/[0.03] text-gray-200 border border-white/[0.05] rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-6 max-w-4xl">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20" aria-hidden="true">
              <span className="text-white text-xs font-black">LX</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1">Thinking...</span>
              <div className="flex gap-1.5 p-5 rounded-3xl bg-white/[0.03] border border-white/[0.05] rounded-tl-none">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Multi-Agent Workflow Visualization */}
      <div className="px-8 mb-4">
        <AgentWorkflow />
      </div>

      {/* Input Area */}
      <div className="px-8 pb-8 pt-4 bg-gradient-to-t from-[#050506] via-[#050506] to-transparent">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          <div className="relative flex items-center gap-3 p-2 bg-white/[0.03] border border-white/[0.08] rounded-[28px] focus-within:border-white/20 transition-all shadow-2xl">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              accept=".pdf"
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload PDF"
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </button>
            
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Message Lexicon..."
              placeholder="Message Lexicon..." 
              className="flex-1 bg-transparent border-none text-base text-white placeholder-gray-500 focus:ring-0 px-2"
            />
            
            <button 
              onClick={handleSendMessage}
              disabled={isLoading || !query.trim()}
              aria-label="Send message" 
              className="w-12 h-12 rounded-2xl bg-white text-black hover:bg-gray-200 disabled:opacity-20 transition-all flex items-center justify-center shadow-xl shadow-white/5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <p className="text-center text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            Lexicon Intelligence Core v1.4 • Groq Powered
          </p>
        </div>
      </div>
    </div>
  );
}
