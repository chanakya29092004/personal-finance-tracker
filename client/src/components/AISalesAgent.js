import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import aiService from '../services/aiService';

// Comprehensive sales knowledge base for instant responses
const SALES_KNOWLEDGE_BASE = {
  greetings: {
    patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
    responses: [
      "Hello! Welcome to FinanceTracker! 👋 I'm Sarah, your AI sales assistant. I'm here to help you find the perfect plan for your needs. What brings you here today?",
      "Hi there! Great to meet you! I'm Sarah from FinanceTracker sales. I'd love to help you discover how our platform can transform your financial management. What's your biggest financial challenge right now?",
      "Hey! Thanks for your interest in FinanceTracker! I'm Sarah, and I'm excited to show you how we can help streamline your finances. Are you looking for personal finance tracking or business solutions?"
    ]
  },
  
  pricing: {
    patterns: ['price', 'cost', 'pricing', 'how much', 'plans', 'subscription'],
    responses: [
      "Great question! We have three fantastic plans:\n\n💫 **FREE** - Perfect for individuals getting started\n• $0/month forever\n• 50 transactions/month\n• Basic reporting\n\n🚀 **PRO** - Our most popular for small businesses\n• $29/month\n• Unlimited transactions\n• Advanced analytics\n• Team collaboration\n\n👑 **ELITE** - Enterprise solution\n• $99/month\n• Everything in Pro\n• API access\n• Dedicated support\n\nWhich type of user are you - individual, small business, or enterprise?"
    ]
  },
  
  features: {
    patterns: ['features', 'what does', 'capabilities', 'functionality', 'what can'],
    responses: [
      "I'd love to show you what makes FinanceTracker special! 🌟\n\n**Core Features:**\n• Smart expense categorization\n• Real-time financial insights\n• Beautiful, intuitive dashboard\n• Multi-device sync\n• Bank-level security\n\n**Pro Features:**\n• Advanced reporting & analytics\n• Team collaboration tools\n• Custom categories\n• Data export (CSV, PDF)\n• Budget planning & alerts\n\n**Elite Features:**\n• API integrations\n• White-label options\n• Custom workflows\n• Dedicated account manager\n\nWhat specific features are most important for your use case?"
    ]
  },
  
  comparison: {
    patterns: ['compare', 'difference', 'vs', 'versus', 'better than', 'competitor'],
    responses: [
      "Excellent question! Here's what sets FinanceTracker apart:\n\n🎯 **vs Mint/YNAB:**\n• Modern, intuitive interface\n• Better team collaboration\n• More affordable enterprise options\n\n🚀 **vs QuickBooks:**\n• Simpler for personal use\n• Better mobile experience\n• More affordable for small teams\n\n💡 **vs Spreadsheets:**\n• Automated categorization\n• Real-time insights\n• No manual data entry\n• Beautiful visualizations\n\n**Our Secret Sauce:**\n• AI-powered insights\n• Seamless user experience\n• Flexible pricing tiers\n• Outstanding customer support\n\nWhat alternatives are you currently considering?"
    ]
  },
  
  trial: {
    patterns: ['trial', 'demo', 'test', 'try', 'free trial'],
    responses: [
      "Absolutely! I'd love to get you started with a trial! 🎉\n\n**Free Plan:**\n• Start immediately - no credit card required\n• 50 transactions/month\n• Full access to core features\n\n**Pro Trial:**\n• 14-day free trial of Pro features\n• Unlimited transactions\n• Advanced analytics\n• Team collaboration\n• Cancel anytime\n\n**What I recommend:**\n1. Start with Free to get familiar\n2. Upgrade to Pro trial when ready\n3. See the difference advanced features make\n\nShall I help you get started with the Free plan right now?"
    ]
  },
  
  business: {
    patterns: ['business', 'company', 'team', 'employees', 'enterprise', 'organization'],
    responses: [
      "Perfect! FinanceTracker is excellent for businesses! 🏢\n\n**For Small Businesses (Pro Plan):**\n• Up to 5 team members\n• Collaborative expense tracking\n• Advanced reporting for tax time\n• Budget management across departments\n• Priority support\n\n**For Large Enterprises (Elite Plan):**\n• Unlimited team members\n• API integrations with existing systems\n• Custom workflows\n• White-label options\n• Dedicated account manager\n• SOC 2 compliance\n\n**Popular Business Use Cases:**\n• Expense reimbursements\n• Department budget tracking\n• Tax preparation\n• Financial forecasting\n• Vendor payment tracking\n\nHow many people would be using the system?"
    ]
  },
  
  security: {
    patterns: ['security', 'safe', 'secure', 'privacy', 'data protection'],
    responses: [
      "Security is our top priority! 🔐 Here's how we protect your data:\n\n**Bank-Level Security:**\n• 256-bit SSL encryption\n• SOC 2 Type II compliant\n• Regular security audits\n• Zero-knowledge architecture\n\n**Data Protection:**\n• We NEVER store bank passwords\n• Read-only bank connections\n• Data encrypted at rest\n• GDPR & CCPA compliant\n\n**Privacy Commitment:**\n• We don't sell your data\n• No ads or tracking\n• You own your financial data\n• Easy data export anytime\n\n**Certifications:**\n• ISO 27001 certified\n• PCI DSS compliant\n• Regular penetration testing\n\nYour financial privacy is sacred to us!"
    ]
  },
  
  support: {
    patterns: ['support', 'help', 'customer service', 'assistance'],
    responses: [
      "We pride ourselves on exceptional support! 🌟\n\n**Free Plan:**\n• Email support (24-48 hour response)\n• Comprehensive help documentation\n• Video tutorials\n• Community forum\n\n**Pro Plan:**\n• Priority email support (same day response)\n• Live chat during business hours\n• Phone support\n• Onboarding assistance\n\n**Elite Plan:**\n• Dedicated account manager\n• 24/7 phone & chat support\n• Custom training sessions\n• Implementation assistance\n\n**Our Promise:**\n• Real humans, not bots\n• Financial experts on staff\n• 98% customer satisfaction\n• Money-back guarantee\n\nWhat level of support would you need?"
    ]
  },
  
  objections: {
    patterns: ['expensive', 'too much', 'cost', 'budget', 'afford', 'cheap', 'free alternative'],
    responses: [
      "I totally understand cost is important! Let me break down the value:\n\n💰 **ROI Analysis:**\n• Average user saves 5+ hours/month\n• Typical small business saves $2,000+ annually\n• Better financial decisions = increased profits\n\n🔍 **Cost Comparison:**\n• $29/month = Less than $1 per day\n• Compare to: Coffee ($5/day), Netflix ($15/month)\n• Most users see ROI within first month\n\n💡 **Value Proposition:**\n• Automate hours of manual work\n• Reduce accounting costs\n• Make better financial decisions\n• Avoid costly mistakes\n\n**Special Offers:**\n• 14-day free trial (no risk)\n• 30-day money-back guarantee\n• Annual plans (2 months free)\n\nWhat if I could show you how to save the subscription cost in your first month?"
    ]
  }
};

