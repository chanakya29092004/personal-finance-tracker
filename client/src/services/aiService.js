// Free AI API service - uses multiple free tiers for redundancy
const AI_APIS = {
  // Hugging Face Inference API (Free tier: 30,000 characters/month)
  huggingFace: {
    url: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
    headers: {
      'Authorization': 'Bearer hf_your_token_here', // Replace with your free token
      'Content-Type': 'application/json'
    }
  },
  
  // Cohere API (Free tier: 5,000 requests/month)
  cohere: {
    url: 'https://api.cohere.ai/v1/generate',
    headers: {
      'Authorization': 'Bearer your_cohere_token_here', // Replace with your free token
      'Content-Type': 'application/json'
    }
  }
};

// Smart API usage to minimize requests
export const getAIResponse = async (query, context = {}) => {
  // First, try to find answer in local knowledge base (no API calls)
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
    // Use Hugging Face free tier
    const response = await callHuggingFaceAPI(query, context);
    
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
  // Enhanced pattern matching logic
  const keywords = query.toLowerCase().split(' ');
  let bestMatch = { confidence: 0, answer: null };
  
  // Basic keyword matching for now
  if (keywords.some(word => ['budget', 'budgeting'].includes(word))) {
    bestMatch = { confidence: 0.9, answer: "Local budget advice..." };
  }
  
  return bestMatch;
};

const callHuggingFaceAPI = async (query, context) => {
  // Implementation for Hugging Face API call
  // Only used for complex queries that can't be answered locally
  return "AI response from free API";
};

const getEnhancedLocalResponse = (query, context) => {
  // Fallback response when APIs are not available
  return `I understand you're asking about "${query}". While I can help with basic finance questions using my local knowledge, for complex queries I might need access to my advanced AI features. 

Here are some things I can definitely help with right now:
• App navigation and features
• Basic budgeting tips  
• Transaction management
• Account settings
• Plan information

Would you like help with any of these topics?`;
};

const aiService = {
  getAIResponse
};

export default aiService;
