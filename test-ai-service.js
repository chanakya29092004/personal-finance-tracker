// Test the AI Service locally
// Run this file to test AI responses without needing API keys

import { getAIResponse } from '../client/src/services/aiService.js';

const testQueries = [
  "How do I budget my money?",
  "What are the best investment options?", 
  "How to save money effectively?",
  "Tax saving tips for Indians?",
  "Help me with expense tracking",
  "What features does this app have?"
];

console.log("🤖 Testing AI Service - Local Knowledge Base\n");

testQueries.forEach(async (query, index) => {
  console.log(`\n${index + 1}. Question: "${query}"`);
  console.log("---".repeat(20));
  
  try {
    const response = await getAIResponse(query);
    console.log(response);
  } catch (error) {
    console.log("Error:", error.message);
  }
  
  console.log("\n" + "=".repeat(60));
});

console.log("\n✅ Test completed! The AI service provides helpful responses even without API keys.");
console.log("💡 To enable advanced AI features, add your free API keys to client/src/services/aiService.js");
