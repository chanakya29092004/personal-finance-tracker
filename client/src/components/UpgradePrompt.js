import React from 'react';
import { Link } from 'react-router-dom';
import usePlanPermissions from '../hooks/usePlanPermissions';

const UpgradePrompt = ({ 
  feature, 
  title, 
  description, 
  className = '',
  size = 'medium' 
}) => {
  const { getUpgradeMessage, currentPlan } = usePlanPermissions();

  if (currentPlan !== 'free') return null;

  const sizeClasses = {
    small: 'p-4 text-sm',
    medium: 'p-6',
    large: 'p-8 text-lg'
  };

  return (
    <div className={`bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200 rounded-xl ${sizeClasses[size]} ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">💎</span>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">
            {title || 'Upgrade Required'}
          </h3>
          <p className="text-gray-600 mb-4">
            {description || getUpgradeMessage(feature)}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/pricing"
              className="btn-primary inline-flex items-center justify-center"
            >
              <span className="mr-2">⭐</span>
              Upgrade Now
            </Link>
            <button className="btn-secondary">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureGate = ({ 
  feature, 
  fallback, 
  children, 
  upgradePrompt = true,
  upgradeProps = {} 
}) => {
  const { hasPermission } = usePlanPermissions();

  if (hasPermission(feature)) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  if (upgradePrompt) {
    return <UpgradePrompt feature={feature} {...upgradeProps} />;
  }

  return null;
};

const UsageIndicator = ({ feature, currentUsage, className = '' }) => {
  const { getFeatureLimit, currentPlan } = usePlanPermissions();
  
  const limit = getFeatureLimit(feature);
  
  if (limit === 'unlimited') {
    return (
      <div className={`text-sm text-success-600 font-medium ${className}`}>
        Unlimited
      </div>
    );
  }

  const percentage = (currentUsage / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isOverLimit = percentage >= 100;

  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          {feature.charAt(0).toUpperCase() + feature.slice(1)} Usage
        </span>
        <span className={`text-sm font-medium ${
          isOverLimit ? 'text-danger-600' : 
          isNearLimit ? 'text-warning-600' : 
          'text-gray-600'
        }`}>
          {currentUsage} / {limit}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            isOverLimit ? 'bg-danger-500' :
            isNearLimit ? 'bg-warning-500' :
            'bg-success-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      {isNearLimit && currentPlan === 'free' && (
        <div className="mt-2">
          <Link 
            to="/pricing" 
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            Upgrade for unlimited access →
          </Link>
        </div>
      )}
    </div>
  );
};

const PlanBadge = ({ className = '' }) => {
  const { currentPlan } = usePlanPermissions();
  
  const planStyles = {
    free: 'bg-gray-100 text-gray-800',
    pro: 'bg-primary-100 text-primary-800',
    elite: 'bg-purple-100 text-purple-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planStyles[currentPlan]} ${className}`}>
      {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
    </span>
  );
};

export { FeatureGate, UsageIndicator, PlanBadge };
export default UpgradePrompt;
