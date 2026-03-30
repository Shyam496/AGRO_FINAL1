import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";

async function listAllModels() {
    console.log("--- Listing All Available Models for API Key ---");
    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const models = response.data.models;
        console.log(`Total models found: ${models.length}`);
        models.forEach(m => {
            const methods = m.supportedGenerationMethods || [];
            if (methods.includes('generateContent')) {
                console.log(`✅ [SUPPORTED] ${m.name} - ${m.displayName}`);
            } else {
                console.log(`❌ [UNSUPPORTED] ${m.name} - ${m.displayName}`);
            }
        });
    } catch (error) {
        console.error("Critical Failure:", error.response?.data || error.message);
    }
}

listAllModels();
