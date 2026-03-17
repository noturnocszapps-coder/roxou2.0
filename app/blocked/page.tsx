import { Zap, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function BlockedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-roxou-bg">
      <div className="w-full max-w-md p-10 rounded-[40px] bg-roxou-surface border border-roxou-border text-center space-y-8">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="text-red-500 w-10 h-10" />
        </div>
        <h1 className="text-3xl font-display font-extrabold text-red-500">Acesso Bloqueado</h1>
        <p className="text-roxou-text-muted leading-relaxed">
          Sua conta foi suspensa por violar nossos termos de uso ou diretrizes da comunidade. Se você acredita que isso é um erro, entre em contato com o suporte.
        </p>
        <Link 
          href="/"
          className="block w-full py-4 glass rounded-full font-bold"
        >
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}
