import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AQIData } from '../types/aqi';
import { getAQILevel } from '../utils/aqiLevels';
import { MapPin, TrendingUp, TrendingDown, Globe } from 'lucide-react';

type ViewMode = 'major' | 'best' | 'worst';

interface CitiesViewToggleProps {
  cities: AQIData[];
  onCitySelect: (cityName: string) => void;
  className?: string;
  limit?: number;
}

const CitiesViewToggle: React.FC<CitiesViewToggleProps> = ({ 
  cities, 
  onCitySelect, 
  className = '',
  limit = 6 
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('major');
  const [sortBy, setSortBy] = useState<'name' | 'aqi'>('name');
  const [showLimit, setShowLimit] = useState(limit);

  const filteredCities = cities
    .filter(city => {
      if (viewMode === 'best') {
        const isGood = city.aqi <= 100;
        console.log(`${city.city.name}: AQI ${city.aqi} - ${isGood ? 'Good Air' : 'Not Good Air'}`);
        return isGood;
      }
      if (viewMode === 'worst') {
        const isPoor = city.aqi >= 101;
        console.log(`${city.city.name}: AQI ${city.aqi} - ${isPoor ? 'Poor Air' : 'Not Poor Air'}`);
        return isPoor;
      }
      return true; // 'major' shows all
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.city.name.localeCompare(b.city.name);
      }
      return a.aqi - b.aqi;
    })
    .slice(0, showLimit);

  // Debug logging
  console.log(`Filter applied: ${viewMode}, Total cities: ${cities.length}, Filtered: ${filteredCities.length}`);
  if (filteredCities.length > 0) {
    console.log('AQI values in filtered list:', filteredCities.map(c => `${c.city.name}: ${c.aqi}`));
  }

  const handleLoadMore = () => {
    setShowLimit(prev => Math.min(prev + 6, cities.length));
  };

  const handleCityClick = (cityName: string) => {
    onCitySelect(cityName);
  };

  return (
    <motion.div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with Controls */}
      <div className="px-5 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-medium text-gray-800 flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          Major Cities
        </h2>
        
        <div className="flex flex-wrap gap-2">
          {/* View Mode Filter */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'major', label: 'All Cities', icon: Globe },
              { key: 'best', label: 'Good Air', icon: TrendingUp },
              { key: 'worst', label: 'Poor Air', icon: TrendingDown }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setViewMode(key as ViewMode)}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-md transition-all ${
                  viewMode === key
                    ? 'bg-white text-blue-700 font-medium shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            ))}
          </div>

          {/* Sort Filter */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'aqi')}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-1.5 px-3 pr-8 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-gray-100 transition-colors"
            >
              <option value="name">Sort by Name</option>
              <option value="aqi">Sort by AQI</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Cities List */}
      <div className="p-4">
        {filteredCities.length === 0 ? (
          <motion.div 
            className="text-center py-8 text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Globe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p>No cities found for the selected filter</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredCities.map((city, index) => {
                const aqiLevel = getAQILevel(city.aqi);
                return (
                  <motion.button
                    key={city.idx}
                    onClick={() => handleCityClick(city.city.name)}
                    className="w-full p-3 text-left rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-100 hover:border-gray-200 hover:shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-gray-800 font-medium">{city.city.name}</span>
                          {city.dominentpol && (
                            <div className="text-xs text-gray-500 mt-1">
                              Main pollutant: {city.dominentpol.toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                          aqiLevel.bgColor
                        } ${aqiLevel.color}`}>
                          <span>{aqiLevel.emoji}</span>
                          <span>{city.aqi}</span>
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
            
            {/* Load More Button */}
            {showLimit < cities.length && filteredCities.length === showLimit && (
              <motion.button
                onClick={handleLoadMore}
                className="w-full mt-3 text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-3 px-4 rounded-lg hover:bg-blue-50 transition-all duration-200 border border-blue-200 hover:border-blue-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Load More Cities ({cities.length - showLimit} remaining)
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CitiesViewToggle;
