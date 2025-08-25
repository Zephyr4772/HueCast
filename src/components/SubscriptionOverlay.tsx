import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle, AlertCircle } from 'lucide-react';

interface SubscriptionOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  onSubscribe: (email: string) => Promise<boolean>;
}

const SubscriptionOverlay: React.FC<SubscriptionOverlayProps> = ({
  isVisible,
  onClose,
  onSubscribe
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      setSubmitStatus('error');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const success = await onSubscribe(email);
      if (success) {
        setSubmitStatus('success');
        setTimeout(() => {
          onClose();
          setEmail('');
          setSubmitStatus('idle');
        }, 2000);
      } else {
        setSubmitStatus('error');
        setErrorMessage('Failed to subscribe. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSubmitStatus('idle');
    setErrorMessage('');
    onClose();
  };

  // Reset form when overlay becomes visible
  useEffect(() => {
    if (isVisible) {
      setEmail('');
      setSubmitStatus('idle');
      setErrorMessage('');
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white relative">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors p-1"
                disabled={isSubmitting}
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Stay Updated!</h2>
                  <p className="text-blue-100 text-sm">Get air quality alerts & insights</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {submitStatus === 'success' ? (
                <motion.div
                  className="text-center py-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Successfully Subscribed!
                  </h3>
                  <p className="text-gray-600">
                    Thank you for subscribing. You'll receive air quality updates and insights.
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Continue monitoring air quality
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Subscribe to receive personalized air quality alerts, health recommendations, 
                      and weekly insights delivered to your inbox.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (submitStatus === 'error') {
                              setSubmitStatus('idle');
                              setErrorMessage('');
                            }
                          }}
                          placeholder="your.email@example.com"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            submitStatus === 'error' ? 'border-red-300' : 'border-gray-300'
                          }`}
                          disabled={isSubmitting}
                          required
                        />
                        <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                      
                      {submitStatus === 'error' && errorMessage && (
                        <motion.div
                          className="mt-2 flex items-center space-x-2 text-red-600"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">{errorMessage}</span>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <motion.button
                        type="submit"
                        disabled={isSubmitting || !email.trim()}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                          isSubmitting || !email.trim()
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:transform active:scale-95'
                        }`}
                        whileHover={!isSubmitting && email.trim() ? { scale: 1.02 } : {}}
                        whileTap={!isSubmitting && email.trim() ? { scale: 0.98 } : {}}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            <span>Subscribing...</span>
                          </div>
                        ) : (
                          'Subscribe & Continue'
                        )}
                      </motion.button>
                      
                      <motion.button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                        whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                      >
                        Skip
                      </motion.button>
                    </div>
                  </form>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center">
                      We respect your privacy. Unsubscribe at any time.
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubscriptionOverlay;