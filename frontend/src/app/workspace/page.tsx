"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import RightSidebar from "@/components/RightSidebar";

export default function Workspace() {
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<"docs" | "notes">("docs");
  const [activeContext, setActiveContext] = useState<string | null>(null);

  const toggleTab = (tab: "docs" | "notes") => {
    if (showRightSidebar && activeTab === tab) {
      setShowRightSidebar(false);
    } else {
      setShowRightSidebar(true);
      setActiveTab(tab);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#09090b] overflow-hidden">
      <Sidebar />
      <ChatArea 
        onToggleNotes={() => toggleTab("notes")} 
        showNotes={showRightSidebar && activeTab === "notes"}
        onToggleDocuments={() => toggleTab("docs")}
        showDocuments={showRightSidebar && activeTab === "docs"}
        documentContext={activeContext}
        onContextUpdate={setActiveContext}
      />
      {showRightSidebar && (
        <RightSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onContextUpdate={setActiveContext}
          onClose={() => setShowRightSidebar(false)}
        />
      )}
    </div>
  );
}
