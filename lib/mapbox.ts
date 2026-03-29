const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Presidente Prudente, SP coordinates for default bias
const PRUDENTE_COORDS = { lat: -22.1225, lng: -51.3887 };

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
  
  // Strategy: Try a local-biased search first
  // We include country=BR to keep it in Brazil
  const baseUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=BR&language=pt&limit=8${proximityParam}`;

  try {
    // 1. Try a search with a bounding box for the region first to be strictly local-first
    const localUrl = `${baseUrl}&bbox=${PRUDENTE_BBOX}`;
    const localResponse = await fetch(localUrl);
    const localData = await localResponse.json();
    
    let features = localData.features || [];

    // 2. If we have fewer than 3 local results, or the query seems broader, 
    // we perform a broader search and append results
    if (features.length < 3) {
      const broadResponse = await fetch(baseUrl);
      const broadData = await broadResponse.json();
      const broadFeatures = broadData.features || [];
      
      // Merge results, avoiding duplicates
      const existingIds = new Set(features.map((f: any) => f.id));
      for (const f of broadFeatures) {
        if (!existingIds.has(f.id)) {
          features.push(f);
        }
      }
    }
    
    return features;
  } catch (error) {
    console.error('Error searching address:', error);
    return [];
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
