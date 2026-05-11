"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import RightSidebar from "@/components/RightSidebar";

type WorkspaceData = {
  documents: any[];
  messages: any[];
};

export default function Workspace() {
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<"docs" | "notes">("docs");
  const [activeContext, setActiveContext] = useState<string | null>(null);
  
  const [workspaces, setWorkspaces] = useState(['Neural Networks', 'Market Q3', 'Resume Opt']);
  const [activeWorkspace, setActiveWorkspace] = useState("Neural Networks");
  
  const [workspaceData, setWorkspaceData] = useState<Record<string, WorkspaceData>>({
    "Neural Networks": { documents: [], messages: [{ id: "1", role: "assistant", content: "Welcome to your Neural Networks research lab." }] },
    "Market Q3": { documents: [], messages: [{ id: "1", role: "assistant", content: "Analyzing Market Q3 trends..." }] },
    "Resume Opt": { documents: [], messages: [{ id: "1", role: "assistant", content: "Let's optimize your resume." }] },
  });
  
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
    if (name && !workspaces.includes(name)) {
      setWorkspaces([...workspaces, name]);
      setWorkspaceData({ ...workspaceData, [name]: { documents: [], messages: [{ id: "1", role: "assistant", content: `Welcome to ${name}.` }] } });
      setActiveWorkspace(name);
    }
  };

  const updateWorkspaceData = (data: Partial<WorkspaceData>) => {
    setWorkspaceData(prev => ({
      ...prev,
      [activeWorkspace]: { ...prev[activeWorkspace], ...data }
    }));
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
        onAddCollection={() => {
          const name = prompt("Enter collection name:");
          if (name) setCollections([...collections, name]);
        }}
      />
      <ChatArea 
        workspaceName={activeWorkspace}
        messages={workspaceData[activeWorkspace]?.messages || []}
        setMessages={(msgs) => updateWorkspaceData({ messages: msgs })}
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
          documents={workspaceData[activeWorkspace]?.documents || []}
          setDocuments={(docs) => updateWorkspaceData({ documents: docs })}
          onContextUpdate={setActiveContext}
          onClose={() => setShowRightSidebar(false)}
        />
      )}
    </div>
  );
}
