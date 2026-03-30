"""
Plant Validator Model Training Script
Trains a binary classifier to distinguish plant/crop images from non-plant images
"""

import os
import sys
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path
from datetime import datetime

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import (
    ModelCheckpoint, EarlyStopping, ReduceLROnPlateau,
    TensorBoard, CSVLogger
)

# Configuration
BASE_DIR = Path(__file__).parent
DATASET_DIR = BASE_DIR / 'datasets' / 'plant_validator'
MODEL_SAVE_PATH = BASE_DIR / 'plant_validator_model.keras'
LOGS_DIR = BASE_DIR / 'training_logs'

# Training hyperparameters
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 30
LEARNING_RATE = 0.001
VALIDATION_SPLIT = 0.2

# Model architecture parameters
DROPOUT_RATE = 0.5
DENSE_UNITS = 128

def create_model(input_shape=(224, 224, 3)):
    """
    Create binary classification model using MobileNetV2 as base
    
    Architecture:
    - Base: MobileNetV2 (pre-trained on ImageNet)
    - Custom head: GlobalAveragePooling → Dense(128) → Dropout(0.5) → Dense(1, sigmoid)
    """
    print("Building model architecture...")
    
    # Load pre-trained MobileNetV2 (without top layers)
    base_model = MobileNetV2(
        input_shape=input_shape,
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze base model layers initially
    base_model.trainable = False
    
    # Build custom classification head
    model = keras.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dense(DENSE_UNITS, activation='relu', name='dense_1'),
        layers.Dropout(DROPOUT_RATE, name='dropout'),
        layers.Dense(1, activation='sigmoid', name='output')
    ], name='plant_validator')
    
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss='binary_crossentropy',
        metrics=[
            'accuracy',
            keras.metrics.Precision(name='precision'),
            keras.metrics.Recall(name='recall'),
            keras.metrics.AUC(name='auc')
        ]
    )
    
    
    print("Model created successfully!")
    print(f"\nModel Summary:")
    model.build(input_shape=(None, *input_shape))
    print(f"   Total parameters: {model.count_params():,}")
    print(f"   Trainable parameters: {sum([tf.size(w).numpy() for w in model.trainable_weights]):,}")
    
    
    return model, base_model

def create_data_generators():
    """Create data generators with augmentation"""
    print("\nCreating data generators...")
    
    # Training data augmentation
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest'
    )
    
    # Validation data (no augmentation, only rescaling)
    val_datagen = ImageDataGenerator(rescale=1./255)
    
    # Load training data
    train_generator = train_datagen.flow_from_directory(
        DATASET_DIR / 'train',
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='binary',
        shuffle=True,
        seed=42
    )
    
    # Load validation data
    val_generator = val_datagen.flow_from_directory(
        DATASET_DIR / 'validation',
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='binary',
        shuffle=False
    )
    
    # Load test data
    test_generator = val_datagen.flow_from_directory(
        DATASET_DIR / 'test',
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='binary',
        shuffle=False
    )
    
    print(f"Data generators created!")
    print(f"\nDataset Statistics:")
    print(f"   Training samples:   {train_generator.samples:,}")
    print(f"   Validation samples: {val_generator.samples:,}")
    print(f"   Test samples:       {test_generator.samples:,}")
    print(f"   Classes: {train_generator.class_indices}")
    
    return train_generator, val_generator, test_generator

def create_callbacks():
    """Create training callbacks"""
    print("\nSetting up callbacks...")
    
    # Create logs directory
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_dir = LOGS_DIR / timestamp
    log_dir.mkdir(parents=True, exist_ok=True)
    
    callbacks = [
        # Save best model
        ModelCheckpoint(
            filepath=str(MODEL_SAVE_PATH),
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=1
        ),
        
        # Early stopping
        EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True,
            verbose=1
        ),
        
        # Reduce learning rate on plateau
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            min_lr=1e-7,
            verbose=1
        ),
        
        # TensorBoard logging
        TensorBoard(
            log_dir=str(log_dir),
            histogram_freq=1
        ),
        
        # CSV logging
        CSVLogger(
            filename=str(log_dir / 'training_log.csv'),
            separator=',',
            append=False
        )
    ]
    
    print(f"Callbacks configured!")
    print(f"   Logs directory: {log_dir}")
    
    return callbacks

