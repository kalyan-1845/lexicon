"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import RightSidebar from "@/components/RightSidebar";
import ShortcutsCheatSheet from "@/components/ShortcutsCheatSheet";

  type Document = { 
    name: string; 
    size: number; 
    status: string;
    text?: string;
  };

  type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
  };

  type WorkspaceData = {
    documents: Document[];
    messages: Message[];
    collectionId: string | null;
  };

  type WorkspaceItem = {
    name: string;
    collectionId: string | null;
  };

  export default function Workspace() {
    const [showRightSidebar, setShowRightSidebar] = useState(true);
    const [showLeftSidebar, setShowLeftSidebar] = useState(false);
    const [activeTab, setActiveTab] = useState<"docs" | "notes">("docs");
    const [activeContext, setActiveContext] = useState<string | null>(null);
    
    const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([
      { name: 'Neural Networks', collectionId: 'Deep Learning' },
      { name: 'Market Q3', collectionId: 'Finance' },
      { name: 'Resume Opt', collectionId: 'Career' },
      { name: 'Stock Analysis', collectionId: 'Finance' }
    ]);
    const [activeWorkspace, setActiveWorkspace] = useState("Neural Networks");
    
    useEffect(() => {
      const saved = localStorage.getItem('lexicon-active-workspace');
      if (saved) {
        setActiveWorkspace(saved);
      }
    }, []);
    
    const [workspaceData, setWorkspaceData] = useState<Record<string, WorkspaceData>>({
      "Neural Networks": { documents: [], messages: [{ id: "1", role: "assistant", content: "Focusing on Deep Learning architectures." }], collectionId: 'Deep Learning' },
      "Market Q3": { documents: [], messages: [{ id: "1", role: "assistant", content: "Analyzing market trends." }], collectionId: 'Finance' },
      "Resume Opt": { documents: [], messages: [{ id: "1", role: "assistant", content: "Ready to optimize." }], collectionId: 'Career' },
      "Stock Analysis": { documents: [], messages: [{ id: "1", role: "assistant", content: "Checking tickers." }], collectionId: 'Finance' },
    });
    
    const [collections, setCollections] = useState(['Deep Learning', 'Finance', 'Career']);
    const [activeCollection, setActiveCollection] = useState<string | null>(null);

    useEffect(() => {
      const handleLexiconAction = (e: Event) => {
        const customEvent = e as CustomEvent<{ type: string }>;
        if (customEvent.detail?.type === 'upload-pdf') {
          setShowRightSidebar(true);
          setActiveTab("docs");
        } else if (customEvent.detail?.type === 'new-chat') {
          const name = prompt("Enter workspace name:");
          if (name) {
            setWorkspaces(prev => {
              if (prev.some(w => w.name === name)) return prev;
              return [...prev, { name, collectionId: activeCollection }];
            });
            setWorkspaceData(prev => {
              if (prev[name]) return prev;
              return {
                ...prev,
                [name]: { documents: [], messages: [{ id: "1", role: "assistant", content: `New workspace in ${activeCollection || 'General'}.` }], collectionId: activeCollection }
              };
            });
            setActiveWorkspace(name);
          }
        }
      };
      window.addEventListener('lexicon-action', handleLexiconAction);
      return () => window.removeEventListener('lexicon-action', handleLexiconAction);
    }, [activeCollection]);

    useEffect(() => {
      if (activeWorkspace) {
        localStorage.setItem('lexicon-active-workspace', activeWorkspace);
      }
    }, [activeWorkspace]);

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

    const filteredWorkspaces = activeCollection 
      ? workspaces.filter(w => w.collectionId === activeCollection)
      : workspaces;

    return (
      <div className="flex h-screen w-full bg-[var(--theme-bg)] text-[var(--theme-text)] overflow-hidden">
        <Sidebar 
          workspaces={filteredWorkspaces}
          activeWorkspace={activeWorkspace} 
          onWorkspaceChange={(name) => {
            setActiveWorkspace(name);
            setShowLeftSidebar(false);
          }}
          onAddWorkspace={handleAddWorkspace}
          collections={collections}
          activeCollection={activeCollection}
          onCollectionChange={(c) => setActiveCollection(c === activeCollection ? null : c)}
          onAddCollection={() => {
            const name = prompt("Enter collection name:");
            if (name) setCollections([...collections, name]);
          }}
          showMobileSidebar={showLeftSidebar}
          onMobileSidebarClose={() => setShowLeftSidebar(false)}
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
          onToggleSidebar={() => setShowLeftSidebar(true)}
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
        <ShortcutsCheatSheet />
      </div>
    );
  }
