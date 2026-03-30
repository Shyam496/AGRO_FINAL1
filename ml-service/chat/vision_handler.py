import os
import tensorflow as tf
import numpy as np
from PIL import Image
import io

class VisionHandler:
    def __init__(self, disease_model, validator_model, class_names):
        self.disease_model = disease_model
        self.validator_model = validator_model
        self.class_names = class_names

    def process_image(self, image_bytes):
        """Validates and identifies disease from image bytes"""
        try:
            # 1. Load and preprocess
            img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            img_resized = img.resize((224, 224))
            img_array = tf.keras.preprocessing.image.img_to_array(img_resized)
            img_array = np.expand_dims(img_array, axis=0) / 255.0

            # 2. Validate (Is it a plant?)
            if self.validator_model:
                valid_pred = self.validator_model.predict(img_array)
                if valid_pred[0][0] < 0.5: # Assuming binary: 0=non-plant, 1=plant
                    return {
                        "is_valid": False,
                        "message": "This doesn't look like a plant or leaf. Please upload a clear photo of a crop leaf for diagnosis."
                    }

            # 3. Predict Disease
            if not self.disease_model:
                return {"error": "Disease model not loaded on server."}

            predictions = self.disease_model.predict(img_array)
            idx = np.argmax(predictions[0])
            confidence = float(predictions[0][idx])
            disease_name = self.class_names[idx]

            if confidence < 0.6:
                return {
                    "is_valid": True,
                    "message": f"I see something that might be **{disease_name}**, but I'm only {confidence*100:.1f}% sure. Could you provide a clearer photo?",
                    "disease": disease_name,
                    "confidence": confidence
                }

            return {
                "is_valid": True,
                "disease": disease_name,
                "confidence": confidence,
                "message": f"I've identified this as **{disease_name}** with {confidence*100:.1f}% confidence."
            }

        except Exception as e:
            print(f"❌ Vision Error: {e}")
            return {"error": str(e)}

# Note: This will be instantiated in chat_engine.py with models passed from app.py
