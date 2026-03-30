"""
Fertilizer Recommendation - Fast Training with Good Accuracy
Optimized for speed while maintaining high accuracy (97-99%)
"""

import sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, callbacks
import joblib
import json

print("="*70)
print("FERTILIZER RECOMMENDATION - FAST TRAINING")
print("="*70)

# Configuration
DATASET_PATH = 'datasets/fertilizer/fertilizer.csv'
MODEL_PATH = 'fertilizer_model.pkl'
MODEL_NN_PATH = 'fertilizer_model_nn.keras'
ENCODERS_PATH = 'fertilizer_encoders.pkl'
SCALER_PATH = 'fertilizer_scaler.pkl'
FERTILIZER_INFO_PATH = 'fertilizer_info.json'

# Step 1: Load Dataset
print("\n📁 Step 1: Loading Dataset...")
df = pd.read_csv(DATASET_PATH)
print(f"✅ Dataset loaded: {len(df)} records")

# Step 2: Feature Engineering
print("\n🔧 Step 2: Feature Engineering...")
X = df.drop('Fertilizer Name', axis=1).copy()
y = df['Fertilizer Name']

# Create interaction features
X['N_P_ratio'] = X['Nitrogen'] / (X['Phosphorous'] + 1)
X['N_K_ratio'] = X['Nitrogen'] / (X['Potassium'] + 1)
X['P_K_ratio'] = X['Phosphorous'] / (X['Potassium'] + 1)
X['NPK_sum'] = X['Nitrogen'] + X['Phosphorous'] + X['Potassium']
X['Temp_Humidity'] = X['Temperature'] * X['Humidity'] / 100
X['Moisture_Humidity'] = X['Moisture'] * X['Humidity'] / 100

print(f"   Added 6 engineered features")
print(f"   Total features: {X.shape[1]}")

# Encode categorical features
label_encoders = {}
for col in ['Soil Type', 'Crop Type']:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col])
    label_encoders[col] = le
    print(f"   Encoded {col}: {len(le.classes_)} classes")

# Encode target
le_fertilizer = LabelEncoder()
y_encoded = le_fertilizer.fit_transform(y)
label_encoders['Fertilizer Name'] = le_fertilizer
print(f"   Encoded Fertilizer Name: {len(le_fertilizer.classes_)} classes")

# Normalize features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Step 3: Split Data
print("\n📊 Step 3: Splitting Data...")
X_temp, X_test, y_temp, y_test = train_test_split(
    X, y_encoded, test_size=0.15, random_state=42, stratify=y_encoded
)
X_train, X_val, y_train, y_val = train_test_split(
    X_temp, y_temp, test_size=0.176, random_state=42, stratify=y_temp
)

# Scaled versions
X_temp_scaled, X_test_scaled, _, _ = train_test_split(
    X_scaled, y_encoded, test_size=0.15, random_state=42, stratify=y_encoded
)
X_train_scaled, X_val_scaled, _, _ = train_test_split(
    X_temp_scaled, y_temp, test_size=0.176, random_state=42, stratify=y_temp
)

print(f"   Training: {len(X_train)}")
print(f"   Validation: {len(X_val)}")
print(f"   Test: {len(X_test)}")

# Step 4: Train Random Forest (with good parameters, no tuning)
print("\n🌲 Step 4: Training Random Forest...")
rf_model = RandomForestClassifier(
    n_estimators=500,
    max_depth=40,
    min_samples_split=2,
    min_samples_leaf=1,
    max_features='sqrt',
    random_state=42,
    n_jobs=-1,
    verbose=1
)
rf_model.fit(X_train, y_train)

rf_train_acc = accuracy_score(y_train, rf_model.predict(X_train))
rf_val_acc = accuracy_score(y_val, rf_model.predict(X_val))
rf_test_acc = accuracy_score(y_test, rf_model.predict(X_test))

print(f"   Training Accuracy: {rf_train_acc*100:.2f}%")
print(f"   Validation Accuracy: {rf_val_acc*100:.2f}%")
print(f"   Test Accuracy: {rf_test_acc*100:.2f}%")

# Step 5: Train Neural Network
print("\n🧠 Step 5: Training Neural Network...")

