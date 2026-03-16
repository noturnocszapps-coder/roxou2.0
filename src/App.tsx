import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Shield, 
  BarChart3, 
  Globe, 
  MessageSquare, 
  Menu, 
  X,
  Instagram,
  Linkedin,
  Twitter,
  ChevronRight
} from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-4 glass' : 'py-6 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-roxou-primary rounded-lg flex items-center justify-center">
            <Zap className="text-white w-5 h-5 fill-current" />
          </div>
          <span className="text-2xl font-display font-bold tracking-tighter">ROXOU</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {['Serviços', 'Projetos', 'Sobre', 'Contato'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              {item}
            </a>
          ))}
          <button className="px-5 py-2.5 bg-roxou-primary hover:bg-roxou-primary/90 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95">
            Começar Projeto
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 glass border-t border-white/10 p-6 flex flex-col gap-4 md:hidden"
          >
            {['Serviços', 'Projetos', 'Sobre', 'Contato'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-lg font-medium text-white/80"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <button className="w-full py-4 bg-roxou-primary rounded-xl font-bold">
              Começar Projeto
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-roxou-primary/20 blur-[120px] rounded-full -z-10" />
      <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-roxou-secondary/30 blur-[100px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="px-4 py-1.5 rounded-full bg-roxou-primary/10 border border-roxou-primary/20 text-roxou-accent text-xs font-bold uppercase tracking-widest mb-6 inline-block">
            Design & Performance de Elite
          </span>
          <h1 className="text-5xl md:text-8xl font-display font-extrabold tracking-tight mb-8 leading-[1.1]">
            Transformamos sua <br />
            <span className="text-gradient">Presença Digital</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/60 mb-10 leading-relaxed">
            Criamos experiências digitais de alto impacto que convertem visitantes em clientes fiéis. Design premium para marcas que não aceitam o comum.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-roxou-dark rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/90 transition-all hover:scale-105">
              Ver Projetos <ArrowRight className="w-5 h-5" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 glass rounded-full font-bold text-lg hover:bg-white/10 transition-all">
              Nossa Metodologia
            </button>
          </div>
        </motion.div>

        {/* Hero Image / Mockup Placeholder */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-20 relative"
        >
          <div className="relative z-10 rounded-3xl overflow-hidden border border-white/10 purple-glow">
            <img 
              src="https://picsum.photos/seed/roxou-hero/1200/600" 
              alt="Dashboard Preview" 
              className="w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-roxou-primary/40 blur-3xl rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-roxou-secondary/40 blur-3xl rounded-full" />
        </motion.div>
      </div>
    </section>
  );
};

const BentoGrid = () => {
  const services = [
    {
      title: "Landing Pages",
      desc: "Páginas focadas 100% em conversão com design exclusivo.",
      icon: <Zap className="w-6 h-6 text-roxou-accent" />,
      size: "col-span-1 md:col-span-2",
      img: "https://picsum.photos/seed/lp/600/400"
    },
    {
      title: "Identidade Visual",
      desc: "Branding que comunica autoridade e sofisticação.",
      icon: <Shield className="w-6 h-6 text-roxou-accent" />,
      size: "col-span-1",
      img: "https://picsum.photos/seed/brand/400/400"
    },
    {
      title: "Tráfego Pago",
      desc: "Estratégias de escala para maximizar seu ROI.",
      icon: <BarChart3 className="w-6 h-6 text-roxou-accent" />,
      size: "col-span-1",
      img: "https://picsum.photos/seed/ads/400/400"
    },
    {
      title: "Desenvolvimento Web",
      desc: "Sistemas robustos e interfaces ultra-velozes.",
      icon: <Globe className="w-6 h-6 text-roxou-accent" />,
      size: "col-span-1 md:col-span-2",
      img: "https://picsum.photos/seed/web/600/400"
    }
  ];

  return (
    <section id="serviços" className="py-24 bg-roxou-dark">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 text-center md:text-left">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">Nossas Soluções</h2>
          <p className="text-white/60 max-w-xl text-lg">
            Combinamos design de vanguarda com tecnologia de ponta para entregar resultados reais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className={`${service.size} group relative overflow-hidden rounded-3xl bg-roxou-card border border-white/5 p-8 flex flex-col justify-between min-h-[320px]`}
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-roxou-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                <p className="text-white/50 leading-relaxed">{service.desc}</p>
              </div>
              
              <div className="absolute bottom-0 right-0 w-1/2 h-1/2 opacity-20 group-hover:opacity-40 transition-opacity">
                <img 
                  src={service.img} 
                  alt={service.title} 
                  className="w-full h-full object-cover rounded-tl-3xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Stats = () => {
  const stats = [
    { label: "Projetos Entregues", value: "250+" },
    { label: "ROI Médio", value: "4.5x" },
    { label: "Países Atendidos", value: "12" },
    { label: "Satisfação", value: "99%" }
  ];

  return (
    <section className="py-20 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-4xl md:text-6xl font-display font-bold text-roxou-accent mb-2">{stat.value}</div>
              <div className="text-sm text-white/40 font-bold uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => {
  return (
    <section id="contato" className="py-24 px-6">
      <div className="max-w-5xl mx-auto relative overflow-hidden rounded-[40px] bg-gradient-to-br from-roxou-primary to-roxou-secondary p-12 md:p-20 text-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">Pronto para elevar o nível do seu negócio?</h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Não perca mais tempo com designs genéricos. Vamos construir algo extraordinário juntos.
          </p>
          <button className="px-10 py-5 bg-white text-roxou-dark rounded-full font-bold text-xl hover:scale-105 transition-all shadow-2xl">
            Agendar Consultoria Gratuita
          </button>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-16 border-t border-white/5 bg-roxou-dark">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-roxou-primary rounded-lg flex items-center justify-center">
                <Zap className="text-white w-5 h-5 fill-current" />
              </div>
              <span className="text-2xl font-display font-bold tracking-tighter">ROXOU</span>
            </div>
            <p className="text-white/50 max-w-md leading-relaxed mb-8">
              A agência digital focada em performance e design de elite. Transformamos marcas comuns em líderes de mercado através da inovação constante.
            </p>
            <div className="flex gap-4">
              {[Instagram, Linkedin, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-roxou-primary transition-colors">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6">Links Rápidos</h4>
            <ul className="space-y-4 text-white/50">
              <li><a href="#" className="hover:text-white transition-colors">Início</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Serviços</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Projetos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Contato</h4>
            <ul className="space-y-4 text-white/50">
              <li>contato@roxou.com.br</li>
              <li>+55 (11) 99999-9999</li>
              <li>São Paulo, SP - Brasil</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/30">
          <p>© 2026 ROXOU. Todos os direitos reservados.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white">Privacidade</a>
            <a href="#" className="hover:text-white">Termos</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <div className="min-h-screen selection:bg-roxou-primary selection:text-white">
      <Navbar />
      <Hero />
      <Stats />
      <BentoGrid />
      
      {/* Testimonial Section */}
      <section className="py-24 bg-roxou-card/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">O que dizem nossos clientes</h2>
            <div className="w-20 h-1 bg-roxou-primary mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-8 glass rounded-3xl">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Zap key={j} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-white/70 italic mb-8">
                  "A Roxou superou todas as nossas expectativas. O novo site não só ficou visualmente incrível, mas nossas conversões aumentaram em 150% no primeiro mês."
                </p>
                <div className="flex items-center gap-4">
                  <img 
                    src={`https://picsum.photos/seed/user${i}/100/100`} 
                    alt="User" 
                    className="w-12 h-12 rounded-full border border-white/20"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="font-bold">Ricardo Santos</div>
                    <div className="text-xs text-white/40 uppercase tracking-wider">CEO, TechFlow</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTA />
      <Footer />
    </div>
  );
}

