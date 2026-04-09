"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { 
  Menu, 
  User, 
  Bell, 
  MapPin, 
  Zap,
  Calendar,
  Search
} from "lucide-react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const BaseMap = dynamic(() => import("@/components/Map/BaseMap"), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-roxou-surface animate-pulse flex items-center justify-center">
      <p className="text-[10px] font-black text-roxou-primary uppercase tracking-widest">Iniciando Mapa...</p>
    </div>
  )
});

import AddressSearch from "@/components/AddressSearch";
import { useAuth } from "@/components/AuthProvider";

const SUGGESTED_PLACES = [
  { name: "Parque do Povo", lat: -22.1225, lng: -51.4032 },
  { name: "Prudenshopping", lat: -22.1158, lng: -51.4068 },
  { name: "Centro", lat: -22.1225, lng: -51.3852 },
  { name: "Matarazzo", lat: -22.1189, lng: -51.3814 },
];

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [userLocation, setUserLocation] = useState<[number, number]>([-22.1225, -51.3852]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    console.log("HOME: Booting...");
    
    // Safety timeout to prevent infinite loading on home page
    const timeout = setTimeout(() => {
      if (localLoading) {
        console.warn("HOME: Boot timeout reached, forcing loading false");
        setLocalLoading(false);
      }
    }, 5000);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log("HOME: Geolocation success");
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setLocalLoading(false);
          clearTimeout(timeout);
        },
        () => {
          console.warn("HOME: Geolocation failed");
          setUserLocation([-22.1225, -51.3852]);
          setLocalLoading(false);
          clearTimeout(timeout);
        },
        { timeout: 3000 } // Don't wait forever for geolocation
      );
    } else {
      setLocalLoading(false);
      clearTimeout(timeout);
    }

    return () => clearTimeout(timeout);
  }, []);

  const handleDestinationSelect = (name: string, coords?: { lat: number, lng: number }) => {
    if (coords) {
      const params = new URLSearchParams({
        destino: name,
        dest_lat: coords.lat.toString(),
        dest_lng: coords.lng.toString()
      });
      router.push(`/request/new?${params.toString()}`);
    } else {
      router.push(`/request/new?destino=${encodeURIComponent(name)}`);
    }
  };

  // Show loading if either auth is loading or local boot tasks (like geolocation) are loading
  if (authLoading || localLoading) {
    return (
      <div className="min-h-screen bg-roxou-bg flex flex-col items-center justify-center gap-4">
        <Zap className="w-12 h-12 text-roxou-primary animate-pulse" />
        <p className="text-[10px] font-black text-roxou-primary uppercase tracking-[0.2em]">Iniciando Roxou...</p>
      </div>
    );
  }

  return (
    <main className="relative h-screen w-full bg-roxou-bg overflow-hidden">
      {/* Full Screen Map */}
      <div className="absolute inset-0 z-0">
        <BaseMap 
          center={userLocation} 
          zoom={15} 
          showUserLocation={true} 
          userLocation={userLocation} 
        />
      </div>

      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-4 pointer-events-auto">
          <button 
            onClick={() => router.push(user ? "/dashboard" : "/login")}
            className="w-12 h-12 rounded-2xl bg-roxou-surface/80 backdrop-blur-xl border border-roxou-border flex items-center justify-center text-white shadow-2xl hover:bg-roxou-surface transition-all active:scale-95"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col gap-4 pointer-events-auto">
          <Link 
            href={user ? "/profile" : "/login"}
            className="w-12 h-12 rounded-2xl bg-roxou-surface/80 backdrop-blur-xl border border-roxou-border flex items-center justify-center text-white shadow-2xl hover:bg-roxou-surface transition-all active:scale-95"
          >
            <User className="w-6 h-6" />
          </Link>
          <button className="w-12 h-12 rounded-2xl bg-roxou-surface/80 backdrop-blur-xl border border-roxou-border flex items-center justify-center text-white shadow-2xl hover:bg-roxou-surface transition-all active:scale-95 relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-roxou-primary rounded-full border border-roxou-bg" />
          </button>
        </div>
      </div>

      {/* Floating Search Card */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
        <div className="max-w-md mx-auto space-y-4">
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-roxou-bg/90 backdrop-blur-2xl border border-roxou-border rounded-[40px] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-display font-black text-white tracking-tight">Pra onde você vai?</h2>
                  <p className="text-xs text-roxou-text-muted font-bold uppercase tracking-widest opacity-50">Roxou Transporte Premium</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-roxou-primary/20 flex items-center justify-center border border-roxou-primary/30">
                  <Zap className="w-5 h-5 text-roxou-primary fill-current" />
                </div>
              </div>

              <AddressSearch 
                value="" 
                onChange={handleDestinationSelect}
                placeholder="Insira o destino..."
                label="Destino"
                forceOpen={isSearchOpen}
                hideTrigger={true}
                onClose={() => setIsSearchOpen(false)}
              />

              <button 
                onClick={() => setIsSearchOpen(true)}
                className="w-full flex items-center gap-4 p-6 rounded-[32px] bg-roxou-surface/50 border border-roxou-border hover:border-roxou-primary/30 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-2xl bg-roxou-primary/20 border border-roxou-primary/30 flex items-center justify-center">
                  <Search className="w-5 h-5 text-roxou-primary" />
                </div>
                <span className="text-lg font-bold text-roxou-text-muted/50 group-hover:text-white transition-colors">Buscar destino...</span>
              </button>

              {/* Quick Suggestions */}
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {SUGGESTED_PLACES.map((place) => (
                  <button
                    key={place.name}
                    onClick={() => handleDestinationSelect(place.name, { lat: place.lat, lng: place.lng })}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl bg-roxou-surface/50 border border-roxou-border hover:border-roxou-primary/30 transition-all group"
                  >
                    <MapPin className="w-3 h-3 text-roxou-primary" />
                    <span className="text-xs font-bold text-white">{place.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Bottom Navigation / Status Bar */}
          <div className="flex justify-between items-center px-4">
            <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-full bg-roxou-bg/80 backdrop-blur-xl border border-roxou-border text-[10px] font-black text-roxou-text-muted uppercase tracking-widest hover:text-white transition-colors">
              <Calendar className="w-3 h-3 text-roxou-primary" />
              Minhas Viagens
            </Link>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-roxou-bg/80 backdrop-blur-xl border border-roxou-border text-[10px] font-black text-roxou-text-muted uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Motoristas Online
            </div>
          </div>
        </div>
      </div>

      {/* Safe Area Spacer */}
      <div className="h-[env(safe-area-inset-bottom)] bg-roxou-bg" />

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}
