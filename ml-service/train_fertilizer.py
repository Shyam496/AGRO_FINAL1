"""
Fertilizer Recommendation Model - Training Script
This script trains a Random Forest model for fertilizer recommendation
"""

import sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import os
import json

print("="*70)
print("FERTILIZER RECOMMENDATION MODEL - TRAINING")
print("="*70)

# Configuration
DATASET_PATH = 'datasets/fertilizer/fertilizer.csv'
MODEL_PATH = 'fertilizer_model.pkl'
ENCODERS_PATH = 'fertilizer_encoders.pkl'
FERTILIZER_INFO_PATH = 'fertilizer_info.json'

# Step 1: Load Dataset
print("\n📁 Step 1: Loading Dataset...")
try:
    df = pd.read_csv(DATASET_PATH)
    print(f"✅ Dataset loaded successfully!")
    print(f"   Rows: {len(df)}")
    print(f"   Columns: {list(df.columns)}")
except FileNotFoundError:
    print(f"❌ Dataset not found at: {DATASET_PATH}")
    print("\n📥 Please download the dataset:")
    print("   1. Go to: https://www.kaggle.com/datasets/gdabhishek/fertilizer-prediction")
    print("   2. Download fertilizer.csv")
    print(f"   3. Place it in: {DATASET_PATH}")
    exit(1)

# Step 2: Explore Dataset
print("\n🔍 Step 2: Dataset Overview...")
print(df.head())
print("\nDataset Info:")
print(df.info())
print("\nFertilizer Distribution:")
print(df['Fertilizer Name'].value_counts())

# Step 3: Preprocess Data
print("\n⚙️ Step 3: Preprocessing Data...")

# Separate features and target
X = df.drop('Fertilizer Name', axis=1)
y = df['Fertilizer Name']

# Initialize label encoders
label_encoders = {}

# Encode categorical features
categorical_columns = ['Soil Type', 'Crop Type']
for col in categorical_columns:
    if col in X.columns:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])
        label_encoders[col] = le
        print(f"   Encoded {col}: {len(le.classes_)} classes")

# Encode target variable
le_fertilizer = LabelEncoder()
y_encoded = le_fertilizer.fit_transform(y)
label_encoders['Fertilizer Name'] = le_fertilizer
print(f"   Encoded Fertilizer Name: {len(le_fertilizer.classes_)} classes")

# Step 4: Split Data
print("\n📊 Step 4: Splitting Data...")
X_temp, X_test, y_temp, y_test = train_test_split(
    X, y_encoded, test_size=0.15, random_state=42, stratify=y_encoded
)
X_train, X_val, y_train, y_val = train_test_split(
    X_temp, y_temp, test_size=0.176, random_state=42, stratify=y_temp  # 0.176 * 0.85 ≈ 0.15
)

print(f"   Training set: {len(X_train)} samples")
print(f"   Validation set: {len(X_val)} samples")
print(f"   Test set: {len(X_test)} samples")

# Step 5: Train Model
print("\n🧠 Step 5: Training Random Forest Model...")
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=20,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1,
    verbose=1
)

model.fit(X_train, y_train)
print("✅ Model training complete!")

# Step 6: Evaluate Model
print("\n📈 Step 6: Evaluating Model...")

# Training accuracy
train_pred = model.predict(X_train)
train_accuracy = accuracy_score(y_train, train_pred)
print(f"   Training Accuracy: {train_accuracy*100:.2f}%")

# Validation accuracy
val_pred = model.predict(X_val)
val_accuracy = accuracy_score(y_val, val_pred)
print(f"   Validation Accuracy: {val_accuracy*100:.2f}%")

# Test accuracy
test_pred = model.predict(X_test)
test_accuracy = accuracy_score(y_test, test_pred)
print(f"   Test Accuracy: {test_accuracy*100:.2f}%")

# Detailed classification report
print("\n📋 Classification Report (Test Set):")
print(classification_report(
    y_test, 
    test_pred, 
    target_names=le_fertilizer.classes_,
    zero_division=0
))

# Step 7: Create Fertilizer Information Database
print("\n📚 Step 7: Creating Fertilizer Information Database...")

# Common fertilizer codes and compositions
fertilizer_info = {
    'Urea': {
        'code': '46-0-0',
        'composition': {'N': 46, 'P': 0, 'K': 0},
        'application_rate_per_acre': 50,
        'cost_per_kg': 6
    },
    'DAP': {
        'code': '18-46-0',
        'composition': {'N': 18, 'P': 46, 'K': 0},
        'application_rate_per_acre': 50,
        'cost_per_kg': 28
    },
    '10-26-26': {
        'code': '10-26-26',
        'composition': {'N': 10, 'P': 26, 'K': 26},
        'application_rate_per_acre': 60,
        'cost_per_kg': 25
    },
    '14-35-14': {
        'code': '14-35-14',
        'composition': {'N': 14, 'P': 35, 'K': 14},
        'application_rate_per_acre': 55,
        'cost_per_kg': 30
    },
    '17-17-17': {
        'code': '17-17-17',
        'composition': {'N': 17, 'P': 17, 'K': 17},
        'application_rate_per_acre': 50,
        'cost_per_kg': 22
    },
    '20-20': {
        'code': '20-20-0',
        'composition': {'N': 20, 'P': 20, 'K': 0},
        'application_rate_per_acre': 45,
        'cost_per_kg': 20
    },
    '28-28': {
        'code': '28-28-0',
        'composition': {'N': 28, 'P': 28, 'K': 0},
        'application_rate_per_acre': 40,
        'cost_per_kg': 35
    }
}

# Add default values for fertilizers without specific info
for fertilizer in le_fertilizer.classes_:
    if fertilizer not in fertilizer_info:
        fertilizer_info[fertilizer] = {
            'code': None,
            'composition': {'N': 0, 'P': 0, 'K': 0},
            'application_rate_per_acre': 50,
            'cost_per_kg': 20
        }

# Save fertilizer info
with open(FERTILIZER_INFO_PATH, 'w') as f:
    json.dump(fertilizer_info, f, indent=2)
print(f"✅ Fertilizer info saved to: {FERTILIZER_INFO_PATH}")

# Step 8: Save Model and Encoders
print("\n💾 Step 8: Saving Model and Encoders...")
joblib.dump(model, MODEL_PATH)
joblib.dump(label_encoders, ENCODERS_PATH)
print(f"✅ Model saved to: {MODEL_PATH}")
print(f"✅ Encoders saved to: {ENCODERS_PATH}")

# Step 9: Feature Importance
print("\n🎯 Step 9: Feature Importance...")
feature_importance = pd.DataFrame({
    'feature': X.columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)
print(feature_importance)

# Final Summary
print("\n" + "="*70)
print("✅ TRAINING COMPLETE!")
print("="*70)
print(f"📊 Model Performance:")
print(f"   Training Accuracy:   {train_accuracy*100:.2f}%")
print(f"   Validation Accuracy: {val_accuracy*100:.2f}%")
print(f"   Test Accuracy:       {test_accuracy*100:.2f}%")
print(f"\n📁 Saved Files:")
print(f"   Model: {MODEL_PATH}")
print(f"   Encoders: {ENCODERS_PATH}")
print(f"   Fertilizer Info: {FERTILIZER_INFO_PATH}")
print(f"\n🎯 Fertilizer Classes: {len(le_fertilizer.classes_)}")
print("="*70)
