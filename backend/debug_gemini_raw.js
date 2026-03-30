import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function debugRaw() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

    console.log(`🔌 Probing URL: ${url.replace(key, 'HIDDEN_KEY')}`);

    try {
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: "Hello" }] }]
        });
        console.log("✅ SUCCESS:", response.data);
    } catch (error) {
        console.error("❌ ERROR STATUS:", error.response?.status);
        console.error("❌ ERROR DATA:", JSON.stringify(error.response?.data, null, 2));
    }
}

debugRaw();