def plot_training_history(history, save_path):
    """Plot and save training history"""
    print("\nPlotting training history...")
    
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    
    # Accuracy
    axes[0, 0].plot(history.history['accuracy'], label='Train')
    axes[0, 0].plot(history.history['val_accuracy'], label='Validation')
    axes[0, 0].set_title('Model Accuracy')
    axes[0, 0].set_xlabel('Epoch')
    axes[0, 0].set_ylabel('Accuracy')
    axes[0, 0].legend()
    axes[0, 0].grid(True)
    
    # Loss
    axes[0, 1].plot(history.history['loss'], label='Train')
    axes[0, 1].plot(history.history['val_loss'], label='Validation')
    axes[0, 1].set_title('Model Loss')
    axes[0, 1].set_xlabel('Epoch')
    axes[0, 1].set_ylabel('Loss')
    axes[0, 1].legend()
    axes[0, 1].grid(True)
    
    # Precision
    axes[1, 0].plot(history.history['precision'], label='Train')
    axes[1, 0].plot(history.history['val_precision'], label='Validation')
    axes[1, 0].set_title('Model Precision')
    axes[1, 0].set_xlabel('Epoch')
    axes[1, 0].set_ylabel('Precision')
    axes[1, 0].legend()
    axes[1, 0].grid(True)
    
    # Recall
    axes[1, 1].plot(history.history['recall'], label='Train')
    axes[1, 1].plot(history.history['val_recall'], label='Validation')
    axes[1, 1].set_title('Model Recall')
    axes[1, 1].set_xlabel('Epoch')
    axes[1, 1].set_ylabel('Recall')
    axes[1, 1].legend()
    axes[1, 1].grid(True)
    
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"Training history saved to: {save_path}")

def evaluate_model(model, test_generator):
    """Evaluate model on test set"""
    print("\nEvaluating model on test set...")
    
    results = model.evaluate(test_generator, verbose=1)
    
    print("\nTest Results:")
    print(f"   Loss:      {results[0]:.4f}")
    print(f"   Accuracy:  {results[1]:.4f} ({results[1]*100:.2f}%)")
    print(f"   Precision: {results[2]:.4f}")
    print(f"   Recall:    {results[3]:.4f}")
    print(f"   AUC:       {results[4]:.4f}")
    
    # Calculate F1 score
    precision = results[2]
    recall = results[3]
    f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    print(f"   F1 Score:  {f1_score:.4f}")
    
    return results

def fine_tune_model(model, base_model, train_gen, val_gen, callbacks):
    """Fine-tune the model by unfreezing base layers"""
    print("\nFine-tuning model...")
    
    # Unfreeze the base model
    base_model.trainable = True
    
    # Freeze early layers, fine-tune later layers
    for layer in base_model.layers[:100]:
        layer.trainable = False
    
    # Recompile with lower learning rate
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE/10),
        loss='binary_crossentropy',
        metrics=[
            'accuracy',
            keras.metrics.Precision(name='precision'),
            keras.metrics.Recall(name='recall'),
            keras.metrics.AUC(name='auc')
        ]
    )
    
    print(f"   Trainable parameters: {sum([tf.size(w).numpy() for w in model.trainable_weights]):,}")
    
    # Fine-tune for fewer epochs
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=10,
        callbacks=callbacks,
        verbose=1
    )
    
    return history

def main():
    """Main training pipeline"""
    print("\n" + "="*70)
    print("PLANT VALIDATOR MODEL - TRAINING")
    print("="*70 + "\n")
    
    # Check if dataset exists
    if not DATASET_DIR.exists():
        print("Dataset directory not found!")
        print(f"   Expected: {DATASET_DIR}")
        print("   Run: python data_collection.py first")
        sys.exit(1)
    
    # Step 1: Create data generators
    train_gen, val_gen, test_gen = create_data_generators()
    
    # Step 2: Create model
    model, base_model = create_model(input_shape=(*IMAGE_SIZE, 3))
    
    # Step 3: Setup callbacks
    callbacks = create_callbacks()
    
    # Step 4: Train model (initial training with frozen base)
    print("\n" + "="*70)
    print("PHASE 1: Initial Training (Frozen Base)")
    print("="*70 + "\n")
    
    history_1 = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS,
        callbacks=callbacks,
        verbose=1
    )
    
    # Step 5: Fine-tune model
    print("\n" + "="*70)
    print("PHASE 2: Fine-Tuning (Unfrozen Base)")
    print("="*70 + "\n")
    
    history_2 = fine_tune_model(model, base_model, train_gen, val_gen, callbacks)
    
    # Step 6: Evaluate on test set
    test_results = evaluate_model(model, test_gen)
    
    # Step 7: Plot training history
    plot_path = LOGS_DIR / f"training_history_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
    plot_training_history(history_1, plot_path)
    
    # Step 8: Save final model
    print(f"\nSaving final model to: {MODEL_SAVE_PATH}")
    model.save(MODEL_SAVE_PATH)
    
    print("\n" + "="*70)
    print("TRAINING COMPLETE!")
    print("="*70)
    print(f"\nModel saved to: {MODEL_SAVE_PATH}")
    print(f"Test Accuracy: {test_results[1]*100:.2f}%")
    print("\nNext steps:")
    print("   1. Review training logs and plots")
    print("   2. Test the model: python test_validator.py")
    print("   3. Integrate into app.py")
    print("="*70 + "\n")

if __name__ == '__main__':
    # Check GPU availability
    print("Checking GPU availability...")
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        print(f"Found {len(gpus)} GPU(s): {[gpu.name for gpu in gpus]}")
    else:
        print("No GPU found. Training will use CPU (slower)")
    
    # Set memory growth for GPU
    for gpu in gpus:
        tf.config.experimental.set_memory_growth(gpu, True)
    
    # Run training
    main()
