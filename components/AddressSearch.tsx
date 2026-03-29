"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MapPin, 
  Search, 
  X, 
  Navigation, 
  History, 
  Star, 
  ChevronRight, 
  Zap, 
  Loader2, 
  Clock,
  Building2,
  ShoppingBag,
  Trees,
  Palette,
  Moon,
  GlassWater,
  Music
} from "lucide-react";
import { searchAddress, reverseGeocode, type MapboxFeature } from "@/lib/mapbox";

interface RecentPlace {
  name: string;
  lat: number;
  lng: number;
  timestamp: number;
}

const POPULAR_PLACES_DAY = [
  { name: "Prudenshopping", lat: -22.1158, lng: -51.4068, icon: ShoppingBag },
  { name: "Parque do Povo", lat: -22.1225, lng: -51.4032, icon: Trees },
  { name: "Centro", lat: -22.1225, lng: -51.3852, icon: Building2 },
  { name: "Matarazzo", lat: -22.1189, lng: -51.3814, icon: Palette },
];

const POPULAR_PLACES_NIGHT = [
  { name: "Parque do Povo", lat: -22.1225, lng: -51.4032, icon: Moon },
  { name: "Euromarket", lat: -22.1285, lng: -51.4055, icon: GlassWater },
  { name: "Vila Real", lat: -22.1100, lng: -51.3900, icon: Music },
  { name: "Prudenshopping", lat: -22.1158, lng: -51.4068, icon: ShoppingBag },
];

const ROXOU_EVENTS = [
  { name: "Roxou Arena - Show Sertanejo", lat: -22.1300, lng: -51.4100, icon: Zap, isEvent: true },
  { name: "Festa Universitária", lat: -22.1400, lng: -51.4200, icon: Zap, isEvent: true },
];

interface AddressSearchProps {
  value: string;
  onChange: (value: string, coords?: { lat: number, lng: number }) => void;
  onOpenChange?: (isOpen: boolean) => void;
  placeholder?: string;
  label?: string;
  isEventPrefilled?: boolean;
  forceOpen?: boolean;
  hideTrigger?: boolean;
  onClose?: () => void;
}

