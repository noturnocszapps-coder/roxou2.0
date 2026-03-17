import Link from "next/link";
import { ArrowRight, Zap, Shield, Star, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass py-4">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-roxou-primary rounded-lg flex items-center justify-center">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="text-2xl font-display font-bold tracking-tighter">ROXOU</span>
          </div>
          <Link 
            href="/login" 
            className="px-6 py-2 bg-roxou-primary hover:bg-roxou-primary/90 rounded-full text-sm font-semibold transition-all hover:scale-105"
          >
            Entrar
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-roxou-primary/20 blur-[120px] rounded-full -z-10" />
          
          <div className="container mx-auto px-6 text-center">
            <div className="inline-block px-4 py-1.5 rounded-full bg-roxou-primary/10 border border-roxou-primary/20 text-roxou-primary text-xs font-bold uppercase tracking-widest mb-6">
              A Noite é Sua. A Chegada é Nossa.
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-8 leading-[1.1]">
              Domine a Cidade <br />
              <span className="text-roxou-primary">Com Estilo e Segurança</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-roxou-text-muted mb-12 leading-relaxed">
              Conectamos você aos melhores motoristas da cena urbana. Negocie diretamente, viaje com conforto e chegue nos melhores eventos com a exclusividade Roxou.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/login/passenger" 
                className="w-full sm:w-auto px-8 py-4 bg-white text-roxou-bg rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/90 transition-all hover:scale-105"
              >
                Sou Passageiro <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/login/driver" 
                className="w-full sm:w-auto px-8 py-4 glass rounded-full font-bold text-lg hover:bg-white/10 transition-all"
              >
                Sou Motorista
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-roxou-surface-alt/50">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-roxou-surface border border-roxou-border hover:border-roxou-primary/30 transition-all">
                <div className="w-12 h-12 bg-roxou-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="text-roxou-primary w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Segurança Premium</h3>
                <p className="text-roxou-text-muted">Motoristas verificados e aprovados pela nossa curadoria para garantir sua tranquilidade na noite.</p>
              </div>
              <div className="p-8 rounded-3xl bg-roxou-surface border border-roxou-border hover:border-roxou-primary/30 transition-all">
                <div className="w-12 h-12 bg-roxou-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="text-roxou-primary w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Conexão Direta</h3>
                <p className="text-roxou-text-muted">Sem intermediários. Negocie valores e horários diretamente com o motorista via chat exclusivo.</p>
              </div>
              <div className="p-8 rounded-3xl bg-roxou-surface border border-roxou-border hover:border-roxou-primary/30 transition-all">
                <div className="w-12 h-12 bg-roxou-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Star className="text-roxou-primary w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Experiência VIP</h3>
                <p className="text-roxou-text-muted">Veículos selecionados e atendimento diferenciado para quem não aceita o básico.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Como Funciona</h2>
              <p className="text-roxou-text-muted max-w-xl mx-auto">Simples, direto e eficiente. O controle está nas suas mãos.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="space-y-12">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-roxou-primary flex items-center justify-center font-bold text-xl">1</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Publique seu Pedido</h4>
                    <p className="text-roxou-text-muted">Diga para onde vai e que horas precisa sair. É rápido e intuitivo.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-roxou-primary flex items-center justify-center font-bold text-xl">2</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Receba Propostas</h4>
                    <p className="text-roxou-text-muted">Motoristas interessados entrarão em contato com você via chat.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-roxou-primary flex items-center justify-center font-bold text-xl">3</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Negocie e Confirme</h4>
                    <p className="text-roxou-text-muted">Combine o valor, confirme os detalhes e pronto. Sua viagem está garantida.</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-[40px] bg-gradient-to-br from-roxou-primary/20 to-roxou-bg border border-roxou-border overflow-hidden violet-glow">
                  <img 
                    src="https://picsum.photos/seed/roxou-night/800/800" 
                    alt="Nightlife" 
                    className="w-full h-full object-cover opacity-60"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-roxou-border bg-roxou-bg">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="text-roxou-primary w-6 h-6 fill-current" />
            <span className="text-xl font-display font-bold tracking-tighter">ROXOU</span>
          </div>
          <div className="text-roxou-text-muted text-sm">
            © 2026 Roxou Transporte. Todos os direitos reservados.
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="/terms" className="hover:text-roxou-primary transition-colors">Termos</Link>
            <Link href="/privacy" className="hover:text-roxou-primary transition-colors">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
