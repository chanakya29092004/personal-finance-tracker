import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import usePlanPermissions from '../hooks/usePlanPermissions';

// Local knowledge base for instant responses (no API calls needed)
const KNOWLEDGE_BASE = {
  // Common questions with instant answers
  greetings: {
    patterns: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
    response: "Hello! 👋 I'm your personal finance assistant. I can help you with:\n\n• Understanding your expenses\n• Explaining app features\n• Budget planning tips\n• Account management\n\nWhat would you like to know?"
  },
  
  features: {
    patterns: ['features', 'what can', 'capabilities', 'help with'],
    response: "I can help you with:\n\n📊 **Dashboard & Reports**\n• View spending trends\n• Category breakdowns\n• Monthly summaries\n\n💰 **Transaction Management**\n• Add/edit transactions\n• Categorize expenses\n• Search & filter\n\n📈 **Analytics**\n• Spending patterns\n• Budget tracking\n• Financial insights\n\n⚙️ **Account Settings**\n• Profile management\n• Plan upgrades\n• Data export"
  },
  
  budget: {
    patterns: ['budget', 'budgeting', 'spending limit', 'money management'],
    response: "💡 **Smart Budgeting Tips:**\n\n1. **Track Everything** - Record all transactions\n2. **Categorize** - Group similar expenses\n3. **Set Limits** - Use the 50/30/20 rule\n4. **Review Monthly** - Check your summaries\n5. **Adjust** - Update budgets as needed\n\nWould you like help setting up your first budget?"
  },
  
  export: {
    patterns: ['export', 'download', 'backup', 'csv', 'pdf'],
    response: "📁 **Data Export Options:**\n\n**Free Plan:** Basic transaction list\n**Pro Plan:** \n• CSV exports\n• PDF reports\n• Advanced filtering\n• Monthly summaries\n\nTo export: Go to Transactions → Export button (Pro feature)\n\nWant to upgrade to Pro for advanced exports?"
  },
  
  plans: {
    patterns: ['pricing', 'plans', 'upgrade', 'pro', 'elite', 'subscription'],
    response: "💎 **Our Plans:**\n\n🆓 **Free** - Personal use\n• 50 transactions/month\n• Basic reports\n• Email support\n\n💼 **Pro ($29/month)** - Small business\n• Unlimited transactions\n• Advanced analytics\n• Team collaboration\n• Data export\n\n👑 **Elite ($99/month)** - Enterprise\n• Everything in Pro\n• API access\n• Custom integrations\n• 24/7 support\n\nReady to upgrade?"
  },
  
  transactions: {
    patterns: ['add transaction', 'record expense', 'input', 'enter'],
    response: "➕ **Adding Transactions:**\n\n1. Click **'Add Transaction'** button\n2. Enter amount and description\n3. Select category (Food, Transport, etc.)\n4. Choose date\n5. Save!\n\n💡 **Pro Tips:**\n• Use clear descriptions\n• Pick the right category\n• Add notes for context\n• Check amounts twice\n\nNeed help with specific categories?"
  },
  
  categories: {
    patterns: ['categories', 'category', 'organize', 'classification'],
    response: "🏷️ **Expense Categories:**\n\n**Default Categories:**\n• 🍔 Food & Dining\n• 🚗 Transportation\n• 🛍️ Shopping\n• 🏠 Bills & Utilities\n• 🎯 Entertainment\n• 💊 Healthcare\n• 🎓 Education\n• 💰 Income\n\n**Pro Plan:** Create custom categories!\n\nTip: Consistent categorization helps with better insights."
  },
  
  troubleshooting: {
    patterns: ['problem', 'error', 'not working', 'issue', 'bug', 'help'],
    response: "🔧 **Common Solutions:**\n\n**Login Issues:**\n• Check email/password\n• Clear browser cache\n• Try incognito mode\n\n**Transaction Problems:**\n• Refresh the page\n• Check internet connection\n• Verify all fields filled\n\n**Data Not Showing:**\n• Wait a moment for sync\n• Refresh browser\n• Check date filters\n\nStill having issues? Contact support!"
  }
};

