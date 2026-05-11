"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import PDFUploader from "@/components/PDFUploader";
import SmartNotes from "@/components/SmartNotes";

export default function Workspace() {
  const [showNotes, setShowNotes] = useState(false);
  const [activeContext, setActiveContext] = useState<string | null>(null);

  return (
    <div className="flex h-screen w-full bg-[#0a0a0b] overflow-hidden">
      <Sidebar />
      <ChatArea 
        onToggleNotes={() => setShowNotes(!showNotes)} 
        showNotes={showNotes} 
        documentContext={activeContext}
      />
      {showNotes && <SmartNotes onClose={() => setShowNotes(false)} />}
      <PDFUploader onContextUpdate={setActiveContext} />
    </div>
  );
}
