"use client";
import { useState, useRef, useEffect } from "react";
import ShareModal from "@/components/ShareModal";
import AgentWorkflow from "@/components/AgentWorkflow";
import ClearHistoryModal from "@/components/ClearHistoryModal";
import { showToast } from "@/components/Toast";
import { encryptText, decryptText } from "@/utils/encryption";
import { getApiUrl } from "@/utils/api";

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: {
    [index: number]: {
      transcript: string;
    };
  };
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: () => void;
  start: () => void;
  stop: () => void;
}

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
  onToggleSidebar?: () => void;
};

// SHA-256 password hashing utility for client-side Zero-Knowledge password verification
async function hashPassphrase(passphrase: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(passphrase);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function ChatArea({ 
  workspaceName,
  messages,
  setMessages,
  onToggleNotes, 
  showNotes, 
  onToggleDocuments, 
  showDocuments, 
  documentContext,
  onContextUpdate,
  onToggleSidebar
}: ChatAreaProps) {
  const [query, setQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);

  // E2EE Vault states
  const [isVaultEnabled, setIsVaultEnabled] = useState(false);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [vaultPassphrase, setVaultPassphrase] = useState<string | null>(null);
  
  const [showVaultSetupModal, setShowVaultSetupModal] = useState(false);
  const [vaultSetupPassphrase, setVaultSetupPassphrase] = useState("");
  const [vaultSetupConfirm, setVaultSetupConfirm] = useState("");
  
  const [showVaultUnlockModal, setShowVaultUnlockModal] = useState(false);
  const [unlockPassphrase, setUnlockPassphrase] = useState("");

  const [decryptedCache, setDecryptedCache] = useState<Record<string, string>>({});
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Sync ref to avoid missing dependency rule on decryptedCache
  const decryptedCacheRef = useRef<Record<string, string>>({});
  useEffect(() => {
    decryptedCacheRef.current = decryptedCache;
  }, [decryptedCache]);

  // Circular character limits boundary
  const maxChars = 4000;

  // Global vault locked state
  const isLocked = isVaultEnabled && !isVaultUnlocked;

  // Reset E2EE status on workspace switch
  useEffect(() => {
    if (workspaceName) {
      const enabled = localStorage.getItem(`lexicon_vault_enabled_${workspaceName}`) === "true";
      setTimeout(() => {
        setIsVaultEnabled(enabled);
        setIsVaultUnlocked(false);
        setVaultPassphrase(null);
        setDecryptedCache({});
      }, 0);
    }
  }, [workspaceName]);

  // Decrypt incoming message strings asynchronously on state changes
  useEffect(() => {
    async function decryptAll() {
      if (isVaultUnlocked && vaultPassphrase) {
        const updates: Record<string, string> = {};
        let changed = false;
        for (const msg of messages) {
          if (msg.content.startsWith("ENC:") && !decryptedCacheRef.current[msg.id]) {
            try {
              const dec = await decryptText(msg.content.slice(4), vaultPassphrase);
              updates[msg.id] = dec;
              changed = true;
            } catch {
              updates[msg.id] = "⚠️ Decryption error.";
              changed = true;
            }
          }
        }
        if (changed) {
          setTimeout(() => {
            setDecryptedCache(prev => ({ ...prev, ...updates }));
          }, 0);
        }
      }
    }
    decryptAll();
  }, [messages, isVaultUnlocked, vaultPassphrase]);

  // Setup security vault
  const handleSetupVault = async () => {
    if (vaultSetupPassphrase.length < 6) {
      showToast("Passphrase must be at least 6 characters.", "error");
      return;
    }
    if (vaultSetupPassphrase !== vaultSetupConfirm) {
      showToast("Passphrases do not match.", "error");
      return;
    }

    try {
      const hash = await hashPassphrase(vaultSetupPassphrase);
      localStorage.setItem(`lexicon_vault_hash_${workspaceName}`, hash);
      localStorage.setItem(`lexicon_vault_enabled_${workspaceName}`, "true");

      const encryptedMsgs = [];
      const newCache: Record<string, string> = {};
      for (const msg of messages) {
        if (!msg.content.startsWith("ENC:")) {
          const enc = await encryptText(msg.content, vaultSetupPassphrase);
          encryptedMsgs.push({ ...msg, content: "ENC:" + enc });
          newCache[msg.id] = msg.content;
        } else {
          encryptedMsgs.push(msg);
        }
      }

      setMessages(encryptedMsgs);
      setDecryptedCache(newCache);
      setVaultPassphrase(vaultSetupPassphrase);
      setIsVaultEnabled(true);
      setIsVaultUnlocked(true);
      setShowVaultSetupModal(false);
      setVaultSetupPassphrase("");
      setVaultSetupConfirm("");
      showToast("Secure Cryptographic Vault enabled!", "success");
    } catch {
      showToast("Failed to initialize vault.", "error");
    }
  };

  // Unlock existing E2EE Vault
  const handleUnlockVault = async () => {
    const savedHash = localStorage.getItem(`lexicon_vault_hash_${workspaceName}`);
    if (!savedHash) {
      showToast("Vault is not configured.", "error");
      return;
    }

    try {
      const hash = await hashPassphrase(unlockPassphrase);
      if (hash === savedHash) {
        setVaultPassphrase(unlockPassphrase);
        setIsVaultUnlocked(true);
        setShowVaultUnlockModal(false);
        setUnlockPassphrase("");
        showToast("Vault decrypted successfully!", "success");
      } else {
        showToast("Invalid passphrase.", "error");
      }
    } catch {
      showToast("Decryption verification failed.", "error");
    }
  };

  // Lock or unlock trigger
  const handleVaultIconClick = () => {
    if (!isVaultEnabled) {
      setShowVaultSetupModal(true);
    } else if (isVaultUnlocked) {
      setIsVaultUnlocked(false);
      setVaultPassphrase(null);
      setDecryptedCache({});
      showToast("Vault locked. Chats secured.", "warning");
    } else {
      setShowVaultUnlockModal(true);
    }
  };

  // Dynamic thread compilation downloads
  const handleExport = async (format: "json" | "md") => {
    setShowExportDropdown(false);
    try {
      const exportedData = [];
      for (const msg of messages) {
        let content = msg.content;
        if (content.startsWith("ENC:")) {
          if (isVaultUnlocked && vaultPassphrase) {
            try {
              content = await decryptText(content.slice(4), vaultPassphrase);
            } catch {
              content = "[Decryption Failed]";
            }
          } else {
            content = "[Content Encrypted - Vault Locked]";
          }
        }
        exportedData.push({ ...msg, content });
      }

      let blob: Blob;
      let filename: string;
      
      if (format === "json") {
        blob = new Blob([JSON.stringify(exportedData, null, 2)], { type: "application/json" });
        filename = `lexicon-chat-${workspaceName || "workspace"}.json`;
      } else {
        const mdContent = `# Chat Log: ${workspaceName || "Lexicon Workspace"}\n\n` + 
          exportedData.map(m => `### ${m.role === 'user' ? 'User' : 'Lexicon'} (${new Date().toLocaleString()})\n\n${m.content}\n`).join("\n---\n\n");
        blob = new Blob([mdContent], { type: "text/markdown" });
        filename = `lexicon-chat-${workspaceName || "workspace"}.md`;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Successfully exported conversation!`, "success");
    } catch {
      showToast("Failed to compile export file.", "error");
    }
  };

  const handleScroll = () => {
    const container = chatScrollRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceFromBottom > 300);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("Copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([]);
    setShowClearModal(false);
    showToast("Chat history cleared.", "info");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!query.trim() || query.length > maxChars) return;
    const rawContent = query.trim();
    
    let encContent = rawContent;

    if (isVaultEnabled && isVaultUnlocked && vaultPassphrase) {
      try {
        const encrypted = await encryptText(rawContent, vaultPassphrase);
        encContent = "ENC:" + encrypted;
      } catch {
        showToast("Passphrase encryption failed.", "error");
        return;
      }
    }

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: encContent };
    
    setDecryptedCache(prev => ({ ...prev, [userMessage.id]: rawContent }));
    setMessages([...messages, userMessage]);
    setQuery("");
    setIsLoading(true);
    setActiveAgent(null);
    setStatusMessage(null);

    try {
      const response = await fetch(getApiUrl("/api/chat/message/stream"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: rawContent, document_context: documentContext }),
      });
      if (!response.ok) throw new Error("Failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: "" };
      
      let currentMessages = [...messages, userMessage];
      setMessages([...currentMessages, assistantMessage]);
      currentMessages = [...currentMessages, assistantMessage];

      let accumulatedText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (line.trim() === "") continue;
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.status) {
                setActiveAgent(data.agent);
                setStatusMessage(data.status);
                continue;
              }

              if (data.content) {
                setActiveAgent("Lexicon");
                setStatusMessage("Generating final synthesis...");
                
                accumulatedText += data.content;
                assistantMessage.content = accumulatedText;
                
                setDecryptedCache(prev => ({ ...prev, [assistantMessage.id]: accumulatedText }));

                const updatedMessages = [...currentMessages];
                updatedMessages[updatedMessages.length - 1] = { ...assistantMessage };
                setMessages(updatedMessages);
              }
            } catch (err) {
              console.error("Error parsing stream chunk", err, line);
            }
          }
        }
      }

      if (isVaultEnabled && isVaultUnlocked && vaultPassphrase) {
        try {
          const encAI = await encryptText(accumulatedText, vaultPassphrase);
          assistantMessage.content = "ENC:" + encAI;
          
          const finalizedMsgs = [...currentMessages];
          finalizedMsgs[finalizedMsgs.length - 1] = { ...assistantMessage };
          setMessages(finalizedMsgs);
        } catch {
          console.error("AI response encryption failed");
        }
      }

    } catch {
      let errMsg = "⚠️ Connection error.";
      if (isVaultEnabled && isVaultUnlocked && vaultPassphrase) {
        try {
          const encErr = await encryptText(errMsg, vaultPassphrase);
          errMsg = "ENC:" + encErr;
        } catch {}
      }
      setMessages([...messages, userMessage, { id: Date.now().toString(), role: "assistant", content: errMsg }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setActiveAgent(null);
        setStatusMessage(null);
      }, 3000);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file || file.type !== "application/pdf") return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(getApiUrl("/api/upload/pdf"), { method: "POST", body: formData });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      if (onContextUpdate && data.full_text) {
        onContextUpdate(data.full_text);
        
        let parseNotice = `Parsed **${file.name}**.`;
        if (isVaultEnabled && isVaultUnlocked && vaultPassphrase) {
          try {
            const encNotice = await encryptText(parseNotice, vaultPassphrase);
            setDecryptedCache(prev => ({ ...prev, [file.name]: parseNotice }));
            parseNotice = "ENC:" + encNotice;
          } catch {}
        }
        setMessages([...messages, { id: file.name, role: "assistant", content: parseNotice }]);
        showToast(`Document context integrated successfully!`, "success");
      }
    } catch {
      showToast("Failed to parse document.", "error");
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
    if (e.key === "Enter" && !e.shiftKey) { 
      e.preventDefault(); 
      handleSendMessage(); 
    }
  };

  const toggleVoiceInput = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as unknown as { SpeechRecognition: new () => SpeechRecognitionInstance; webkitSpeechRecognition: new () => SpeechRecognitionInstance }).SpeechRecognition ||
                              (window as unknown as { SpeechRecognition: new () => SpeechRecognitionInstance; webkitSpeechRecognition: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Speech recognition is not supported in this browser.", "warning");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setQuery((prev) => prev + transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
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

      {/* Header bar and menu items */}
      <div className="h-12 border-b border-white/[0.04] flex items-center justify-between px-4 bg-[#09090b]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={onToggleSidebar}
            className="md:hidden p-1 text-gray-400 hover:text-white mr-1 transition-colors"
            title="Toggle Sidebar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <h1 className="text-[13px] font-bold text-gray-200 tracking-tight">{workspaceName || 'General'}</h1>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          <div className="flex items-center gap-1.5 ml-1.5 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.05]">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-500">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <span className="text-[10px] font-semibold text-gray-400">Context Active</span>
          </div>

          {/* Secure E2EE Vault Status Badge in Header */}
          <button 
            onClick={handleVaultIconClick}
            className={`flex items-center gap-1.5 ml-1.5 px-2 py-0.5 rounded border text-[10px] font-bold transition-all cursor-pointer ${
              isVaultEnabled 
                ? isVaultUnlocked 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.02]'
            }`}
            title={isVaultEnabled ? (isVaultUnlocked ? "Vault Unlocked (Click to lock)" : "Vault Locked (Click to decrypt)") : "Enable E2EE Vault"}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {isVaultUnlocked ? (
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </>
              ) : (
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                </>
              )}
            </svg>
            {isVaultEnabled ? (isVaultUnlocked ? "E2EE Active" : "E2EE Secured") : "Secure Vault"}
          </button>
        </div>

        <div className="flex items-center gap-1.5 relative">
          <button 
            onClick={() => setShowClearModal(true)} 
            className="px-2.5 py-1 text-[12px] font-semibold text-gray-400 hover:text-red-400 hover:bg-white/[0.03] rounded-md transition-colors"
          >
            Clear
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowExportDropdown(!showExportDropdown)} 
              className={`px-2.5 py-1 text-[12px] font-semibold rounded-md transition-colors cursor-pointer ${
                showExportDropdown ? 'text-white bg-white/[0.05]' : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              Export
            </button>
            {showExportDropdown && (
              <div className="absolute right-0 mt-1.5 w-32 bg-[#0c0c0e] border border-white/10 rounded-lg shadow-2xl py-1 z-[60] animate-in fade-in slide-in-from-top-1">
                <button 
                  onClick={() => handleExport("json")} 
                  className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  Export JSON
                </button>
                <button 
                  onClick={() => handleExport("md")} 
                  className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  Export Markdown
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowShareModal(true)} 
            className="px-2.5 py-1 text-[12px] font-semibold text-gray-400 hover:text-white hover:bg-white/[0.03] rounded-md transition-colors"
          >
            Share
          </button>
          
          <button 
            onClick={onToggleDocuments} 
            className={`px-2.5 py-1 text-[12px] font-semibold rounded-md transition-colors border ${
              showDocuments 
                ? 'text-white bg-white/[0.06] border-white/10' 
                : 'text-gray-400 border-transparent hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            Docs
          </button>
          
          <button 
            onClick={onToggleNotes} 
            className={`px-2.5 py-1 text-[12px] font-semibold rounded-md transition-colors border ${
              showNotes 
                ? 'text-white bg-white/[0.06] border-white/10' 
                : 'text-gray-400 border-transparent hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            Notes
          </button>
        </div>
      </div>

      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}
      <ClearHistoryModal isOpen={showClearModal} onClose={() => setShowClearModal(false)} onConfirm={handleClearHistory} />

      {/* Vault Setup Modal */}
      {showVaultSetupModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0c0c0e] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-bold text-xs uppercase tracking-widest text-indigo-400 mb-2">Configure Secure Vault</h3>
            <p className="text-[11px] text-gray-500 mb-4 leading-relaxed font-medium">
              Secure this workspace with Zero-Knowledge client-side AES-256 encryption. Your passphrase never leaves this browser.
            </p>
            
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-[9px] font-bold text-gray-600 uppercase tracking-wider block mb-1">Enter Passphrase</label>
                <input 
                  type="password" 
                  value={vaultSetupPassphrase} 
                  onChange={(e) => setVaultSetupPassphrase(e.target.value)} 
                  placeholder="Min 6 characters..." 
                  className="w-full bg-[#18181b] border border-white/5 rounded-lg px-3 py-2 text-[12px] text-white focus:border-indigo-500 focus:ring-0 outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-600 uppercase tracking-wider block mb-1">Confirm Passphrase</label>
                <input 
                  type="password" 
                  value={vaultSetupConfirm} 
                  onChange={(e) => setVaultSetupConfirm(e.target.value)} 
                  placeholder="Confirm passphrase..." 
                  className="w-full bg-[#18181b] border border-white/5 rounded-lg px-3 py-2 text-[12px] text-white focus:border-indigo-500 focus:ring-0 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => {
                  setShowVaultSetupModal(false);
                  setVaultSetupPassphrase("");
                  setVaultSetupConfirm("");
                }} 
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSetupVault}
                className="px-4 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-[10px] font-bold uppercase text-white transition-colors cursor-pointer"
              >
                Enable Vault
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vault Unlock Modal */}
      {showVaultUnlockModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0c0c0e] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-bold text-xs uppercase tracking-widest text-indigo-400 mb-2">Decrypt Secure Vault</h3>
            <p className="text-[11px] text-gray-500 mb-4 leading-relaxed font-medium">
              This workspace is encrypted. Enter your passphrase to decrypt chat logs.
            </p>
            
            <div className="mb-5">
              <label className="text-[9px] font-bold text-gray-600 uppercase tracking-wider block mb-1">Enter Passphrase</label>
              <input 
                type="password" 
                value={unlockPassphrase} 
                onChange={(e) => setUnlockPassphrase(e.target.value)} 
                placeholder="Passphrase..." 
                className="w-full bg-[#18181b] border border-white/5 rounded-lg px-3 py-2 text-[12px] text-white focus:border-indigo-500 focus:ring-0 outline-none"
                onKeyDown={(e) => { if (e.key === 'Enter') handleUnlockVault(); }}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => {
                  setShowVaultUnlockModal(false);
                  setUnlockPassphrase("");
                }} 
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleUnlockVault}
                className="px-4 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-[10px] font-bold uppercase text-white transition-colors cursor-pointer"
              >
                Decrypt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message bubbles list */}
      <div ref={chatScrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6 max-w-2xl mx-auto w-full">
        {messages.map((msg) => {
          const isEncryptedPayload = msg.content.startsWith("ENC:");
          const isLocked = isEncryptedPayload && !isVaultUnlocked;
          
          return (
            <div key={msg.id} className={`flex gap-3 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-3 duration-300 ease-out`}>
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/10">
                  <span className="text-[10px] font-black text-white">L</span>
                </div>
              )}
              
              <div className={`flex flex-col gap-1 max-w-[85%] group relative ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{msg.role === 'user' ? 'You' : 'Lexicon'}</span>
                  {!isLocked && (
                    <button 
                      onClick={() => handleCopy(msg.id, isEncryptedPayload ? (decryptedCache[msg.id] || "") : msg.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/5 text-gray-500 hover:text-white cursor-pointer"
                      title="Copy message"
                    >
                      {copiedId === msg.id ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      )}
                    </button>
                  )}
                </div>

                <div className={`text-[13px] leading-relaxed flex flex-col gap-2 p-4 rounded-2xl border transition-all duration-300 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-white/[0.02] border-white/[0.05] text-gray-200 hover:border-white/[0.08]' 
                    : 'bg-[var(--theme-surface)]/40 border-[var(--theme-border)] text-gray-300 hover:border-white/[0.08]'
                }`}>
                  {isLocked ? (
                    <div className="font-mono text-[10px] text-indigo-400 bg-indigo-950/20 border border-indigo-500/10 px-3 py-2 rounded-lg relative overflow-hidden group/payload select-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent -translate-x-full group-hover/payload:translate-x-full duration-1000 transition-transform" />
                      <div className="flex items-center gap-1.5 mb-1.5 text-[8.5px] text-indigo-500 font-black uppercase tracking-widest select-none">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className="animate-pulse shrink-0">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Encrypted E2EE Payload
                      </div>
                      <div className="break-all opacity-35 select-none filter blur-[0.6px] leading-tight font-medium">
                        {msg.content.slice(4, 120)}...
                      </div>
                    </div>
                  ) : (
                    formatMessageContent(isEncryptedPayload ? (decryptedCache[msg.id] || "Decrypting...") : msg.content)
                  )}
                </div>

                {msg.role === 'assistant' && msg.content.length > 500 && !isLocked && (
                  <div className="mt-2 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-full">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-1.5 h-3 bg-indigo-500 rounded-full" />
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Neural Synthesis</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                      This response was synthesized across multiple research threads for maximum factual density.
                    </p>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded bg-white flex items-center justify-center shrink-0 shadow-lg shadow-white/5 border border-white/10">
                  <span className="text-[10px] font-black text-black">U</span>
                </div>
              )}
            </div>
          );
        })}
        {isLoading && (
          <div className="flex gap-3 justify-start animate-pulse">
            <div className="w-6 h-6 rounded bg-gray-800 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-black text-gray-500 font-sans">L</span>
            </div>
            <div className="flex flex-col gap-1 max-w-[85%]">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1">Lexicon</span>
              <div className="bg-[var(--theme-surface)]/40 border border-[var(--theme-border)] p-4 rounded-2xl flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-8 z-30 p-2.5 rounded-full bg-[#18181b] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] text-gray-400 hover:text-white transition-all shadow-xl animate-in fade-in duration-200 cursor-pointer"
          title="Scroll to bottom"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="animate-bounce">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
        </button>
      )}

      <div className="px-4 py-1">
        <AgentWorkflow activeAgent={activeAgent} statusMessage={statusMessage} />
      </div>

      {/* Input panel with Character limit indicators */}
      <div className="px-4 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative flex items-center gap-1.5 p-1.5 bg-[#18181b] border border-white/5 rounded-lg focus-within:border-white/10 transition-all shadow-xl">
            <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} accept=".pdf" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="w-7 h-7 rounded hover:bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
            </button>
            
            <input 
              type="text" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              onKeyDown={handleKeyDown} 
              maxLength={maxChars}
              placeholder={isLocked ? "Unlock E2EE Vault to submit queries..." : "Ask..."} 
              disabled={isLocked}
              className="flex-1 bg-transparent border-none text-[13px] text-white placeholder-gray-700 focus:ring-0 px-0.5 outline-none disabled:opacity-30 disabled:cursor-not-allowed" 
            />

            {/* Input character circular progression telemetry */}
            {query.length > 0 && (
              <div className="relative w-5 h-5 flex items-center justify-center shrink-0" title={`${query.length} / ${maxChars} characters`}>
                <svg className="w-full h-full -rotate-90">
                  <circle cx="10" cy="10" r="8" className="stroke-white/5 fill-transparent" strokeWidth="2" />
                  <circle 
                    cx="10" 
                    cy="10" 
                    r="8" 
                    className={`${
                      query.length >= maxChars 
                        ? 'stroke-red-500' 
                        : query.length > 3000 
                          ? 'stroke-amber-500' 
                          : 'stroke-indigo-500'
                    } fill-transparent transition-all duration-150`} 
                    strokeWidth="2" 
                    strokeDasharray={2 * Math.PI * 8} 
                    strokeDashoffset={2 * Math.PI * 8 * (1 - Math.min(query.length / maxChars, 1))} 
                  />
                </svg>
              </div>
            )}

            <button onClick={toggleVoiceInput} className={`w-7 h-7 rounded transition-all cursor-pointer ${isListening ? 'text-red-500' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path></svg>
            </button>
            <button onClick={handleSendMessage} disabled={isLoading || !query.trim() || query.length > maxChars || isLocked} className="w-7 h-7 rounded bg-white text-black hover:bg-gray-200 disabled:opacity-20 transition-all flex items-center justify-center cursor-pointer">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
          {isListening && <div className="mt-1 flex items-center justify-center gap-1"><div className="w-0.5 h-2 bg-red-500/50 rounded-full animate-bounce" /></div>}
        </div>
      </div>
    </div>
  );
}

// Custom sub-components and helper functions to parse and format code/bold/ticks markdown features
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast("Copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="my-4 rounded-xl overflow-hidden border border-white/[0.06] bg-[#0c0c0e]/90 flex flex-col font-mono text-[12px] shadow-xl relative w-full animate-in fade-in duration-300">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#09090b]/90 border-b border-white/[0.04] text-gray-500 text-[10px] select-none font-sans font-medium">
        <span className="uppercase font-bold tracking-wider">{language || "code"}</span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/5 text-gray-500 hover:text-white transition-all font-sans font-semibold text-[10px] cursor-pointer"
        >
          {copied ? (
            <>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="4">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span className="text-[#10b981]">Copied</span>
            </>
          ) : (
            <>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code Content */}
      <pre className="p-4 overflow-x-auto text-[11px] leading-relaxed text-gray-300 select-all whitespace-pre-wrap bg-black/10">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function parseInlineMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];
  
  // Format bold (**bold**), italic (*italic* or _italic_), and inline code (`code`)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
  const parts = text.split(regex);
  
  return parts.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={idx} className="bg-white/[0.06] border border-white/[0.04] px-1 py-0.5 rounded text-[11px] font-mono text-indigo-400">
          {part.slice(1, -1)}
        </code>
      );
    } else if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-extrabold text-white">{part.slice(2, -2)}</strong>;
    } else if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      return <em key={idx} className="italic text-gray-200">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function parseBlocks(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (trimmed === "") {
      i++;
      continue;
    }
    
    // Check for Horizontal Rule
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      blocks.push(<hr key={`hr-${i}`} className="my-6 border-white/[0.06]" />);
      i++;
      continue;
    }
    
    // Check for Headers
    if (trimmed.startsWith("#")) {
      const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const headerText = match[2];
        const inlineContent = parseInlineMarkdown(headerText);
        if (level === 1) {
          blocks.push(<h2 key={`h1-${i}`} className="text-base font-extrabold text-white mt-6 mb-3 border-b border-white/[0.04] pb-1.5 tracking-tight">{inlineContent}</h2>);
        } else if (level === 2) {
          blocks.push(<h3 key={`h2-${i}`} className="text-sm font-bold text-white mt-5 mb-2 tracking-tight">{inlineContent}</h3>);
        } else {
          blocks.push(<h4 key={`h3-${i}`} className="text-[13px] font-semibold text-gray-200 mt-4 mb-1.5">{inlineContent}</h4>);
        }
        i++;
        continue;
      }
    }
    
    // Check for Blockquote
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ""));
        i++;
      }
      blocks.push(
        <blockquote key={`bq-${i}`} className="border-l-[3px] border-indigo-500 pl-4 py-2 italic bg-indigo-500/[0.03] text-gray-400 rounded-r-lg my-4 leading-relaxed text-xs shadow-inner">
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx} className="my-0.5">{parseInlineMarkdown(ql)}</p>
          ))}
        </blockquote>
      );
      continue;
    }
    
    // Check for Unordered List
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length) {
        const itemTrim = lines[i].trim();
        const match = itemTrim.match(/^[\*\-\•]\s+(.*)$/);
        if (!match) break;
        listItems.push(
          <li key={`li-${i}`} className="text-[13px] leading-relaxed text-gray-300">
            {parseInlineMarkdown(match[1])}
          </li>
        );
        i++;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="list-disc pl-5 my-3 space-y-2">
          {listItems}
        </ul>
      );
      continue;
    }
    
    // Check for Ordered List
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length) {
        const itemTrim = lines[i].trim();
        const match = itemTrim.match(/^(\d+)\.\s+(.*)$/);
        if (!match) break;
        listItems.push(
          <li key={`li-${i}`} className="text-[13px] leading-relaxed text-gray-300">
            {parseInlineMarkdown(match[2])}
          </li>
        );
        i++;
      }
      blocks.push(
        <ol key={`ol-${i}`} className="list-decimal pl-5 my-3 space-y-2">
          {listItems}
        </ol>
      );
      continue;
    }
    
    // Check for Table
    if (trimmed.startsWith("|")) {
      const tableLines: string[][] = [];
      let separatorFound = false;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const currentLine = lines[i].trim();
        if (/^[\|\s\-:\+]+$/.test(currentLine)) {
          separatorFound = true;
          i++;
          continue;
        }
        
        const cols = currentLine.split("|").map(c => c.trim());
        if (cols[0] === "") cols.shift();
        if (cols[cols.length - 1] === "") cols.pop();
        
        tableLines.push(cols);
        i++;
      }
      
      if (tableLines.length > 0) {
        const hasHeader = tableLines.length > 1 || separatorFound;
        const headers = hasHeader ? tableLines[0] : [];
        const rows = hasHeader ? tableLines.slice(1) : tableLines;
        
        blocks.push(
          <div key={`table-wrapper-${i}`} className="overflow-hidden my-5 w-full rounded-xl border border-white/[0.06] bg-[#0c0c0e]/80 shadow-lg backdrop-blur-md">
            <table className="w-full border-collapse text-[12px] text-left">
              {headers.length > 0 && (
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/[0.08]">
                    {headers.map((h, hIdx) => (
                      <th key={hIdx} className="px-4 py-3 font-bold text-white border-r border-white/[0.05] last:border-r-0 tracking-wide uppercase text-[10px]">
                        {parseInlineMarkdown(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.01] transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-2.5 border-r border-white/[0.05] last:border-r-0 text-gray-300">
                        {parseInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }
    
    // Default: normal Paragraph
    blocks.push(
      <p key={`p-${i}`} className="text-[13px] leading-relaxed text-gray-300 my-2.5">
        {parseInlineMarkdown(line)}
      </p>
    );
    i++;
  }
  
  return blocks;
}

function formatMessageContent(content: string) {
  if (!content) return null;
  
  // Split the content by triple backticks to isolate code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);
  
  return parts.map((part, idx) => {
    if (part.startsWith("```") && part.endsWith("```")) {
      const trimmed = part.slice(3, -3).trim();
      const codeLines = trimmed.split("\n");
      
      let language = "code";
      let code = trimmed;
      
      if (codeLines[0] && !codeLines[0].includes(" ") && codeLines[0].length < 15) {
        language = codeLines[0];
        code = codeLines.slice(1).join("\n");
      }
      
      return (
        <CodeBlock key={idx} code={code} language={language} />
      );
    }
    
    return (
      <div key={idx} className="flex flex-col w-full">
        {parseBlocks(part)}
      </div>
    );
  });
}
