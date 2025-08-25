import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, RefreshCw, AlertCircle, MapPin, Clock } from 'lucide-react';
import AQICard from '../components/AQICard';
import HistoricalChart from '../components/HistoricalChart';
import { fetchCityAQI, fetchHistoricalData, HistoricalDataPoint, testAPIConnectivity } from '../utils/aqiApi';
import { AQIData } from '../types/aqi';
import { useAQI } from '../context/AQIContext';

const CityDetail: React.FC = () => {
  const { cityName } = useParams<{ cityName: string }>();
  const navigate = useNavigate();
  const { setCurrentAQI, favorites, addFavorite, removeFavorite } = useAQI();
  
  const [cityData, setCityData] = useState<AQIData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const decodedCityName = cityName ? decodeURIComponent(cityName) : '';
  const isFavorite = favorites.some(fav => fav.name.toLowerCase() === decodedCityName.toLowerCase());

  // Debug logging
  console.log('CityDetail component mounted with:');
  console.log('- Raw cityName param:', cityName);
  console.log('- Decoded cityName:', decodedCityName);
  console.log('- Current URL:', window.location.href);

  const fetchCityData = async () => {
    if (!decodedCityName) {
      setError('No city name provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching data for city:', decodedCityName);
      
      // Test API connectivity first
      const isAPIWorking = await testAPIConnectivity();
      if (!isAPIWorking) {
        throw new Error('API server is not responding. Please check your internet connection and try again.');
      }
      
      // Fetch current AQI data
      const currentData = await fetchCityAQI(decodedCityName);
      setCityData(currentData);
      setCurrentAQI(currentData);
      
      // Fetch historical data
      try {
        const historical = await fetchHistoricalData(decodedCityName, 7);
        setHistoricalData(historical);
      } catch (histError) {
        console.warn('Failed to load historical data:', histError);
        // Don't fail the whole page if historical data fails
      }
      
    } catch (error) {
      console.error('Error fetching city data:', error);
      const errorMessage = error instanceof Error ? error.message : `Could not find air quality data for "${decodedCityName}". Please check the city name and try again.`;
      setError(errorMessage);
      setCityData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCityData();
    setIsRefreshing(false);
  };

  const handleFavoriteToggle = () => {
    if (!cityData) return;
    
    if (isFavorite) {
      const favoriteToRemove = favorites.find(fav => fav.name.toLowerCase() === decodedCityName.toLowerCase());
      if (favoriteToRemove) {
        removeFavorite(favoriteToRemove.id);
      }
    } else {
      addFavorite({
        id: cityData.idx.toString(),
        name: cityData.city.name,
        aqi: cityData.aqi,
        lastUpdated: new Date(cityData.time.s).toLocaleString()
      });
    }
  };

  useEffect(() => {
    fetchCityData();
  }, [decodedCityName]);

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"
      >
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading City Data</h2>
          <p className="text-gray-600">Fetching air quality information for {decodedCityName}...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"
      >
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-4">City Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isRefreshing ? 'Retrying...' : 'Try Again'}
            </button>
            <Link
              to="/"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!cityData) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"
      >
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="h-8 w-8 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-4">Unable to load city data.</p>
          <Link
            to="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
    >
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="h-6 w-6 md:h-7 md:w-7 text-blue-600" />
                {cityData.city.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Clock className="h-4 w-4" />
                <span>Last updated: {new Date(cityData.time.s).toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleFavoriteToggle}
              className={`p-2 rounded-lg shadow-sm hover:shadow-md transition-all ${
                isFavorite 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AQI Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <AQICard data={cityData} showActions={false} />
          </motion.div>

          {/* Historical Chart */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            {historicalData.length > 0 ? (
              <HistoricalChart 
                data={historicalData} 
                cityName={cityData.city.name}
                className="h-full"
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-6 h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Historical data not available</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Location Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Coordinates</p>
              <p className="font-medium">{cityData.city.geo[0]}, {cityData.city.geo[1]}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Station ID</p>
              <p className="font-medium">#{cityData.idx}</p>
            </div>
            {cityData.dominentpol && (
              <div>
                <p className="text-sm text-gray-600">Dominant Pollutant</p>
                <p className="font-medium uppercase">{cityData.dominentpol}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Data Source</p>
              <p className="font-medium">World Air Quality Index Project</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CityDetail;