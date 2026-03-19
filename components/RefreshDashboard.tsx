'use client';

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function RefreshDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    router.refresh();
    
    // Simulate a small delay for the animation to be visible
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setIsLoading(false);
    setShowToast(true);
    
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="relative">
      <button 
        onClick={handleRefresh}
        disabled={isLoading}
        className={`p-2 rounded-xl bg-roxou-surface border border-roxou-border hover:border-roxou-primary transition-all group disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Atualizar dados"
      >
        <RefreshCw className={`w-4 h-4 text-roxou-text-muted group-hover:text-roxou-primary transition-all duration-500 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
      </button>

      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute right-0 top-full mt-2 px-3 py-1.5 rounded-lg bg-roxou-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl z-50 whitespace-nowrap"
          >
            Dados atualizados
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
