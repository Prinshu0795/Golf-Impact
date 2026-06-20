import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscriptionService } from '../services';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSubscription = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await subscriptionService.getStatus();
      setSubscription(res.subscription);
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscription();
    } else {
      setSubscription(null);
    }
  }, [isAuthenticated, fetchSubscription]);

  const isActive = subscription?.status === 'active';
  const isExpired = subscription?.status === 'expired' || subscription?.status === 'cancelled';

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      loading,
      isActive,
      isExpired,
      refetch: fetchSubscription,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
};
