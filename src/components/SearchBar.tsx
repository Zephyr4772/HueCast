import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchCities, SearchResult } from '../utils/aqiApi';
import { useAQI } from '../context/AQIContext';

const POPULAR_CITIES = [
  'Delhi, India',
  'New York, USA',
  'Tokyo, Japan',
  'London, UK',
  'Beijing, China',
  'Los Angeles, USA',
  'Mumbai, India',
  'Paris, France'
];

interface SearchBarProps {
  onCitySelect: (city: string) => void;
  onClearSearch?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onCitySelect, onClearSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { lastSearchedCity } = useAQI();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchCitiesDebounced = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          const results = await searchCities(query);
          setSuggestions(results.slice(0, 8));
          setShowSuggestions(true);
        } catch (error) {
          console.error('Search error:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(searchCitiesDebounced);
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value === '' && onClearSearch) {
      onClearSearch();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onCitySelect(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (cityName: string) => {
    setQuery(cityName);
    onCitySelect(cityName);
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    if (query.length >= 2) {
      setShowSuggestions(true);
    }
  };

  return (
    <motion.div 
      ref={searchRef} 
      className="relative w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="relative">
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <motion.input
            type="text"
            placeholder="Search for any city worldwide..."
            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300 bg-white shadow-sm hover:shadow-md"
            whileFocus={{ scale: 1.01 }}
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
          />
        </motion.div>
      </form>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div 
            className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
          >
          {isLoading ? (
            <motion.div 
              className="p-4 text-center text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="h-6 w-6 border-b-2 border-blue-600 rounded-full mx-auto"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <motion.p 
                className="mt-2"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Searching...
              </motion.p>
            </motion.div>
          ) : suggestions.length > 0 ? (
            <motion.div 
              className="py-2"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05,
                    when: "beforeChildren"
                  }
                }
              }}
            >
              {suggestions.map((result, index) => (
                <motion.button
                  key={index}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  onClick={() => handleSuggestionClick(result.station.name)}
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: { 
                      opacity: 1, 
                      x: 0,
                      transition: { type: 'spring', stiffness: 300 }
                    }
                  }}
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                  whileTap={{ scale: 0.99 }}
                >
                  <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </motion.div>
                  <span className="text-gray-900">{result.station.name}</span>
                </motion.button>
              ))}
            </motion.div>
          ) : query.length >= 2 ? (
            <motion.div 
              className="p-4 text-center text-gray-500"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              No cities found for "{query}"
            </motion.div>
          ) : (
            <motion.div 
              className="py-2"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05,
                    when: "beforeChildren"
                  }
                }
              }}
            >
              <motion.div 
                className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-100"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Popular Cities
              </motion.div>
              {POPULAR_CITIES.map((city, index) => (
                <motion.button
                  key={index}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  onClick={() => handleSuggestionClick(city)}
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: { 
                      opacity: 1, 
                      x: 0,
                      transition: { type: 'spring', stiffness: 300, damping: 15 }
                    }
                  }}
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                  whileTap={{ scale: 0.99 }}
                >
                  <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </motion.div>
                  <span className="text-gray-900">{city}</span>
                </motion.button>
              ))}
              {lastSearchedCity && (
                <>
                  <motion.div 
                    className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-t border-gray-100"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    Recent Search
                  </motion.div>
                  <motion.button
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                    onClick={() => handleSuggestionClick(lastSearchedCity)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { 
                        type: 'spring', 
                        stiffness: 300, 
                        damping: 15,
                        delay: 0.1
                      }
                    }}
                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                      <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </motion.div>
                    <span className="text-gray-900">{lastSearchedCity}</span>
                  </motion.button>
                </>
              )}
            </motion.div>
          )}
       </motion.div> 
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SearchBar;
