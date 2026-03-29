const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Presidente Prudente, SP coordinates for default bias
const PRUDENTE_COORDS = { lat: -22.1256, lng: -51.3889 };

// Bounding box for Presidente Prudente and nearby region (approximate)
const PRUDENTE_BBOX = "-51.6,-22.3,-51.1,-21.9";

// Local alias map for common Presidente Prudente places
const LOCAL_ALIASES: Record<string, string> = {
  "prudenshopping": "Pruden Shopping Presidente Prudente SP",
  "matarazzo": "Centro Cultural Matarazzo Presidente Prudente SP",
  "parque do povo": "Parque do Povo Presidente Prudente SP",
  "ana jacinta": "Ana Jacinta Presidente Prudente SP",
  "prudente": "Presidente Prudente SP",
  "shopping": "Pruden Shopping Presidente Prudente SP",
  "uniesp": "UNIESP Presidente Prudente SP",
  "unoeste": "Unoeste Presidente Prudente SP",
  "toledo": "Toledo Prudente Centro Universitário Presidente Prudente SP",
  "estação": "Estação Ferroviária Presidente Prudente SP",
  "rodoviária": "Terminal Rodoviário Presidente Prudente SP",
  "aeroporto": "Aeroporto de Presidente Prudente SP",
};

const LOCAL_CITIES = ["Presidente Prudente", "Álvares Machado", "Pirapozinho", "Regente Feijó", "Tarabai", "Anhumas"];

export interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  context?: any[];
}

export async function searchAddress(query: string, proximity?: { lat: number, lng: number }): Promise<MapboxFeature[]> {
  if (!query || query.length < 3) return [];

  // 1. Query Normalization
  const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // 2. Check for Alias
  const aliasQuery = LOCAL_ALIASES[normalizedQuery];
  const searchQuery = aliasQuery || query;

  // Use user location or fallback to Presidente Prudente for proximity bias
  const biasLat = proximity?.lat ?? PRUDENTE_COORDS.lat;
  const biasLng = proximity?.lng ?? PRUDENTE_COORDS.lng;
  
  const proximityParam = `&proximity=${biasLng},${biasLat}`;
  const typesParam = `&types=poi,address,neighborhood,locality,place`;
  
  // 3. Two-Step Search Implementation
  const performSearch = async (q: string) => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=BR&language=pt&limit=5${proximityParam}${typesParam}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.features || [];
  };

  try {
    let features = await performSearch(searchQuery);

    // If alias was used but no results found, fallback to raw query
    if (aliasQuery && features.length === 0) {
      features = await performSearch(query);
    }
    
    // 4. Local Boost / Ranking
    // Sort results to prioritize those containing local city names
    const sortedFeatures = [...features].sort((a, b) => {
      const aIsLocal = LOCAL_CITIES.some(city => a.place_name.includes(city));
      const bIsLocal = LOCAL_CITIES.some(city => b.place_name.includes(city));
      
      if (aIsLocal && !bIsLocal) return -1;
      if (!aIsLocal && bIsLocal) return 1;
      return 0;
    });

    console.log('MAPBOX RESULTS (SORTED)', sortedFeatures);
    
    return sortedFeatures;
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
