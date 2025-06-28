// Free AI API service - uses multiple free tiers for redundancy
import UserDataService from './userDataService';

const AI_APIS = {
  // Hugging Face Inference API (Free tier: 30,000 characters/month)
  huggingFace: {
    url: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
    headers: {
      'Authorization': `Bearer ${process.env.REACT_APP_HUGGING_FACE_TOKEN || 'YOUR_HUGGING_FACE_TOKEN_HERE'}`,
      'Content-Type': 'application/json'
    }
  },
  
  // Cohere API (Free tier: 5,000 requests/month)
  cohere: {
    url: 'https://api.cohere.ai/v1/generate',
    headers: {
      'Authorization': `Bearer ${process.env.REACT_APP_COHERE_TOKEN || 'YOUR_COHERE_TOKEN_HERE'}`,
      'Content-Type': 'application/json'
    }
  },

  // Google Gemini API (Free tier: 15 requests/minute, 1,500/day)
  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    headers: {
      'Content-Type': 'application/json'
    },
    apiKey: process.env.REACT_APP_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE'
  }
};

// Track API usage to respect free tier limits
const trackAPIUsage = (apiName, success = true) => {
  const usage = JSON.parse(localStorage.getItem('aiApiUsage') || '{}');
  const today = new Date().toDateString();
  
  if (!usage[today]) {
    usage[today] = {};
  }
  
  if (!usage[today][apiName]) {
    usage[today][apiName] = { calls: 0, success: 0, failed: 0 };
  }
  
  usage[today][apiName].calls++;
  if (success) {
    usage[today][apiName].success++;
  } else {
    usage[today][apiName].failed++;
  }
  
  localStorage.setItem('aiApiUsage', JSON.stringify(usage));
  
  // Log usage for monitoring
  console.log(`📊 API Usage - ${apiName}: ${usage[today][apiName].calls} calls today (${usage[today][apiName].success} successful)`);
  
  return usage[today][apiName];
};

// Check if we're approaching API limits
const checkAPILimits = () => {
  const usage = JSON.parse(localStorage.getItem('aiApiUsage') || '{}');
  const today = new Date().toDateString();
  const todayUsage = usage[today] || {};
  
  // Gemini: 1,500 requests/day limit
  if (todayUsage.gemini?.calls > 1400) {
    console.warn('⚠️ Approaching Gemini API daily limit (1,500/day)');
  }
  
  // Cohere: 5,000 requests/month limit (estimate ~166/day)
  if (todayUsage.cohere?.calls > 150) {
    console.warn('⚠️ High Cohere API usage today');
  }
  
  return todayUsage;
};

