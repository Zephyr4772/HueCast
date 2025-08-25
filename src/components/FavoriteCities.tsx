import React, { useEffect, useState } from 'react';
import { Heart, RefreshCw, MapPin, AlertCircle } from 'lucide-react';
import { useAQI } from '../context/AQIContext';
import { fetchCityAQI } from '../utils/aqiApi';
import { getAQILevel } from '../utils/aqiLevels';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const FavoriteCities: React.FC = () => {
  const { favorites, removeFavorite, addFavorite } = useAQI();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const refreshFavorites = async () => {
    if (favorites.length === 0) return;
    
    setIsRefreshing(true);
    setRefreshError(null);
    
    try {
      console.log('Refreshing favorite cities...');
      const promises = favorites.map(async (favorite) => {
        try {
          const data = await fetchCityAQI(favorite.name);
          return {
            ...favorite,
            aqi: data.aqi,
            lastUpdated: new Date(data.time.s).toLocaleString()
          };
        } catch (error) {
          console.warn(`Failed to refresh ${favorite.name}:`, error);
          return favorite; // Keep existing data if refresh fails
        }
      });

      const updatedFavorites = await Promise.all(promises);
      
      // Update favorites in context
      updatedFavorites.forEach(fav => addFavorite(fav));
      
      console.log('Successfully refreshed favorites');
    } catch (error) {
      console.error('Error refreshing favorites:', error);
      setRefreshError('Failed to refresh cities. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Auto-refresh favorites every 10 minutes
    const interval = setInterval(refreshFavorites, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [favorites]);

  if (favorites.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-md transition-all"
      >
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Favorite Cities</h3>
          <p className="text-gray-600">
            Search for cities and add them to your favorites for quick access.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-md transition-all duration-300"
    >
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <motion.h2 
          className="text-xl font-semibold text-gray-900"
          whileHover={{ scale: 1.02 }}
        >
          Selected Cities
        </motion.h2>
        <motion.button
          onClick={refreshFavorites}
          disabled={isRefreshing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 disabled:opacity-50 ${
            refreshError 
              ? 'bg-red-100 hover:bg-red-200 text-red-700' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : refreshError ? 'Try Again' : 'Refresh'}</span>
        </motion.button>
      </div>
      
      {/* Error Message */}
      {refreshError && (
        <motion.div 
          className="px-4 py-2 bg-red-50 border-t border-red-100"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{refreshError}</span>
          </div>
        </motion.div>
      )}
      
      <div className="p-4">
        <AnimatePresence>
          <div className="space-y-3">
            {favorites.map((favorite, index) => {
              const aqiLevel = getAQILevel(favorite.aqi);
              return (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  layout
                >
                  <Link
                    to={`/city/${encodeURIComponent(favorite.name)}`}
                    className="block p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                          <MapPin className="h-4 w-4 text-gray-400" />
                        </motion.div>
                        <div>
                          <div className="font-medium text-gray-900">{favorite.name}</div>
                          <div className="text-xs text-gray-500">{favorite.lastUpdated}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <motion.div 
                          className={`px-3 py-1 rounded-full text-sm font-medium ${aqiLevel.bgColor} ${aqiLevel.color}`}
                          whileHover={{ scale: 1.05 }}
                        >
                          {aqiLevel.emoji} {favorite.aqi}
                        </motion.div>
                        <motion.button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeFavorite(favorite.id);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </motion.button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FavoriteCities;