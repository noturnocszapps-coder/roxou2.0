'use client';

import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useState, useEffect, createContext, useContext, useCallback } from "react";

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-[90vw] sm:max-w-md pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className={`
                flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl
                ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 
                  toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 
                  'bg-roxou-primary/10 border-roxou-primary/20 text-roxou-primary'}
              `}>
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
                {toast.type === 'error' && <XCircle className="w-5 h-5 flex-shrink-0" />}
                {toast.type === 'info' && <Info className="w-5 h-5 flex-shrink-0" />}
                
                <p className="text-sm font-bold flex-grow">{toast.message}</p>
                
                <button 
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 opacity-50" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
