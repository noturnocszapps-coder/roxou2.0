"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { Navigation, MapPin, Zap, Info, Clock, Ruler, Target } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Dynamically import BaseMap to avoid SSR issues with Leaflet
const BaseMap = dynamic(() => import("./BaseMap"), { ssr: false });

interface Location {
  lat: number;
  lng: number;
}

interface LiveRideMapProps {
  requestId: string;
  pickup?: Location;
  destination?: Location;
  driverLocation?: Location;
  status: string;
  className?: string;
  showETA?: boolean;
}

// Custom icons
const PickupIcon = L.divIcon({
  className: 'pickup-icon',
  html: `<div style="background-color: #10b981; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px #10b981;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const DestinationIcon = L.divIcon({
  className: 'destination-icon',
  html: `<div style="background-color: #ef4444; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px #ef4444;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const DriverIcon = L.divIcon({
  className: 'driver-icon',
  html: `<div style="background-color: #7c3aed; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 20px #7c3aed; display: flex; align-items: center; justify-center;">
    <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
  </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function RecenterButton({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  return (
    <div className="absolute bottom-20 right-4 z-[1000] pointer-events-auto">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          map.setView(center, zoom);
        }}
        className="w-12 h-12 bg-roxou-surface/90 backdrop-blur-md border border-roxou-border rounded-2xl flex items-center justify-center text-white hover:bg-roxou-primary transition-all active:scale-95 shadow-2xl group"
        title="Recentrar no Motorista"
      >
        <Target className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}

export default function LiveRideMap({ 
  requestId,
  pickup, 
  destination, 
  driverLocation, 
  status,
  className = "h-[300px] w-full",
  showETA = true
}: LiveRideMapProps) {
  const [center, setCenter] = useState<[number, number]>([-22.1225, -51.3852]);
  const [zoom, setZoom] = useState(13);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [eta, setEta] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    if (driverLocation) {
      setCenter([driverLocation.lat, driverLocation.lng]);
      setZoom(15);
    } else if (pickup) {
      setCenter([pickup.lat, pickup.lng]);
      setZoom(14);
    }
  }, [driverLocation, pickup]);

  // Fetch directions from Mapbox
  useEffect(() => {
    if (!mapboxToken) return;

    const fetchRoute = async () => {
      let start: Location | undefined;
      let end: Location | undefined;

      // Determine route based on status
      if (["A_CAMINHO", "CHEGUEI", "ACEITA"].includes(status)) {
        start = driverLocation || pickup;
        end = pickup;
      } else if (status === "EM_CORRIDA") {
        start = driverLocation || pickup;
        end = destination;
      }

      if (!start || !end || (start.lat === end.lat && start.lng === end.lng)) {
        setRoute([]);
        setEta(null);
        setDistance(null);
        return;
      }

      try {
        const query = `${start.lng},${start.lat};${end.lng},${end.lat}`;
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${query}?access_token=${mapboxToken}&geometries=geojson&overview=full`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const routeData = data.routes[0];
          const coords = routeData.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
          setRoute(coords);
          setEta(Math.round(routeData.duration / 60)); // in minutes
          setDistance(Number((routeData.distance / 1000).toFixed(1))); // in km
        }
      } catch (error) {
        console.error("Error fetching Mapbox route:", error);
      }
    };

    fetchRoute();
  }, [pickup, destination, driverLocation, status, mapboxToken]);

  const getStatusLabel = () => {
    switch (status) {
      case "A_CAMINHO": return "Motorista a caminho";
      case "CHEGUEI": return "Motorista no local";
      case "EM_CORRIDA": return "Em corrida";
      case "ACEITA": return "Aguardando partida";
      default: return status;
    }
  };

  return (
    <div className={`relative ${className} group`}>
      <BaseMap center={center} zoom={zoom} className="h-full w-full">
        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={PickupIcon}>
            <Popup>Local de Partida</Popup>
          </Marker>
        )}
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={DestinationIcon}>
            <Popup>Destino</Popup>
          </Marker>
        )}
        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={DriverIcon}>
            <Popup>Motorista</Popup>
          </Marker>
        )}
        
        {/* Real Route Polyline */}
        {route.length > 0 && (
          <Polyline 
            positions={route} 
            color="#7c3aed" 
            weight={4} 
            opacity={0.8} 
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Fallback straight line if no route but markers exist */}
        {route.length === 0 && pickup && destination && (
          <Polyline 
            positions={[[pickup.lat, pickup.lng], [destination.lat, destination.lng]]} 
            color="#7c3aed" 
            weight={3} 
            opacity={0.3} 
            dashArray="10, 10"
          />
        )}

        <RecenterButton center={center} zoom={zoom} />
      </BaseMap>

      {/* Overlay Status & ETA */}
      <div className="absolute top-4 left-4 right-4 z-[500] pointer-events-none">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-4 py-2 rounded-full bg-roxou-bg/80 backdrop-blur-md border border-roxou-primary/30 flex items-center gap-2 shadow-2xl"
            >
              <div className={`w-2 h-2 rounded-full animate-pulse ${status === 'CHEGUEI' ? 'bg-amber-500' : 'bg-roxou-primary'}`} />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{getStatusLabel()}</span>
            </motion.div>

            {showETA && (eta !== null || distance !== null) && (
              <div className="flex gap-2">
                {distance !== null && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="px-3 py-2 rounded-full bg-roxou-surface/80 backdrop-blur-md border border-roxou-border flex items-center gap-2 shadow-2xl"
                  >
                    <Ruler className="w-3 h-3 text-roxou-text-muted" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{distance} km</span>
                  </motion.div>
                )}
                {eta !== null && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="px-3 py-2 rounded-full bg-roxou-primary/90 backdrop-blur-md border border-roxou-primary/30 flex items-center gap-2 shadow-2xl"
                  >
                    <Clock className="w-3 h-3 text-white" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{eta} min</span>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Info */}
      <div className="absolute bottom-4 left-4 right-4 z-[500] pointer-events-none">
        <div className="flex flex-col gap-2">
          {status === 'CHEGUEI' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-3xl bg-amber-500/90 backdrop-blur-md text-white border border-amber-400/50 shadow-2xl flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">Motorista no local!</p>
                <p className="text-[10px] font-medium opacity-80">Encontre o motorista no ponto de partida.</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
