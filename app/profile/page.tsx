"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, User, Save, Zap, Camera } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [driverStatus, setDriverStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        setError("Erro ao carregar perfil.");
      } else {
        setProfile(data);
        
        // Fetch driver status if role is driver
        if (data.role === 'driver') {
          const { data: driver } = await supabase
            .from("drivers")
            .select("verification_status")
            .eq("user_id", user.id)
            .maybeSingle();
          
          if (driver) {
            setDriverStatus(driver.verification_status);
          }
        }
      }
      setLoading(false);
    }

    fetchProfile();
  }, [supabase, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    // 1. Update Profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: profile.role,
      })
      .eq("id", profile.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    // 2. If role is driver, ensure driver record exists (upsert)
    if (profile.role === 'driver') {
      const { error: driverError } = await supabase
        .from("drivers")
        .upsert({
          user_id: profile.id,
          verification_status: driverStatus || "pending",
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (driverError) {
        setError("Erro ao salvar dados de motorista.");
        setSaving(false);
        return;
      }
      
      // Refresh driver status if it was null before
      if (!driverStatus) {
        setDriverStatus("pending");
      }
    }

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-roxou-bg">
        <Zap className="w-12 h-12 text-roxou-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-roxou-bg pb-20">
      <header className="glass sticky top-0 z-40 py-4 px-6">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-display font-bold">Meu Perfil</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-8">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[40px] bg-roxou-surface border-2 border-roxou-border overflow-hidden violet-glow">
                <img 
                  src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[40px] cursor-pointer">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-xs text-roxou-text-muted uppercase font-bold tracking-widest">Toque para alterar foto</p>
          </div>

          <div className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs text-roxou-text-muted uppercase font-bold tracking-widest ml-1">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-roxou-text-muted" />
                <input 
                  required
                  type="text"
                  className="w-full p-5 pl-14 rounded-2xl bg-roxou-surface border border-roxou-border focus:border-roxou-primary outline-none transition-all"
                  value={profile.full_name || ""}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                />
              </div>
            </div>

            {/* Avatar URL (Simple for now) */}
            <div className="space-y-2">
              <label className="text-xs text-roxou-text-muted uppercase font-bold tracking-widest ml-1">URL da Foto</label>
              <input 
                type="text"
                placeholder="https://exemplo.com/foto.jpg"
                className="w-full p-5 rounded-2xl bg-roxou-surface border border-roxou-border focus:border-roxou-primary outline-none transition-all placeholder:text-roxou-text-muted/30"
                value={profile.avatar_url || ""}
                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
              />
            </div>

            {/* Role Selector */}
            <div className="space-y-2">
              <label className="text-xs text-roxou-text-muted uppercase font-bold tracking-widest ml-1">Tipo de Conta</label>
              <select 
                className="w-full p-5 rounded-2xl bg-roxou-surface border border-roxou-border focus:border-roxou-primary outline-none transition-all appearance-none cursor-pointer"
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                disabled={profile.role === 'admin'}
              >
                <option value="passenger">Passageiro</option>
                <option value="driver">Motorista</option>
                {profile.role === 'admin' && <option value="admin">Administrador</option>}
              </select>
              {profile.role === 'admin' && (
                <p className="text-[10px] text-roxou-primary uppercase font-bold tracking-widest ml-1">
                  Contas de administrador não podem ser alteradas aqui.
                </p>
              )}
            </div>

            {/* Driver Status Info */}
            {profile.role === 'driver' && (
              <div className="p-6 rounded-2xl bg-roxou-surface/50 border border-roxou-border flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-roxou-text-muted uppercase font-bold tracking-widest mb-1">Status de Verificação</p>
                  <p className={`font-bold uppercase tracking-tighter ${driverStatus === 'approved' ? 'text-green-500' : 'text-yellow-500'}`}>
                    {driverStatus === 'approved' ? 'Aprovado' : 'Pendente / Em Análise'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-roxou-surface border border-roxou-border flex items-center justify-center">
                  <Zap className={`w-5 h-5 ${driverStatus === 'approved' ? 'text-green-500' : 'text-yellow-500'}`} />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-sm">
              Perfil atualizado com sucesso!
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-5 bg-roxou-primary text-white rounded-full font-bold text-xl flex items-center justify-center gap-3 hover:bg-roxou-primary/90 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 shadow-2xl shadow-roxou-primary/20"
          >
            <Save className="w-6 h-6" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </main>
    </div>
  );
}
