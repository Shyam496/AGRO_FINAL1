"""
Fertilizer Recommendation Model - NEURAL NETWORK Training
This script trains a Deep Learning model for 99%+ accuracy
"""

import sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import joblib
import json

print("="*70)
print("FERTILIZER RECOMMENDATION - NEURAL NETWORK TRAINING")
print("="*70)

# Configuration
DATASET_PATH = 'datasets/fertilizer/fertilizer.csv'
MODEL_PATH = 'fertilizer_model_nn.keras'
ENCODERS_PATH = 'fertilizer_encoders.pkl'
SCALER_PATH = 'fertilizer_scaler.pkl'
FERTILIZER_INFO_PATH = 'fertilizer_info.json'

# Step 1: Load Dataset
print("\n📁 Step 1: Loading Dataset...")
df = pd.read_csv(DATASET_PATH)
print(f"✅ Dataset loaded: {len(df)} records")

# Step 2: Preprocess
print("\n⚙️ Step 2: Preprocessing...")
X = df.drop('Fertilizer Name', axis=1)
y = df['Fertilizer Name']

# Encode categorical features
label_encoders = {}
for col in ['Soil Type', 'Crop Type']:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col])
    label_encoders[col] = le

# Encode target
le_fertilizer = LabelEncoder()
y_encoded = le_fertilizer.fit_transform(y)
label_encoders['Fertilizer Name'] = le_fertilizer

# Normalize numerical features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

print(f"   Features: {X.shape[1]}")
print(f"   Classes: {len(le_fertilizer.classes_)}")

# Step 3: Split Data
print("\n📊 Step 3: Splitting Data...")
X_temp, X_test, y_temp, y_test = train_test_split(
    X_scaled, y_encoded, test_size=0.15, random_state=42, stratify=y_encoded
)
X_train, X_val, y_train, y_val = train_test_split(
    X_temp, y_temp, test_size=0.176, random_state=42, stratify=y_temp
)

print(f"   Training: {len(X_train)}")
print(f"   Validation: {len(X_val)}")
print(f"   Test: {len(X_test)}")

# Step 4: Build Neural Network
print("\n🧠 Step 4: Building Neural Network...")
model = keras.Sequential([
    layers.Input(shape=(X_train.shape[1],)),
    layers.Dense(256, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.3),
    
    layers.Dense(128, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.3),
    
    layers.Dense(64, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.2),
    
    layers.Dense(32, activation='relu'),
    layers.Dropout(0.2),
    
    layers.Dense(len(le_fertilizer.classes_), activation='softmax')
])

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.001),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

print(model.summary())

# Step 5: Train Model
print("\n🚀 Step 5: Training Neural Network...")
callbacks = [
    keras.callbacks.EarlyStopping(
        monitor='val_accuracy',
        patience=15,
        restore_best_weights=True,
        verbose=1
    ),
    keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=5,
        verbose=1,
        min_lr=0.00001
    )
]

history = model.fit(
    X_train, y_train,
    validation_data=(X_val, y_val),
    epochs=100,
    batch_size=32,
    callbacks=callbacks,
    verbose=1
)

# Step 6: Evaluate
print("\n📈 Step 6: Evaluating Model...")

# Training accuracy
train_loss, train_acc = model.evaluate(X_train, y_train, verbose=0)
print(f"   Training Accuracy: {train_acc*100:.2f}%")

# Validation accuracy
val_loss, val_acc = model.evaluate(X_val, y_val, verbose=0)
print(f"   Validation Accuracy: {val_acc*100:.2f}%")

# Test accuracy
test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
print(f"   Test Accuracy: {test_acc*100:.2f}%")

# Detailed report
y_pred = np.argmax(model.predict(X_test, verbose=0), axis=1)
print("\n📋 Classification Report:")
print(classification_report(
    y_test, y_pred,
    target_names=le_fertilizer.classes_,
    zero_division=0
))

# Step 7: Save Everything
print("\n💾 Step 7: Saving Model and Encoders...")
model.save(MODEL_PATH)
joblib.dump(label_encoders, ENCODERS_PATH)
joblib.dump(scaler, SCALER_PATH)

# Update fertilizer info
fertilizer_info = {
    'Urea': {'code': '46-0-0', 'composition': {'N': 46, 'P': 0, 'K': 0}, 'application_rate_per_acre': 50, 'cost_per_kg': 6},
    'DAP': {'code': '18-46-0', 'composition': {'N': 18, 'P': 46, 'K': 0}, 'application_rate_per_acre': 50, 'cost_per_kg': 28},
    '10-26-26': {'code': '10-26-26', 'composition': {'N': 10, 'P': 26, 'K': 26}, 'application_rate_per_acre': 60, 'cost_per_kg': 25},
    '14-35-14': {'code': '14-35-14', 'composition': {'N': 14, 'P': 35, 'K': 14}, 'application_rate_per_acre': 55, 'cost_per_kg': 30},
    '17-17-17': {'code': '17-17-17', 'composition': {'N': 17, 'P': 17, 'K': 17}, 'application_rate_per_acre': 50, 'cost_per_kg': 22},
    '20-20': {'code': '20-20-0', 'composition': {'N': 20, 'P': 20, 'K': 0}, 'application_rate_per_acre': 45, 'cost_per_kg': 20},
    '28-28': {'code': '28-28-0', 'composition': {'N': 28, 'P': 28, 'K': 0}, 'application_rate_per_acre': 40, 'cost_per_kg': 35},
    'MOP': {'code': '0-0-60', 'composition': {'N': 0, 'P': 0, 'K': 60}, 'application_rate_per_acre': 40, 'cost_per_kg': 18},
    'SSP': {'code': '0-16-0', 'composition': {'N': 0, 'P': 16, 'K': 0}, 'application_rate_per_acre': 50, 'cost_per_kg': 8},
    'Ammonium Sulphate': {'code': '21-0-0', 'composition': {'N': 21, 'P': 0, 'K': 0}, 'application_rate_per_acre': 45, 'cost_per_kg': 7}
}

with open(FERTILIZER_INFO_PATH, 'w') as f:
    json.dump(fertilizer_info, f, indent=2)

print(f"✅ Model saved to: {MODEL_PATH}")
print(f"✅ Encoders saved to: {ENCODERS_PATH}")
print(f"✅ Scaler saved to: {SCALER_PATH}")
print(f"✅ Fertilizer info saved to: {FERTILIZER_INFO_PATH}")

# Final Summary
print("\n" + "="*70)
print("✅ NEURAL NETWORK TRAINING COMPLETE!")
print("="*70)
print(f"📊 Model Performance:")
print(f"   Training Accuracy:   {train_acc*100:.2f}%")
print(f"   Validation Accuracy: {val_acc*100:.2f}%")
print(f"   Test Accuracy:       {test_acc*100:.2f}%")
print(f"\n🎯 Target: 99%+ accuracy")
if test_acc >= 0.99:
    print("   ✅ TARGET ACHIEVED!")
else:
    print(f"   ⚠️ Current: {test_acc*100:.2f}% (Close to target)")
print("="*70)
