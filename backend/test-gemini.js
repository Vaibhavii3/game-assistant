const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testGeminiAPI() {
  console.log("Testing Gemini API...");
  console.log("API Key:", GEMINI_API_KEY ? "Present ✓" : "Missing ✗");
  
  if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY not found in .env file!");
    return;
  }

  // Test 1: List models
  try {
    console.log("\n📋 Fetching available models...");
    const listResponse = await axios.get(
      `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`
    );
    
    console.log("✅ API Key is valid!");
    console.log("\n🎯 Available models that support generateContent:");
    
    const workingModels = listResponse.data.models.filter(model => 
      model.supportedGenerationMethods?.includes('generateContent')
    );
    
    workingModels.forEach(model => {
      console.log(`  - ${model.name}`);
    });
    
    // Test 2: Try generateContent with first working model
    if (workingModels.length > 0) {
      const testModel = workingModels[0].name;
      console.log(`\n🧪 Testing generateContent with: ${testModel}`);
      
      const generateResponse = await axios.post(
        `https://generativelanguage.googleapis.com/${testModel}:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{ text: "Say hello in one word" }]
          }]
        },
        {
          headers: { "Content-Type": "application/json" }
        }
      );
      
      const reply = generateResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("✅ Generate Content Test Successful!");
      console.log("Response:", reply);
      console.log(`\n✨ Use this URL in your code:\nhttps://generativelanguage.googleapis.com/${testModel}:generateContent`);
    }
    
  } catch (error) {
    console.error("\n❌ Error:", error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      console.log("\n💡 API Key issue detected. Check:");
      console.log("1. Is your API key correct?");
      console.log("2. Is Gemini API enabled in Google Cloud Console?");
      console.log("3. Are there any billing/quota issues?");
    }
  }
}

testGeminiAPI();