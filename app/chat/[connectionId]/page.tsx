"use client";

import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Zap, ShieldAlert, Info, Loader2 } from "lucide-react";
import Link from "next/link";
import DriverStatusControls from "@/components/DriverStatusControls";

export default function ChatPage() {
  const { connectionId } = useParams();
  const supabase = createClient();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [connection, setConnection] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function setupChat() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setCurrentUser(user);

      // Fetch connection details
      const { data: conn, error: connError } = await supabase
        .from("connections")
        .select(`
          *,
          passenger:profiles!connections_passenger_id_fkey(id, full_name, avatar_url),
          driver:profiles!connections_driver_id_fkey(id, full_name, avatar_url),
          request:transport_requests(id, origin, departure_time, status)
        `)
        .eq("id", connectionId)
        .single();

      if (connError || !conn) {
        router.push("/dashboard");
        return;
      }

      // Check if user is participant
      if (user.id !== conn.passenger_id && user.id !== conn.driver_id) {
        router.push("/dashboard");
        return;
      }

      setConnection(conn);

      // Fetch message history
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("connection_id", connectionId)
        .order("created_at", { ascending: true });

      if (msgs) setMessages(msgs);
      setLoading(false);

      // Subscribe to new messages
      const messageChannel = supabase
        .channel(`chat:${connectionId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `connection_id=eq.${connectionId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new]);
          }
        )
        .subscribe();

      // Subscribe to request status changes
      const requestChannel = supabase
        .channel(`request:${conn.request_id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "transport_requests",
            filter: `id=eq.${conn.request_id}`,
          },
          (payload) => {
            setConnection((prev: any) => ({
              ...prev,
              request: {
                ...prev.request,
                status: payload.new.status,
              },
            }));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messageChannel);
        supabase.removeChannel(requestChannel);
      };
    }

    setupChat();
  }, [connectionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const msg = newMessage;
    setNewMessage("");

    const { error } = await supabase.from("messages").insert({
      connection_id: connectionId,
      sender_id: currentUser.id,
      content: msg,
    });

    if (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-roxou-bg">
        <Zap className="w-12 h-12 text-roxou-primary animate-pulse" />
      </div>
    );
  }

  const otherUser = currentUser.id === connection.passenger_id ? connection.driver : connection.passenger;

  return (
    <div className="flex flex-col h-screen bg-roxou-bg">
      {/* Header */}
      <header className="glass py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={currentUser.id === connection.driver_id ? "/driver/dashboard" : "/dashboard"} className="p-2 hover:bg-white/5 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-roxou-surface border border-roxou-border overflow-hidden">
              <img 
                src={otherUser.avatar_url || `https://ui-avatars.com/api/?name=${otherUser.full_name}`} 
                alt={otherUser.full_name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="font-bold text-sm">{otherUser.full_name}</h3>
              <p className="text-[10px] text-roxou-text-muted font-bold uppercase tracking-widest">Chat Ativo</p>
            </div>
          </div>
        </div>
        <button className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors">
          <ShieldAlert className="w-6 h-6" />
        </button>
      </header>

      {/* Info Banner */}
      <div className="bg-roxou-primary/10 border-b border-roxou-primary/20 p-4 px-6 space-y-4">
        <div className="flex items-center gap-3">
          <Info className="w-4 h-4 text-roxou-primary flex-shrink-0" />
          <p className="text-[10px] text-roxou-text-muted leading-tight">
            Viagem para: <span className="text-white font-bold">{connection.request.origin}</span>. Combine o valor e local exato aqui.
          </p>
        </div>
        
        {currentUser.id === connection.driver_id && (
          <div className="pt-2 border-t border-roxou-primary/10">
            <DriverStatusControls 
              requestId={connection.request_id} 
              currentStatus={connection.request.status} 
            />
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        <div className="text-center py-10">
          <p className="text-[10px] text-roxou-text-muted uppercase tracking-[0.2em] mb-4">Início da Conversa</p>
          <div className="p-4 rounded-2xl bg-roxou-surface/50 border border-roxou-border text-xs text-roxou-text-muted max-w-xs mx-auto">
            Lembre-se: O Roxou não processa pagamentos. Combine diretamente com o motorista.
          </div>
        </div>

        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-4 rounded-3xl ${
              msg.sender_id === currentUser.id 
                ? 'bg-roxou-primary text-white rounded-tr-none shadow-lg shadow-roxou-primary/10' 
                : 'bg-roxou-surface border border-roxou-border text-roxou-text rounded-tl-none'
            }`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p className={`text-[9px] mt-2 opacity-50 ${msg.sender_id === currentUser.id ? 'text-right' : 'text-left'}`}>
                {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-6 glass">
        <form onSubmit={sendMessage} className="max-w-2xl mx-auto flex gap-3">
          <input 
            type="text"
            placeholder="Digite sua mensagem..."
            className="flex-grow p-4 rounded-2xl bg-roxou-bg border border-roxou-border focus:border-roxou-primary outline-none transition-all text-sm"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button 
            type="submit"
            className="w-14 h-14 bg-roxou-primary rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-roxou-primary/20"
          >
            <Send className="w-6 h-6 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
