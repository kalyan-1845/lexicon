"use client";
import { useState } from "react";

export default function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);

  const steps = [
    {
      title: "Welcome to Lexicon AI",
      description: "Your new command center for agentic research. Let's get you situated in under 60 seconds.",
      icon: "✨"
    },
    {
      title: "Create a Workspace",
      description: "Isolated hubs for different projects. One for 'Market Trends', another for 'Legal Audit'.",
      icon: "🏗️"
    },
    {
      title: "Activate the Agents",
      description: "Upload a PDF and watch the Researcher and Analyst agents synthesize your knowledge.",
      icon: "🧠"
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#09090b]/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="w-full max-w-lg bg-[#0c0c0e] border border-white/10 rounded-3xl p-10 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="text-4xl mb-6">{steps[step - 1].icon}</div>
        <h2 className="text-2xl font-black mb-3">{steps[step - 1].title}</h2>
        <p className="text-gray-500 leading-relaxed mb-8">{steps[step - 1].description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1 rounded-full transition-all ${s === step ? 'w-6 bg-white' : 'w-2 bg-white/10'}`} />
            ))}
          </div>
          <button 
            onClick={() => step < 3 ? setStep(step + 1) : onClose()}
            className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all"
          >
            {step < 3 ? "Next" : "Get Started"}
          </button>
        </div>
      </div>
    </div>
  );
}
