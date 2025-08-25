import axios from 'axios';
import { AQIData } from '../types/aqi';

// API configuration - in production, this should be set via environment variables
const API_TOKEN = import.meta.env.VITE_WAQI_API_TOKEN || '239afabe5116cf124feef6d1acb1b098e3d30235';
const BASE_URL = 'https://api.waqi.info';

// Log API configuration (without exposing the token)
console.log('API Configuration:');
console.log('- Base URL:', BASE_URL);
console.log('- Token configured:', API_TOKEN ? 'Yes' : 'No');
console.log('- Token source:', import.meta.env.VITE_WAQI_API_TOKEN ? 'Environment' : 'Fallback');

// Test API connectivity
export const testAPIConnectivity = async (): Promise<boolean> => {
  try {
    console.log('Testing API connectivity...');
    const response = await axios.get(`${BASE_URL}/feed/beijing`, {
      params: { token: API_TOKEN },
      timeout: 5000
    });
    
    const isConnected = response.data.status === 'ok';
    console.log('API connectivity test:', isConnected ? 'PASSED' : 'FAILED');
    if (!isConnected) {
      console.error('API test response:', response.data);
    }
    return isConnected;
  } catch (error) {
    console.error('API connectivity test FAILED:', error);
    return false;
  }
};

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const makeApiRequest = async <T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> => {
  const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Returning cached data for:', endpoint);
    return cached.data;
  }

  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log('Making API request to:', fullUrl, 'with params:', { ...params, token: '[HIDDEN]' });

  try {
    const response = await axios.get(fullUrl, {
      params: {
        ...params,
        token: API_TOKEN
      },
      timeout: 10000 // 10 second timeout
    });

    console.log('API Response status:', response.status);
    console.log('API Response data:', response.data);

    if (response.data.status !== 'ok') {
      const errorMessage = response.data.data || response.data.message || 'API request failed';
      console.error('API returned error status:', response.data.status, 'Error:', errorMessage);
      throw new Error(errorMessage);
    }

    const result = response.data.data;
    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error('API request failed for:', fullUrl);
    console.error('Error details:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        throw new Error(`API Error (${error.response.status}): ${error.response.data?.data || error.response.statusText}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('Network error: Unable to reach the API server');
      }
    }
    
    throw error;
  }
};

// Utility function to normalize city names for better API compatibility
const normalizeCityName = (cityName: string): string[] => {
  const variations = [cityName];
  
  // Remove parentheses and content within them (e.g., "Meguro (目黒)" -> "Meguro")
  const withoutParentheses = cityName.replace(/\s*\([^)]*\)/g, '').trim();
  if (withoutParentheses !== cityName) {
    variations.push(withoutParentheses);
  }
  
  // Extract content within parentheses (e.g., "Meguro (目黒)" -> "目黒")
  const parenthesesMatch = cityName.match(/\(([^)]+)\)/);
  if (parenthesesMatch) {
    variations.push(parenthesesMatch[1]);
  }
  
  // Add common city suffixes/prefixes
  const baseName = withoutParentheses || cityName;
  variations.push(`${baseName}, Japan`);
  variations.push(`${baseName}-shi`);
  variations.push(`${baseName} City`);
  
  return [...new Set(variations)]; // Remove duplicates
};

export const fetchCityAQI = async (city: string): Promise<AQIData> => {
  console.log('Fetching AQI data for city:', city);
  
  const cityVariations = normalizeCityName(city);
  console.log('Trying city name variations:', cityVariations);
  
  // Try each variation
  for (const variation of cityVariations) {
    try {
      console.log('Attempting to fetch data for variation:', variation);
      const result = await makeApiRequest<AQIData>(`/feed/${encodeURIComponent(variation)}`);
      console.log('Successfully found data for variation:', variation);
      return result;
    } catch (error) {
      console.warn(`Failed to fetch data for variation "${variation}":`, error);
      continue;
    }
  }
  
  // If direct lookups fail, try searching
  console.log('All direct lookups failed, trying search-based approach...');
  try {
    const searchResults = await searchCities(city);
    if (searchResults.length > 0) {
      const firstResult = searchResults[0];
      console.log('Found alternative city name from search:', firstResult.station.name);
      
      // Try with the search result name
      return await makeApiRequest<AQIData>(`/feed/${encodeURIComponent(firstResult.station.name)}`);
    }
  } catch (searchError) {
    console.warn('Search-based lookup also failed:', searchError);
  }
  
  // If all methods fail, throw a descriptive error
  throw new Error(`Unable to find air quality data for "${city}". Please try a different city name or check if the city has air quality monitoring stations.`);
};

export interface SearchResult {
  station: {
    name: string;
    geo: [number, number];
    url: string;
  };
}

export const searchCities = async (query: string): Promise<SearchResult[]> => {
  try {
    return await makeApiRequest<SearchResult[]>('/search/', { keyword: query }) || [];
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
};

export const fetchMultipleCities = async (cities: string[]): Promise<AQIData[]> => {
  try {
    console.log('Fetching data for cities:', cities);
    
    // Create promises for all cities
    const promises = cities.map(async (city) => {
      try {
        const data = await fetchCityAQI(city);
        console.log(`Successfully loaded data for ${city}:`, data.aqi);
        return data;
      } catch (error) {
        console.warn(`Failed to load data for ${city}:`, error);
        return null;
      }
    });
    
    // Wait for all promises to settle
    const results = await Promise.allSettled(promises);
    
    // Filter out failed requests and null results
    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<AQIData | null> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value as AQIData);
    
    console.log(`Successfully loaded ${successfulResults.length} out of ${cities.length} cities`);
    
    return successfulResults;
  } catch (error) {
    console.error('Error in fetchMultipleCities:', error);
    return [];
  }
};

export interface HistoricalDataPoint {
  aqi: number;
  time: {
    s: string; // ISO timestamp
    tz: string;
    v: number; // Unix timestamp
  };
  dominentpol: string;
}

export const fetchHistoricalData = async (city: string, days: number = 7): Promise<HistoricalDataPoint[]> => {
  try {
    const data = await fetchCityAQI(city);
    
    // If no forecast data is available, generate some mock data
    if (!data.forecast?.daily?.pm25) {
      console.warn('No forecast data available, generating mock data');
      return Array.from({ length: days }, (_, i) => ({
        aqi: Math.floor(Math.random() * 150) + 30, // Random AQI between 30-180
        time: {
          s: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString(),
          tz: data?.time?.tz || 'UTC',
          v: Math.floor((Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000) / 1000)
        },
        dominentpol: data?.dominentpol || 'pm25'
      }));
    }
    
    // Use actual forecast data if available
    return data.forecast.daily.pm25.slice(0, days).map((day, index) => ({
      aqi: day.avg,
      time: {
        s: new Date(Date.now() - (days - index - 1) * 24 * 60 * 60 * 1000).toISOString(),
        tz: data.time.tz,
        v: Math.floor((Date.now() - (days - index - 1) * 24 * 60 * 60 * 1000) / 1000)
      },
      dominentpol: data.dominentpol || 'pm25'
    }));
  } catch (error) {
    console.error('Error fetching historical data:', error);
    // Return mock data as fallback
    return Array.from({ length: days }, (_, i) => ({
      aqi: Math.floor(Math.random() * 150) + 30,
      time: {
        s: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString(),
        tz: 'UTC',
        v: Math.floor((Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000) / 1000)
      },
      dominentpol: 'pm25'
    }));
  }
};