"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface Toast {
  id: number;
  message: string;
  tone: "success" | "error" | "info";
}

const ToastContext = createContext<{ push: (message: string, tone?: Toast["tone"]) => void } | null>(
  null
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, tone: Toast["tone"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center px-4 w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`glass rounded-full px-5 py-2.5 text-sm shadow-lg animate-toast-in pointer-events-auto ${
              t.tone === "success" ? "text-green" : t.tone === "error" ? "text-[#E85D4D]" : "text-bone"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
