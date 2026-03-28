"use client";

import { Clock, AlertCircle } from "lucide-react";
import DriverLogoutButton from "./DriverLogoutButton";

interface DriverOnboardingStatusProps {
  role: string | null;
  driverFound: boolean;
  verificationStatus: string | null;
}

export default function DriverOnboardingStatus({
  role,
  driverFound,
  verificationStatus,
}: DriverOnboardingStatusProps) {
  const isRejected = verificationStatus === "rejected";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-roxou-bg relative overflow-hidden pointer-events-none">
      {/* Background decorative elements - pointer-events-none to prevent blocking */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-roxou-primary/10 blur-[100px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-roxou-secondary/5 blur-[80px] rounded-full -z-10 pointer-events-none" />
      
      <div className="w-full max-w-md p-10 rounded-[40px] bg-roxou-surface border border-roxou-border text-center space-y-8 relative z-10 pointer-events-auto">
        <div className="w-20 h-20 bg-roxou-primary/20 rounded-full flex items-center justify-center mx-auto">
          {isRejected ? (
            <AlertCircle className="text-red-500 w-10 h-10" />
          ) : (
            <Clock className="text-roxou-primary w-10 h-10" />
          )}
        </div>
        
        <div className="space-y-4">
          <h1 className={`text-3xl font-display font-extrabold ${isRejected ? "text-red-500" : "text-white"}`}>
            {isRejected ? "Perfil Não Aprovado" : "Análise em Andamento"}
          </h1>
          
          <div className="space-y-4">
            <p className="text-roxou-text-muted leading-relaxed">
              {isRejected 
                ? "Infelizmente seu perfil não atende aos requisitos atuais da Roxou. Se você acredita que houve um erro, entre em contato com o suporte."
                : "Recebemos seus dados! Nossa equipe está revisando seu perfil para garantir a segurança da plataforma. Você receberá um aviso assim que for aprovado."}
            </p>
            <p className="text-roxou-text-muted/60 text-xs font-medium">
              Você pode sair agora e voltar depois para acompanhar a análise.
            </p>
          </div>
        </div>

        <DriverLogoutButton />
      </div>
    </div>
  );
}
