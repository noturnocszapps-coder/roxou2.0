'use client';

import { useEffect, useState } from 'react';
import { Users, Zap, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveIndicatorsProps {
  initialDrivers?: number;
  initialRequests?: number;
}

export default function LiveIndicators({ initialDrivers = 12, initialRequests = 8 }: LiveIndicatorsProps) {
  const [driversOnline, setDriversOnline] = useState(initialDrivers);
  const [activeRequests, setActiveRequests] = useState(initialRequests);

  // Simulate real-time fluctuations to make it feel "alive"
  useEffect(() => {
    const interval = setInterval(() => {
      setDriversOnline(prev => {
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        return Math.max(5, prev + change);
      });
      setActiveRequests(prev => {
        const change = Math.floor(Math.random() * 3) - 1;
        return Math.max(2, prev + change);
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-4 py-4 overflow-x-auto no-scrollbar">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 flex items-center gap-3 px-4 py-2 rounded-2xl bg-roxou-surface border border-roxou-border shadow-lg shadow-roxou-primary/5"
      >
        <div className="relative">
          <Users className="w-4 h-4 text-roxou-primary" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        </div>
        <div className="flex flex-col">
          <AnimatePresence mode="wait">
            <motion.span 
              key={driversOnline}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="text-xs font-black text-white leading-none"
            >
              {driversOnline}
            </motion.span>
          </AnimatePresence>
          <span className="text-[9px] text-roxou-text-muted uppercase font-bold tracking-widest leading-none mt-1">Motoristas Online</span>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-shrink-0 flex items-center gap-3 px-4 py-2 rounded-2xl bg-roxou-surface border border-roxou-border shadow-lg shadow-roxou-secondary/5"
      >
        <div className="relative">
          <Zap className="w-4 h-4 text-roxou-secondary" />
          <div className="absolute -top-1 -right-1">
            <Activity className="w-2 h-2 text-roxou-secondary animate-bounce" />
          </div>
        </div>
        <div className="flex flex-col">
          <AnimatePresence mode="wait">
            <motion.span 
              key={activeRequests}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="text-xs font-black text-white leading-none"
            >
              {activeRequests}
            </motion.span>
          </AnimatePresence>
          <span className="text-[9px] text-roxou-text-muted uppercase font-bold tracking-widest leading-none mt-1">Pedidos Ativos</span>
        </div>
      </motion.div>
    </div>
  );
}
