import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const models = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
    "gemini-pro",
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash"
];

async function findWorkingModel() {
    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hi");
            process.stdout.write(`✅ Working: ${m}\n`);
            return;
        } catch (e) {
            process.stdout.write(`❌ Failed ${m}: ${e.message}\n`);
        }
    }
}

findWorkingModel();
