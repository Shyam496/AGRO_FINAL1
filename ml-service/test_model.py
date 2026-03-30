"""
Quick test script to verify the ML model works
"""
import os
import sys
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow import keras

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

MODEL_PATH = 'plant_disease_model.h5'

print("="*50)
print("Testing ML Model")
print("="*50)

# Check if model exists
if not os.path.exists(MODEL_PATH):
    print(f"[ERROR] Model not found at {MODEL_PATH}")
    print("Please run copy-model.bat first!")
    exit(1)

print(f"[OK] Model file found: {MODEL_PATH}")
print(f"[INFO] Model size: {os.path.getsize(MODEL_PATH) / (1024*1024):.2f} MB")

# Load model
print("\n[LOADING] Loading model...")
try:
    model = keras.models.load_model(MODEL_PATH)
    print("[OK] Model loaded successfully!")
except Exception as e:
    print(f"[ERROR] Error loading model: {e}")
    exit(1)

# Model summary
print("\n[INFO] Model Summary:")
print(f"   Input shape: {model.input_shape}")
print(f"   Output shape: {model.output_shape}")
print(f"   Total parameters: {model.count_params():,}")

# Test with a dummy image
print("\n[TEST] Testing prediction with dummy image...")
try:
    dummy_img = np.random.rand(1, 128, 128, 3).astype(np.float32)
    prediction = model.predict(dummy_img, verbose=0)
    predicted_class = np.argmax(prediction[0])
    confidence = prediction[0][predicted_class]
    
    print(f"[OK] Prediction successful!")
    print(f"   Predicted class: {predicted_class}")
    print(f"   Confidence: {confidence:.4f}")
    print(f"   Total classes: {len(prediction[0])}")
except Exception as e:
    print(f"[ERROR] Prediction failed: {e}")
    exit(1)

print("\n" + "="*50)
print("[SUCCESS] All tests passed! Model is ready to use.")
print("="*50)
print("\nNext step: Run 'python app.py' to start the ML service")
