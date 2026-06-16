"use client";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
};

// Global helper function to trigger a toast from anywhere
export function showToast(message: string, type: ToastType = "info") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("lexicon-toast", {
        detail: { message, type },
      })
    );
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: ToastType }>;
      if (!customEvent.detail) return;
      const { message, type } = customEvent.detail;
      const id = Math.random().toString(36).substring(2, 9);
      
      setToasts((prev) => [...prev, { id, message, type }]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    window.addEventListener("lexicon-toast", handleToast);
    return () => window.removeEventListener("lexicon-toast", handleToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bgColor = "bg-[var(--theme-surface)]/95 border-[var(--theme-border)]";
        let iconColor = "text-indigo-400";
        let iconPath = (
          <path d="M12 16h.01M12 8v5m9-1a9 9 0 11-18 0 9 9 0 0118 0z" />
        );

        if (toast.type === "success") {
          bgColor = "bg-[#091510]/95 border-emerald-500/20";
          iconColor = "text-emerald-400";
          iconPath = <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />;
        } else if (toast.type === "error") {
          bgColor = "bg-[#180a0a]/95 border-red-500/20";
          iconColor = "text-red-400";
          iconPath = <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />;
        } else if (toast.type === "warning") {
          bgColor = "bg-[#161208]/95 border-amber-500/20";
          iconColor = "text-amber-400";
          iconPath = <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />;
        }

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-xl border ${bgColor} shadow-2xl backdrop-blur-md pointer-events-auto transform translate-y-0 transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in`}
            role="alert"
          >
            <svg
              className={`w-5 h-5 ${iconColor} shrink-0 mt-0.5`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              {iconPath}
            </svg>
            
            <div className="flex-1 text-[11.5px] font-medium text-[var(--theme-text)] leading-normal">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors p-0.5 rounded-lg hover:bg-[var(--theme-border)]"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
