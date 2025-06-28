import React, { useState } from 'react';
import { PRICING_PLANS } from '../config/pricing';
import { useAuth } from '../context/AuthContext';
import { useNotification } from './NotificationProvider';
import AISalesAgent from './AISalesAgent';

const PricingCard = ({ plan, currentPlan, onSelectPlan, isAnnual, onTalkToSales, onChatWithSales }) => {
  const { success, info } = useNotification();
  
  const getPrice = () => {
    if (plan.price === 0) return plan.priceLabel;
    const price = isAnnual ? Math.floor(plan.price * 10) : plan.price; // 2 months free for annual
    return `$${price}`;
  };

  const getBilling = () => {
    if (plan.price === 0) return plan.billing;
    return isAnnual ? 'per year' : 'per month';
  };

  const handleSelectPlan = () => {
    if (plan.id === 'free') {
      success('Free plan activated! Start tracking your finances now.');
      onSelectPlan(plan.id);
    } else if (plan.id === 'elite') {
      info('Redirecting to sales team...');
      // In a real app, this would redirect to a sales form or contact page
      onSelectPlan(plan.id);
    } else {
      onSelectPlan(plan.id);
    }
  };

  const isCurrentPlan = currentPlan === plan.id;

  return (
    <div className={`relative rounded-2xl border-2 p-8 ${
      plan.popular 
        ? 'border-primary-500 bg-primary-50 shadow-xl scale-105' 
        : 'border-gray-200 bg-white shadow-lg'
    } transition-all duration-300 hover:shadow-xl hover:scale-105`}>
      
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-4 right-4">
          <span className="bg-success-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Current Plan
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <div className="text-4xl mb-3">{plan.icon}</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{plan.subtitle}</p>
        
        <div className="mb-4">
          <span className="text-4xl font-bold text-gray-900">{getPrice()}</span>
          {plan.price > 0 && (
            <span className="text-gray-600 ml-2">{getBilling()}</span>
          )}
        </div>
        
        {isAnnual && plan.price > 0 && (
          <p className="text-sm text-success-600 font-medium">Save 2 months!</p>
        )}
        
        <p className="text-gray-600 text-sm">{plan.description}</p>
      </div>

      <div className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start">
            <span className="text-success-500 mr-3 text-lg">✓</span>
            <span className="text-gray-700 text-sm">{feature}</span>
          </div>
        ))}
        
        {plan.limitations.length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            {plan.limitations.map((limitation, index) => (
              <div key={index} className="flex items-start mb-2">
                <span className="text-gray-400 mr-3 text-lg">×</span>
                <span className="text-gray-500 text-sm">{limitation}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Button Section */}
      {plan.id === 'elite' && !isCurrentPlan ? (
        <div className="space-y-3">
          <button
            onClick={() => onTalkToSales()}
            className="w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:from-primary-700 hover:to-purple-700 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <span>🎤</span>
            <span>Talk to Sales (Voice + Chat)</span>
          </button>
          <button
            onClick={() => onChatWithSales()}
            className="w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 bg-white border-2 border-primary-300 text-primary-700 hover:border-primary-500 hover:bg-primary-50 flex items-center justify-center space-x-2"
          >
            <span>💬</span>
            <span>Chat with Sales</span>
          </button>
        </div>
      ) : (
        <button
          onClick={handleSelectPlan}
          disabled={isCurrentPlan}
          className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
            isCurrentPlan
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : plan.popular
              ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
              : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-primary-500 hover:text-primary-600'
          }`}
        >
          {isCurrentPlan ? 'Current Plan' : plan.buttonText}
        </button>
      )}
    </div>
  );
};

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [showSalesAgent, setShowSalesAgent] = useState(false);
  const [salesAgentMode, setSalesAgentMode] = useState('chat');
  const { user } = useAuth();
  const { success, info } = useNotification();
  
  // In a real app, this would come from user's subscription data
  const [currentPlan, setCurrentPlan] = useState(user?.plan || 'free');

  const handleSelectPlan = async (planId) => {
    if (planId === 'free') {
      setCurrentPlan(planId);
      return;
    }

    if (planId === 'elite') {
      // Simulate contacting sales
      info('Our sales team will contact you within 24 hours to discuss your enterprise needs.');
      return;
    }

    // For pro plan, simulate payment process
    info('Redirecting to secure payment...');
    
    // Simulate payment processing
    setTimeout(() => {
      setCurrentPlan(planId);
      success(`Welcome to ${PRICING_PLANS[planId.toUpperCase()].name}! Your subscription is now active.`);
    }, 2000);
  };

  const handleTalkToSales = () => {
    setSalesAgentMode('voice');
    setShowSalesAgent(true);
  };

  const handleChatWithSales = () => {
    setSalesAgentMode('chat');
    setShowSalesAgent(true);
  };

  const closeSalesAgent = () => {
    setShowSalesAgent(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Whether you're managing personal finances or running a business, 
            we have the perfect plan to help you succeed.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 bg-white rounded-xl p-2 shadow-lg inline-flex">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                !isAnnual 
                  ? 'bg-primary-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 relative ${
                isAnnual 
                  ? 'bg-primary-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-success-500 text-white text-xs px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {Object.values(PRICING_PLANS).map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              currentPlan={currentPlan}
              onSelectPlan={handleSelectPlan}
              isAnnual={isAnnual}
              onTalkToSales={handleTalkToSales}
              onChatWithSales={handleChatWithSales}
            />
          ))}
        </div>

        {/* Need Help Choosing Section */}
        <div className="text-center mb-16">
          <div className="bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              🤔 Need Help Choosing the Right Plan?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our AI sales consultant Sarah is here to help! She can answer questions about features, 
              pricing, and help you find the perfect plan for your specific needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleTalkToSales}
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span className="mr-2 text-lg">🎤</span>
                Talk to Sarah (Voice + Chat)
              </button>
              
              <button
                onClick={handleChatWithSales}
                className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-primary-300 text-primary-700 font-semibold rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
              >
                <span className="mr-2 text-lg">💬</span>
                Chat with Sarah
              </button>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              ✨ Powered by AI • Instant responses • Available 24/7
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. 
                Changes take effect immediately, and we'll prorate any billing differences.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                Pro plan comes with a 14-day free trial. No credit card required. 
                Elite plan includes a 30-day trial with dedicated support.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and bank transfers. 
                Enterprise customers can also pay via invoice.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Is my data secure?
              </h3>
              <p className="text-gray-600">
                Absolutely! We use bank-level encryption and security measures. 
                Your financial data is encrypted both in transit and at rest.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Need help choosing the right plan?
          </h3>
          <p className="text-gray-600 mb-6">
            Our team is here to help you find the perfect solution for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary">
              📞 Schedule a Call
            </button>
            <button className="btn-secondary">
              💬 Chat with Sales
            </button>
          </div>
        </div>
      </div>
      
      {/* AI Sales Agent */}
      {showSalesAgent && (
        <AISalesAgent
          mode={salesAgentMode}
          onClose={closeSalesAgent}
        />
      )}
    </div>
  );
};

export default Pricing;
