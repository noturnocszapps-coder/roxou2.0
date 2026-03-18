'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, X, CheckCircle2, Navigation, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function RealTimeNotification() {
  const [notification, setNotification] = useState<{ title: string; message: string; type: 'success' | 'info' } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function setupSubscription() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('realtime_notifications')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'transport_requests',
            filter: `passenger_id=eq.${user.id}`,
          },
          (payload) => {
            const oldStatus = payload.old.status;
            const newStatus = payload.new.status;

            if (oldStatus === 'open' && newStatus === 'accepted') {
              setNotification({
                title: 'Motorista a caminho! 🚗',
                message: 'Seu pedido foi aceito. Combine os detalhes no chat.',
                type: 'success'
              });
            } else if (oldStatus === 'accepted' && newStatus === 'in_progress') {
              setNotification({
                title: 'Viagem iniciada! 🏁',
                message: 'Aproveite o seu rolê Roxou.',
                type: 'info'
              });
            } else if (oldStatus === 'in_progress' && newStatus === 'completed') {
              setNotification({
                title: 'Chegamos! ✨',
                message: 'Sua viagem foi finalizada com sucesso.',
                type: 'success'
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    setupSubscription();
  }, [supabase]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -100, x: '-50%' }}
          animate={{ opacity: 1, y: 20, x: '-50%' }}
          exit={{ opacity: 0, y: -100, x: '-50%' }}
          className="fixed top-0 left-1/2 z-[100] w-[90%] max-w-sm"
        >
          <div className="p-4 rounded-3xl bg-roxou-surface border border-roxou-primary/30 shadow-2xl shadow-roxou-primary/20 flex items-center gap-4 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-roxou-primary'}`} />
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${notification.type === 'success' ? 'bg-emerald-500/10' : 'bg-roxou-primary/10'}`}>
              {notification.type === 'success' ? (
                <CheckCircle className={`w-6 h-6 ${notification.type === 'success' ? 'text-emerald-500' : 'text-roxou-primary'}`} />
              ) : (
                <Navigation className="w-6 h-6 text-roxou-primary" />
              )}
            </div>
            <div className="flex-grow">
              <h4 className="text-sm font-black text-white leading-tight">{notification.title}</h4>
              <p className="text-[10px] text-roxou-text-muted mt-1 font-medium">{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
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
