import React, { createContext, useContext, useState, useEffect } from 'react';
import { AQIData, FavoriteCity } from '../types/aqi';
import { getStoredFavorites, storeFavorites, getLastSearchedCity, storeLastSearchedCity, clearLastSearchedCity } from '../utils/storage';

interface AQIContextType {
  currentAQI: AQIData | null;
  setCurrentAQI: (data: AQIData | null) => void;
  favorites: FavoriteCity[];
  addFavorite: (city: FavoriteCity) => void;
  removeFavorite: (cityId: string) => void;
  lastSearchedCity: string | null;
  setLastSearchedCity: (city: string) => void;
  clearLastSearchedCity: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const AQIContext = createContext<AQIContextType | undefined>(undefined);

export const AQIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAQI, setCurrentAQI] = useState<AQIData | null>(null);
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);
  const [lastSearchedCity, setLastSearchedCityState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedFavorites = getStoredFavorites();
    const storedLastCity = getLastSearchedCity();
    setFavorites(storedFavorites);
    setLastSearchedCityState(storedLastCity);
  }, []);

  const addFavorite = (city: FavoriteCity) => {
    const updatedFavorites = [...favorites.filter(f => f.id !== city.id), city];
    setFavorites(updatedFavorites);
    storeFavorites(updatedFavorites);
  };

  const removeFavorite = (cityId: string) => {
    const updatedFavorites = favorites.filter(f => f.id !== cityId);
    setFavorites(updatedFavorites);
    storeFavorites(updatedFavorites);
  };

  const setLastSearchedCity = (city: string) => {
    setLastSearchedCityState(city);
    storeLastSearchedCity(city);
  };

  const handleClearLastSearchedCity = () => {
    setLastSearchedCityState(null);
    clearLastSearchedCity();
  };

  return (
    <AQIContext.Provider
      value={{
        currentAQI,
        setCurrentAQI,
        favorites,
        addFavorite,
        removeFavorite,
        lastSearchedCity,
        setLastSearchedCity,
        clearLastSearchedCity: handleClearLastSearchedCity,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </AQIContext.Provider>
  );
};

export const useAQI = () => {
  const context = useContext(AQIContext);
  if (context === undefined) {
    throw new Error('useAQI must be used within an AQIProvider');
  }
  return context;
};