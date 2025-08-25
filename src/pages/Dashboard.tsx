import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import AQIMap from '../components/AQIMap';
import FavoriteCities from '../components/FavoriteCities';
import AQICard from '../components/AQICard';
import CitiesViewToggle from '../components/CitiesViewToggle';
import { fetchCityAQI, fetchMultipleCities } from '../utils/aqiApi';
import { useAQI } from '../context/AQIContext';
import { AlertCircle, TrendingUp, Globe, Users, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AQIData } from '../types/aqi';
import GeminiChat from '../components/GeminiChat';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentAQI, setIsLoading, lastSearchedCity, setLastSearchedCity, clearLastSearchedCity } = useAQI();
  const [selectedCity, setSelectedCity] = useState<AQIData | null>(null);
  const [featuredCities, setFeaturedCities] = useState<AQIData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [citiesError, setCitiesError] = useState<string | null>(null);

  const FEATURED_CITIES = [
    'Beijing', 'New York', 'London', 'Tokyo', 'Mumbai', 'Paris',
    'Los Angeles', 'Delhi', 'Shanghai', 'Dubai', 'Singapore', 'Sydney',
    'Berlin', 'Moscow', 'Cairo', 'Rio de Janeiro', 'Toronto', 'Seoul'
  ];

  useEffect(() => {
    loadFeaturedCities();

    if (lastSearchedCity) {
      const loadLastSearchedCity = async () => {
        try {
          await handleCitySearch(lastSearchedCity);
        } catch (error) {
          console.error('Failed to load last searched city:', error);
          clearLastSearchedCity();
        }
      };
      loadLastSearchedCity();
    }

    return () => {
      clearLastSearchedCity();
      setCurrentAQI(null);
    };
  }, []);

  const loadFeaturedCities = async () => {
    setIsLoadingCities(true);
    setCitiesError(null);
    try {
      console.log('Loading featured cities...');
      const cities = await fetchMultipleCities(FEATURED_CITIES);
      console.log('Loaded cities:', cities.length);
      
      if (cities.length === 0) {
        setCitiesError('Unable to load city data. Please check your internet connection.');
      } else {
        setFeaturedCities(cities);
        setCitiesError(null);
      }
    } catch (error) {
      console.error('Error loading featured cities:', error);
      setCitiesError('Failed to load major cities. Please try refreshing the page.');
      setFeaturedCities([]);
    } finally {
      setIsLoadingCities(false);
    }
  };

  const handleCitySearch = async (cityName: string) => {
    if (!cityName.trim()) {
      setSelectedCity(null);
      setCurrentAQI(null);
      setError(null);
      clearLastSearchedCity();
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const data = await fetchCityAQI(cityName);
      setSelectedCity(data);
      setCurrentAQI(data);
      setLastSearchedCity(cityName);
    } catch (error) {
      console.error('Error fetching city data:', error);
      setError(`Could not find air quality data for "${cityName}". Please try another city.`);
      setSelectedCity(null);
      setCurrentAQI(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = () => {
    if (selectedCity) {
      navigate(`/city/${encodeURIComponent(selectedCity.city.name)}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-6 space-y-8"
    >
      {/* Search Bar + Error */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <SearchBar
          onCitySelect={handleCitySearch}
          onClearSearch={() => {
            setSelectedCity(null);
            setCurrentAQI(null);
            setError(null);
            clearLastSearchedCity();
          }}
        />

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </motion.div>

      {/* Selected City Card */}
      <AnimatePresence>
        {selectedCity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto mb-12 card-hover"
          >
            <AQICard data={selectedCity} />
            <div className="text-center mt-6">
              <button
                onClick={handleViewDetails}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View Detailed Information
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
          <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <div className="text-2xl font-bold text-gray-900">10,000+</div>
          <div className="text-sm text-gray-600">Monitoring Stations</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
          <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <div className="text-2xl font-bold text-gray-900">190+</div>
          <div className="text-sm text-gray-600">Countries Covered</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
          <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <div className="text-2xl font-bold text-gray-900">24/7</div>
          <div className="text-sm text-gray-600">Real-time Updates</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
          <AlertCircle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
          <div className="text-2xl font-bold text-gray-900">WHO</div>
          <div className="text-sm text-gray-600">Standard Guidelines</div>
        </div>
      </div>

      {/* Map + Gemini + Right Column */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-5 gap-6"
      >
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <AQIMap />
          </div>
          <div className="h-[400px]">
            <GeminiChat />
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Favorites */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-800">Your Favorites</h2>
            </div>
            <div className="p-4">
              <FavoriteCities />
            </div>
          </div>

          {/* Major Cities */}
          {isLoadingCities ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-center space-x-3">
                <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                <span className="text-gray-600">Loading major cities...</span>
              </div>
            </div>
          ) : citiesError ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <p className="text-red-600 mb-3">{citiesError}</p>
                <button
                  onClick={loadFeaturedCities}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : featuredCities.length > 0 ? (
            <CitiesViewToggle
              cities={featuredCities}
              onCitySelect={handleCitySearch}
              limit={6}
            />
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
