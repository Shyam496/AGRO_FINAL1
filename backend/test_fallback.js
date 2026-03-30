import { generateAgriculturalResponse } from './src/services/aiService.js';

async function testFallback() {
    console.log("🧪 Testing AI Service Fallback Logic...");

    // Test Case: "Who is the Prime Minister?" (Should trigger fallback)
    const question = "Who is the Prime Minister of India?";
    console.log(`User Question: "${question}"`);

    const response = await generateAgriculturalResponse(question, [], { location: "Delhi" });

    console.log(`AI Response: "${response}"`);

    if (response && response !== "[FALLBACK_TO_GEMINI]" && !response.includes("system error")) {
        console.log("✅ SUCCESS: Service correctly handled fallback and returned a real answer.");
    } else {
        console.log("❌ FAILURE: Service returned raw fallback string or error.");
    }
}

testFallback();
