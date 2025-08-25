export interface AQIData {
  idx: number;
  aqi: number;
  city: {
    name: string;
    geo: [number, number];
  };
  dominentpol: string;
  iaqi: {
    pm25?: { v: number };
    pm10?: { v: number };
    o3?: { v: number };
    no2?: { v: number };
    so2?: { v: number };
    co?: { v: number };
  };
  time: {
    s: string;
    tz: string;
    v: number;
  };
  forecast?: {
    daily: {
      pm25: Array<{ avg: number; day: string; max: number; min: number }>;
      pm10: Array<{ avg: number; day: string; max: number; min: number }>;
    };
  };
}

export interface FavoriteCity {
  id: string;
  name: string;
  aqi: number;
  lastUpdated: string;
}

export interface AQILevel {
  min: number;
  max: number;
  level: string;
  description: string;
  healthAdvice: string;
  color: string;
  bgColor: string;
  emoji: string;
}

export interface SearchSuggestion {
  name: string;
  country: string;
  displayName: string;
}