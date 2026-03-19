"use client";

import { useRouter } from "next/navigation";

export default function BackToHomeButton() {
  const router = useRouter();

  return (
    <div className="w-full relative z-[100] pointer-events-auto">
      <button
        type="button"
        onClick={() => router.push("/")}
        className="w-full py-5 glass rounded-full font-black text-lg uppercase tracking-widest flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 shadow-2xl border border-white/10"
      >
        Voltar ao Início
      </button>
    </div>
  );
}
