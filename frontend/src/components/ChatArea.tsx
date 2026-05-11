"use client";
import { useState, useRef, useEffect } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatArea() {
  const [query, setQuery] = useState("");
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
        body: JSON.stringify({ message: userMessage.content })
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0b] relative">
      {/* Chat Messages */}
      <div 
        className="flex-1 overflow-y-auto p-8 flex flex-col gap-6"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-800' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`} aria-hidden="true">
              <span className="text-white text-xs font-bold">{msg.role === 'user' ? 'U' : 'AI'}</span>
            </div>
            <div className={`flex flex-col gap-1 mt-1 ${msg.role === 'user' ? 'items-end' : ''}`}>
              <span className="text-sm font-semibold text-gray-200">
                {msg.role === 'user' ? 'You' : 'Lexicon Assistant'}
              </span>
              <div className={`text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600/20 text-indigo-100 px-4 py-3 rounded-2xl rounded-tr-none border border-indigo-500/20' : 'text-gray-300'}`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 max-w-3xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0" aria-hidden="true">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-sm font-semibold text-gray-200">Lexicon Assistant</span>
              <div className="flex gap-1 mt-2 items-center h-4">
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/5 bg-[#0a0a0b]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto relative flex items-center">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Ask anything about your research..."
            placeholder="Ask anything about your research..." 
            className="w-full bg-gray-900/50 border border-white/10 rounded-xl px-4 py-4 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
          />
          <button 
            onClick={handleSendMessage}
            disabled={isLoading || !query.trim()}
            aria-label="Send message" 
            className="absolute right-2 p-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 mt-3">Lexicon AI can make mistakes. Consider verifying important information.</p>
      </div>
    </div>
  );
}
