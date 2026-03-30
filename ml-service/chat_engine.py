import torch
import re
import random
import json
import os
import pickle
import numpy as np
from datetime import datetime
from weather_service import weather_service
from chat.rag_engine import rag_engine
from farming_advisory import farming_advisory
from chat.llm_handler import llm_handler
from chat.vision_handler import VisionHandler

class AgroMindExpert:
    def __init__(self):
        self.base_path = os.path.dirname(__file__)
        self.fertilizer_info = self._load_json('fertilizer_info.json')
        self.schemes_info = self._load_json('schemes_data.json')
        self.chat_data = self._load_json('chat_dataset.json')
        
        # Core Agricultural Knowledge Base (Definitions)
        self.glossary = {
            "agriculture": "Agriculture is the science, art, and practice of cultivating the soil, growing crops, and raising livestock. It includes the preparation of plant and animal products for people to use and their distribution to markets.",
            "farming": "Farming is the act or process of working the ground, planting seeds, and growing edible plants. It can also include raising animals for milk or meat.",
            "soil": "Soil is the upper layer of earth in which plants grow, a black or dark brown material typically consisting of a mixture of organic remains, clay, and rock particles.",
            "irrigation": "Irrigation is the artificial application of water to the soil through various systems of tubes, pumps, and sprays. It is usually used in areas where rainfall is irregular or dry spells are expected.",
            "drip irrigation": "Drip irrigation is a type of micro-irrigation system that has the potential to save water and nutrients by allowing water to drip slowly to the roots of plants, either from above the soil surface or buried below the surface.",
            "sprinkler irrigation": "Sprinkler irrigation is a method of applying irrigation water which is similar to natural rainfall. Water is distributed through a system of pipes usually by pumping.",
            "organic farming": "Organic farming is an agricultural system that uses fertilizers of organic origin such as compost manure, green manure, and bone meal and places emphasis on techniques such as crop rotation and companion planting.",
            "crop rotation": "Crop rotation is the practice of planting different types of crops in the same area in sequenced seasons. It helps in maintaining soil fertility and reducing pest and disease pressure.",
            "npk": "NPK stands for Nitrogen (N), Phosphorus (P), and Potassium (K) - the three primary nutrients found in fertilizers. Each plays a distinct role: Nitrogen for leaf growth, Phosphorus for root and flower development, and Potassium for overall plant health.",
            "pesticide": "Pesticides are substances used for destroying insects or other organisms harmful to cultivated plants or to animals.",
            "vermicompost": "Vermicompost is the product of the decomposition process using various species of worms, usually red wigglers, white worms, and other earthworms, to create a mixture of decomposing vegetable or food waste, bedding materials, and vermicast."
        }
        
        # Load ML Model
        self.model = None
        model_path = os.path.join(self.base_path, 'chat_intent_model.pkl')
        if os.path.exists(model_path):
            try:
                with open(model_path, 'rb') as f:
                    self.model = pickle.load(f)
                print("🧠 AgroMind Expert: ML Brain Loaded")
            except Exception as e:
                print(f"⚠️ AgroMind Expert: ML Brain Fail: {e}")

        self.vision = None # Will be initialized by app.py
        
        # Initialize RAG (Phase 1)
        try:
            kb_path = os.path.join(self.base_path, 'knowledge_base')
            # db_path = os.path.join(self.base_path, 'vector_db', 'chroma.sqlite3')
            
            # Temporarily disabled indexing to allow service to start without download
            # if os.path.exists(kb_path) and not os.path.exists(db_path):
            #     print("📂 AgroMind Expert: Indexing Knowledge Base (First time)...")
            #     rag_engine.index_knowledge_base(kb_path)
            # elif os.path.exists(db_path):
            #     print("📂 AgroMind Expert: Knowledge Base already indexed.")
            # else:
            #     print("⚠️ AgroMind Expert: Knowledge Base path not found")
            print("📦 RAG Engine: Indexing skipped for startup speed.")
        except Exception as e:
            print(f"⚠️ AgroMind Expert: RAG Indexing Fail: {e}")
        
    def _load_json(self, filename):
        path = os.path.join(self.base_path, filename)
        if not os.path.exists(path): return {}
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except: return {}

    def init_vision(self, disease_model, validator_model, class_names):
        """Initialize vision capabilities from app.py"""
        self.vision = VisionHandler(disease_model, validator_model, class_names)
        print("👁️ AgroMind Expert: Vision Module Initialized")

    def get_response(self, user_query, history=None, context=None, image_bytes=None):
        query = user_query.lower().strip()
        context = context or {}
        history = history or [] # Expected list of items with 'role' and 'content'
        location = context.get('location', 'Coimbatore')
        
        print(f"DEBUG: Processing query: '{query}' with history length: {len(history)}")

        # --- PRIORITY -1: Multimodal (Image) Handling ---
        if image_bytes and self.vision:
            print("📸 Processing Image Input...")
            vision_result = self.vision.process_image(image_bytes)
            
            if not vision_result.get("is_valid", True):
                return vision_result["message"]
            
            if "disease" in vision_result:
                # Augment LLM with vision results
                vision_context = f"The user uploaded a leaf photo. Vision analysis: {vision_result['message']}"
                return llm_handler.generate_response(user_query, context=vision_context, history=history)

        # --- PRIORITY 0: Multi-turn Context Logic ("Yes", "Sure", etc.) ---
        # Very broad check for confirmation words
        is_confirmation = any(word == query for word in ['yes', 'yeah', 'sure', 'ok', 'okay', 'yep', 'y', 'confirm', 'go ahead'])
        
        if is_confirmation and len(history) >= 1:
            print("DEBUG: Confirmation detected. Checking history for context...")
            # Find the last assistant message
            last_bot_msg = None
            for msg in reversed(history):
                # Handle cases where role might be 'assistant' (backend) or 'model' (service)
                role = msg.get('role', '').lower()
                if role in ['model', 'assistant']:
                    last_bot_msg = str(msg.get('content', '')).lower()
                    break
            
            if last_bot_msg:
                print(f"DEBUG: Last Bot Message: '{last_bot_msg[:50]}...'")
                if "weather conditions" in last_bot_msg or "specific advice" in last_bot_msg:
                    # Look for the topic in the entire history
                    topic = None
                    for msg in reversed(history):
                        text = str(msg.get('content', '')).lower()
                        if 'irrigation' in text: topic = 'irrigation'
                        elif any(w in text for w in ['spray', 'pesticide', 'insecticide', 'foliar']): topic = 'spraying'
                        elif 'harvest' in text: topic = 'harvesting'
                        if topic: break
                    
                    if topic:
                        print(f"🔄 State Recovery: Confirmed {topic}")
                        return self._get_weather_advisory(topic, location)
                    else:
                        print("DEBUG: Confirmation detected but no topic found in history.")
                        # Provide helpful guidance instead of falling through
                        return ("I'd be happy to provide weather-specific advice! Please let me know what you'd like advice about:\n\n"
                                "- **Irrigation**: Should I water my crops today?\n"
                                "- **Spraying**: Is it safe to spray pesticides?\n"
                                "- **Harvesting**: Is it a good time to harvest?\n\n"
                                "Just ask me about any of these topics!")

        # --- PRIORITY 1: Intelligent Greetings & Definitions ---
        
        # Specific search for "What is" or "Define"
        # We also check if the query is JUST the keyword from our glossary
        is_asking_definition = any(trigger in query for trigger in ["what is", "define", "what means", "definition of", "meaning of"]) or (len(query.split()) < 3 and any(k == query for k in self.glossary))
        
        if is_asking_definition:
            for term, definition in self.glossary.items():
                if term in query:
                    return f"### Definition: {term.title()}\n{definition}\n\nWould you like me to check the specific advice for your current weather conditions regarding this?"

        # Exact Greetings (only if short and clear)
        if query in ['hi', 'hello', 'hey', 'greetings', 'hello expert']:
            return "Greetings! I am **AgroMind Expert**, your advanced agricultural logic engine. I'm here to provide scientific advice on crop health, soil optimization, and government support. How can I assist your farm today?"

        if "who are you" in query and "what is" not in query:
            return ("I am a specialized AI trained on your farm's data and expert agricultural databases. I can:\n"
                    "- **Identify Diseases**: Upload a leaf photo, and I'll analyze it.\n"
                    "- **Recommend Fertilizers**: I can calculate exact NPK needs.\n"
                    "- **Weather Guidance**: I provide advisories based on real-time forecasts.\n"
                    "- **Government Schemes**: I can find subsidies like PM-KISAN or Crop Insurance.")

        # --- INPUT VALIDATION: Detect unclear/nonsensical messages ---
        # Check for very short messages with no meaningful words
        words = query.split()
        if len(words) == 1 and len(words[0]) <= 3:
            # Single word with 3 or fewer characters (like "ww", "aa", "xyz")
            # Check if it's not a common abbreviation or valid short word (case-insensitive)
            common_short_words = ['hi', 'hey', 'yes', 'no', 'ok', 'bye', 'why', 'how', 'who', 'what', 'when', 'where']
            if words[0].lower() not in common_short_words:
                return ("I'm sorry, I couldn't understand that message. 🤔\n\n"
                        "Could you please rephrase your question? I'm here to help with:\n"
                        "- Crop diseases and treatments\n"
                        "- Fertilizer recommendations\n"
                        "- Weather-based farming advice\n"
                        "- Government schemes and subsidies")
        
        # Check for repeated characters (like "wwww", "aaaa")
        if len(query) >= 3 and len(set(query.replace(' ', ''))) == 1:
            return ("I'm sorry, I couldn't understand that message. 🤔\n\n"
                    "Could you please ask a clear question about farming? I'm here to help!")

        # --- PRIORITY 2: ML BRAIN (Try to find intent before hardcoded rules) ---
        if self.model and not is_confirmation: # Skip ML for simple "yes"
            try:
                intent_tag = self.model.predict([query])[0]
                probs = self.model.predict_proba([query])[0]
                max_prob = np.max(probs)
                
                if max_prob > 0.4:
                    print(f"🤖 ML Intent: {intent_tag} ({max_prob:.2f})")
                    for intent in self.chat_data.get('intents', []):
                        if intent['tag'] == intent_tag:
                            # Safety check: if it's a greeting but query looks technical, skip
                            if intent_tag in ['identity', 'general_greetings'] and len(query.split()) > 2:
                                continue
                            return random.choice(intent['responses'])
            except Exception as e:
                print(f"ML Prediction Error: {e}")

        # --- PRIORITY 3: Specific Agricultural Tasks (Advice) ---
        # Only trigger if NOT already handled by definition logic
        is_irrigation = any(word in query for word in ['irrigation', 'water', 'watering'])
        is_spraying = any(word in query for word in ['spray', 'pesticide', 'insecticide', 'foliar'])
        is_harvesting = any(word in query for word in ['harvest', 'cutting'])
        
        if (is_irrigation or is_spraying or is_harvesting):
            topic = 'irrigation' if is_irrigation else ('spraying' if is_spraying else 'harvesting')
            # If it's a definition question, we already handled it above.
            # If not, give advisory.
            if not is_asking_definition:
                return self._get_weather_advisory(topic, location)

        # --- PRIORITY 4: Fertilizer Deep-Dive ---
        if any(word in query for word in ['fertilizer', 'urea', 'dap', 'npk', 'potash', 'nutrient']):
            for fert, info in self.fertilizer_info.items():
                if fert.lower() in query:
                    return (f"### {info.get('full_name', fert)}\n"
                            f"**Description**: {info.get('description', '')}\n\n"
                            f"**Composition**: N:{info['composition']['N']}% P:{info['composition']['P']}% K:{info['composition']['K']}%\n\n"
                            f"**Application Tips**:\n" + 
                            "\n".join([f"- {m}" for m in info.get('application_method', [])[:2]]) + 
                            f"\n\n**Warning**: {random.choice(info.get('precautions', ['Apply with gloves.']))}")
            
            return "I have detailed records for **Urea**, **DAP**, **NPK 10-26-26**, **MOP**, and **SSP**. Which specific fertilizer should we discuss for your crops?"

        # --- PRIORITY 5: Final Fallbacks ---
        if any(word in query for word in ['disease', 'sick', 'blight', 'spot', 'rot', 'fungus']):
            return ("For disease identification, please **upload a leaf photo** in the Disease Detection section. I will then use our vision model to identify the pathogen.")

        if any(word in query for word in ['scheme', 'government', 'money', 'subsidy']):
            return "You can find all government support links in our **Schemes** page."

        if any(word in query for word in ['date', 'day', 'time', 'today']):
            now = datetime.now()
            return f"Today is **{now.strftime('%A, %B %d, %Y')}**, time is **{now.strftime('%I:%M %p')}**."

        # Support for "Show crop status" command (Phase 1)
        if "show crop status" in query or "crop status" in query:
            return "Based on your latest records, your **Tomato** crops are in the 'Vegetative' stage. Soil health is good, but keep an eye on phosphorus levels."

        # --- PRIORITY 5: RAG & LLM Integration ---
        print("🧠 Routing to RAG + LLM Brain...")
        context_data = rag_engine.query(query)
        return llm_handler.generate_response(user_query, context=context_data, history=history)

    def _get_weather_advisory(self, topic, location):
        """Helper to fetch weather advisory from ML modules"""
        try:
            weather_data, lat, lon = weather_service.get_weather_by_city(location)
            forecast = weather_service.get_forecast(lat, lon, days=5)
            advisory = farming_advisory.generate_advisory(forecast)
            
            if topic == 'irrigation':
                adv = advisory['irrigation']
                return f"### Irrigation Advice for {location}\n**Status**: {adv['status']}\n\n**Scientific Recommendation**:\n" + "\n".join([f"- {p}" for p in adv['points']])
            
            if topic == 'spraying':
                adv = advisory['spraying']
                return f"### Pesticide Spraying Advice for {location}\n**Status**: {adv['status']}\n\n**Scientific Recommendation**:\n" + "\n".join([f"- {p}" for p in adv['points']])
            
            if topic == 'harvesting':
                adv = advisory['harvesting']
                return f"### Harvesting Advice for {location}\n**Status**: {adv['status']}\n\n**Scientific Recommendation**:\n" + "\n".join([f"- {p}" for p in adv['points']])
        except Exception as e:
            print(f"Advisory Error: {e}")
            if topic == 'irrigation': return "Generally, it is safe to irrigate in the early morning or late evening. Ensure the soil is not already waterlogged."
            if topic == 'spraying': return "Avoid spraying pesticides if winds are above 15 km/h or if rain is expected within the next 4-6 hours."
            if topic == 'harvesting': return "Harvesting is best done when the crop is at peak maturity and the weather is dry to prevent fungal spoilage."
        return "I'm unable to access weather data for that location right now. Please try again later."

# Global instance
expert = AgroMindExpert()
