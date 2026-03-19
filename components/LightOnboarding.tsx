"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Shield, MessageSquare, ChevronRight, X } from "lucide-react";

const slides = [
  {
    title: "Peça sua carona",
    description: "Diga para onde você vai e encontre motoristas disponíveis na hora.",
    icon: <Zap className="w-12 h-12 text-roxou-primary" />,
    color: "from-roxou-primary/20 to-violet-500/20"
  },
  {
    title: "Negocie direto",
    description: "Converse com o motorista e combine os detalhes sem intermediários.",
    icon: <MessageSquare className="w-12 h-12 text-emerald-500" />,
    color: "from-emerald-500/20 to-teal-500/20"
  },
  {
    title: "Chegue no rolê sem stress",
    description: "Segurança e praticidade para você curtir o melhor da noite.",
    icon: <Shield className="w-12 h-12 text-blue-500" />,
    color: "from-blue-500/20 to-indigo-500/20"
  }
];

export default function LightOnboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("roxou_onboarding_seen");
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("roxou_onboarding_seen", "true");
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-roxou-bg/90 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-md bg-roxou-surface border border-roxou-border rounded-[48px] overflow-hidden shadow-2xl relative"
        >
          <button 
            onClick={handleClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-roxou-bg/50 flex items-center justify-center border border-roxou-border text-roxou-text-muted hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className={`p-10 pt-16 bg-gradient-to-b ${slides[currentSlide].color} transition-colors duration-500`}>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              className="w-24 h-24 bg-roxou-bg rounded-[32px] flex items-center justify-center mx-auto border border-roxou-border shadow-xl mb-8"
            >
              {slides[currentSlide].icon}
            </motion.div>

            <div className="text-center space-y-4">
              <motion.h2
                key={`title-${currentSlide}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-display font-black text-white tracking-tight"
              >
                {slides[currentSlide].title}
              </motion.h2>
              <motion.p
                key={`desc-${currentSlide}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-roxou-text-muted text-lg font-medium leading-relaxed"
              >
                {slides[currentSlide].description}
              </motion.p>
            </div>
          </div>

          <div className="p-10 bg-roxou-surface flex flex-col gap-6">
            <div className="flex justify-center gap-2">
              {slides.map((_, i) => (
                <div 
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentSlide ? "w-8 bg-roxou-primary" : "w-2 bg-roxou-border"
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="w-full py-5 bg-roxou-primary text-white rounded-[24px] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-roxou-primary/20"
            >
              {currentSlide === slides.length - 1 ? "Bora pro rolê!" : "Próximo"}
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
