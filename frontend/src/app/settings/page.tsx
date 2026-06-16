"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function SettingsPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState([
    { name: 'Neural Networks', collectionId: 'Deep Learning' },
    { name: 'Market Q3', collectionId: 'Finance' },
    { name: 'Resume Opt', collectionId: 'Career' },
    { name: 'Stock Analysis', collectionId: 'Finance' }
  ]);
  const [activeWorkspace, setActiveWorkspace] = useState("Neural Networks");
  const [collections, setCollections] = useState(['Deep Learning', 'Finance', 'Career']);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);

  const [modelProvider, setModelProvider] = useState("groq");
  const [apiKey, setApiKey] = useState("");
  const [isLocalMode, setIsLocalMode] = useState(false);

  return (
    <div className="flex h-screen bg-[var(--theme-bg)] text-[var(--theme-text)]">
      <Sidebar 
        workspaces={activeCollection ? workspaces.filter(w => w.collectionId === activeCollection) : workspaces}
        activeWorkspace={activeWorkspace}
        onWorkspaceChange={(name) => {
          setActiveWorkspace(name);
          localStorage.setItem('lexicon-active-workspace', name);
          router.push('/workspace');
        }}
        onAddWorkspace={() => {
          router.push('/workspace');
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('lexicon-action', { detail: { type: 'new-chat' } }));
          }, 100);
        }}
        collections={collections}
        activeCollection={activeCollection}
        onCollectionChange={(c) => setActiveCollection(c === activeCollection ? null : c)}
        onAddCollection={() => {
          const name = prompt("Enter collection name:");
          if (name) setCollections([...collections, name]);
        }}
      />
      <main className="flex-1 overflow-y-auto p-12">
        <div className="max-w-2xl mx-auto">
          <header className="mb-12">
            <h1 className="text-3xl font-bold tracking-tight mb-2">System Settings</h1>
            <p className="text-[var(--theme-text-muted)] font-medium">Configure your research engines and identity.</p>
          </header>

          <section className="space-y-8">
            <div className="p-6 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xl">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--theme-text-muted)] mb-6">Inference Engine</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-[var(--theme-border)]">
                  <div>
                    <h3 className="font-bold text-[var(--theme-text)]">Model Provider</h3>
                    <p className="text-xs text-[var(--theme-text-muted)]">Choose the AI engine for your research.</p>
                  </div>
                  <select 
                    value={modelProvider}
                    onChange={(e) => setModelProvider(e.target.value)}
                    className="bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="groq">Groq Cloud (Fast)</option>
                    <option value="ollama">Ollama (Local/Private)</option>
                    <option value="openai">OpenAI (Pro)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">API Key (Encrypted)</label>
                  <input 
                    type="password" 
                    placeholder="Enter key..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[var(--theme-border)] transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xl flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[var(--theme-text)]">Strict Local Mode</h3>
                <p className="text-xs text-[var(--theme-text-muted)]">Disable all cloud features for maximum privacy.</p>
              </div>
              <button 
                onClick={() => setIsLocalMode(!isLocalMode)}
                className={`w-10 h-5 rounded-full transition-all relative ${isLocalMode ? 'bg-indigo-500' : 'bg-gray-800'}`}
              >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isLocalMode ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button className="px-6 py-2 text-sm font-bold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors">Discard</button>
              <button className="px-6 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-200 transition-all">Save Changes</button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
