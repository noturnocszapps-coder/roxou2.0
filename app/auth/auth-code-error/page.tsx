"use client";

import { motion } from "motion/react";
import { AlertCircle, ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-roxou-bg relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-roxou-primary/10 blur-[100px] rounded-full -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 sm:p-10 rounded-[40px] bg-roxou-surface border border-roxou-border violet-glow text-center relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20 relative group">
            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <AlertCircle className="text-red-500 w-10 h-10 relative z-10" />
          </div>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold mb-4 text-white">Erro de Autenticação</h1>
        
        <div className="space-y-4 mb-10 text-left">
          <p className="text-sm sm:text-base text-roxou-text-muted leading-relaxed text-center">
            Não foi possível completar seu acesso. O link pode ter expirado ou houve uma falha na criação do seu perfil.
          </p>
          
          <div className="p-4 rounded-2xl bg-roxou-bg/50 border border-roxou-border">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-roxou-primary mb-2">O que aconteceu?</h4>
            <p className="text-xs text-roxou-text-muted">
              Sua conta foi criada no sistema de autenticação, mas o banco de dados de perfil encontrou um problema temporário.
            </p>
          </div>
        </div>

        <Link 
          href="/login"
          className="w-full py-4 bg-roxou-primary text-white rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:bg-roxou-primary/90 transition-all hover:scale-105 shadow-xl shadow-roxou-primary/20 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Tentar Novamente
        </Link>
        
        <div className="mt-10 flex items-center justify-center gap-2 opacity-30">
          <Zap className="w-4 h-4 text-roxou-primary fill-current" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Roxou Transporte</span>
        </div>
      </motion.div>
    </div>
  );
}
