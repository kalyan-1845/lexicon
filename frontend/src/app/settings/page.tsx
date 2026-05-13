"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function SettingsPage() {
  const [modelProvider, setModelProvider] = useState("groq");
  const [apiKey, setApiKey] = useState("");
  const [isLocalMode, setIsLocalMode] = useState(false);

  return (
    <div className="flex h-screen bg-[#09090b] text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-12">
        <div className="max-w-2xl mx-auto">
          <header className="mb-12">
            <h1 className="text-3xl font-bold tracking-tight mb-2">System Settings</h1>
            <p className="text-gray-500 font-medium">Configure your research engines and identity.</p>
          </header>

          <section className="space-y-8">
            <div className="p-6 bg-[#0c0c0e] border border-white/[0.04] rounded-xl">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Inference Engine</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <div>
                    <h3 className="font-bold text-gray-200">Model Provider</h3>
                    <p className="text-xs text-gray-500">Choose the AI engine for your research.</p>
                  </div>
                  <select 
                    value={modelProvider}
                    onChange={(e) => setModelProvider(e.target.value)}
                    className="bg-[#09090b] border border-white/10 rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
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
                    className="w-full bg-[#09090b] border border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-white/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#0c0c0e] border border-white/[0.04] rounded-xl flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-200">Strict Local Mode</h3>
                <p className="text-xs text-gray-500">Disable all cloud features for maximum privacy.</p>
              </div>
              <button 
                onClick={() => setIsLocalMode(!isLocalMode)}
                className={`w-10 h-5 rounded-full transition-all relative ${isLocalMode ? 'bg-indigo-500' : 'bg-gray-800'}`}
              >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isLocalMode ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-white transition-colors">Discard</button>
              <button className="px-6 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-200 transition-all">Save Changes</button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
