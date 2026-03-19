"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Car, User, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function DriverOnboardingPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    vehicle_model: "",
    vehicle_plate: "",
    driver_license: "",
  });

  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch profile to get role and name
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single();

      // Fetch driver record for verification status
      const { data: driver } = await supabase
        .from("drivers")
        .select("verification_status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (driver) {
        setStatus(driver.verification_status);
      } else if (profile?.role === "driver") {
        // Deterministic fallback: if driver role exists but no drivers row is found, show pending screen
        setStatus("pending");
      } else {
        setStatus(null);
      }

      if (profile?.full_name) {
        setFormData(prev => ({ ...prev, full_name: profile.full_name }));
      }
      
      setFetching(false);
    }
    checkStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        role: "driver",
        full_name: formData.full_name,
        phone: formData.phone,
        driver_documents: {
          vehicle_model: formData.vehicle_model,
          vehicle_plate: formData.vehicle_plate,
          driver_license: formData.driver_license,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Also update drivers table to ensure verification_status is tracked
    const { error: driverError } = await supabase
      .from("drivers")
      .upsert({
        user_id: user.id,
        verification_status: "pending",
        updated_at: new Date().toISOString(),
      });

    if (driverError) {
      setError(driverError.message);
      setLoading(false);
    } else {
      setStatus("pending");
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-roxou-bg">
        <Zap className="w-12 h-12 text-roxou-primary animate-pulse" />
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-roxou-bg">
        <div className="w-full max-w-md p-10 rounded-[40px] bg-roxou-surface border border-roxou-border text-center space-y-8">
          <div className="w-20 h-20 bg-roxou-primary/20 rounded-full flex items-center justify-center mx-auto">
            <Clock className="text-roxou-primary w-10 h-10" />
          </div>
          <h1 className="text-3xl font-display font-extrabold">Análise em Andamento</h1>
          <p className="text-roxou-text-muted leading-relaxed">
            Recebemos seus dados! Nossa equipe está revisando seu perfil para garantir a segurança da plataforma. Você receberá um aviso assim que for aprovado.
          </p>
          <Link 
            href="/"
            className="w-full py-4 glass rounded-full font-bold relative z-50 flex items-center justify-center hover:bg-white/5 transition-all active:scale-95"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-roxou-bg">
        <div className="w-full max-w-md p-10 rounded-[40px] bg-roxou-surface border border-roxou-border text-center space-y-8">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="text-red-500 w-10 h-10" />
          </div>
          <h1 className="text-3xl font-display font-extrabold text-red-500">Perfil Não Aprovado</h1>
          <p className="text-roxou-text-muted leading-relaxed">
            Infelizmente seu perfil não atende aos requisitos atuais da Roxou. Se você acredita que houve um erro, entre em contato com o suporte.
          </p>
          <button 
            onClick={() => setStatus(null)}
            className="w-full py-4 bg-roxou-primary rounded-full font-bold"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-roxou-bg pb-20">
      <header className="glass sticky top-0 z-40 py-6 px-6 text-center">
        <div className="flex justify-center mb-2">
          <Zap className="text-roxou-primary w-8 h-8 fill-current" />
        </div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Seja um Motorista Roxou</h1>
      </header>

      <main className="max-w-md mx-auto px-6 pt-10">
        <div className="mb-10 text-center">
          <p className="text-roxou-text-muted">Complete seu cadastro para começar a receber leads de passageiros premium.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-roxou-text-muted" />
              <input 
                required
                type="text"
                placeholder="Nome Completo"
                className="w-full pl-12 pr-5 py-4 rounded-2xl bg-roxou-surface border border-roxou-border focus:border-roxou-primary outline-none transition-all"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-roxou-text-muted" />
              <input 
                required
                type="tel"
                placeholder="Telefone / WhatsApp"
                className="w-full pl-12 pr-5 py-4 rounded-2xl bg-roxou-surface border border-roxou-border focus:border-roxou-primary outline-none transition-all"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-xs font-bold text-roxou-primary uppercase tracking-widest mb-4 ml-1">Dados do Veículo</h3>
            <div className="space-y-4">
              <div className="relative">
                <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-roxou-text-muted" />
                <input 
                  required
                  type="text"
                  placeholder="Modelo do Carro (Ex: Corolla 2022)"
                  className="w-full pl-12 pr-5 py-4 rounded-2xl bg-roxou-surface border border-roxou-border focus:border-roxou-primary outline-none transition-all"
                  value={formData.vehicle_model}
                  onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                />
              </div>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-roxou-text-muted" />
                <input 
                  required
                  type="text"
                  placeholder="Placa do Veículo"
                  className="w-full pl-12 pr-5 py-4 rounded-2xl bg-roxou-surface border border-roxou-border focus:border-roxou-primary outline-none transition-all"
                  value={formData.vehicle_plate}
                  onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-xs font-bold text-roxou-primary uppercase tracking-widest mb-4 ml-1">Documentação</h3>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-roxou-text-muted" />
              <input 
                required
                type="text"
                placeholder="Número da CNH"
                className="w-full pl-12 pr-5 py-4 rounded-2xl bg-roxou-surface border border-roxou-border focus:border-roxou-primary outline-none transition-all"
                value={formData.driver_license}
                onChange={(e) => setFormData({ ...formData, driver_license: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-roxou-primary text-white rounded-full font-bold text-xl flex items-center justify-center gap-3 hover:bg-roxou-primary/90 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 shadow-2xl shadow-roxou-primary/20"
          >
            {loading ? "Enviando..." : "Enviar para Análise"}
          </button>
        </form>
      </main>
    </div>
  );
}
