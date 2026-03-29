"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Navigation, AlertCircle, Loader2, ShieldCheck, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DriverLocationTrackerProps {
  requestId: string;
  isActive: boolean;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

export default function DriverLocationTracker({ 
  requestId, 
  isActive,
  onLocationUpdate 
}: DriverLocationTrackerProps) {
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const watchId = useRef<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!isActive) {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      return;
    }

    const startTracking = () => {
      if (!navigator.geolocation) {
        setError("Geolocalização não suportada pelo seu navegador.");
        return;
      }

      setIsUpdating(true);
      watchId.current = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setPermissionStatus('granted');
          setError(null);
          setLastUpdate(new Date());
          onLocationUpdate?.(latitude, longitude);

          // Update Supabase
          try {
            const { error: updateError } = await supabase
              .from("transport_requests")
              .update({
                driver_lat: latitude,
                driver_lng: longitude,
                updated_at: new Date().toISOString()
              })
              .eq("id", requestId);

            if (updateError) {
              console.error("Error updating location:", updateError);
              // Silent error to avoid disrupting the driver
            }
          } catch (err) {
            console.error("Failed to update location in DB:", err);
          } finally {
            setIsUpdating(false);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          if (err.code === 1) {
            setPermissionStatus('denied');
            setError("Permissão de localização negada. Ative para que o passageiro veja seu trajeto.");
          } else {
            setError("Erro ao obter localização. Verifique seu GPS.");
          }
          setIsUpdating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    };

    startTracking();

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [isActive, requestId, supabase, onLocationUpdate]);

  return (
    <div className="w-full">
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-4 rounded-3xl bg-roxou-surface/40 border border-roxou-border flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                permissionStatus === 'granted' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                permissionStatus === 'denied' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                'bg-roxou-primary/10 text-roxou-primary border border-roxou-primary/20'
              }`}>
                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Localização em Tempo Real</p>
                <p className="text-[9px] text-roxou-text-muted font-medium uppercase tracking-widest">
                  {permissionStatus === 'granted' ? `Última atualização: ${lastUpdate?.toLocaleTimeString()}` : 
                   permissionStatus === 'denied' ? 'Acesso negado' : 'Aguardando permissão...'}
                </p>
              </div>
            </div>

            {permissionStatus === 'denied' && (
              <div className="flex items-center gap-1 text-red-500">
                <AlertCircle className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase tracking-widest">Erro</span>
              </div>
            )}

            {permissionStatus === 'granted' && (
              <div className="flex items-center gap-1 text-emerald-500">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase tracking-widest">Ativo</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && permissionStatus === 'denied' && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </motion.div>
      )}
    </div>
  );
}
