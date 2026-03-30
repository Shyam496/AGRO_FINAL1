import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

async function testGemini() {
    console.log("🧪 Testing Gemini API Connection...");

    const key = process.env.GEMINI_API_KEY;
    console.log(`🔑 API Key Found: ${key ? "YES (" + key.slice(0, 5) + "...)" : "NO"}`);

    if (!key) {
        console.error("❌ No API Key found in env!");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("📤 Sending 'Hello' to Gemini (Model: gemini-1.5-flash)...");
        const result = await model.generateContent("Hello, are you online?");
        const response = await result.response;
        const text = response.text();

        console.log(`✅ SUCCESS! Gemini Response: "${text}"`);

    } catch (error) {
        console.error("❌ Gemini Connection Failed:");
        console.error(error);
    }
}

testGemini();
