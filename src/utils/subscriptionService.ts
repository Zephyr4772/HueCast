// Subscription service for managing email subscriptions
export interface Subscription {
  id: string;
  email: string;
  subscribedAt: number;
  isActive: boolean;
  source: 'overlay' | 'manual';
  userAgent?: string;
  ipHash?: string; // For analytics, not storing actual IP
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  subscriptionsToday: number;
  subscriptionsThisWeek: number;
}

const SUBSCRIPTIONS_KEY = 'aqi_subscriptions';
const USER_SUBSCRIPTION_KEY = 'aqi_user_subscription_status';

// Check if localStorage is available
const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, 'test');
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Generate a simple ID
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Hash function for IP (simple hash for privacy)
const simpleHash = (str: string): string => {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

// Get all subscriptions
export const getSubscriptions = (): Subscription[] => {
  if (!isStorageAvailable()) return [];
  
  try {
    const stored = localStorage.getItem(SUBSCRIPTIONS_KEY);
    if (!stored) return [];
    
    const subscriptions = JSON.parse(stored);
    return Array.isArray(subscriptions) ? subscriptions : [];
  } catch (error) {
    console.error('Failed to retrieve subscriptions:', error);
    return [];
  }
};

// Save subscriptions
const saveSubscriptions = (subscriptions: Subscription[]): boolean => {
  if (!isStorageAvailable()) return false;
  
  try {
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
    return true;
  } catch (error) {
    console.error('Failed to save subscriptions:', error);
    return false;
  }
};

// Add a new subscription
export const addSubscription = async (email: string, source: 'overlay' | 'manual' = 'overlay'): Promise<boolean> => {
  try {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    const subscriptions = getSubscriptions();
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if email already exists
    const existingSubscription = subscriptions.find(sub => sub.email === normalizedEmail);
    if (existingSubscription) {
      // Reactivate if it was inactive
      if (!existingSubscription.isActive) {
        existingSubscription.isActive = true;
        existingSubscription.subscribedAt = Date.now();
        return saveSubscriptions(subscriptions);
      }
      return true; // Already subscribed and active
    }

    // Create new subscription
    const newSubscription: Subscription = {
      id: generateId(),
      email: normalizedEmail,
      subscribedAt: Date.now(),
      isActive: true,
      source,
      userAgent: navigator.userAgent,
      ipHash: simpleHash(navigator.userAgent + Date.now().toString()) // Pseudo IP hash for privacy
    };

    subscriptions.push(newSubscription);
    const success = saveSubscriptions(subscriptions);
    
    if (success) {
      // Mark user as subscribed in their session
      setUserSubscriptionStatus(true);
      console.log('Subscription added successfully:', normalizedEmail);
    }
    
    return success;
  } catch (error) {
    console.error('Failed to add subscription:', error);
    return false;
  }
};

// Remove a subscription
export const removeSubscription = (email: string): boolean => {
  try {
    const subscriptions = getSubscriptions();
    const normalizedEmail = email.toLowerCase().trim();
    
    const subscriptionIndex = subscriptions.findIndex(sub => sub.email === normalizedEmail);
    if (subscriptionIndex === -1) {
      return false; // Subscription not found
    }

    // Mark as inactive instead of removing (for analytics)
    subscriptions[subscriptionIndex].isActive = false;
    
    return saveSubscriptions(subscriptions);
  } catch (error) {
    console.error('Failed to remove subscription:', error);
    return false;
  }
};

// Check if email is subscribed
export const isEmailSubscribed = (email: string): boolean => {
  const subscriptions = getSubscriptions();
  const normalizedEmail = email.toLowerCase().trim();
  
  const subscription = subscriptions.find(sub => sub.email === normalizedEmail);
  return subscription ? subscription.isActive : false;
};

// Get subscription statistics
export const getSubscriptionStats = (): SubscriptionStats => {
  const subscriptions = getSubscriptions();
  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

  return {
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: subscriptions.filter(sub => sub.isActive).length,
    subscriptionsToday: subscriptions.filter(sub => 
      sub.isActive && sub.subscribedAt > oneDayAgo
    ).length,
    subscriptionsThisWeek: subscriptions.filter(sub => 
      sub.isActive && sub.subscribedAt > oneWeekAgo
    ).length
  };
};

// Export subscriptions data (for admin use)
export const exportSubscriptions = (): string => {
  const subscriptions = getSubscriptions();
  const csvHeader = 'Email,Subscribed At,Status,Source,User Agent\n';
  const csvData = subscriptions.map(sub => 
    `${sub.email},${new Date(sub.subscribedAt).toISOString()},${sub.isActive ? 'Active' : 'Inactive'},${sub.source},"${sub.userAgent || ''}"`
  ).join('\n');
  
  return csvHeader + csvData;
};

// Clear all subscriptions (for admin use)
export const clearAllSubscriptions = (): boolean => {
  if (!isStorageAvailable()) return false;
  
  try {
    localStorage.removeItem(SUBSCRIPTIONS_KEY);
    localStorage.removeItem(USER_SUBSCRIPTION_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear subscriptions:', error);
    return false;
  }
};

// User subscription status management
export const getUserSubscriptionStatus = (): boolean => {
  if (!isStorageAvailable()) return false;
  
  try {
    const status = localStorage.getItem(USER_SUBSCRIPTION_KEY);
    return status === 'true';
  } catch {
    return false;
  }
};

export const setUserSubscriptionStatus = (subscribed: boolean): void => {
  if (!isStorageAvailable()) return;
  
  try {
    localStorage.setItem(USER_SUBSCRIPTION_KEY, subscribed.toString());
  } catch (error) {
    console.error('Failed to set user subscription status:', error);
  }
};

// Session management for overlay timing
const SESSION_START_KEY = 'aqi_session_start';
const OVERLAY_SHOWN_KEY = 'aqi_overlay_shown';

export const initializeSession = (): void => {
  if (!isStorageAvailable()) return;
  
  try {
    const sessionStart = sessionStorage.getItem(SESSION_START_KEY);
    if (!sessionStart) {
      sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
    }
  } catch (error) {
    console.error('Failed to initialize session:', error);
  }
};

export const getSessionDuration = (): number => {
  if (!isStorageAvailable()) return 0;
  
  try {
    const sessionStart = sessionStorage.getItem(SESSION_START_KEY);
    if (!sessionStart) return 0;
    
    return Date.now() - parseInt(sessionStart, 10);
  } catch {
    return 0;
  }
};

export const shouldShowOverlay = (): boolean => {
  if (!isStorageAvailable()) return false;
  
  try {
    // Don't show if user is already subscribed
    if (getUserSubscriptionStatus()) return false;
    
    // Don't show if overlay was already shown in this session
    if (sessionStorage.getItem(OVERLAY_SHOWN_KEY)) return false;
    
    // Show if session duration is more than 5 minutes (300,000 ms)
    return getSessionDuration() > 300000;
  } catch {
    return false;
  }
};

export const markOverlayAsShown = (): void => {
  if (!isStorageAvailable()) return;
  
  try {
    sessionStorage.setItem(OVERLAY_SHOWN_KEY, 'true');
  } catch (error) {
    console.error('Failed to mark overlay as shown:', error);
  }
};