export default function AddressSearch({ 
  value, 
  onChange, 
  onOpenChange,
  placeholder = "Para onde você vai?", 
  label = "Destino Final",
  isEventPrefilled = false,
  forceOpen = false,
  hideTrigger = false,
  onClose
}: AddressSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [recentPlaces, setRecentPlaces] = useState<RecentPlace[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  useEffect(() => {
    onOpenChange?.(isOpen);
    if (!isOpen && onClose) {
      onClose();
    }
  }, [isOpen, onOpenChange, onClose]);

  // Load recent places
  useEffect(() => {
    const stored = localStorage.getItem("roxou_recent_places");
    if (stored) {
      try {
        setRecentPlaces(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse recent places", e);
      }
    }
  }, [isOpen]);

  const saveRecentPlace = (name: string, lat: number, lng: number) => {
    const newPlace: RecentPlace = { name, lat, lng, timestamp: Date.now() };
    const updated = [newPlace, ...recentPlaces.filter(p => p.name !== name)].slice(0, 5);
    setRecentPlaces(updated);
    localStorage.setItem("roxou_recent_places", JSON.stringify(updated));
  };

  // Capture user location for proximity bias
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  const geocodedRef = useRef(false);

  // Handle initial prefill geocoding if coordinates are missing
  useEffect(() => {
    if (isEventPrefilled && value && !geocodedRef.current && value !== "Minha Localização Atual" && !value.includes(",")) {
      geocodedRef.current = true;
      const geocodePrefill = async () => {
        const results = await searchAddress(value, userLocation || undefined);
        if (results.length > 0) {
          const best = results[0];
          onChange(best.place_name, { lat: best.center[1], lng: best.center[0] });
        }
      };
      geocodePrefill();
    }
  }, [isEventPrefilled, value, userLocation, onChange]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const performSearch = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const results = await searchAddress(query, userLocation || undefined);
      setSuggestions(results);
    } catch (err) {
      console.error("Search failed:", err);
      setError("Erro ao buscar localização");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(query);
    }, 400);
  };

  const handleSelect = (feature: MapboxFeature) => {
    saveRecentPlace(feature.place_name, feature.center[1], feature.center[0]);
    onChange(feature.place_name, { lat: feature.center[1], lng: feature.center[0] });
    setIsOpen(false);
    setSearchQuery("");
    setSuggestions([]);
  };

  const handleQuickSelect = (place: { name: string, lat: number, lng: number }) => {
    saveRecentPlace(place.name, place.lat, place.lng);
    onChange(place.name, { lat: place.lat, lng: place.lng });
    setIsOpen(false);
    setSearchQuery("");
    setSuggestions([]);
  };

  const handleUseCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const address = await reverseGeocode(lat, lng);
        onChange(address || "Minha Localização Atual", { lat, lng });
        setLoading(false);
        setIsOpen(false);
      }, () => {
        onChange("Minha Localização Atual");
        setLoading(false);
        setIsOpen(false);
      });
    } else {
      onChange("Minha Localização Atual");
      setLoading(false);
      setIsOpen(false);
    }
  };

  const isLocalResult = (placeName: string) => {
    const localCities = ["Presidente Prudente", "Álvares Machado", "Pirapozinho", "Regente Feijó", "Tarabai", "Anhumas"];
    return localCities.some(city => placeName.toLowerCase().includes(city.toLowerCase()));
  };

  const isNight = () => {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
  };

  const currentPopularPlaces = isNight() ? POPULAR_PLACES_NIGHT : POPULAR_PLACES_DAY;

  return (
    <div className="space-y-3 group">
      {!forceOpen && !hideTrigger && (
        <>
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
        </>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-roxou-bg flex flex-col"
          >
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
                  {loading ? (
                    <Loader2 className="w-5 h-5 text-roxou-primary animate-spin" />
                  ) : (
                    <Search className="w-5 h-5 text-roxou-primary" />
                  )}
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

            <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center animate-shake">
                  {error}
                </div>
              )}

              {!searchQuery && (
                <>
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

                  {/* 1. Recent Places */}
                  {recentPlaces.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-2">
                        <History className="w-4 h-4 text-roxou-primary" />
                        <p className="text-[10px] text-roxou-text-muted uppercase font-black tracking-[0.2em]">Recentes</p>
                      </div>
                      <div className="space-y-2">
                        {recentPlaces.map((place, i) => (
                          <button
                            key={`${place.name}-${i}`}
                            onClick={() => handleQuickSelect(place)}
                            className="w-full flex items-center gap-4 p-4 rounded-[32px] hover:bg-roxou-surface/50 transition-all text-left group"
                          >
                            <div className="w-10 h-10 rounded-2xl bg-roxou-surface border border-roxou-border flex items-center justify-center flex-shrink-0 group-hover:border-roxou-primary/30 transition-colors">
                              <Clock className="w-4 h-4 text-roxou-text-muted group-hover:text-roxou-primary transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white truncate">{place.name.split(',')[0]}</p>
                              <p className="text-[10px] text-roxou-text-muted truncate">{place.name.split(',').slice(1).join(',').trim() || "Presidente Prudente, SP"}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-roxou-text-muted/20 group-hover:text-roxou-primary transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Roxou Events */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                      <Zap className="w-4 h-4 text-roxou-primary" />
                      <p className="text-[10px] text-roxou-text-muted uppercase font-black tracking-[0.2em]">Eventos Roxou</p>
                    </div>
                    <div className="space-y-2">
                      {ROXOU_EVENTS.map((event) => (
                        <button
                          key={event.name}
                          onClick={() => handleQuickSelect(event)}
                          className="w-full flex items-center gap-4 p-4 rounded-[32px] bg-gradient-to-r from-roxou-primary/5 to-transparent border border-roxou-primary/10 hover:border-roxou-primary/30 transition-all text-left group"
                        >
                          <div className="w-10 h-10 rounded-2xl bg-roxou-primary/20 border border-roxou-primary/30 flex items-center justify-center flex-shrink-0 group-hover:bg-roxou-primary/30 transition-colors">
                            <event.icon className="w-4 h-4 text-roxou-primary fill-current" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-white truncate">{event.name}</p>
                              <span className="text-[8px] font-black bg-roxou-primary text-white px-1.5 py-0.5 rounded-full uppercase tracking-widest">Sugestão</span>
                            </div>
                            <p className="text-[10px] text-roxou-primary/60 font-bold uppercase tracking-widest">Evento Oficial</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-roxou-primary/20 group-hover:text-roxou-primary transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Popular Local Places (Time-based) */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                      <Star className="w-4 h-4 text-roxou-primary" />
                      <p className="text-[10px] text-roxou-text-muted uppercase font-black tracking-[0.2em]">
                        {isNight() ? "Destaques da Noite" : "Destaques do Dia"}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentPopularPlaces.map((place) => (
                        <button
                          key={place.name}
                          onClick={() => handleQuickSelect(place)}
                          className="flex items-center gap-4 p-4 rounded-3xl bg-roxou-surface/30 border border-roxou-border hover:border-roxou-primary/30 transition-all text-left group"
                        >
                          <div className="w-10 h-10 rounded-2xl bg-roxou-primary/10 border border-roxou-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-roxou-primary/20 transition-colors">
                            <place.icon className="w-4 h-4 text-roxou-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-sm truncate">{place.name}</p>
                            <p className="text-[9px] text-roxou-text-muted font-bold uppercase tracking-widest">Sugestão</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Roxou Events Promo Card */}
                  <div className="p-6 rounded-[32px] bg-gradient-to-br from-roxou-primary/20 to-roxou-secondary/10 border border-roxou-primary/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                      <Zap className="w-12 h-12 text-roxou-primary fill-current" />
                    </div>
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black bg-roxou-primary text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Novidade</span>
                        <p className="text-xs font-bold text-roxou-primary">Roxou Events</p>
                      </div>
                      <h4 className="text-lg font-black text-white leading-tight">Vai para algum evento?</h4>
                      <p className="text-xs text-roxou-text-muted leading-relaxed">Confira os eventos oficiais da Roxou e garanta seu transporte com desconto exclusivo.</p>
                    </div>
                  </div>
                </>
              )}

              {searchQuery && (
                <div className="space-y-2">
                  <p className="text-[10px] text-roxou-text-muted uppercase font-black tracking-[0.2em] px-2 mb-4">Resultados da busca</p>
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSelect(s)}
                      className="w-full flex items-start gap-4 p-4 rounded-[32px] hover:bg-roxou-surface/50 transition-all text-left group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-roxou-surface border border-roxou-border flex items-center justify-center flex-shrink-0 group-hover:border-roxou-primary/30 transition-colors">
                        <MapPin className="w-5 h-5 text-roxou-text-muted group-hover:text-roxou-primary transition-colors" />
                      </div>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white truncate">{s.place_name.split(',')[0]}</p>
                          {isLocalResult(s.place_name) && (
                            <span className="text-[8px] font-black bg-roxou-primary/20 text-roxou-primary px-1.5 py-0.5 rounded-full uppercase tracking-widest border border-roxou-primary/30">
                              Local
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-roxou-text-muted truncate">{s.place_name.split(',').slice(1).join(',').trim()}</p>
                      </div>
                    </button>
                  ))}

                  {suggestions.length === 0 && searchQuery && !loading && (
                    <div className="py-12 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-roxou-surface border border-roxou-border flex items-center justify-center mx-auto opacity-50">
                        <Search className="w-8 h-8 text-roxou-text-muted" />
                      </div>
                      <p className="text-roxou-text-muted font-medium">Nenhum destino encontrado para &quot;{searchQuery}&quot;</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="h-[env(safe-area-inset-bottom)] bg-roxou-bg" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
