import { useState, useEffect } from 'react';
import {
  initializeSession,
  shouldShowOverlay,
  markOverlayAsShown,
  addSubscription,
  getUserSubscriptionStatus,
  setUserSubscriptionStatus
} from '../utils/subscriptionService';

export const useSubscriptionOverlay = () => {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Initialize session tracking
    initializeSession();
    
    // Check if user is already subscribed
    const subscriptionStatus = getUserSubscriptionStatus();
    setIsSubscribed(subscriptionStatus);

    // Set up timer to check if overlay should be shown
    const checkInterval = setInterval(() => {
      if (shouldShowOverlay() && !isSubscribed) {
        setIsOverlayVisible(true);
        markOverlayAsShown();
        clearInterval(checkInterval);
      }
    }, 10000); // Check every 10 seconds

    // Cleanup interval on unmount
    return () => clearInterval(checkInterval);
  }, [isSubscribed]);

  const handleSubscribe = async (email: string): Promise<boolean> => {
    try {
      const success = await addSubscription(email, 'overlay');
      if (success) {
        setIsSubscribed(true);
        setUserSubscriptionStatus(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Subscription failed:', error);
      return false;
    }
  };

  const handleCloseOverlay = () => {
    setIsOverlayVisible(false);
  };

  const forceShowOverlay = () => {
    if (!isSubscribed) {
      setIsOverlayVisible(true);
    }
  };

  return {
    isOverlayVisible,
    isSubscribed,
    handleSubscribe,
    handleCloseOverlay,
    forceShowOverlay
  };
};