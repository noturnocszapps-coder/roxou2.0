"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Calendar, X, Check, Zap } from "lucide-react";

interface RoxouDateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function RoxouDateTimePicker({ value, onChange, label = "Horário de Partida" }: RoxouDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  // Timezone helper: America/Sao_Paulo
  const getTzDate = (date: Date = new Date()) => {
    return new Date(date.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  };

  useEffect(() => {
    if (value) {
      // Try to parse existing value, fallback to now in TZ
      const d = new Date(value);
      setTempDate(isNaN(d.getTime()) ? getTzDate() : d);
    } else {
      setTempDate(getTzDate());
    }
  }, [value, isOpen]);

  const formatDisplay = (date: Date) => {
    if (!date || isNaN(date.getTime())) return "Selecionar horário";
    
    const now = getTzDate();
    
    const dateStr = date.toLocaleDateString("en-US", { timeZone: "America/Sao_Paulo" });
    const nowStr = now.toLocaleDateString("en-US", { timeZone: "America/Sao_Paulo" });
    
    const isToday = dateStr === nowStr;
    
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString("en-US", { timeZone: "America/Sao_Paulo" });
    const isTomorrow = dateStr === tomorrowStr;

    const time = date.toLocaleTimeString("pt-BR", { 
      hour: "2-digit", 
      minute: "2-digit",
      timeZone: "America/Sao_Paulo"
    });
    
    if (isToday) return `Hoje às ${time}`;
    if (isTomorrow) return `Amanhã às ${time}`;
    
    return date.toLocaleDateString("pt-BR", { 
      day: "2-digit", 
      month: "2-digit", 
      year: "numeric",
      timeZone: "America/Sao_Paulo"
    }) + ` às ${time}`;
  };

  const handleQuickAction = (type: "now" | "tonight" | "tomorrow" | "30min") => {
    const now = getTzDate();
    let newDate = new Date(now);

    switch (type) {
      case "now":
        break;
      case "tonight":
        newDate.setHours(22, 0, 0, 0);
        if (newDate < now) newDate.setDate(newDate.getDate() + 1);
        break;
      case "tomorrow":
        newDate.setDate(newDate.getDate() + 1);
        newDate.setHours(8, 0, 0, 0);
        break;
      case "30min":
        newDate.setMinutes(now.getMinutes() + 30);
        break;
    }
    setTempDate(newDate);
  };

  const handleConfirm = () => {
    const now = getTzDate();
    // Allow a small buffer (1 minute) for "now" selections
    const buffer = 60000; 
    if (tempDate.getTime() < now.getTime() - buffer) {
      setError("O horário não pode ser no passado.");
      return;
    }
    
    onChange(tempDate.toISOString());
    setIsOpen(false);
    setError(null);
  };

  const updateTempDate = (part: "day" | "month" | "year" | "hour" | "minute", val: number) => {
    const d = new Date(tempDate);
    switch (part) {
      case "day": d.setDate(val); break;
      case "month": d.setMonth(val); break;
      case "year": d.setFullYear(val); break;
      case "hour": d.setHours(val); break;
      case "minute": d.setMinutes(val); break;
    }
    setTempDate(d);
    setError(null);
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] text-roxou-primary uppercase font-bold tracking-[0.2em] ml-1">{label}</label>
      
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full p-6 rounded-3xl bg-roxou-surface border border-roxou-border focus:border-roxou-primary outline-none transition-all text-left flex items-center justify-between group hover:border-roxou-primary/50"
      >
        <span className={value ? "text-white text-lg font-medium" : "text-roxou-text-muted/30 text-lg"}>
          {value ? formatDisplay(new Date(value)) : "Ex: Hoje às 22:30"}
        </span>
        <Clock className="w-6 h-6 text-roxou-text-muted group-hover:text-roxou-primary transition-colors" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-roxou-bg border-t border-roxou-border rounded-t-[40px] z-50 px-6 pt-8 pb-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="max-w-md mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-display font-extrabold">Quando é o rolê?</h3>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full bg-roxou-surface border border-roxou-border text-roxou-text-muted"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Agora", type: "now" },
                    { label: "Hoje à noite", type: "tonight" },
                    { label: "Amanhã", type: "tomorrow" },
                    { label: "Em 30 min", type: "30min" },
                  ].map((action) => (
                    <button
                      key={action.type}
                      type="button"
                      onClick={() => handleQuickAction(action.type as any)}
                      className="px-4 py-2 rounded-full bg-roxou-surface border border-roxou-border text-xs font-bold hover:border-roxou-primary hover:text-roxou-primary transition-all active:scale-95"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>

                {/* Wheel Picker Simulation */}
                <div className="bg-roxou-surface/50 rounded-[32px] border border-roxou-border p-6 relative overflow-hidden">
                  <div className="flex justify-center items-center gap-2 h-56 overflow-hidden relative">
                    {/* Selection Highlight */}
                    <div className="absolute inset-x-4 h-14 border-y border-roxou-primary/40 bg-roxou-primary/10 pointer-events-none z-10 rounded-xl" />
                    
                    {/* Gradient Masks */}
                    <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-roxou-bg to-transparent pointer-events-none z-10" />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-roxou-bg to-transparent pointer-events-none z-10" />
                    
                    {/* Day */}
                    <PickerColumn 
                      items={Array.from({ length: 31 }, (_, i) => i + 1)} 
                      value={tempDate.getDate()} 
                      onChange={(v) => updateTempDate("day", v)}
                    />
                    {/* Month */}
                    <PickerColumn 
                      items={Array.from({ length: 12 }, (_, i) => i)} 
                      value={tempDate.getMonth()} 
                      onChange={(v) => updateTempDate("month", v)}
                      format={(v) => (v + 1).toString().padStart(2, '0')}
                    />
                    {/* Year */}
                    <PickerColumn 
                      items={[2026, 2027]} 
                      value={tempDate.getFullYear()} 
                      onChange={(v) => updateTempDate("year", v)}
                    />
                    
                    <span className="text-3xl font-black text-roxou-primary/40 mx-1 mb-1">:</span>

                    {/* Hour */}
                    <PickerColumn 
                      items={Array.from({ length: 24 }, (_, i) => i)} 
                      value={tempDate.getHours()} 
                      onChange={(v) => updateTempDate("hour", v)}
                      format={(v) => v.toString().padStart(2, '0')}
                    />
                    {/* Minute */}
                    <PickerColumn 
                      items={Array.from({ length: 60 }, (_, i) => i)} 
                      value={tempDate.getMinutes()} 
                      onChange={(v) => updateTempDate("minute", v)}
                      format={(v) => v.toString().padStart(2, '0')}
                    />
                  </div>
                </div>

                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs font-bold text-center"
                  >
                    {error}
                  </motion.p>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      onChange("");
                      setIsOpen(false);
                    }}
                    className="py-4 rounded-2xl bg-roxou-surface border border-roxou-border font-bold text-roxou-text-muted hover:text-white transition-colors"
                  >
                    Limpar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="py-4 rounded-2xl bg-roxou-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-roxou-primary/90 transition-all active:scale-95 shadow-lg shadow-roxou-primary/20"
                  >
                    <Check className="w-5 h-5" />
                    Definir
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function PickerColumn({ items, value, onChange, format = (v) => v.toString() }: { 
  items: number[], 
  value: number, 
  onChange: (v: number) => void,
  format?: (v: number) => string 
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const index = items.indexOf(value);
    if (index !== -1 && scrollRef.current) {
      const itemHeight = 48; // h-12
      scrollRef.current.scrollTop = index * itemHeight;
    }
  }, [value, items]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const itemHeight = 48;
    const index = Math.round(scrollRef.current.scrollTop / itemHeight);
    const newValue = items[index];
    if (newValue !== undefined && newValue !== value) {
      onChange(newValue);
    }
  };

  return (
    <div 
      ref={scrollRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory py-20 w-12"
    >
      {items.map((item) => (
        <div 
          key={item}
          className={`h-12 flex items-center justify-center snap-center transition-all duration-300 ${
            item === value ? "text-roxou-primary text-xl font-black" : "text-roxou-text-muted/20 text-sm font-bold"
          }`}
        >
          {format(item)}
        </div>
      ))}
    </div>
  );
}