// Quick action buttons for common queries
const QUICK_ACTIONS = [
  { label: "📊 How to view reports?", query: "how to view reports and dashboard" },
  { label: "➕ Add transaction?", query: "how to add transaction" },
  { label: "💰 Budget tips?", query: "budget planning tips" },
  { label: "📁 Export data?", query: "how to export data" },
  { label: "💎 Upgrade plans?", query: "pricing and plans" },
  { label: "🔧 Having issues?", query: "troubleshooting help" }
];

const AISupport = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: "Hi! I'm your finance assistant 🤖\n\nI can help you with budgeting, app features, and financial tips. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { currentPlan } = usePlanPermissions();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Smart response matching
  const findBestResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Check each knowledge base category
    for (const [, data] of Object.entries(KNOWLEDGE_BASE)) {
      if (data.patterns.some(pattern => lowerQuery.includes(pattern))) {
        return data.response;
      }
    }
    
    // Fallback responses based on keywords
    if (lowerQuery.includes('thank')) {
      return "You're welcome! 😊 I'm here whenever you need help with your finances. Feel free to ask anything else!";
    }
    
    if (lowerQuery.includes('account') || lowerQuery.includes('profile')) {
      return "👤 **Account Management:**\n\nTo manage your account:\n1. Go to Settings ⚙️\n2. Update profile information\n3. Change password\n4. Manage subscription\n\nNeed help with a specific account setting?";
    }
    
    // Default response with suggestions
    return "I'd be happy to help! Here are some things I can assist with:\n\n• 📊 App features and navigation\n• 💰 Budgeting and financial tips\n• 📁 Data management and exports\n• ⚙️ Account settings\n• 💎 Plan upgrades\n\nCould you be more specific about what you'd like to know?";
  };

  // Add contextual information to responses
  const personalizeResponse = (response) => {
    let personalizedResponse = response;
    
    // Add user context
    if (user?.name) {
      personalizedResponse = personalizedResponse.replace(/Hi!/g, `Hi ${user.name}!`);
    }
    
    // Add plan-specific information
    if (currentPlan && (response.includes('Pro') || response.includes('upgrade'))) {
      if (currentPlan === 'free') {
        personalizedResponse += `\n\n📋 **Your Current Plan:** Free\nConsider upgrading to unlock more features!`;
      } else if (currentPlan === 'pro') {
        personalizedResponse += `\n\n✨ **Your Current Plan:** Pro\nYou have access to all premium features!`;
      } else if (currentPlan === 'elite') {
        personalizedResponse += `\n\n👑 **Your Current Plan:** Elite\nYou're using our top-tier plan with all features!`;
      }
    }
    
    return personalizedResponse;
  };

  const handleSendMessage = async (message = inputValue) => {
    if (!message.trim()) return;

    const userMessage = {
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = findBestResponse(message);
      const personalizedResponse = personalizeResponse(aiResponse);
      
      const aiMessage = {
        type: 'ai',
        content: personalizedResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200); // Random delay for realism
  };

  const handleQuickAction = (query) => {
    handleSendMessage(query);
  };

  const formatMessage = (content) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <span className="text-2xl">🤖</span>
          
          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-primary-500 opacity-30 animate-ping"></div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            AI Finance Assistant
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[32rem] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            🤖
          </div>
          <div>
            <h3 className="font-semibold">AI Finance Assistant</h3>
            <p className="text-xs opacity-90">Always here to help</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-sm leading-relaxed">
                {formatMessage(message.content)}
              </div>
              <div className={`text-xs mt-1 opacity-70 ${
                message.type === 'user' ? 'text-primary-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 p-3 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-2 border-t border-gray-100">
        <div className="text-xs text-gray-500 mb-2 px-2">Quick help:</div>
        <div className="grid grid-cols-2 gap-1 mb-2">
          {QUICK_ACTIONS.slice(0, 4).map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.query)}
              className="text-xs p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything about your finances..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isTyping}
            className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-3 py-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISupport;
