import { useState, useEffect } from 'react';
import { PLAN_PERMISSIONS, PLAN_FEATURES } from '../config/pricing';
import { useAuth } from '../context/AuthContext';

export const usePlanPermissions = () => {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState(user?.plan || 'free');

  useEffect(() => {
    setCurrentPlan(user?.plan || 'free');
  }, [user]);

  const hasPermission = (permission) => {
    const permissions = PLAN_PERMISSIONS[currentPlan] || PLAN_PERMISSIONS.free;
    return permissions.includes(permission);
  };

  const getFeatureLimit = (feature) => {
    return PLAN_FEATURES[feature]?.[currentPlan] || PLAN_FEATURES[feature]?.free;
  };

  const canUseFeature = (feature, currentUsage = 0) => {
    const limit = getFeatureLimit(feature);
    if (limit === 'unlimited') return true;
    return currentUsage < limit;
  };

  const getUpgradeMessage = (feature) => {
    const messages = {
      transactions: 'Upgrade to Pro for unlimited transactions',
      users: 'Upgrade to Pro for team collaboration',
      export_data: 'Upgrade to Pro to export your data',
      advanced_reports: 'Upgrade to Pro for advanced analytics',
      custom_categories: 'Upgrade to Pro for custom categories',
      api_access: 'Upgrade to Elite for API access'
    };
    
    return messages[feature] || 'Upgrade your plan to access this feature';
  };

  return {
    currentPlan,
    hasPermission,
    getFeatureLimit,
    canUseFeature,
    getUpgradeMessage,
    isPro: currentPlan === 'pro',
    isElite: currentPlan === 'elite',
    isFree: currentPlan === 'free'
  };
};

export default usePlanPermissions;
