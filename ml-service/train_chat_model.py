import json
import pickle
import numpy as np
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline

def train_model():
    base_path = os.path.dirname(__file__)
    data_path = os.path.join(base_path, 'chat_dataset.json')
    model_path = os.path.join(base_path, 'chat_intent_model.pkl')
    
    print(f"📥 Loading dataset from {data_path}...")
    with open(data_path, 'r') as f:
        data = json.load(f)
    
    X = [] # Patterns
    y = [] # Tags
    
    for intent in data['intents']:
        for pattern in intent['patterns']:
            X.append(pattern.lower())
            y.append(intent['tag'])
    
    print(f"🧪 Training on {len(X)} patterns across {len(set(y))} categories...")
    
    # Create a pipeline with TF-IDF Vectorizer and Random Forest
    text_clf = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 3), lowercase=True)), # Use 1-3 grams, keep small words
        ('clf', RandomForestClassifier(n_estimators=200, random_state=42))
    ])
    
    # Train the model
    text_clf.fit(X, y)
    
    # Save the model
    print(f"💾 Saving model to {model_path}...")
    with open(model_path, 'wb') as f:
        pickle.dump(text_clf, f)
    
    # Save the responses Mapping separately or keep in JSON
    print("✅ Training Complete!")

if __name__ == "__main__":
    train_model()