nn_model = keras.Sequential([
    layers.Input(shape=(X_train_scaled.shape[1],)),
    
    # First block
    layers.Dense(512, activation='relu', kernel_regularizer=keras.regularizers.l2(0.001)),
    layers.BatchNormalization(),
    layers.Dropout(0.4),
    
    # Second block
    layers.Dense(256, activation='relu', kernel_regularizer=keras.regularizers.l2(0.001)),
    layers.BatchNormalization(),
    layers.Dropout(0.4),
    
    # Third block
    layers.Dense(128, activation='relu', kernel_regularizer=keras.regularizers.l2(0.001)),
    layers.BatchNormalization(),
    layers.Dropout(0.3),
    
    # Fourth block
    layers.Dense(64, activation='relu', kernel_regularizer=keras.regularizers.l2(0.001)),
    layers.BatchNormalization(),
    layers.Dropout(0.3),
    
    # Fifth block
    layers.Dense(32, activation='relu'),
    layers.Dropout(0.2),
    
    # Output
    layers.Dense(len(le_fertilizer.classes_), activation='softmax')
])

nn_model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.001),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

nn_callbacks = [
    callbacks.EarlyStopping(
        monitor='val_accuracy',
        patience=15,
        restore_best_weights=True,
        verbose=1
    ),
    callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=5,
        verbose=1,
        min_lr=0.00001
    )
]

print("   Training with up to 100 epochs (early stopping enabled)...")
history = nn_model.fit(
    X_train_scaled, y_train,
    validation_data=(X_val_scaled, y_val),
    epochs=100,
    batch_size=64,
    callbacks=nn_callbacks,
    verbose=1
)

nn_train_loss, nn_train_acc = nn_model.evaluate(X_train_scaled, y_train, verbose=0)
nn_val_loss, nn_val_acc = nn_model.evaluate(X_val_scaled, y_val, verbose=0)
nn_test_loss, nn_test_acc = nn_model.evaluate(X_test_scaled, y_test, verbose=0)

print(f"   Training Accuracy: {nn_train_acc*100:.2f}%")
print(f"   Validation Accuracy: {nn_val_acc*100:.2f}%")
print(f"   Test Accuracy: {nn_test_acc*100:.2f}%")
print(f"   Epochs trained: {len(history.history['loss'])}")

# Step 6: Select Best Model
print("\n🏆 Step 6: Selecting Best Model...")

models_performance = {
    'Random Forest': rf_test_acc,
    'Neural Network': nn_test_acc
}

best_model_name = max(models_performance, key=models_performance.get)
best_accuracy = models_performance[best_model_name]

print(f"\n   Model Performance Summary:")
for name, acc in sorted(models_performance.items(), key=lambda x: x[1], reverse=True):
    marker = "🏆" if name == best_model_name else "  "
    print(f"   {marker} {name}: {acc*100:.2f}%")

# Select best model
if best_model_name == 'Random Forest':
    best_model = rf_model
else:
    best_model = None

print(f"\n   ✅ Best Model: {best_model_name} ({best_accuracy*100:.2f}%)")

# Step 7: Detailed Evaluation
print("\n📈 Step 7: Detailed Evaluation...")

if best_model_name == 'Neural Network':
    y_pred = np.argmax(nn_model.predict(X_test_scaled, verbose=0), axis=1)
else:
    y_pred = best_model.predict(X_test)

print("\n📋 Classification Report (Test Set):")
print(classification_report(
    y_test, y_pred,
    target_names=le_fertilizer.classes_,
    zero_division=0
))

# Step 8: Save Models
print("\n💾 Step 8: Saving Models...")

if best_model is not None:
    joblib.dump(best_model, MODEL_PATH)
    print(f"✅ Best ML Model ({best_model_name}) saved to: {MODEL_PATH}")

nn_model.save(MODEL_NN_PATH)
print(f"✅ Neural Network saved to: {MODEL_NN_PATH}")

joblib.dump(label_encoders, ENCODERS_PATH)
joblib.dump(scaler, SCALER_PATH)
print(f"✅ Encoders saved to: {ENCODERS_PATH}")
print(f"✅ Scaler saved to: {SCALER_PATH}")

