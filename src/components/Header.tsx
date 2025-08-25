import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wind, Info, Home, Menu, X, Settings, RefreshCw, Bell, BellOff, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAQI } from '../context/AQIContext';
import { getAppSettings, storeAppSettings, type AppSettings } from '../utils/storage';
import { getUserSubscriptionStatus, addSubscription } from '../utils/subscriptionService';

const Header: React.FC = () => {
  const location = useLocation();
  const { isLoading } = useAQI();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => getAppSettings());
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSubscribeInput, setShowSubscribeInput] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  // Check subscription status on mount
  useEffect(() => {
    setIsSubscribed(getUserSubscriptionStatus());
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    storeAppSettings(newSettings);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail.trim() || isSubscribing) return;

    setIsSubscribing(true);
    try {
      const success = await addSubscription(subscribeEmail, 'manual');
      if (success) {
        setIsSubscribed(true);
        setShowSubscribeInput(false);
        setSubscribeEmail('');
      }
    } catch (error) {
      console.error('Subscription failed:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <motion.div 
              className="p-2 bg-blue-600 rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Wind className="h-8 w-8 text-white" />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-gray-900">AirWatch</h1>
              <p className="text-xs text-gray-500">Real-time Air Quality</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive('/') 
                  ? 'bg-blue-100 text-blue-700 font-medium shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/about"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive('/about') 
                  ? 'bg-blue-100 text-blue-700 font-medium shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Info className="h-4 w-4" />
              <span>About AQI</span>
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Subscription Button */}
            {!isSubscribed && (
              <div className="relative">
                <motion.button
                  onClick={() => setShowSubscribeInput(!showSubscribeInput)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Subscribe for updates"
                >
                  <Mail className="h-4 w-4" />
                  <span>Subscribe</span>
                </motion.button>

                <AnimatePresence>
                  {showSubscribeInput && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[280px] z-50"
                    >
                      <form onSubmit={handleSubscribe} className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={subscribeEmail}
                            onChange={(e) => setSubscribeEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            disabled={isSubscribing}
                            required
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            disabled={isSubscribing || !subscribeEmail.trim()}
                            className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                          >
                            {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowSubscribeInput(false)}
                            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Subscribed Status */}
            {isSubscribed && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
                <Mail className="h-4 w-4" />
                <span>Subscribed</span>
              </div>
            )}
            {/* Refresh Button */}
            <motion.button
              onClick={handleRefresh}
              className={`p-2 rounded-lg transition-all ${
                isLoading 
                  ? 'text-blue-600 bg-blue-50 cursor-not-allowed' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Refresh data"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </motion.button>

            {/* Settings Dropdown */}
            <div className="relative" ref={settingsRef}>
              <motion.button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  isSettingsOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </motion.button>

              <AnimatePresence>
                {isSettingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="font-medium text-gray-900">Settings</h3>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      {/* Notifications Toggle */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Notifications</span>
                        <button
                          onClick={() => handleSettingChange('notifications', !settings.notifications)}
                          className={`p-1 rounded-lg transition-colors ${
                            settings.notifications ? 'text-blue-600' : 'text-gray-400'
                          }`}
                        >
                          {settings.notifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Auto Refresh Toggle */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Auto Refresh</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.autoRefresh}
                            onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      {/* Refresh Interval */}
                      {settings.autoRefresh && (
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Refresh Interval</label>
                          <select
                            value={settings.refreshInterval}
                            onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
                            className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value={5}>5 minutes</option>
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 hour</option>
                          </select>
                        </div>
                      )}

                      {/* Theme Selection */}
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Theme</label>
                        <select
                          value={settings.theme}
                          onChange={(e) => handleSettingChange('theme', e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <motion.button
              onClick={handleRefresh}
              className={`p-2 rounded-lg transition-colors ${
                isLoading 
                  ? 'text-blue-600 bg-blue-50 cursor-not-allowed' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </motion.button>
            
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 border-t border-gray-200 pt-4"
            >
              <nav className="space-y-2">
                <Link
                  to="/"
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive('/') 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/about"
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive('/about') 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Info className="h-5 w-5" />
                  <span>About AQI</span>
                </Link>
                
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="px-4 py-2">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Settings</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Notifications</span>
                        <button
                          onClick={() => handleSettingChange('notifications', !settings.notifications)}
                          className={`p-1 rounded-lg transition-colors ${
                            settings.notifications ? 'text-blue-600' : 'text-gray-400'
                          }`}
                        >
                          {settings.notifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Auto Refresh</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.autoRefresh}
                            onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;