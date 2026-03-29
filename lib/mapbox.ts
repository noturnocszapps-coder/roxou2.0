const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Presidente Prudente, SP coordinates for default bias
const PRUDENTE_COORDS = { lat: -22.1256, lng: -51.3889 };

// Bounding box for Presidente Prudente and nearby region (approximate)
const PRUDENTE_BBOX = "-51.6,-22.3,-51.1,-21.9";

export interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  context?: any[];
}

export async function searchAddress(query: string, proximity?: { lat: number, lng: number }): Promise<MapboxFeature[]> {
  if (!query || query.length < 3) return [];

  // Use user location or fallback to Presidente Prudente for proximity bias
  const biasLat = proximity?.lat ?? PRUDENTE_COORDS.lat;
  const biasLng = proximity?.lng ?? PRUDENTE_COORDS.lng;
  
  const proximityParam = `&proximity=${biasLng},${biasLat}`;
  
  // Strategy: Simple search without bbox to ensure results
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=BR&language=pt&limit=5${proximityParam}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.statusText}`);
    }
    const data = await response.json();
    
    console.log('MAPBOX RESULTS', data);
    
    return data.features || [];
  } catch (error) {
    console.error('Error searching address:', error);
    throw error; // Re-throw to handle in UI
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1&language=pt`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    }
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}
