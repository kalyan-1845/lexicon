"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import RightSidebar from "@/components/RightSidebar";

type WorkspaceData = {
  documents: any[];
  messages: any[];
  collectionId: string | null;
};

export default function Workspace() {
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<"docs" | "notes">("docs");
  const [activeContext, setActiveContext] = useState<string | null>(null);
  
  const [workspaces, setWorkspaces] = useState([
    { name: 'Neural Networks', collectionId: 'Deep Learning' },
    { name: 'Market Q3', collectionId: 'Finance' },
    { name: 'Resume Opt', collectionId: 'Career' },
    { name: 'Stock Analysis', collectionId: 'Finance' }
  ]);
  const [activeWorkspace, setActiveWorkspace] = useState("Neural Networks");
  
  const [workspaceData, setWorkspaceData] = useState<Record<string, WorkspaceData>>({
    "Neural Networks": { documents: [], messages: [{ id: "1", role: "assistant", content: "Focusing on Deep Learning architectures." }], collectionId: 'Deep Learning' },
    "Market Q3": { documents: [], messages: [{ id: "1", role: "assistant", content: "Analyzing market trends." }], collectionId: 'Finance' },
    "Resume Opt": { documents: [], messages: [{ id: "1", role: "assistant", content: "Ready to optimize." }], collectionId: 'Career' },
    "Stock Analysis": { documents: [], messages: [{ id: "1", role: "assistant", content: "Checking tickers." }], collectionId: 'Finance' },
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
    if (name && !workspaceData[name]) {
      const newWs = { name, collectionId: activeCollection };
      setWorkspaces([...workspaces, newWs]);
      setWorkspaceData({ 
        ...workspaceData, 
        [name]: { documents: [], messages: [{ id: "1", role: "assistant", content: `New workspace in ${activeCollection || 'General'}.` }], collectionId: activeCollection } 
      });
      setActiveWorkspace(name);
    }
  };

  const updateWorkspaceData = (data: Partial<WorkspaceData>) => {
    setWorkspaceData(prev => ({
      ...prev,
      [activeWorkspace]: { ...prev[activeWorkspace], ...data }
    }));
  };

  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const filteredWorkspaces = activeCollection 
    ? workspaces.filter(w => w.collectionId === activeCollection)
    : workspaces;

  return (
    <div className="flex h-screen w-full bg-[#09090b] overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 transform ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}>
        <Sidebar 
          workspaces={filteredWorkspaces}
          activeWorkspace={activeWorkspace} 
          onWorkspaceChange={(ws) => { setActiveWorkspace(ws); setShowMobileSidebar(false); }}
          onAddWorkspace={handleAddWorkspace}
          collections={collections}
          activeCollection={activeCollection}
          onCollectionChange={(c) => setActiveCollection(c === activeCollection ? null : c)}
          onAddCollection={() => {
            const name = prompt("Enter collection name:");
            if (name) setCollections([...collections, name]);
          }}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Toggle */}
        <div className="md:hidden flex items-center p-3 border-b border-white/[0.04] bg-[#09090b]/80 backdrop-blur-md">
          <button 
            onClick={() => setShowMobileSidebar(true)}
            className="p-2 -ml-2 text-gray-500 hover:text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <span className="ml-3 font-bold text-sm tracking-tight text-white">Lexicon AI</span>
        </div>

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
      </div>

      {showRightSidebar && (
        <div className="fixed inset-y-0 right-0 z-50 w-[300px] bg-[#09090b] border-l border-white/[0.04] md:relative md:z-0">
          <RightSidebar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            documents={workspaceData[activeWorkspace]?.documents || []}
            setDocuments={(docs) => updateWorkspaceData({ documents: docs })}
            onContextUpdate={setActiveContext}
            onClose={() => setShowRightSidebar(false)}
          />
        </div>
      )}
    </div>
  );
}

