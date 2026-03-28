"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Search, X, Navigation, History, Star, ChevronRight, Zap } from "lucide-react";

interface AddressSearchProps {
  value: string;
  onChange: (value: string) => void;
  onOpenChange?: (isOpen: boolean) => void;
  placeholder?: string;
  label?: string;
  isEventPrefilled?: boolean;
}

// Mock suggestions for the ride-hailing experience
const MOCK_SUGGESTIONS = [
  { id: "1", name: "Arena Club", address: "Av. Senador Pinheiro Machado, 33 - Santos", type: "recent" },
  { id: "2", name: "Bar do Juarez", address: "R. Joaquim Távora, 1095 - Vila Mariana, SP", type: "recent" },
  { id: "3", name: "Allianz Parque", address: "Av. Francisco Matarazzo, 1705 - Água Branca, SP", type: "popular" },
  { id: "4", name: "Aeroporto de Congonhas", address: "Av. Washington Luís, s/n - Vila Congonhas, SP", type: "popular" },
  { id: "5", name: "Shopping Ibirapuera", address: "Av. Ibirapuera, 3103 - Indianópolis, SP", type: "popular" },
];

export default function AddressSearch({ 
  value, 
  onChange, 
  onOpenChange,
  placeholder = "Para onde você vai?", 
  label = "Destino Final",
  isEventPrefilled = false
}: AddressSearchProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState(MOCK_SUGGESTIONS);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      // Mock filtering
      const filtered = MOCK_SUGGESTIONS.filter(s => 
        s.name.toLowerCase().includes(query.toLowerCase()) || 
        s.address.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions(MOCK_SUGGESTIONS);
    }
  };

  const handleSelect = (suggestion: typeof MOCK_SUGGESTIONS[0]) => {
    onChange(suggestion.name);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleUseCurrentLocation = () => {
    onChange("Minha Localização Atual");
    setIsOpen(false);
  };

  return (
    <div className="space-y-3 group">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] text-roxou-primary uppercase font-black tracking-[0.25em] opacity-80 group-focus-within:opacity-100 transition-opacity">
          {label}
        </label>
        {isEventPrefilled && (
          <span className="text-[9px] font-black bg-roxou-primary/20 text-roxou-primary px-2 py-0.5 rounded-full uppercase tracking-widest border border-roxou-primary/30 flex items-center gap-1">
            <Zap className="w-2 h-2 fill-current" />
            Evento Sugerido
          </span>
        )}
      </div>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`w-full p-6 rounded-[32px] bg-roxou-surface/50 border transition-all text-left flex items-center justify-between group/btn ${
          isOpen ? 'border-roxou-primary ring-1 ring-roxou-primary/50' : 'border-roxou-border hover:border-roxou-primary/30'
        }`}
      >
        <div className="flex items-center gap-4 overflow-hidden">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border transition-colors ${
            value ? 'bg-roxou-primary/20 border-roxou-primary/30' : 'bg-roxou-bg border-roxou-border'
          }`}>
            <MapPin className={`w-5 h-5 ${value ? 'text-roxou-primary' : 'text-roxou-text-muted/40'}`} />
          </div>
          <span className={`text-lg font-bold truncate ${value ? 'text-white' : 'text-roxou-text-muted/30'}`}>
            {value || placeholder}
          </span>
        </div>
        <ChevronRight className="w-5 h-5 text-roxou-text-muted/20 group-hover/btn:text-roxou-primary transition-colors" />
      </button>

      {/* Search Interface Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-roxou-bg flex flex-col"
          >
            {/* Search Header */}
            <div className="p-6 space-y-6 bg-roxou-bg border-b border-roxou-border/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-display font-black text-white tracking-tight">Buscar destino</h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full bg-roxou-surface border border-roxou-border text-roxou-text-muted hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2">
                  <Search className="w-5 h-5 text-roxou-primary" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Para onde você vai?"
                  className="w-full pl-14 pr-14 py-6 rounded-[32px] bg-roxou-surface border border-roxou-border focus:border-roxou-primary focus:ring-1 focus:ring-roxou-primary/50 outline-none transition-all text-lg font-bold text-white placeholder:text-roxou-text-muted/20"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-1 rounded-full bg-roxou-bg text-roxou-text-muted"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Suggestions List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
              {/* Quick Actions */}
              {!searchQuery && (
                <div className="space-y-4">
                  <button
                    onClick={handleUseCurrentLocation}
                    className="w-full flex items-center gap-4 p-4 rounded-3xl bg-roxou-primary/10 border border-roxou-primary/20 hover:bg-roxou-primary/20 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-roxou-primary flex items-center justify-center text-white shadow-lg shadow-roxou-primary/20">
                      <Navigation className="w-5 h-5" />
                    </div>
                    <span className="font-black text-roxou-primary uppercase tracking-widest text-xs">Usar minha localização</span>
                  </button>
                </div>
              )}

              {/* Results */}
              <div className="space-y-2">
                <p className="text-[10px] text-roxou-text-muted uppercase font-black tracking-[0.2em] px-2 mb-4">
                  {searchQuery ? "Resultados da busca" : "Destinos recentes"}
                </p>
                
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(s)}
                    className="w-full flex items-start gap-4 p-4 rounded-[32px] hover:bg-roxou-surface/50 transition-all text-left group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-roxou-surface border border-roxou-border flex items-center justify-center flex-shrink-0 group-hover:border-roxou-primary/30 transition-colors">
                      {s.type === 'recent' ? (
                        <History className="w-5 h-5 text-roxou-text-muted group-hover:text-roxou-primary transition-colors" />
                      ) : (
                        <Star className="w-5 h-5 text-roxou-text-muted group-hover:text-roxou-primary transition-colors" />
                      )}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-bold text-white truncate">{s.name}</p>
                      <p className="text-xs text-roxou-text-muted truncate">{s.address}</p>
                    </div>
                  </button>
                ))}

                {suggestions.length === 0 && searchQuery && (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-roxou-surface border border-roxou-border flex items-center justify-center mx-auto opacity-50">
                      <Search className="w-8 h-8 text-roxou-text-muted" />
                    </div>
                    <p className="text-roxou-text-muted font-medium">Nenhum destino encontrado para &quot;{searchQuery}&quot;</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Safe Area Spacer */}
            <div className="h-[env(safe-area-inset-bottom)] bg-roxou-bg" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
