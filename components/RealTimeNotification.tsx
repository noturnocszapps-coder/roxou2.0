'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, X, CheckCircle2 } from 'lucide-react';

export default function RealTimeNotification() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Simulate a notification after 5 seconds
    const timer = setTimeout(() => {
      setShow(true);
    }, 5000);

    // Auto-hide after 8 seconds
    const hideTimer = setTimeout(() => {
      setShow(false);
    }, 13000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, y: -100, x: '-50%' }}
          animate={{ opacity: 1, y: 20, x: '-50%' }}
          exit={{ opacity: 0, y: -100, x: '-50%' }}
          className="fixed top-0 left-1/2 z-[100] w-[90%] max-w-sm"
        >
          <div className="p-4 rounded-3xl bg-roxou-surface border border-roxou-primary/30 shadow-2xl shadow-roxou-primary/20 flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-roxou-primary" />
            <div className="w-12 h-12 rounded-2xl bg-roxou-primary/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-roxou-primary" />
            </div>
            <div className="flex-grow">
              <h4 className="text-sm font-black text-white leading-tight">Motorista encontrou seu rolê 🚗</h4>
              <p className="text-[10px] text-roxou-text-muted mt-1 font-medium">Confira as propostas agora mesmo.</p>
            </div>
            <button 
              onClick={() => setShow(false)}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4 text-roxou-text-muted" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
