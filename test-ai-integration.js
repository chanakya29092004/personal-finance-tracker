// AI Service Integration Test
// This will help debug why the AI agent isn't answering properly

const testAIIntegration = () => {
  console.log("🧪 AI Integration Test Starting...");
  
  // Test 1: Check environment variables
  console.log("\n1️⃣ Environment Variables:");
  console.log("- Gemini API Key:", process.env.REACT_APP_GEMINI_API_KEY ? "✅ Configured" : "❌ Missing");
  console.log("- Hugging Face Token:", process.env.REACT_APP_HUGGING_FACE_TOKEN ? "✅ Configured" : "❌ Missing");
  console.log("- Cohere Token:", process.env.REACT_APP_COHERE_TOKEN ? "✅ Configured" : "❌ Missing");
  
  // Test 2: Check AI service is loaded
  console.log("\n2️⃣ AI Service:");
  if (window.aiService) {
    console.log("✅ AI Service is loaded");
  } else {
    console.log("❌ AI Service not found");
  }
  
  // Test 3: Test simple local response
  console.log("\n3️⃣ Testing Local Knowledge Base:");
  if (window.aiService && window.aiService.getAIResponse) {
    window.aiService.getAIResponse("budget help")
      .then(response => {
        console.log("✅ Local response working:", response.slice(0, 100) + "...");
      })
      .catch(error => {
        console.log("❌ Local response error:", error);
      });
  }
  
  // Test 4: Test complex query (should use API)
  console.log("\n4️⃣ Testing Complex Query (API):");
  if (window.aiService && window.aiService.getAIResponse) {
    window.aiService.getAIResponse("What's the difference between SIP and lumpsum investment strategies for someone earning 8 lakhs per year in India?")
      .then(response => {
        console.log("✅ Complex query response:", response.slice(0, 100) + "...");
        console.log("🔍 Check if this uses API or local fallback");
      })
      .catch(error => {
        console.log("❌ Complex query error:", error);
      });
  }
  
  console.log("\n✅ Test completed! Check above results.");
};

// Auto-run when script loads
if (typeof window !== 'undefined') {
  setTimeout(testAIIntegration, 1000);
}

export default testAIIntegration;
