"""
Test script for Plant Validator Model
Evaluates the trained model and generates detailed metrics
"""

import os
import sys
import io

# Fix Windows terminal encoding for emoji support
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from sklearn.metrics import (
    confusion_matrix, classification_report,
    roc_curve, auc, precision_recall_curve
)

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Configuration
BASE_DIR = Path(__file__).parent
MODEL_PATH = BASE_DIR / 'plant_validator_model.keras'
DATASET_DIR = BASE_DIR / 'datasets' / 'plant_validator'
RESULTS_DIR = BASE_DIR / 'test_results'

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32

def load_model():
    """Load the trained model"""
    print("Loading model...")
    
    if not MODEL_PATH.exists():
        print(f"Model not found: {MODEL_PATH}")
        print("   Train the model first: python train_validator.py")
        sys.exit(1)
    
    model = keras.models.load_model(MODEL_PATH)
    print(f"Model loaded from: {MODEL_PATH}\n")
    
    return model

def create_test_generator():
    """Create test data generator"""
    print("Loading test data...")
    
    test_datagen = ImageDataGenerator(rescale=1./255)
    
    test_generator = test_datagen.flow_from_directory(
        DATASET_DIR / 'test',
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='binary',
        shuffle=False
    )
    
    print(f"Test data loaded!")
    print(f"   Samples: {test_generator.samples}")
    print(f"   Classes: {test_generator.class_indices}\n")
    
    return test_generator

def plot_confusion_matrix(y_true, y_pred, class_names, save_path):
    """Plot and save confusion matrix"""
    print("Generating confusion matrix...")
    
    cm = confusion_matrix(y_true, y_pred)
    
    plt.figure(figsize=(8, 6))
    sns.heatmap(
        cm, annot=True, fmt='d', cmap='Blues',
        xticklabels=class_names,
        yticklabels=class_names
    )
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"Confusion matrix saved to: {save_path}\n")
    
    return cm

def plot_roc_curve(y_true, y_pred_proba, save_path):
    """Plot and save ROC curve"""
    print("Generating ROC curve...")
    
    fpr, tpr, thresholds = roc_curve(y_true, y_pred_proba)
    roc_auc = auc(fpr, tpr)
    
    plt.figure(figsize=(8, 6))
    plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (AUC = {roc_auc:.4f})')
    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--', label='Random')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('Receiver Operating Characteristic (ROC) Curve')
    plt.legend(loc="lower right")
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"ROC curve saved to: {save_path}\n")
    
    return roc_auc

def plot_precision_recall_curve(y_true, y_pred_proba, save_path):
    """Plot and save precision-recall curve"""
    print("Generating precision-recall curve...")
    
    precision, recall, thresholds = precision_recall_curve(y_true, y_pred_proba)
    
    plt.figure(figsize=(8, 6))
    plt.plot(recall, precision, color='blue', lw=2)
    plt.xlabel('Recall')
    plt.ylabel('Precision')
    plt.title('Precision-Recall Curve')
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"Precision-recall curve saved to: {save_path}\n")

def test_sample_images(model, test_generator, num_samples=10):
    """Test model on sample images and display results"""
    print(f"Testing on {num_samples} sample images...")
    
    # Get sample images
    x_batch, y_batch = next(test_generator)
    predictions = model.predict(x_batch[:num_samples])
    
    # Plot results
    fig, axes = plt.subplots(2, 5, figsize=(15, 6))
    axes = axes.ravel()
    
    class_names = ['Non-Plant', 'Plant']
    
    for i in range(num_samples):
        axes[i].imshow(x_batch[i])
        pred_class = 1 if predictions[i] > 0.5 else 0
        true_class = int(y_batch[i])
        confidence = predictions[i][0] if pred_class == 1 else 1 - predictions[i][0]
        
        color = 'green' if pred_class == true_class else 'red'
        axes[i].set_title(
            f"True: {class_names[true_class]}\n"
            f"Pred: {class_names[pred_class]} ({confidence:.2%})",
            color=color
        )
        axes[i].axis('off')
    
    plt.tight_layout()
    save_path = RESULTS_DIR / 'sample_predictions.png'
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"Sample predictions saved to: {save_path}\n")

def main():
    """Main testing pipeline"""
    print("\n" + "="*70)
    print("PLANT VALIDATOR MODEL - TESTING")
    print("="*70 + "\n")
    
    # Create results directory
    RESULTS_DIR.mkdir(exist_ok=True)
    
    # Load model
    model = load_model()
    
    # Load test data
    test_generator = create_test_generator()
    
    # Get predictions
    print("Generating predictions...")
    y_pred_proba = model.predict(test_generator, verbose=1)
    y_pred = (y_pred_proba > 0.5).astype(int).flatten()
    y_true = test_generator.classes
    
    print(f"Predictions generated!\n")
    
    # Evaluate model
    print("Evaluating model...")
    results = model.evaluate(test_generator, verbose=0)
    
    print("\n" + "="*70)
    print("TEST RESULTS")
    print("="*70)
    print(f"Loss:      {results[0]:.4f}")
    print(f"Accuracy:  {results[1]:.4f} ({results[1]*100:.2f}%)")
    print(f"Precision: {results[2]:.4f}")
    print(f"Recall:    {results[3]:.4f}")
    print(f"AUC:       {results[4]:.4f}")
    
    # Calculate F1 score
    precision = results[2]
    recall = results[3]
    f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    print(f"F1 Score:  {f1_score:.4f}")
    print("="*70 + "\n")
    
    # Classification report
    class_names = ['Non-Plant', 'Plant']
    print("Classification Report:")
    print(classification_report(y_true, y_pred, target_names=class_names))
    
    # Plot confusion matrix
    cm = plot_confusion_matrix(
        y_true, y_pred, class_names,
        RESULTS_DIR / 'confusion_matrix.png'
    )
    
    # Plot ROC curve
    roc_auc = plot_roc_curve(
        y_true, y_pred_proba,
        RESULTS_DIR / 'roc_curve.png'
    )
    
    # Plot precision-recall curve
    plot_precision_recall_curve(
        y_true, y_pred_proba,
        RESULTS_DIR / 'precision_recall_curve.png'
    )
    
    # Test sample images
    test_sample_images(model, test_generator)
    
    # Summary
    print("\n" + "="*70)
    print("TESTING COMPLETE!")
    print("="*70)
    print(f"\nResults saved to: {RESULTS_DIR}")
    print(f"Test Accuracy: {results[1]*100:.2f}%")
    print(f"AUC Score: {roc_auc:.4f}")
    
    if results[1] >= 0.95:
        print("\nEXCELLENT! Model achieved ≥95% accuracy!")
    elif results[1] >= 0.90:
        print("\nGOOD! Model achieved ≥90% accuracy!")
    else:
        print("\nModel accuracy below 90%. Consider:")
        print("   - Collecting more training data")
        print("   - Adjusting hyperparameters")
        print("   - Training for more epochs")
    
    print("="*70 + "\n")

if __name__ == '__main__':
    main()
