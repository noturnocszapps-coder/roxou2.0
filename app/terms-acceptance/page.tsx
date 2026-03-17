"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Zap, ShieldCheck, ArrowRight } from "lucide-react";

export default function TermsAcceptancePage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ terms_accepted: true })
      .eq("id", user.id);

    if (!error) {
      router.push("/dashboard");
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-roxou-bg">
      <div className="w-full max-w-2xl p-10 rounded-[40px] bg-roxou-surface border border-roxou-border space-y-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-roxou-primary rounded-xl flex items-center justify-center">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-display font-bold">Termos de Uso Roxou</h1>
        </div>

        <div className="prose prose-invert max-h-96 overflow-y-auto p-6 bg-roxou-bg rounded-2xl border border-roxou-border text-sm text-roxou-text-muted leading-relaxed">
          <h3 className="text-white font-bold mb-4">1. A Natureza do Serviço</h3>
          <p className="mb-4">O Roxou Transporte é uma plataforma de conexão. Não somos uma empresa de transporte, não possuímos frota e não contratamos motoristas.</p>
          
          <h3 className="text-white font-bold mb-4">2. Negociação Direta</h3>
          <p className="mb-4">Todos os valores, formas de pagamento e detalhes da viagem são negociados diretamente entre o passageiro e o motorista através do nosso chat.</p>
          
          <h3 className="text-white font-bold mb-4">3. Segurança</h3>
          <p className="mb-4">Embora realizemos uma verificação básica de documentos, a Roxou não se responsabiliza por incidentes ocorridos durante as viagens. Recomendamos sempre conferir os dados do veículo antes de embarcar.</p>
          
          <h3 className="text-white font-bold mb-4">4. Conduta</h3>
          <p className="mb-4">Mantemos tolerância zero para assédio, violência ou qualquer comportamento ilegal. Usuários denunciados serão permanentemente banidos.</p>
        </div>

        <button
          onClick={handleAccept}
          disabled={loading}
          className="w-full py-5 bg-roxou-primary text-white rounded-full font-bold text-xl flex items-center justify-center gap-3 hover:bg-roxou-primary/90 transition-all hover:scale-105 disabled:opacity-50"
        >
          {loading ? "Processando..." : "Li e Aceito os Termos"}
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
