import { useState, useCallback } from 'react';

interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
}

export const useGeocoding = () => {
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use OpenStreetMap Nominatim API (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=nl`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();

      const formattedResults: GeocodingResult[] = data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        displayName: item.display_name,
      }));

      setResults(formattedResults);
    } catch (err) {
      setError('Failed to search for address');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, loading, error, search, clearResults };
};
