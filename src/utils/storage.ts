import { FavoriteCity } from '../types/aqi';

const FAVORITES_KEY = 'aqi_favorites';
const LAST_SEARCHED_KEY = 'aqi_last_searched';
const SETTINGS_KEY = 'aqi_settings';
const SEARCH_HISTORY_KEY = 'aqi_search_history';

// Storage availability check
const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, 'test');
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Safe JSON parse with fallback
const safeJsonParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    return fallback;
  }
};

// Type guard for checking if an object has the required FavoriteCity properties
interface UnknownObject {
  [key: string]: unknown;
}

const isObject = (value: unknown): value is UnknownObject => {
  return typeof value === 'object' && value !== null;
};

// Validate favorite city data
const isValidFavoriteCity = (city: unknown): city is FavoriteCity => {
  if (!isObject(city)) return false;
  
  return (
    typeof city.id === 'string' &&
    typeof city.name === 'string' &&
    typeof city.aqi === 'number' &&
    typeof city.lastUpdated === 'string'
  );
};

export const getStoredFavorites = (): FavoriteCity[] => {
  if (!isStorageAvailable()) return [];
  
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    const favorites = safeJsonParse(stored, []);
    
    // Validate and filter favorites
    return Array.isArray(favorites) 
      ? favorites.filter(isValidFavoriteCity)
      : [];
  } catch (error) {
    console.warn('Failed to retrieve favorites:', error);
    return [];
  }
};

export const storeFavorites = (favorites: FavoriteCity[]): void => {
  if (!isStorageAvailable()) {
    console.warn('LocalStorage not available');
    return;
  }
  
  try {
    // Validate favorites before storing
    const validFavorites = favorites.filter(isValidFavoriteCity);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(validFavorites));
  } catch (error) {
    console.error('Failed to store favorites:', error);
  }
};

export const getLastSearchedCity = (): string | null => {
  if (!isStorageAvailable()) return null;
  
  try {
    const city = localStorage.getItem(LAST_SEARCHED_KEY);
    return city && city.trim() ? city : null;
  } catch (error) {
    console.warn('Failed to retrieve last searched city:', error);
    return null;
  }
};

export const storeLastSearchedCity = (city: string): void => {
  if (!isStorageAvailable()) return;
  
  try {
    const trimmedCity = city.trim();
    if (trimmedCity) {
      localStorage.setItem(LAST_SEARCHED_KEY, trimmedCity);
    }
  } catch (error) {
    console.error('Failed to store last searched city:', error);
  }
};

export const clearLastSearchedCity = (): void => {
  if (!isStorageAvailable()) return;
  
  try {
    localStorage.removeItem(LAST_SEARCHED_KEY);
  } catch (error) {
    console.error('Failed to clear last searched city:', error);
  }
};

// Search history management
export interface SearchHistoryItem {
  city: string;
  timestamp: number;
}

// Type guard for SearchHistoryItem
const isValidSearchHistoryItem = (item: unknown): item is SearchHistoryItem => {
  if (!isObject(item)) return false;
  
  return (
    typeof item.city === 'string' && 
    typeof item.timestamp === 'number'
  );
};

export const getSearchHistory = (): SearchHistoryItem[] => {
  if (!isStorageAvailable()) return [];
  
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    const history = safeJsonParse(stored, []);
    
    return Array.isArray(history)
      ? history.filter(isValidSearchHistoryItem)
      : [];
  } catch (error) {
    console.warn('Failed to retrieve search history:', error);
    return [];
  }
};

export const addToSearchHistory = (city: string): void => {
  if (!isStorageAvailable() || !city.trim()) return;
  
  try {
    const history = getSearchHistory();
    const trimmedCity = city.trim();
    
    // Remove existing entry if present
    const filteredHistory = history.filter(item => 
      item.city.toLowerCase() !== trimmedCity.toLowerCase()
    );
    
    // Add new entry at the beginning
    const newHistory = [
      { city: trimmedCity, timestamp: Date.now() },
      ...filteredHistory
    ].slice(0, 10); // Keep only last 10 searches
    
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Failed to add to search history:', error);
  }
};

export const clearSearchHistory = (): void => {
  if (!isStorageAvailable()) return;
  
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear search history:', error);
  }
};

// App settings management
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  units: 'metric' | 'imperial';
  language: string;
  notifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in minutes
}

const defaultSettings: AppSettings = {
  theme: 'light',
  units: 'metric',
  language: 'en',
  notifications: true,
  autoRefresh: true,
  refreshInterval: 15
};

export const getAppSettings = (): AppSettings => {
  if (!isStorageAvailable()) return defaultSettings;
  
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    const settings = safeJsonParse(stored, defaultSettings);
    
    // Merge with defaults to ensure all properties exist
    return { ...defaultSettings, ...settings };
  } catch (error) {
    console.warn('Failed to retrieve app settings:', error);
    return defaultSettings;
  }
};

export const storeAppSettings = (settings: Partial<AppSettings>): void => {
  if (!isStorageAvailable()) return;
  
  try {
    const currentSettings = getAppSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
  } catch (error) {
    console.error('Failed to store app settings:', error);
  }
};

// Clear all storage
export const clearAllStorage = (): void => {
  if (!isStorageAvailable()) return;
  
  try {
    [FAVORITES_KEY, LAST_SEARCHED_KEY, SETTINGS_KEY, SEARCH_HISTORY_KEY]
      .forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
};