'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Trash2, Loader2, MessageSquare, Zap, Navigation, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createClient } from '@/lib/supabase/client';
import { markAsRead, markAllAsRead } from '@/lib/notifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function NotificationCenter({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setNotifications(data || []);
        setUnreadCount((data || []).filter(n => !n.is_read).length);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
    
    // Real-time subscription for new notifications
    const channel = supabase
      .channel(`user_notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications(prev => {
            const newList = prev.map(n => n.id === payload.new.id ? payload.new : n);
            setUnreadCount(newList.filter(n => !n.is_read).length);
            return newList;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    await markAllAsRead(userId);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'INTEREST': return <Zap className="w-4 h-4 text-roxou-primary" />;
      case 'CHOSEN': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'STATUS_CHANGE': return <Navigation className="w-4 h-4 text-roxou-primary" />;
      case 'CHAT': return <MessageSquare className="w-4 h-4 text-roxou-primary" />;
      default: return <Bell className="w-4 h-4 text-roxou-text-muted" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-roxou-surface border border-roxou-border flex items-center justify-center relative hover:border-roxou-primary/50 transition-all active:scale-95"
      >
        <Bell className="w-5 h-5 text-roxou-text-muted" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-roxou-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-roxou-bg shadow-lg shadow-roxou-primary/40 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-roxou-surface border border-roxou-border rounded-[32px] shadow-2xl z-50 overflow-hidden glass"
          >
            <div className="p-5 border-bottom border-roxou-border flex items-center justify-between bg-white/5">
              <h3 className="text-sm font-black text-white tracking-tight">Notificações</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-black uppercase tracking-widest text-roxou-primary hover:text-white transition-colors"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
              {loading ? (
                <div className="p-10 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 text-roxou-primary animate-spin" />
                  <span className="text-[10px] font-bold text-roxou-text-muted uppercase tracking-widest">Carregando...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-10 flex flex-col items-center justify-center gap-4 opacity-40">
                  <div className="w-16 h-16 rounded-full bg-roxou-border/20 flex items-center justify-center">
                    <Bell className="w-8 h-8 text-roxou-text-muted" />
                  </div>
                  <p className="text-xs font-bold text-roxou-text-muted text-center">Tudo limpo por aqui!</p>
                </div>
              ) : (
                <div className="divide-y divide-roxou-border/30">
                  {notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => !n.is_read && handleMarkRead(n.id)}
                      className={`p-4 flex gap-4 hover:bg-white/5 transition-all cursor-pointer relative group ${!n.is_read ? 'bg-roxou-primary/5' : ''}`}
                    >
                      {!n.is_read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-roxou-primary" />
                      )}
                      
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!n.is_read ? 'bg-roxou-primary/20' : 'bg-roxou-border/20'}`}>
                        {getIcon(n.type)}
                      </div>

                      <div className="flex-grow space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className={`text-xs font-black tracking-tight ${!n.is_read ? 'text-white' : 'text-roxou-text-muted'}`}>
                            {n.title}
                          </h4>
                          <span className="text-[9px] font-bold text-roxou-text-muted/60 whitespace-nowrap">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-[10px] text-roxou-text-muted font-medium leading-relaxed">
                          {n.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-white/5 border-t border-roxou-border text-center">
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-black uppercase tracking-widest text-roxou-text-muted hover:text-white transition-colors"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
