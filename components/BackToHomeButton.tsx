"use client";

import { useRouter } from "next/navigation";

export default function BackToHomeButton() {
  const router = useRouter();

  return (
    <div className="w-full relative z-[999] pointer-events-auto">
      <button
        type="button"
        onClick={() => {
          window.location.href = "/";
        }}
        className="w-full py-5 bg-red-600 rounded-full font-black text-lg uppercase tracking-widest flex items-center justify-center hover:bg-red-700 transition-all active:scale-95 shadow-2xl border border-white/10 text-white"
      >
        Voltar ao Início
      </button>
    </div>
  );
}
