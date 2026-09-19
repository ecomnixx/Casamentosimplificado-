export interface AddressSuggestion {
  displayName: string;
  road?: string;
  number?: string;
  suburb?: string;
  city?: string;
  state?: string;
  postcode?: string;
  lat?: number;
  lon?: number;
  mapsUrl: string;
}

/**
 * Builds a direct Google Maps search and navigation URL for a given venue or address
 */
export function buildGoogleMapsUrl(venueNameOrAddress: string, lat?: number, lon?: number): string {
  if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon) && (lat !== 0 || lon !== 0)) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  }
  if (!venueNameOrAddress.trim()) {
    return 'https://www.google.com/maps';
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueNameOrAddress.trim())}`;
}

/**
 * Builds an iframe embed URL for displaying a Google Map preview
 */
export function buildGoogleMapsEmbedUrl(venueNameOrAddress: string): string {
  if (!venueNameOrAddress.trim()) {
    return '';
  }
  return `https://maps.google.com/maps?q=${encodeURIComponent(venueNameOrAddress.trim())}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

/**
 * Searches real addresses and venues using OpenStreetMap / Nominatim with fallback
 */
export async function searchAddressSuggestions(query: string): Promise<AddressSuggestion[]> {
  const clean = query.trim();
  if (!clean || clean.length < 3) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      clean
    )}&countrycodes=br&limit=5&addressdetails=1`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error('Falha na busca de endereços');
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      // Return a synthesized suggestion based on the user's query
      return [
        {
          displayName: clean,
          mapsUrl: buildGoogleMapsUrl(clean),
        },
      ];
    }

    return data.map((item: any) => {
      const addr = item.address || {};
      const road = addr.road || addr.street || addr.pedestrian || '';
      const houseNumber = addr.house_number || '';
      const suburb = addr.suburb || addr.neighbourhood || addr.city_district || '';
      const city = addr.city || addr.town || addr.municipality || addr.village || '';
      const state = addr.state || '';
      const postcode = addr.postcode || '';

      const parts: string[] = [];
      if (road) parts.push(houseNumber ? `${road}, ${houseNumber}` : road);
      if (suburb) parts.push(suburb);
      if (city) parts.push(state ? `${city} - ${state}` : city);
      if (postcode) parts.push(`CEP ${postcode}`);

      const formatted = parts.length > 0 ? parts.join(', ') : item.display_name;

      return {
        displayName: formatted,
        road,
        number: houseNumber,
        suburb,
        city,
        state,
        postcode,
        lat: item.lat ? parseFloat(item.lat) : undefined,
        lon: item.lon ? parseFloat(item.lon) : undefined,
        mapsUrl: buildGoogleMapsUrl(formatted),
      };
    });
  } catch (err) {
    // If offline or blocked, generate direct Google Maps suggestion
    return [
      {
        displayName: clean,
        mapsUrl: buildGoogleMapsUrl(clean),
      },
    ];
  }
}
