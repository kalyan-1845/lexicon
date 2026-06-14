"use client";
import { useState } from "react";

export default function SmartNotes({ isEmbedded }: { onClose?: () => void, isEmbedded?: boolean }) {
  const [note, setNote] = useState("# Research Notes\n\nStart typing your insights here...");
  const [tab, setTab] = useState<"write" | "preview">("write");

  const handleExportNotes = () => {
    const blob = new Blob([note], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lexicon-notes.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const content = (
    <div className="flex-1 flex flex-col p-6 h-full overflow-hidden select-none">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="font-extrabold text-[12px] text-[var(--theme-text-muted)]">Insights</h2>
        <div className="flex items-center gap-1 bg-white/[0.02] border border-[var(--theme-border)] p-0.5 rounded-lg shrink-0">
          <button 
            onClick={() => setTab("write")} 
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
              tab === "write" 
                ? "bg-[var(--theme-border)] text-[var(--theme-text)]" 
                : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
            }`}
          >
            Write
          </button>
          <button 
            onClick={() => setTab("preview")} 
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
              tab === "preview" 
                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/10" 
                : "text-gray-500 hover:text-white border border-transparent"
            }`}
          >
            Preview
          </button>
        </div>
      </div>
      
      <div className="flex-1 surface rounded-xl overflow-hidden border-[var(--theme-border)] flex flex-col bg-[var(--theme-surface)]">
        {tab === "write" ? (
          <textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-full bg-transparent border-none text-[13px] text-[var(--theme-text)] resize-none focus:ring-0 p-4 font-mono leading-relaxed focus:outline-none"
            placeholder="Capture your research insights here..."
          />
        ) : (
          <div className="w-full h-full p-4 overflow-y-auto text-[13px] text-[var(--theme-text)] leading-relaxed flex flex-col gap-2 select-text text-left select-all">
            {formatNotesContent(note)}
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-between items-center px-2 shrink-0">
        <span className="text-[11px] font-semibold text-[var(--theme-text-muted)]">{note.length} characters</span>
        <button onClick={handleExportNotes} className="text-[11px] font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer">
          Export Notes
        </button>
      </div>
    </div>
  );

  if (isEmbedded) return content;

  return (
    <aside className="w-80 border-l border-[var(--theme-border)] bg-[var(--theme-bg)] h-full flex flex-col shrink-0">
      {content}
    </aside>
  );
}

// Helper functions to parse and format notes dynamically into lightweight JSX templates
function formatNotesContent(content: string) {
  if (!content) return <p className="text-[var(--theme-text-muted)] italic text-[12px]">No notes written yet...</p>;
  
  const lines = content.split("\n");
  
  return lines.map((line, idx) => {
    // 1. Headers (# H1, ## H2, ### H3)
    if (line.startsWith("# ")) {
      return <h1 key={idx} className="text-sm font-bold text-[var(--theme-text)] mt-3 mb-1.5 pb-1 border-b border-[var(--theme-border)]">{line.slice(2)}</h1>;
    }
    if (line.startsWith("## ")) {
      return <h2 key={idx} className="text-xs font-semibold text-[var(--theme-text)] mt-2.5 mb-1.5">{line.slice(3)}</h2>;
    }
    if (line.startsWith("### ")) {
      return <h3 key={idx} className="text-[11px] font-semibold text-[var(--theme-text-muted)] mt-2 mb-1">{line.slice(4)}</h3>;
    }
    
    // 2. Bullet list item (* or -)
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <div key={idx} className="flex gap-2 pl-1.5 items-start text-[11.5px] leading-relaxed">
          <span className="text-indigo-400 mt-1 select-none shrink-0 font-bold text-sm">•</span>
          <span dangerouslySetInnerHTML={{ __html: formatText(line.slice(2)) }} />
        </div>
      );
    }
    
    // 3. Horizontal line (---)
    if (line.trim() === "---") {
      return <hr key={idx} className="my-3 border-t border-[var(--theme-border)]" />;
    }
    
    // 4. Regular paragraph
    if (!line.trim()) {
      return <div key={idx} className="h-1.5" />;
    }
    
    return (
      <p 
        key={idx} 
        className="text-[11.5px] leading-relaxed text-[var(--theme-text)]" 
        dangerouslySetInnerHTML={{ __html: formatText(line) }} 
      />
    );
  });
}

function formatText(text: string) {
  if (!text) return "";
  
  let escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
    
  // Format bold (**bold**)
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
  // Format inline code (`code`)
  escaped = escaped.replace(/`(.*?)`/g, "<code class='bg-white/[0.06] border border-[var(--theme-border)] px-1 py-0.5 rounded text-[10px] font-mono text-indigo-400'>$1</code>");
  
  return escaped;
}
