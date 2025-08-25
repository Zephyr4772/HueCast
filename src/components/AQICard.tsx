import React, { useState } from 'react';
import { Calendar, MapPin, Heart, RefreshCw, Share2, Info, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AQIData } from '../types/aqi';
import { getAQILevel } from '../utils/aqiLevels';
import { useAQI } from '../context/AQIContext';

interface AQICardProps {
  data: AQIData;
  showActions?: boolean;
  compact?: boolean;
  onRefresh?: () => void;
}

const AQICard: React.FC<AQICardProps> = ({ 
  data, 
  showActions = true, 
  compact = false,
  onRefresh 
}) => {
  const { favorites, addFavorite, removeFavorite } = useAQI();
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  const aqiLevel = getAQILevel(data.aqi);
  const isFavorite = favorites.some(fav => fav.id === data.idx.toString());
  const lastUpdated = new Date(data.time.s);
  const formattedLastUpdated = lastUpdated.toLocaleString();
  const timeAgo = getTimeAgo(lastUpdated);

  // Calculate trend if historical data is available
  const getTrend = () => {
    // This would typically use historical data
    // For now, return null as no trend data is available
    return null;
  };

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      removeFavorite(data.idx.toString());
    } else {
      addFavorite({
        id: data.idx.toString(),
        name: data.city.name,
        aqi: data.aqi,
        lastUpdated: formattedLastUpdated
      });
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Air Quality in ${data.city.name}`,
          text: `Current AQI: ${data.aqi} (${aqiLevel.level}) - ${aqiLevel.description}`,
          url: window.location.href
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(
          `Air Quality in ${data.city.name}: AQI ${data.aqi} (${aqiLevel.level}). Check it out at ${window.location.href}`
        );
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const pollutants = [
    { key: 'pm25', name: 'PM2.5', value: data.iaqi.pm25?.v, unit: 'μg/m³' },
    { key: 'pm10', name: 'PM10', value: data.iaqi.pm10?.v, unit: 'μg/m³' },
    { key: 'o3', name: 'O₃', value: data.iaqi.o3?.v, unit: 'μg/m³' },
    { key: 'no2', name: 'NO₂', value: data.iaqi.no2?.v, unit: 'μg/m³' },
    { key: 'so2', name: 'SO₂', value: data.iaqi.so2?.v, unit: 'μg/m³' },
    { key: 'co', name: 'CO', value: data.iaqi.co?.v, unit: 'mg/m³' }
  ].filter(p => p.value !== undefined);

  const trend = getTrend();

  if (compact) {
    return (
      <motion.div 
        className="bg-white rounded-lg shadow-md border border-gray-100 p-4 hover:shadow-lg transition-shadow cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        layout
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{aqiLevel.emoji}</span>
            <div>
              <h3 className="font-semibold text-gray-900">{data.city.name}</h3>
              <p className="text-sm text-gray-500">{timeAgo}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${aqiLevel.color}`}>{data.aqi}</div>
            <div className={`text-sm font-medium ${aqiLevel.color}`}>{aqiLevel.level}</div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      {/* Header */}
      <div className={`${aqiLevel.bgColor} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className={`h-5 w-5 ${aqiLevel.color}`} />
            <div>
              <h3 className={`text-lg font-semibold ${aqiLevel.color}`}>
                {data.city.name}
              </h3>
              <p className={`text-sm ${aqiLevel.color} opacity-75 flex items-center space-x-1`}>
                <Calendar className="h-3 w-3" />
                <span>{timeAgo}</span>
              </p>
            </div>
          </div>
          {showActions && (
            <div className="flex items-center space-x-2">
              {onRefresh && (
                <motion.button
                  onClick={onRefresh}
                  className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Refresh data"
                >
                  <RefreshCw className={`h-4 w-4 ${aqiLevel.color}`} />
                </motion.button>
              )}
              <motion.button
                onClick={handleShare}
                disabled={isSharing}
                className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Share"
              >
                <Share2 className={`h-4 w-4 ${aqiLevel.color} ${isSharing ? 'animate-pulse' : ''}`} />
              </motion.button>
              <motion.button
                onClick={handleFavoriteToggle}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-red-600' : aqiLevel.color}`} />
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* AQI Value */}
      <div className="px-6 py-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <motion.span 
              className="text-5xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
            >
              {aqiLevel.emoji}
            </motion.span>
            <div className="flex items-baseline space-x-2">
              <motion.div 
                className="text-6xl font-bold text-gray-900"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
              >
                {data.aqi}
              </motion.div>
              {trend && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`flex items-center space-x-1 ${
                    trend > 0 ? 'text-red-500' : 'text-green-500'
                  }`}
                >
                  {trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span className="text-sm font-medium">{Math.abs(trend)}</span>
                </motion.div>
              )}
            </div>
          </div>
          <motion.div 
            className={`text-xl font-semibold ${aqiLevel.color} mb-3`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {aqiLevel.level}
          </motion.div>
          <motion.p 
            className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {aqiLevel.healthAdvice}
          </motion.p>
        </div>

        {/* Dominant Pollutant */}
        {data.dominentpol && (
          <motion.div 
            className="text-center mb-6 p-3 bg-gray-50 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm text-gray-500 mb-1">Dominant Pollutant</p>
            <p className="text-lg font-medium text-gray-900 uppercase">
              {data.dominentpol}
            </p>
          </motion.div>
        )}

        {/* Pollutant Breakdown */}
        {pollutants.length > 0 && (
          <motion.div 
            className="border-t border-gray-100 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-700">Pollutant Levels</h4>
              <motion.button
                onClick={() => setIsInfoExpanded(!isInfoExpanded)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <Info className="h-4 w-4" />
                <span className="text-xs">Info</span>
              </motion.button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {pollutants.map((pollutant, index) => (
                <motion.div 
                  key={pollutant.key} 
                  className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + (index * 0.1) }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-lg font-semibold text-gray-900">
                    {pollutant.value}
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="font-medium">{pollutant.name}</div>
                    <div className="text-gray-400">{pollutant.unit}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <AnimatePresence>
              {isInfoExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 bg-blue-50 rounded-lg"
                >
                  <p className="text-sm text-blue-900 leading-relaxed">
                    These values represent the concentration of various air pollutants. 
                    PM2.5 and PM10 are particulate matter, O₃ is ozone, NO₂ is nitrogen dioxide, 
                    SO₂ is sulfur dioxide, and CO is carbon monoxide. Lower values indicate better air quality.
                  </p>
                  <motion.a
                    href="/about"
                    className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm mt-2 transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span>Learn more about AQI</span>
                    <ExternalLink className="h-3 w-3" />
                  </motion.a>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Last Updated */}
        <motion.div 
          className="flex items-center justify-center space-x-2 mt-6 pt-4 border-t border-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <RefreshCw className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">
            Last updated: {formattedLastUpdated}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMins < 1) return 'Just now';
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${diffInDays}d ago`;
}

export default AQICard;