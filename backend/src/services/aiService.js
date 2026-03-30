import axios from 'axios';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * AI Service to handle Gemini communication and agricultural context
 */
export const generateAgriculturalResponse = async (userMessage, history, context) => {
    try {
        console.log("--- AI Service (AgroMind Expert) ---");

        const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

        // Prepare payload for local ML chat service
        const payload = {
            message: userMessage,
            history: history.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                content: msg.content
            })),
            context: {
                location: context.location || "Unknown",
                soilType: context.soilType || "Not provided",
                crops: context.crops || []
            }
        };

        console.log(`Sending request to Local AI: ${ML_SERVICE_URL}/chat`);

        let responseText = "";

        // 1. Try Local Expert First
        try {
            const response = await axios.post(`${ML_SERVICE_URL}/chat`, payload, {
                timeout: 30000
            });

            if (response.data && response.data.success) {
                responseText = response.data.response;
                console.log("Local AI Response received");
            } else {
                throw new Error("Local AI failed");
            }
        } catch (localError) {
            console.warn("Local AI unreachable/failed, skipping to Gemini:", localError.message);
            responseText = "[FALLBACK_TO_GEMINI]";
        }

        // 2. Fallback to Gemini if needed
        if (responseText && typeof responseText === 'string' && responseText.trim().includes("[FALLBACK_TO_GEMINI]")) {
            console.log("🔄 Triggering Gemini Fallback...");
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });

                // Construct prompt with context
                const systemContext = `You are AgroMind, an expert agricultural AI assistant for Indian farmers.
                
                Current User Context:
                - Location: ${context.location || "India"}
                - Soil: ${context.soilType || "Unknown"}
                - Crops: ${context.crops?.join(", ") || "Unknown"}
                - Weather: ${context.weather || "Unknown"}

                Guidelines:
                - Answer the user's question accurately regarding agriculture.
                - If the question is General Knowledge (e.g., "What is agriculture?", "Who is the PM?"), answer it directly and briefly.
                - If specific to farming, use the context provided.
                - Be helpful, scientific, and polite.
                - Keep answers concise (under 150 words) unless detailed explanation is asked.
                `;

                const chat = model.startChat({
                    history: history.map(msg => ({
                        role: msg.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: msg.content }]
                    })),
                });

                const result = await chat.sendMessage(`${systemContext}\n\nUser Question: ${userMessage}`);
                const geminiResponse = result.response.text();

                console.log("✅ Gemini Response received");
                return geminiResponse;

            } catch (geminiError) {
                console.error("Gemini Error:", geminiError);
                return "I'm having trouble connecting to the internet right now. Please try again later.";
            }
        }

        return responseText;

    } catch (error) {
        console.error("AI Service Global Error:", error.message);
        return `I'm encountering a system error: ${error.message}. Please check connection.`;
    }
};
