import React, { useState } from 'react';
import { PRICING_PLANS, PLAN_FEATURES } from '../config/pricing';
import { useAuth } from '../context/AuthContext';
import { useNotification } from './NotificationProvider';
import { Link } from 'react-router-dom';

const SubscriptionManagement = () => {
  const { user } = useAuth();
  const { success, warning } = useNotification();
  
  // Mock subscription data - in real app, this would come from API
  const [subscription, setSubscription] = useState({
    plan: user?.plan || 'free',
    status: 'active',
    nextBillingDate: '2025-07-28',
    amount: 29,
    billingCycle: 'monthly'
  });

  const currentPlan = PRICING_PLANS[subscription.plan.toUpperCase()];

  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing cycle.')) {
      setSubscription(prev => ({ ...prev, status: 'cancelled' }));
      warning('Subscription cancelled. You will have access until your next billing date.');
    }
  };

  const handleReactivateSubscription = () => {
    setSubscription(prev => ({ ...prev, status: 'active' }));
    success('Subscription reactivated successfully!');
  };

  const getUsageStats = () => {
    // Mock usage data
    return {
      transactions: { used: 45, limit: PLAN_FEATURES.transactions[subscription.plan] },
      users: { used: 1, limit: PLAN_FEATURES.users[subscription.plan] },
      storage: { used: '2.3 GB', limit: '10 GB' }
    };
  };

  const usage = getUsageStats();

  return (
    <div className="space-y-8">
      {/* Current Plan Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Current Plan</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            subscription.status === 'active' ? 'bg-success-100 text-success-800' :
            subscription.status === 'cancelled' ? 'bg-warning-100 text-warning-800' :
            'bg-danger-100 text-danger-800'
          }`}>
            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
          </span>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div className="text-4xl">{currentPlan.icon}</div>
          <div>
            <h4 className="text-2xl font-bold text-gray-900">{currentPlan.name}</h4>
            <p className="text-gray-600">{currentPlan.subtitle}</p>
          </div>
        </div>

        {subscription.plan !== 'free' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Amount</div>
              <div className="text-xl font-bold text-gray-900">
                ${subscription.amount}/{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Next Billing</div>
              <div className="text-xl font-bold text-gray-900">
                {new Date(subscription.nextBillingDate).toLocaleDateString()}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Billing Cycle</div>
              <div className="text-xl font-bold text-gray-900 capitalize">
                {subscription.billingCycle}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link to="/pricing" className="btn-primary">
            {subscription.plan === 'free' ? 'Upgrade Plan' : 'Change Plan'}
          </Link>
          
          {subscription.plan !== 'free' && subscription.status === 'active' && (
            <button 
              onClick={handleCancelSubscription}
              className="btn-danger"
            >
              Cancel Subscription
            </button>
          )}
          
          {subscription.status === 'cancelled' && (
            <button 
              onClick={handleReactivateSubscription}
              className="btn-success"
            >
              Reactivate Subscription
            </button>
          )}
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Usage Statistics</h3>
        
        <div className="space-y-6">
          {/* Transactions Usage */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Transactions</span>
              <span className="text-sm text-gray-600">
                {usage.transactions.used} / {usage.transactions.limit === 'unlimited' ? '∞' : usage.transactions.limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: usage.transactions.limit === 'unlimited' ? '100%' : 
                         `${Math.min((usage.transactions.used / usage.transactions.limit) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Team Members (for Pro/Elite plans) */}
          {subscription.plan !== 'free' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Team Members</span>
                <span className="text-sm text-gray-600">
                  {usage.users.used} / {usage.users.limit === 'unlimited' ? '∞' : usage.users.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-success-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: usage.users.limit === 'unlimited' ? '100%' : 
                           `${Math.min((usage.users.used / usage.users.limit) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Storage Usage */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Storage Used</span>
              <span className="text-sm text-gray-600">{usage.storage.used} / {usage.storage.limit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-warning-600 h-2 rounded-full transition-all duration-300"
                style={{ width: '23%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Features */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Your Plan Features</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentPlan.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <span className="text-success-500 text-lg">✓</span>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        {currentPlan.limitations.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Plan Limitations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentPlan.limitations.map((limitation, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-gray-400 text-lg">×</span>
                  <span className="text-gray-500">{limitation}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Billing History */}
      {subscription.plan !== 'free' && (
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Billing History</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Description</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {/* Mock billing history */}
                <tr className="border-b border-gray-100">
                  <td className="py-4 text-sm text-gray-900">Jun 28, 2025</td>
                  <td className="py-4 text-sm text-gray-700">Pro Plan - Monthly</td>
                  <td className="py-4 text-sm text-gray-900 font-medium">$29.00</td>
                  <td className="py-4">
                    <span className="px-2 py-1 bg-success-100 text-success-800 text-xs rounded-full">
                      Paid
                    </span>
                  </td>
                  <td className="py-4">
                    <button className="text-primary-600 hover:text-primary-700 text-sm">
                      Download
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 text-sm text-gray-900">May 28, 2025</td>
                  <td className="py-4 text-sm text-gray-700">Pro Plan - Monthly</td>
                  <td className="py-4 text-sm text-gray-900 font-medium">$29.00</td>
                  <td className="py-4">
                    <span className="px-2 py-1 bg-success-100 text-success-800 text-xs rounded-full">
                      Paid
                    </span>
                  </td>
                  <td className="py-4">
                    <button className="text-primary-600 hover:text-primary-700 text-sm">
                      Download
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
