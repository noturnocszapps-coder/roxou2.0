'use client';

import { useEffect, useState } from 'react';
import { Users, Zap, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LiveIndicatorsProps {
  initialDrivers?: number;
  initialRequests?: number;
}

export default function LiveIndicators({ initialDrivers = 12, initialRequests = 8 }: LiveIndicatorsProps) {
  const [driversOnline, setDriversOnline] = useState(initialDrivers);
  const [activeRequests, setActiveRequests] = useState(initialRequests);

  // Remove real-time fluctuations to keep it generic and honest
  useEffect(() => {
    // No-op: we don't simulate fluctuations anymore
  }, []);

  return (
    <div className="flex items-center gap-4 py-2 overflow-x-auto scrollbar-hide">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-shrink-0 flex items-center gap-4 px-6 py-4 rounded-[28px] bg-roxou-surface/40 border border-roxou-border shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-roxou-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl bg-roxou-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-roxou-primary" />
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-roxou-bg animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-baseline gap-1.5">
            <AnimatePresence mode="wait">
              <motion.span 
                key={driversOnline}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-xl font-display font-black text-white leading-none"
              >
                {driversOnline}
              </motion.span>
            </AnimatePresence>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Online</span>
          </div>
          <span className="text-[9px] text-roxou-text-muted uppercase font-black tracking-[0.15em] leading-none">Motoristas</span>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-shrink-0 flex items-center gap-4 px-6 py-4 rounded-[28px] bg-roxou-surface/40 border border-roxou-border shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-roxou-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl bg-roxou-secondary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-roxou-secondary" />
          </div>
          <div className="absolute -top-1 -right-1">
            <Activity className="w-3 h-3 text-roxou-secondary animate-bounce" />
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-baseline gap-1.5">
            <AnimatePresence mode="wait">
              <motion.span 
                key={activeRequests}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-xl font-display font-black text-white leading-none"
              >
                {activeRequests}
              </motion.span>
            </AnimatePresence>
            <span className="text-[10px] font-black text-roxou-secondary uppercase tracking-widest">Ativos</span>
          </div>
          <span className="text-[9px] text-roxou-text-muted uppercase font-black tracking-[0.15em] leading-none">Pedidos</span>
        </div>
      </motion.div>
    </div>
  );
}
