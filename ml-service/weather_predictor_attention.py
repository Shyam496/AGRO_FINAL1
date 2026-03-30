"""
LSTM-Attention Weather Predictor
Advanced deep learning model for weather prediction with attention mechanism
Target: 90-95% accuracy
"""

import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
import joblib
import os

class AttentionLayer(layers.Layer):
    """Custom Attention Layer for focusing on important time steps"""
    
    def __init__(self, **kwargs):
        super(AttentionLayer, self).__init__(**kwargs)
    
    def build(self, input_shape):
        self.W = self.add_weight(
            name='attention_weight',
            shape=(input_shape[-1], input_shape[-1]),
            initializer='glorot_uniform',
            trainable=True
        )
        self.b = self.add_weight(
            name='attention_bias',
            shape=(input_shape[-1],),
            initializer='zeros',
            trainable=True
        )
        super(AttentionLayer, self).build(input_shape)
    
    def call(self, inputs):
        # Calculate attention scores
        score = tf.nn.tanh(tf.matmul(inputs, self.W) + self.b)
        attention_weights = tf.nn.softmax(score, axis=1)
        
        # Apply attention weights
        context_vector = attention_weights * inputs
        context_vector = tf.reduce_sum(context_vector, axis=1)
        
        return context_vector


class WeatherPredictorAttention:
    def __init__(self, sequence_length=30, n_features=8, n_predictions=7):
        """
        Initialize LSTM-Attention weather predictor
        
        Args:
            sequence_length: Number of past days to use (default: 30)
            n_features: Number of input features (default: 8)
            n_predictions: Number of days to predict (default: 7)
        """
        self.sequence_length = sequence_length
        self.n_features = n_features
        self.n_predictions = n_predictions
        self.model = None
        self.scaler = MinMaxScaler()
        
    def build_model(self):
        """Build LSTM-Attention model architecture"""
        
        print("\n🏗️  Building LSTM-Attention Model...")
        print(f"   Input: {self.sequence_length} days × {self.n_features} features")
        print(f"   Output: {self.n_predictions} days × 5 predictions")
        
        # Input layer
        inputs = layers.Input(shape=(self.sequence_length, self.n_features))
        
        # First LSTM layer - captures temporal patterns
        lstm1 = layers.LSTM(128, return_sequences=True)(inputs)
        lstm1 = layers.Dropout(0.2)(lstm1)
        
        # Attention layer - focuses on important days
        attention = AttentionLayer()(lstm1)
        attention = layers.Reshape((1, 128))(attention)
        
        # Second LSTM layer - refines predictions
        lstm2 = layers.LSTM(64, return_sequences=False)(attention)
        lstm2 = layers.Dropout(0.2)(lstm2)
        
        # Dense layers for final predictions
        dense1 = layers.Dense(128, activation='relu')(lstm2)
        dense1 = layers.Dropout(0.1)(dense1)
        
        # Output layer: 7 days × 5 features (temp, rainfall, humidity, pressure, wind)
        outputs = layers.Dense(self.n_predictions * 5)(dense1)
        outputs = layers.Reshape((self.n_predictions, 5))(outputs)
        
        # Create model
        self.model = keras.Model(inputs=inputs, outputs=outputs)
        
        # Compile with Adam optimizer
        self.model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae']
        )
        
        print("\n✅ Model Architecture:")
        self.model.summary()
        
        return self.model
    
    def prepare_data(self, df):
        """
        Prepare data for training
        
        Args:
            df: DataFrame with weather data
            
        Returns:
            X, y: Training data
        """
        print("\n📊 Preparing training data...")
        
        # Select features
        feature_cols = ['temperature', 'humidity', 'pressure', 'wind_speed', 
                       'cloudiness', 'rainfall', 'lat', 'lon']
        
        # Ensure all columns exist
        for col in feature_cols:
            if col not in df.columns:
                df[col] = 0
        
        data = df[feature_cols].values
        
        # Normalize data
        data_scaled = self.scaler.fit_transform(data)
        
        # Create sequences
        X, y = [], []
        
        for i in range(len(data_scaled) - self.sequence_length - self.n_predictions):
            # Input: past 30 days
            X.append(data_scaled[i:i + self.sequence_length])
            
            # Output: next 7 days (only first 5 features)
            y.append(data_scaled[i + self.sequence_length:i + self.sequence_length + self.n_predictions, :5])
        
        X = np.array(X)
        y = np.array(y)
        
        print(f"✅ Created {len(X)} training samples")
        print(f"   X shape: {X.shape}")
        print(f"   y shape: {y.shape}")
        
        return X, y
    
    def train(self, df, epochs=50, batch_size=32, validation_split=0.2):
        """
        Train the model
        
        Args:
            df: DataFrame with historical weather data
            epochs: Number of training epochs
            batch_size: Batch size
            validation_split: Validation data split
        """
        print(f"\n{'='*60}")
        print("🎓 TRAINING LSTM-ATTENTION MODEL")
        print(f"{'='*60}\n")
        
        # Prepare data
        X, y = self.prepare_data(df)
        
        # Split into train and validation
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=validation_split, shuffle=False
        )
        
        print(f"\n📈 Training set: {len(X_train)} samples")
        print(f"📊 Validation set: {len(X_val)} samples")
        
        # Build model if not already built
        if self.model is None:
            self.build_model()
        
        # Callbacks
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=0.00001
            )
        ]
        
        # Train model
        print(f"\n🚀 Starting training for {epochs} epochs...")
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=1
        )
        
        # Evaluate
        train_loss, train_mae = self.model.evaluate(X_train, y_train, verbose=0)
        val_loss, val_mae = self.model.evaluate(X_val, y_val, verbose=0)
        
        print(f"\n{'='*60}")
        print("✅ TRAINING COMPLETE")
        print(f"{'='*60}")
        print(f"📊 Training MAE: {train_mae:.4f}")
        print(f"📊 Validation MAE: {val_mae:.4f}")
        print(f"🎯 Estimated Accuracy: {(1 - val_mae) * 100:.1f}%")
        print(f"{'='*60}\n")
        
        return history
    
    def predict(self, recent_data):
        """
        Make weather predictions
        
        Args:
            recent_data: Recent weather data (last 30 days)
            
        Returns:
            predictions: 7-day forecast
        """
        # Ensure correct shape
        if len(recent_data) < self.sequence_length:
            raise ValueError(f"Need at least {self.sequence_length} days of data")
        
        # Take last 30 days
        recent_data = recent_data[-self.sequence_length:]
        
        # Scale data
        scaled_data = self.scaler.transform(recent_data)
        
        # Reshape for model
        X = scaled_data.reshape(1, self.sequence_length, self.n_features)
        
        # Predict
        predictions_scaled = self.model.predict(X, verbose=0)[0]
        
        # Inverse transform (only first 5 features)
        predictions = np.zeros((self.n_predictions, self.n_features))
        predictions[:, :5] = predictions_scaled
        predictions = self.scaler.inverse_transform(predictions)
        
        return predictions[:, :5]  # Return only predicted features
    
    def save(self, model_path='models/weather_lstm_attention.h5', 
             scaler_path='models/weather_scaler.pkl'):
        """Save model and scaler"""
        os.makedirs('models', exist_ok=True)
        
        self.model.save(model_path)
        joblib.dump(self.scaler, scaler_path)
        
        print(f"✅ Model saved to: {model_path}")
        print(f"✅ Scaler saved to: {scaler_path}")
    
    def load(self, model_path='models/weather_lstm_attention.h5',
             scaler_path='models/weather_scaler.pkl'):
        """Load model and scaler"""
        self.model = keras.models.load_model(
            model_path,
            custom_objects={'AttentionLayer': AttentionLayer}
        )
        self.scaler = joblib.load(scaler_path)
        
        print(f"✅ Model loaded from: {model_path}")
        print(f"✅ Scaler loaded from: {scaler_path}")


def main():
    """Main function to train the model"""
    
    # Load data
    data_file = 'datasets/weather/weather_historical.csv'
    
    if not os.path.exists(data_file):
        print(f"❌ Data file not found: {data_file}")
        print("   Run: python collect_weather_data_advanced.py first")
        return
    
    print(f"📂 Loading data from: {data_file}")
    df = pd.read_csv(data_file)
    print(f"✅ Loaded {len(df)} records")
    
    # Initialize model
    predictor = WeatherPredictorAttention(
        sequence_length=30,
        n_features=8,
        n_predictions=7
    )
    
    # Train model
    history = predictor.train(df, epochs=50, batch_size=32)
    
    # Save model
    predictor.save()
    
    print("\n🎉 Model training complete!")
    print("   Next: Run error_corrector.py to train XGBoost")


if __name__ == '__main__':
    main()
