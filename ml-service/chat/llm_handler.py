import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

# Load environment variables (trying backend .env if not in ml-service)
load_dotenv()
if not os.getenv("GEMINI_API_KEY"):
    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "backend", ".env"))

class LLMHandler:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("⚠️ LLM Handler: GEMINI_API_KEY not found in .env")
            self.model = None
        else:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            print("🧠 LLM Handler: Gemini Engine Ready")

    def generate_response(self, user_query, context="", history=None):
        """Generates a grounded response using provided context"""
        if not self.model:
            return "I'm having trouble connecting to my AI brain. Please check the API key configuration."

        # Construct the system instruction
        system_instruction = (
            "You are AgroMind Expert v2.0, a senior agricultural consultant. "
            "Use the provided context to answer the user's question accurately. "
            "If the context doesn't contain the answer, use your general knowledge but "
            "clearly state if you are providing general advice versus scientifically grounded advice from the manual. "
            "Keep responses farmer-friendly, using bullet points for clarity."
        )

        # Convert history to Gemini format if provided
        gemini_history = []
        if history:
            for msg in history:
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                # Map 'assistant' to 'model' for Gemini
                if role == 'assistant':
                    role = 'model'
                gemini_history.append({
                    "role": role,
                    "parts": [content]
                })

        try:
            # Start chat with history
            chat = self.model.start_chat(history=gemini_history)
            
            # Construct full prompt with context
            full_prompt = f"{system_instruction}\n\nContext from manuals:\n{context}\n\nUser Question: {user_query}\n\nAgroMind Expert, please assist based on the manuals above."
            
            # Send message
            response = chat.send_message(full_prompt)
            return response.text
        except Exception as e:
            print(f"❌ Gemini Error: {e}")
            return "I encountered an error while thinking about that. Let's try again."

# Global instance
llm_handler = LLMHandler()
