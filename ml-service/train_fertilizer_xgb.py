"""
FINAL OPTIMIZED Training - XGBoost for 99%+ Accuracy
Using XGBoost with optimized hyperparameters
"""

import sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import xgboost as xgb
import joblib
import json

print("="*70)
print("FERTILIZER RECOMMENDATION - XGBOOST TRAINING FOR 99%+")
print("="*70)

# Load dataset
print("\n📁 Loading Dataset...")
df = pd.read_csv('datasets/fertilizer/fertilizer.csv')
print(f"✅ Dataset loaded: {len(df):,} records")

# Preprocess
print("\n⚙️ Preprocessing...")
X = df.drop('Fertilizer Name', axis=1)
y = df['Fertilizer Name']

label_encoders = {}
for col in ['Soil Type', 'Crop Type']:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col])
    label_encoders[col] = le

le_fertilizer = LabelEncoder()
y_encoded = le_fertilizer.fit_transform(y)
label_encoders['Fertilizer Name'] = le_fertilizer

# Split
X_temp, X_test, y_temp, y_test = train_test_split(
    X, y_encoded, test_size=0.15, random_state=42, stratify=y_encoded
)
X_train, X_val, y_train, y_val = train_test_split(
    X_temp, y_temp, test_size=0.176, random_state=42, stratify=y_temp
)

print(f"   Training: {len(X_train):,}")
print(f"   Validation: {len(X_val):,}")
print(f"   Test: {len(X_test):,}")

# Train XGBoost
print("\n🚀 Training XGBoost Model...")
model = xgb.XGBClassifier(
    n_estimators=200,
    max_depth=10,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    n_jobs=-1,
    eval_metric='mlogloss'
)

model.fit(
    X_train, y_train,
    eval_set=[(X_val, y_val)],
    verbose=50
)

# Evaluate
print("\n📈 Evaluating...")
train_acc = accuracy_score(y_train, model.predict(X_train))
val_acc = accuracy_score(y_val, model.predict(X_val))
test_acc = accuracy_score(y_test, model.predict(X_test))

print(f"   Training Accuracy:   {train_acc*100:.2f}%")
print(f"   Validation Accuracy: {val_acc*100:.2f}%")
print(f"   Test Accuracy:       {test_acc*100:.2f}%")

# Classification report
y_pred = model.predict(X_test)
print("\n📋 Classification Report:")
print(classification_report(
    y_test, y_pred,
    target_names=le_fertilizer.classes_,
    zero_division=0
))

# Save
print("\n💾 Saving...")
model.save_model('fertilizer_model_xgb.json')
joblib.dump(label_encoders, 'fertilizer_encoders.pkl')

# Fertilizer info
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

with open('fertilizer_info.json', 'w') as f:
    json.dump(fertilizer_info, f, indent=2)

print("="*70)
print("✅ XGBOOST TRAINING COMPLETE!")
print("="*70)
print(f"📊 Final Test Accuracy: {test_acc*100:.2f}%")
if test_acc >= 0.99:
    print("   🎉 99%+ TARGET ACHIEVED!")
elif test_acc >= 0.95:
    print("   ✅ Excellent accuracy achieved!")
else:
    print("   ⚠️ Good accuracy, close to target")
print("="*70)
