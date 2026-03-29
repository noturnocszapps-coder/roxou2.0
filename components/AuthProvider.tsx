"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  const fetchProfile = async (userId: string, userEmail: string, metadata: any) => {
    try {
      console.log("AUTH: Buscando profile para", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !data) {
        console.warn("PROFILE: Não encontrado via trigger, iniciando fallback...");
        
        // Fallback: Create profile if it doesn't exist
        const newProfile = {
          id: userId,
          email: userEmail,
          full_name: metadata?.full_name || "Sem nome",
          role: metadata?.role || "passenger",
          updated_at: new Date().toISOString(),
        };

        const { data: createdProfile, error: createError } = await supabase
          .from("profiles")
          .upsert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error("ERRO PROFILE: Falha no fallback de criação:", createError.message);
          return null;
        }

        console.log("PROFILE: Criado via fallback com sucesso");
        return createdProfile;
      }

      // Auto-repair: Ensure email, full_name and role are present and valid
      const allowedRoles = ["passenger", "driver", "admin"];
      const currentRole = data.role || metadata?.role || "passenger";
      const isRoleValid = allowedRoles.includes(currentRole);

      if (!data.email || !data.full_name || !isRoleValid) {
        console.log("PROFILE: Detectada inconsistência, reparando...");
        const { data: repairedData } = await supabase
          .from("profiles")
          .update({
            email: data.email || userEmail,
            full_name: data.full_name || metadata?.full_name || "Sem nome",
            role: isRoleValid ? currentRole : "passenger",
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)
          .select()
          .single();
        return repairedData || data;
      }

      return data;
    } catch (err) {
      console.error("ERRO PROFILE: Erro inesperado ao processar profile:", err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const p = await fetchProfile(user.id, user.email!, user.user_metadata);
      setProfile(p);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log("AUTH: Sessão carregada para", session.user.email);
        setUser(session.user);
        const p = await fetchProfile(session.user.id, session.user.email!, session.user.user_metadata);
        setProfile(p);
      }
      
      setLoading(false);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AUTH EVENT:", event);
      
      if (session?.user) {
        setUser(session.user);
        const p = await fetchProfile(session.user.id, session.user.email!, session.user.user_metadata);
        setProfile(p);
      } else {
        setUser(null);
        setProfile(null);
      }
      
      setLoading(false);
      
      if (event === "SIGNED_IN") {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
