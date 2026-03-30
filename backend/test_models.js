import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

async function listAndTest() {
    console.log("--- Comprehensive Gemini Diagnostics ---");
    console.log("API Key present:", !!apiKey);

    // 1. Try to list models using REST API to see what's actually there
    console.log("\n--- Attempting to list models via REST (v1beta) ---");
    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        console.log("Found models:");
        response.data.models.forEach(m => console.log(` - ${m.name} (supports: ${m.supportedGenerationMethods.join(', ')})`));
    } catch (error) {
        console.error("❌ Failed to list models via v1beta:", error.response?.data?.error?.message || error.message);
    }

    console.log("\n--- Attempting to list models via REST (v1) ---");
    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        console.log("Found models:");
        response.data.models.forEach(m => console.log(` - ${m.name}`));
    } catch (error) {
        console.error("❌ Failed to list models via v1:", error.response?.data?.error?.message || error.message);
    }

    // 2. Try testing a few more specific ones
    const specificModels = ["models/gemini-1.5-flash", "models/gemini-1.0-pro", "models/text-bison-001"];
    for (const modelName of specificModels) {
        try {
            console.log(`\nTesting: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            const response = await result.response;
            console.log(`✅ ${modelName} works!`);
        } catch (error) {
            console.log(`❌ ${modelName} failed`);
        }
    }
}

listAndTest();