// Smart API usage to minimize requests
export const getAIResponse = async (query, context = {}) => {
  // First, get user's actual financial data
  const userData = await UserDataService.generateInsights();
  
  // Enhanced context with real user data
  const enhancedContext = {
    ...context,
    userData: userData || {}
  };
  
  // Check if this is a question about user's actual expenses/finances
  const isPersonalFinanceQuery = query.toLowerCase().includes('my') || 
                                query.toLowerCase().includes('expenses') ||
                                query.toLowerCase().includes('spending') ||
                                query.toLowerCase().includes('income') ||
                                query.toLowerCase().includes('savings');
  
  // If asking about personal finances and we have data, provide specific answer
  if (isPersonalFinanceQuery && userData) {
    const personalResponse = generatePersonalFinanceResponse(query, userData);
    if (personalResponse) {
      return personalResponse;
    }
  }
  
  // Try to find answer in local knowledge base (no API calls)
  const localResponse = findLocalResponse(query);
  if (localResponse.confidence > 0.8) {
    return localResponse.answer;
  }
  
  // For complex queries, use free AI API with caching
  const cacheKey = `ai_response_${query.toLowerCase().slice(0, 50)}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const { response, timestamp } = JSON.parse(cached);
    // Cache valid for 24 hours
    if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
      return response;
    }
  }
  
  try {
    // Check API limits before making calls
    checkAPILimits();
    
    // Try APIs in order of preference - Gemini first (configured!)
    let response;
    
    try {
      response = await callGeminiAPI(query, enhancedContext);
      trackAPIUsage('gemini', true);
    } catch (error) {
      trackAPIUsage('gemini', false);
      console.log('Gemini unavailable, trying Hugging Face...');
      try {
        response = await callHuggingFaceAPI(query, context);
        trackAPIUsage('huggingFace', true);
      } catch (hfError) {
        trackAPIUsage('huggingFace', false);
        console.log('Hugging Face unavailable, trying Cohere...');
        response = await callCohereAPI(query, context);
        trackAPIUsage('cohere', true);
      }
    }
    
    // Cache the response
    localStorage.setItem(cacheKey, JSON.stringify({
      response,
      timestamp: Date.now()
    }));
    
    return response;
  } catch (error) {
    console.log('API limit reached, using enhanced local response');
    return getEnhancedLocalResponse(query, context);
  }
};

const findLocalResponse = (query) => {
  const keywords = query.toLowerCase().split(' ');
  let bestMatch = { confidence: 0, answer: null };
  
  // Finance topics - high confidence local responses
  if (keywords.some(word => ['budget', 'budgeting', 'budget plan'].includes(word))) {
    bestMatch = { 
      confidence: 0.9, 
      answer: "🎯 **Budgeting Tips for Indians:**\n\n• Follow the 50-30-20 rule: 50% needs, 30% wants, 20% savings\n• Track expenses in INR for better clarity\n• Use our Monthly Summary to monitor spending\n• Set up automatic savings transfers\n• Consider SIP investments for long-term goals\n\nWould you like help setting up budget categories in the app?" 
    };
  }
  
  if (keywords.some(word => ['expense', 'expenses', 'spending'].includes(word))) {
    bestMatch = { 
      confidence: 0.9, 
      answer: "💰 **Managing Expenses:**\n\n• Use our Add Transaction feature to track all spending\n• Categorize expenses (Food, Transport, Bills, etc.)\n• Review your Transaction History weekly\n• Set spending alerts for each category\n• Look for subscription services you can cancel\n\nGo to Dashboard → Add Transaction to start tracking!" 
    };
  }
  
  if (keywords.some(word => ['save', 'saving', 'savings'].includes(word))) {
    bestMatch = { 
      confidence: 0.9, 
      answer: "🏦 **Smart Saving Strategies:**\n\n• Start with emergency fund (6 months expenses)\n• Automate savings on salary day\n• Use high-yield savings accounts\n• Consider digital gold investments\n• Explore PPF and ELSS for tax benefits\n\nTrack your savings goal in Settings → Goals!" 
    };
  }
  
  if (keywords.some(word => ['investment', 'invest', 'mutual fund', 'sip'].includes(word))) {
    bestMatch = { 
      confidence: 0.9, 
      answer: "📈 **Investment Guide for Indians:**\n\n• Start SIP with ₹1000/month in diversified funds\n• Use 80C deductions (ELSS, PPF, NSC)\n• Consider index funds for low-cost investing\n• Don't put all money in FDs - beat inflation\n• Review portfolio quarterly\n\nPro/Elite users get advanced investment tracking!" 
    };
  }
  
  if (keywords.some(word => ['tax', 'taxes', '80c', 'deduction'].includes(word))) {
    bestMatch = { 
      confidence: 0.9, 
      answer: "📊 **Tax Saving Tips:**\n\n• Claim 80C deductions up to ₹1.5L\n• HRA if you pay rent\n• Medical insurance under 80D\n• Home loan interest under 24(b)\n• Keep all investment receipts\n\nUpgrade to Pro for tax calculation features!" 
    };
  }
  
  if (keywords.some(word => ['app', 'feature', 'how to', 'help'].includes(word))) {
    bestMatch = { 
      confidence: 0.85, 
      answer: "🚀 **App Features:**\n\n• **Dashboard:** Overview of finances\n• **Add Transaction:** Track income/expenses\n• **History:** View all transactions\n• **Monthly Summary:** Spending analysis\n• **Settings:** Customize currency (INR) & preferences\n• **Pricing:** Upgrade for advanced features\n\nWhat specific feature do you need help with?" 
    };
  }
  
  return bestMatch;
};

const callHuggingFaceAPI = async (query, context) => {
  const api = AI_APIS.huggingFace;
  
  // Check if API key is configured (now you have Hugging Face token!)
  if (!process.env.REACT_APP_HUGGING_FACE_TOKEN || api.headers.Authorization.includes('your_hugging_face_token_here')) {
    throw new Error('Hugging Face API key not configured');
  }
  
  try {
    const response = await fetch(api.url, {
      method: 'POST',
      headers: api.headers,
      body: JSON.stringify({
        inputs: query,
        parameters: {
          max_length: 100,
          temperature: 0.7
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.generated_text || data[0]?.generated_text || "I'm processing your request...";
  } catch (error) {
    console.log('Hugging Face API error:', error.message);
    throw error;
  }
};

const callCohereAPI = async (query, context) => {
  const api = AI_APIS.cohere;
  
  // Check if API key is configured
  if (!process.env.REACT_APP_COHERE_TOKEN || api.headers.Authorization.includes('your_cohere_token_here')) {
    throw new Error('Cohere API key not configured');
  }
  
  try {
    const response = await fetch(api.url, {
      method: 'POST',
      headers: api.headers,
      body: JSON.stringify({
        prompt: query,
        max_tokens: 100,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.generations?.[0]?.text || "I'm processing your request...";
  } catch (error) {
    console.log('Cohere API error:', error.message);
    throw error;
  }
};

const callGeminiAPI = async (query, context) => {
  const api = AI_APIS.gemini;
  
  // Check if API key is configured (Google Gemini is now configured!)
  if (!process.env.REACT_APP_GEMINI_API_KEY || api.apiKey.includes('YOUR_GEMINI_API_KEY_HERE')) {
    throw new Error('Gemini API key not configured');
  }
  
  // Create contextual prompt based on user role and data
  let systemPrompt = "You are a helpful Indian finance assistant. Answer concisely and practically.";
  
  if (context.role === 'sales_prospect') {
    systemPrompt = `You are Sarah, an expert sales assistant for FinanceTracker, a personal finance app. You're helpful, friendly, and focus on showing value. Mention our plans: Free (₹0), Pro (₹2,400/year), Elite (₹8,000/year). Always be enthusiastic about helping with Indian finance needs (SIP, PPF, tax planning, etc.).`;
  } else if (context.userName) {
    systemPrompt = `You are a helpful finance assistant for ${context.userName}, who is on the ${context.userPlan || 'Free'} plan. Focus on practical Indian finance advice including investments, tax savings, and budget management. Be friendly and personalized.`;
    
    // Add user financial context if available
    if (context.userData && Object.keys(context.userData).length > 0) {
      const userData = context.userData;
      systemPrompt += ` The user's current financial situation: Total expenses ${userData.totalExpenses || 'unknown'}, Recent expenses ${userData.recentExpenses || 'unknown'}, Top expense category: ${userData.topExpenseCategory || 'unknown'}, Savings rate: ${userData.savingsRate || 'unknown'}%. Use this information to provide personalized advice.`;
    }
  }
  
  try {
    const response = await fetch(`${api.url}?key=${api.apiKey}`, {
      method: 'POST',
      headers: api.headers,
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser question: ${query}\n\nPlease provide a helpful, concise response in a friendly tone. Use Indian financial terms and context where relevant.`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.7
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm processing your request...";
  } catch (error) {
    console.log('Gemini API error:', error.message);
    throw error;
  }
};

// Generate personalized responses based on user's actual financial data
const generatePersonalFinanceResponse = (query, userData) => {
  const q = query.toLowerCase();
  
  // Questions about expenses
  if (q.includes('expense') || q.includes('spending') || q.includes('spend')) {
    return `💰 **Your Current Expenses:**

**Total Expenses:** ${userData.totalExpenses}
**Recent Expenses (30 days):** ${userData.recentExpenses}
**Top Spending Category:** ${userData.topExpenseCategory}

📊 **Your Spending Insights:**
• Your savings rate is ${userData.savingsRate}% (${userData.savingsHealth === 'excellent' ? 'Excellent!' : userData.savingsHealth === 'good' ? 'Good job!' : 'Room for improvement'})
• Net savings: ${userData.netSavings}
• Spending trend: ${userData.spendingTrend}

💡 **Recommendations:**
${userData.savingsRate < 10 ? 
  '• Consider reducing expenses in ' + userData.topExpenseCategory + '\n• Set a budget for discretionary spending' :
  '• You\'re doing great! Consider investing your surplus\n• Look into SIP for long-term wealth building'
}

Go to **Dashboard** to see your detailed breakdown!`;
  }
  
  // Questions about savings
  if (q.includes('saving') || q.includes('save')) {
    return `🏦 **Your Savings Summary:**

**Net Savings:** ${userData.netSavings}
**Savings Rate:** ${userData.savingsRate}%
**Status:** ${userData.savingsHealth === 'excellent' ? '🎉 Excellent savings discipline!' : 
             userData.savingsHealth === 'good' ? '👍 Good savings habit!' : 
             '⚠️ Time to boost your savings!'}

💡 **Personalized Advice:**
${userData.savingsRate < 10 ? 
  '• Target 20% savings rate for financial freedom\n• Start with automating ₹5,000/month savings\n• Cut back on ' + userData.topExpenseCategory + ' expenses' :
  '• Great job! Consider increasing investments\n• Look into ELSS for tax benefits\n• Emergency fund should be 6 months of expenses'
}

**Next Steps:** Visit **Settings → Goals** to set savings targets!`;
  }
  
  // Questions about income
  if (q.includes('income') || q.includes('earning')) {
    return `📈 **Your Income Overview:**

Based on your transaction data, I can see your financial patterns. 

**Key Insights:**
• Total expenses tracked: ${userData.totalExpenses}
• Your savings: ${userData.netSavings}
• Current savings rate: ${userData.savingsRate}%

💰 **Income Optimization Tips:**
• Track all income sources in our app
• Consider side investments for passive income
• Use 80C deductions to save taxes
• Invest surplus in SIP for wealth building

**Need more income tracking?** Go to **Add Transaction** → Income to log all sources!`;
  }
  
  return null; // No specific personal response, use general AI
};

const getEnhancedLocalResponse = (query, context) => {
  // Smart fallback based on query intent
  const keywords = query.toLowerCase();
  
  if (keywords.includes('budget') || keywords.includes('plan')) {
    return `💡 **Budget Planning Help:**

I can help you with budgeting right away! Here's what I recommend:

• **50-30-20 Rule:** 50% for needs, 30% for wants, 20% for savings
• **Track in INR:** Use our app to monitor spending in rupees
• **Monthly Review:** Check your Monthly Summary regularly
• **Emergency Fund:** Build 6 months of expenses as safety net

Go to **Dashboard → Add Transaction** to start tracking your expenses today!

*For personalized AI budgeting advice, consider upgrading to Pro which includes advanced AI features.*`;
  }
  
  if (keywords.includes('invest') || keywords.includes('mutual fund')) {
    return `📈 **Investment Guidance:**

Here are proven investment strategies for Indians:

• **Start Small:** Begin with ₹1,000 SIP in diversified equity funds
• **Tax Savings:** Use ELSS funds for 80C deductions (₹1.5L limit)
• **Index Funds:** Low-cost option that tracks market performance
• **PPF:** 15-year lock-in with tax-free returns
• **Avoid:** Putting all money in FDs - won't beat inflation

**Pro Tip:** Our Elite plan includes investment portfolio tracking!

*For detailed investment analysis, upgrade to access our AI investment advisor.*`;
  }
  
  if (keywords.includes('save') || keywords.includes('saving')) {
    return `🏦 **Smart Saving Tips:**

Let me help you save more effectively:

• **Automate:** Set up auto-transfer on salary day
• **High-Yield:** Use savings accounts with 6-7% interest
• **Digital Gold:** Small amounts daily via apps
• **Cut Subscriptions:** Review and cancel unused services
• **Track Goals:** Set specific targets in our app

Use **Settings → Goals** to set and track your savings targets!

*Upgrade to Pro for automated savings insights and recommendations.*`;
  }
  
  // Generic helpful response
  return `🤖 **I'm here to help with your finances!**

While I can provide excellent guidance using my built-in knowledge, I understand you're asking about "${query}".

**I can definitely help with:**
• 💰 Budgeting and expense management
• 📊 Indian tax-saving strategies (80C, HRA, etc.)
• 📈 Investment basics (SIP, mutual funds, PPF)
• 🏦 Savings strategies and emergency funds
• 🚀 App features and navigation

**Popular Topics:**
• "How to budget in India?" 
• "Best investment options for beginners?"
• "Tax saving tips for salaried employees?"
• "Emergency fund planning?"

Ask me about any of these topics, or upgrade to Pro/Elite for advanced AI-powered financial advice!`;
};

const aiService = {
  getAIResponse,
  trackAPIUsage,
  checkAPILimits
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  window.aiService = aiService;
}

export default aiService;
