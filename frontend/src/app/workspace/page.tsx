"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import RightSidebar from "@/components/RightSidebar";

export default function Workspace() {
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<"docs" | "notes">("docs");
  const [activeContext, setActiveContext] = useState<string | null>(null);
  
  const [workspaces, setWorkspaces] = useState(['Neural Networks', 'Market Q3', 'Resume Opt']);
  const [activeWorkspace, setActiveWorkspace] = useState("Neural Networks");
  
  const [collections, setCollections] = useState(['Deep Learning', 'Finance', 'Career']);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);

  const toggleTab = (tab: "docs" | "notes") => {
    if (showRightSidebar && activeTab === tab) {
      setShowRightSidebar(false);
    } else {
      setShowRightSidebar(true);
      setActiveTab(tab);
    }
  };

  const handleAddWorkspace = () => {
    const name = prompt("Enter workspace name:");
    if (name) {
      setWorkspaces([...workspaces, name]);
      setActiveWorkspace(name);
    }
  };

  const handleAddCollection = () => {
    const name = prompt("Enter collection name:");
    if (name) {
      setCollections([...collections, name]);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#09090b] overflow-hidden">
      <Sidebar 
        workspaces={workspaces}
        activeWorkspace={activeWorkspace} 
        onWorkspaceChange={setActiveWorkspace}
        onAddWorkspace={handleAddWorkspace}
        collections={collections}
        activeCollection={activeCollection}
        onCollectionChange={setActiveCollection}
        onAddCollection={handleAddCollection}
      />
      <ChatArea 
        workspaceName={activeWorkspace}
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
