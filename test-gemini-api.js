// Quick test to verify Google Gemini API is working
// Run this in the browser console on your app

const testGeminiAPI = async () => {
  console.log("🚀 Testing Google Gemini API...");
  
  // Test queries
  const testQueries = [
    "What's the best way to invest ₹10,000 per month in India?",
    "How to save tax using 80C deductions?",
    "Should I invest in SIP or lump sum?"
  ];
  
  for (const query of testQueries) {
    console.log(`\n❓ Question: "${query}"`);
    console.log("⏳ Getting AI response...");
    
    try {
      // This will use Gemini API first (since it's configured)
      const response = await window.aiService.getAIResponse(query);
      console.log("✅ Response:", response);
    } catch (error) {
      console.log("❌ Error:", error.message);
    }
    
    console.log("─".repeat(60));
  }
  
  console.log("\n🎉 Test completed!");
  console.log("💡 Check the Network tab to see API calls to Google Gemini");
};

// Auto-run test
testGeminiAPI();