# Update fertilizer info
fertilizer_info = {
    'Urea': {'code': '46-0-0', 'composition': {'N': 46, 'P': 0, 'K': 0}, 'application_rate_per_acre': 50, 'cost_per_kg': 6, 'description': 'High nitrogen content, ideal for leafy growth'},
    'DAP': {'code': '18-46-0', 'composition': {'N': 18, 'P': 46, 'K': 0}, 'application_rate_per_acre': 50, 'cost_per_kg': 28, 'description': 'High phosphorus for root development and flowering'},
    '10-26-26': {'code': '10-26-26', 'composition': {'N': 10, 'P': 26, 'K': 26}, 'application_rate_per_acre': 60, 'cost_per_kg': 25, 'description': 'Balanced P-K for fruiting and flowering crops'},
    '14-35-14': {'code': '14-35-14', 'composition': {'N': 14, 'P': 35, 'K': 14}, 'application_rate_per_acre': 55, 'cost_per_kg': 30, 'description': 'High phosphorus for early growth stages'},
    '17-17-17': {'code': '17-17-17', 'composition': {'N': 17, 'P': 17, 'K': 17}, 'application_rate_per_acre': 50, 'cost_per_kg': 22, 'description': 'Balanced NPK for general purpose use'},
    '20-20': {'code': '20-20-0', 'composition': {'N': 20, 'P': 20, 'K': 0}, 'application_rate_per_acre': 45, 'cost_per_kg': 20, 'description': 'Balanced N-P for vegetative growth'},
    '28-28': {'code': '28-28-0', 'composition': {'N': 28, 'P': 28, 'K': 0}, 'application_rate_per_acre': 40, 'cost_per_kg': 35, 'description': 'High N-P for intensive farming'},
    'MOP': {'code': '0-0-60', 'composition': {'N': 0, 'P': 0, 'K': 60}, 'application_rate_per_acre': 40, 'cost_per_kg': 18, 'description': 'Muriate of Potash - High potassium for fruit quality'},
    'SSP': {'code': '0-16-0', 'composition': {'N': 0, 'P': 16, 'K': 0}, 'application_rate_per_acre': 50, 'cost_per_kg': 8, 'description': 'Single Super Phosphate - Phosphorus source'},
    'Ammonium Sulphate': {'code': '21-0-0', 'composition': {'N': 21, 'P': 0, 'K': 0}, 'application_rate_per_acre': 45, 'cost_per_kg': 7, 'description': 'Nitrogen source with sulfur'}
}

with open(FERTILIZER_INFO_PATH, 'w') as f:
    json.dump(fertilizer_info, f, indent=2)
print(f"✅ Fertilizer info saved to: {FERTILIZER_INFO_PATH}")

# Save metadata
metadata = {
    'best_model': best_model_name,
    'test_accuracy': float(best_accuracy),
    'models': {
        'random_forest': float(rf_test_acc),
        'neural_network': float(nn_test_acc)
    },
    'num_classes': len(le_fertilizer.classes_),
    'fertilizers': list(le_fertilizer.classes_),
    'features': list(X.columns),
    'num_features': X.shape[1],
    'feature_engineering': True,
    'hyperparameter_tuning': False,
    'soil_types': list(label_encoders['Soil Type'].classes_),
    'crop_types': list(label_encoders['Crop Type'].classes_)
}

with open('fertilizer_model_metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)
print(f"✅ Model metadata saved")

# Final Summary
print("\n" + "="*70)
print("✅ FAST TRAINING COMPLETE!")
print("="*70)
print(f"📊 Final Model Performance:")
print(f"   Best Model: {best_model_name}")
print(f"   Test Accuracy: {best_accuracy*100:.2f}%")
print(f"\n🎯 Target: 97%+ accuracy")
if best_accuracy >= 0.99:
    print("   ✅ EXCELLENT! 99%+ achieved!")
elif best_accuracy >= 0.97:
    print(f"   ✅ TARGET ACHIEVED! {best_accuracy*100:.2f}%")
else:
    print(f"   ℹ️ Current: {best_accuracy*100:.2f}%")

print(f"\n🔧 Techniques Used:")
print(f"   ✅ Feature Engineering (6 new features)")
print(f"   ✅ Random Forest (500 trees)")
print(f"   ✅ Deep Neural Network (512-256-128-64-32)")
print(f"   ✅ Early Stopping & Learning Rate Reduction")

print(f"\n📁 Saved Files:")
print(f"   - {MODEL_PATH}")
print(f"   - {MODEL_NN_PATH}")
print(f"   - {ENCODERS_PATH}")
print(f"   - {SCALER_PATH}")
print(f"   - {FERTILIZER_INFO_PATH}")
print("="*70)
