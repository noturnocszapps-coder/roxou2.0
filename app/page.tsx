import Link from "next/link";
import { ArrowRight, Zap, Shield, Star, MapPin, Clock, MessageSquare, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-roxou-bg text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass py-3 sm:py-4">
        <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-roxou-primary rounded-lg flex items-center justify-center">
              <Zap className="text-white w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </div>
            <span className="text-xl sm:text-2xl font-display font-bold tracking-tighter">ROXOU</span>
          </div>
          <Link 
            href="/login" 
            className="px-5 sm:px-6 py-2 bg-roxou-primary hover:bg-roxou-primary/90 rounded-full text-xs sm:text-sm font-semibold transition-all hover:scale-105"
          >
            Entrar
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="relative pt-40 pb-24 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-roxou-primary/20 blur-[150px] rounded-full -z-10 animate-pulse" />
          
          <div className="container mx-auto px-6 text-center">
            <div className="inline-block px-4 py-1.5 rounded-full bg-roxou-primary/10 border border-roxou-primary/20 text-roxou-primary text-xs font-black uppercase tracking-[0.2em] mb-8">
              A Noite é Sua. A Chegada é Nossa.
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-extrabold tracking-tighter mb-8 leading-[0.9]">
              Domine a Noite <br />
              <span className="text-roxou-primary">Sem Complicação</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-roxou-text-muted mb-12 leading-relaxed font-medium">
              A plataforma exclusiva para quem busca segurança, estilo e negociação direta. Conectamos você aos melhores motoristas da cena urbana.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                href="/login/passenger" 
                className="w-full sm:w-auto px-10 py-5 bg-roxou-primary text-white rounded-full font-black text-xl flex items-center justify-center gap-3 hover:bg-roxou-primary/90 transition-all hover:scale-105 shadow-2xl shadow-roxou-primary/20"
              >
                Pedir motorista agora <ArrowRight className="w-6 h-6" />
              </Link>
              <Link 
                href="/login/driver" 
                className="w-full sm:w-auto px-10 py-5 glass rounded-full font-bold text-lg hover:bg-white/10 transition-all border border-white/10"
              >
                Quero ser Motorista
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-32 bg-roxou-surface-alt/30 border-y border-roxou-border">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-roxou-primary mb-4">Vantagens Roxou</h2>
              <p className="text-4xl md:text-5xl font-display font-bold">Por que escolher a Roxou?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="p-10 rounded-[40px] bg-roxou-surface border border-roxou-border hover:border-roxou-primary/40 transition-all group">
                <div className="w-16 h-16 bg-roxou-primary/10 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Shield className="text-roxou-primary w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Segurança Total</h3>
                <p className="text-roxou-text-muted leading-relaxed">Motoristas verificados e aprovados pela nossa curadoria. Sua única preocupação será aproveitar o rolê.</p>
              </div>
              <div className="p-10 rounded-[40px] bg-roxou-surface border border-roxou-border hover:border-roxou-primary/40 transition-all group">
                <div className="w-16 h-16 bg-roxou-primary/10 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <MessageSquare className="text-roxou-primary w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Negociação Direta</h3>
                <p className="text-roxou-text-muted leading-relaxed">Sem algoritmos decidindo o preço. Você negocia o valor e os detalhes diretamente com o motorista.</p>
              </div>
              <div className="p-10 rounded-[40px] bg-roxou-surface border border-roxou-border hover:border-roxou-primary/40 transition-all group">
                <div className="w-16 h-16 bg-roxou-primary/10 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Zap className="text-roxou-primary w-8 h-8 fill-current" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Rolê Sem Stress</h3>
                <p className="text-roxou-text-muted leading-relaxed">Esqueça cancelamentos e esperas infinitas. Agende sua volta ou peça na hora com quem conhece a cidade.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-roxou-secondary/10 blur-[120px] rounded-full -z-10" />
          
          <div className="container mx-auto px-6">
            <div className="text-center mb-24">
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-roxou-primary mb-4">Passo a Passo</h2>
              <p className="text-4xl md:text-6xl font-display font-bold">Como Funciona</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="relative text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-roxou-primary flex items-center justify-center font-display font-black text-3xl mx-auto shadow-xl shadow-roxou-primary/30">1</div>
                <h4 className="text-2xl font-bold">Publique seu Pedido</h4>
                <p className="text-roxou-text-muted">Diga para onde vai e que horas precisa sair. É rápido e intuitivo.</p>
                <div className="hidden md:block absolute top-10 left-[70%] w-full h-[2px] bg-gradient-to-r from-roxou-primary to-transparent opacity-20" />
              </div>
              <div className="relative text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-roxou-primary flex items-center justify-center font-display font-black text-3xl mx-auto shadow-xl shadow-roxou-primary/30">2</div>
                <h4 className="text-2xl font-bold">Receba Propostas</h4>
                <p className="text-roxou-text-muted">Motoristas interessados entrarão em contato com você via chat exclusivo.</p>
                <div className="hidden md:block absolute top-10 left-[70%] w-full h-[2px] bg-gradient-to-r from-roxou-primary to-transparent opacity-20" />
              </div>
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-roxou-primary flex items-center justify-center font-display font-black text-3xl mx-auto shadow-xl shadow-roxou-primary/30">3</div>
                <h4 className="text-2xl font-bold">Vá de Roxou</h4>
                <p className="text-roxou-text-muted">Combine o valor, confirme os detalhes e pronto. Sua viagem está garantida.</p>
              </div>
            </div>

            <div className="mt-24 text-center">
              <Link 
                href="/login/passenger" 
                className="inline-flex items-center gap-3 text-roxou-primary font-black uppercase tracking-widest hover:gap-5 transition-all group"
              >
                Começar agora <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-24 md:py-32 container mx-auto px-4 sm:px-6">
          <div className="p-8 sm:p-12 md:p-24 rounded-[32px] sm:rounded-[48px] md:rounded-[60px] bg-gradient-to-br from-roxou-primary to-roxou-secondary text-center relative overflow-hidden violet-glow">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-black mb-6 sm:mb-10 leading-[1.1] tracking-tighter">
                Pronto para o <br className="hidden sm:inline" />próximo rolê?
              </h2>
              <Link 
                href="/login/passenger" 
                className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 bg-white text-roxou-bg rounded-full font-black text-lg sm:text-xl hover:scale-105 sm:hover:scale-110 transition-all shadow-2xl active:scale-95"
              >
                Pedir motorista agora
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-16 border-t border-roxou-border bg-roxou-bg">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-2">
            <Zap className="text-roxou-primary w-8 h-8 fill-current" />
            <span className="text-2xl font-display font-bold tracking-tighter">ROXOU</span>
          </div>
          <div className="text-roxou-text-muted text-sm font-medium">
            © 2026 Roxou Transporte. Todos os direitos reservados.
          </div>
          <div className="flex gap-8 text-sm font-bold uppercase tracking-widest">
            <Link href="/terms" className="hover:text-roxou-primary transition-colors">Termos</Link>
            <Link href="/privacy" className="hover:text-roxou-primary transition-colors">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
