import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AQIMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map with fade-in effect
    const map = L.map(mapRef.current, {
      zoomControl: false, // We'll add a custom zoom control with animations
      fadeAnimation: true,
      zoomAnimation: true
    }).setView([20, 0], 2);
    mapInstanceRef.current = map;
    
    // Add custom zoom control with animations
    const zoomControl = L.control.zoom({
      position: 'topright'
    });
    map.addControl(zoomControl);
    
    map.whenReady(() => {
      setIsMapLoaded(true);
      const mapContainer = map.getContainer();
      mapContainer.style.transition = 'box-shadow 0.5s ease-in-out';
      mapContainer.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
      
      setTimeout(() => {
        mapContainer.style.boxShadow = 'none';
      }, 1000);
    });

    // Add base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add AQI layer from WAQI
    L.tileLayer('https://tiles.aqicn.org/tiles/usepa-aqi/{z}/{x}/{y}.png?token=239afabe5116cf124feef6d1acb1b098e3d30235', {
      attribution: 'Air Quality Tiles © World Air Quality Index Project',
      opacity: 0.7
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="px-6 py-4 border-b border-gray-100">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold text-gray-900">Global Air Quality</h2>
          <p className="text-sm text-gray-600 mt-1">
            Interactive world map showing real-time AQI levels
          </p>
        </motion.div>
      </div>
      <motion.div 
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div 
          ref={mapRef} 
          className="h-96 w-full bg-gray-100 rounded-b-lg overflow-hidden"
        />
      </motion.div>
      
      <motion.div 
        className="p-4 bg-gray-50 border-t border-gray-100"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            { color: 'bg-green-500', label: 'Good (0-50)' },
            { color: 'bg-yellow-500', label: 'Moderate (51-100)' },
            { color: 'bg-orange-500', label: 'Unhealthy for Sensitive (101-150)' },
            { color: 'bg-red-500', label: 'Unhealthy (151-200)' },
            { color: 'bg-purple-500', label: 'Very Unhealthy (201-300)' },
            { color: 'bg-red-800', label: 'Hazardous (301-500)' }
          ].map((item, index) => (
            <motion.div 
              key={index}
              className="flex items-center space-x-1.5 px-2 py-1 bg-white rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 5 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { 
                  delay: 0.4 + (index * 0.05),
                  type: 'spring',
                  stiffness: 100
                }
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-3 h-3 rounded-full ${item.color} flex-shrink-0`}></div>
              <span className="text-xs text-gray-600 whitespace-nowrap">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AQIMap;