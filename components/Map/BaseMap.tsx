"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for Roxou
export const createRoxouIcon = (color: string) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

export const DriverIcon = L.divIcon({
  className: 'driver-icon',
  html: `<div style="background-color: #7c3aed; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px #7c3aed; display: flex; items-center; justify-center;">
    <div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div>
  </div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export const UserLocationIcon = L.divIcon({
  className: 'user-location-icon',
  html: `<div style="position: relative; width: 20px; height: 20px; display: flex; align-items: center; justify-center;">
    <div style="position: absolute; width: 100%; height: 100%; background-color: #7c3aed; border-radius: 50%; opacity: 0.4; animation: pulse 2s infinite;"></div>
    <div style="position: relative; width: 10px; height: 10px; background-color: #7c3aed; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px #7c3aed;"></div>
  </div>
  <style>
    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.4; }
      70% { transform: scale(2.5); opacity: 0; }
      100% { transform: scale(1); opacity: 0; }
    }
  </style>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface BaseMapProps {
  center?: [number, number];
  zoom?: number;
  children?: React.ReactNode;
  className?: string;
  showUserLocation?: boolean;
  userLocation?: [number, number] | null;
}

function MapUpdater({ center, zoom }: { center?: [number, number], zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
}

export default function BaseMap({ 
  center = [-22.1225, -51.3852], // Default to Presidente Prudente
  zoom = 13, 
  children,
  className = "h-full w-full",
  showUserLocation = false,
  userLocation = null
}: BaseMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={`${className} bg-roxou-surface animate-pulse flex items-center justify-center`}>
        <p className="text-[10px] font-black text-roxou-primary uppercase tracking-widest">Iniciando Mapa...</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false}
        className="h-full w-full rounded-[32px] overflow-hidden"
        style={{ background: '#0b0b0f' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater center={center} zoom={zoom} />
        {showUserLocation && userLocation && (
          <Marker position={userLocation} icon={UserLocationIcon} />
        )}
        {children}
      </MapContainer>
    </div>
  );
}