const CONVERSATION_STARTERS = [
  "I'm interested in the Pro plan for my business",
  "What's the difference between Pro and Elite?", 
  "Can I try it before buying?",
  "How secure is my financial data?",
  "Do you offer team collaboration features?",
  "What kind of support do you provide?"
];

const AISalesAgent = ({ mode = 'chat', onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: "Hi! I'm Sarah, your personal FinanceTracker sales consultant! 👋\n\nI'm here to help you find the perfect plan and answer any questions about our platform. Whether you're an individual looking to track personal expenses or a business needing team collaboration, I've got you covered!\n\nWhat would you like to know about FinanceTracker?",
      timestamp: new Date(),
      avatar: '👩‍💼'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  const { user } = useAuth();

  useEffect(() => {
    // Check for speech support
    if ('speechSynthesis' in window && 'webkitSpeechRecognition' in window) {
      setVoiceSupported(true);
      synthRef.current = window.speechSynthesis;
      
      // Initialize speech recognition
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleSendMessage(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.log('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startListening = () => {
    if (recognitionRef.current && voiceSupported) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakMessage = (text) => {
    if (synthRef.current && voiceSupported) {
      // Stop any current speech
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      // Try to use a female voice for Sarah
      const voices = synthRef.current.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Karen') ||
        voice.gender === 'female'
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const findBestResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Check each knowledge base category
    for (const [, data] of Object.entries(SALES_KNOWLEDGE_BASE)) {
      if (data.patterns.some(pattern => lowerQuery.includes(pattern))) {
        const responses = Array.isArray(data.responses) ? data.responses : [data.responses];
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
    
    // Contextual responses
    if (lowerQuery.includes('thank')) {
      return "You're absolutely welcome! 😊 I'm here to help you succeed with FinanceTracker. Is there anything else you'd like to know about our plans or features? I'm happy to schedule a demo or help you get started!";
    }
    
    if (lowerQuery.includes('buy') || lowerQuery.includes('purchase') || lowerQuery.includes('sign up')) {
      return "Fantastic! I'm excited to help you get started! 🎉\n\nHere's what I recommend:\n\n1. **Start with our Free plan** to get familiar\n2. **Upgrade to Pro** when you're ready for advanced features\n3. **I'll personally ensure** you have a smooth onboarding\n\nShall I guide you through the signup process right now? It takes less than 2 minutes!";
    }
    
    // Default sales response
    return "That's a great question! Let me help you with that. \n\nAs your sales consultant, I want to make sure FinanceTracker is the perfect fit for your needs. Could you tell me a bit more about:\n\n• Are you tracking personal or business finances?\n• How many transactions do you typically have per month?\n• What's your biggest financial management challenge?\n\nThis will help me recommend the best plan and features for you!";
  };

  const personalizeResponse = (response) => {
    let personalizedResponse = response;
    
    // Add user context
    if (user?.name) {
      personalizedResponse = personalizedResponse.replace(/Hi!/g, `Hi ${user.name}!`);
    }
    
    // Add sales-specific personalization
    if (user?.email) {
      personalizedResponse += `\n\n📧 I have your email as ${user.email} - I can send you a detailed comparison chart if that would be helpful!`;
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

    try {
      // Use AI service with Google Gemini API for intelligent sales responses
      const context = {
        userName: user?.name || 'Visitor',
        role: 'sales_prospect',
        intent: 'pricing_and_features',
        timestamp: new Date().toISOString()
      };
      
      const aiResponse = await aiService.getAIResponse(message, context);
      const personalizedResponse = personalizeResponse(aiResponse);
      
      const aiMessage = {
        type: 'ai',
        content: personalizedResponse,
        timestamp: new Date(),
        avatar: '👩‍💼'
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Auto-speak in voice mode
      if (mode === 'voice') {
        speakMessage(personalizedResponse);
      }
    } catch (error) {
      console.log('AI service error, using local sales response:', error);
      // Fallback to local knowledge if AI service fails
      const localResponse = findBestResponse(message);
      const personalizedResponse = personalizeResponse(localResponse);
      
      const aiMessage = {
        type: 'ai',
        content: personalizedResponse,
        timestamp: new Date(),
        avatar: '👩‍💼'
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Auto-speak in voice mode
      if (mode === 'voice') {
        speakMessage(personalizedResponse);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickStart = (starter) => {
    handleSendMessage(starter);
  };

  const formatMessage = (content) => {
    return content.split('\n').map((line, index) => (
      <span key={index} className="block mb-1">
        {line}
      </span>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 via-purple-600 to-pink-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl">
                👩‍💼
              </div>
              <div>
                <h3 className="text-xl font-bold">Sarah - Sales Consultant</h3>
                <p className="text-sm opacity-90">
                  {mode === 'voice' ? '🎤 Voice & Chat Assistant' : '💬 Chat Assistant'} • FinanceTracker Expert
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {voiceSupported && (
                <div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                  Voice Enabled ✨
                </div>
              )}
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[80%] ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                
                {message.type === 'ai' && (
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0">
                    {message.avatar || '👩‍💼'}
                  </div>
                )}
                
                {message.type === 'user' && (
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                
                <div
                  className={`p-4 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-sm leading-relaxed">
                    {formatMessage(message.content)}
                  </div>
                  <div className={`text-xs mt-2 opacity-70 ${
                    message.type === 'user' ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg">
                  👩‍💼
                </div>
                <div className="bg-gray-100 text-gray-900 p-4 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Starters */}
        {messages.length <= 1 && (
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="text-sm text-gray-600 mb-3">💡 Popular questions:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {CONVERSATION_STARTERS.map((starter, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickStart(starter)}
                  className="text-left text-xs p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Voice Controls (if voice mode) */}
        {mode === 'voice' && voiceSupported && (
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex justify-center space-x-4">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isSpeaking}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
              >
                <span className="text-lg">{isListening ? '🔴' : '🎤'}</span>
                <span className="text-sm font-medium">
                  {isListening ? 'Listening...' : 'Start Voice Chat'}
                </span>
              </button>
              
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  <span className="text-lg">🔇</span>
                  <span className="text-sm font-medium">Stop Speaking</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me about pricing, features, or anything else..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            
            {voiceSupported && (
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isSpeaking}
                className={`p-3 rounded-xl transition-all ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </button>
            )}
            
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isTyping}
              className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-6 py-3 transition-colors font-medium"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISalesAgent;
