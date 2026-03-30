# Plant Validator Model - Setup and Training Guide

## 🎯 Overview

This guide will help you train a custom binary classification model to validate plant/crop images vs non-plant images with **95-99% accuracy**.

## 📋 Prerequisites

- Python 3.8 or higher
- 8GB+ RAM (16GB recommended)
- 10GB+ free disk space
- GPU (optional, but recommended for faster training)

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd "c:\Users\Jayakumar\Downloads\Final yr project\agromind\ml-service"
pip install -r requirements_validator.txt
```

### Step 2: Setup Kaggle API (for dataset download)

1. Create a Kaggle account at https://www.kaggle.com
2. Go to Account Settings → API → Create New API Token
3. Download `kaggle.json` file
4. Place it in: `C:\Users\Jayakumar\.kaggle\kaggle.json`

**Windows PowerShell:**
```powershell
mkdir $env:USERPROFILE\.kaggle
# Then manually copy kaggle.json to that folder
```

### Step 3: Download Datasets

```bash
python data_collection.py
```

**What this does:**
- Downloads PlantVillage dataset (~54,000 plant images)
- Downloads COCO validation set (~5,000 non-plant images)
- Organizes images into train/validation/test splits
- Takes ~30-60 minutes depending on internet speed

**Expected output:**
```
📊 DATASET SUMMARY
==================
TRAIN:
  Plant images:     ~38,000
  Non-plant images: ~3,500
  Total:            ~41,500

VALIDATION:
  Plant images:     ~11,000
  Non-plant images: ~1,000
  Total:            ~12,000

TEST:
  Plant images:     ~5,000
  Non-plant images: ~500
  Total:            ~5,500
```

### Step 4: Train the Model

```bash
python train_validator.py
```

**Training time:**
- With GPU: 2-4 hours
- Without GPU: 8-12 hours

**What happens:**
- Phase 1: Initial training with frozen MobileNetV2 base (20-30 epochs)
- Phase 2: Fine-tuning with unfrozen layers (10 epochs)
- Saves best model to `plant_validator_model.h5`
- Generates training logs and plots

### Step 5: Test the Model

```bash
python test_validator.py
```

**What this does:**
- Evaluates model on test set
- Generates confusion matrix
- Creates ROC curve and precision-recall curve
- Shows sample predictions
- Saves all results to `test_results/` folder

**Expected accuracy: ≥95%**

### Step 6: Integrate into ML Service

The integration code will be added to `app.py` automatically in the next phase.

## 📊 Monitoring Training

### TensorBoard (Real-time monitoring)

```bash
tensorboard --logdir=training_logs
```

Then open: http://localhost:6006

### Training Logs

Check `training_logs/` folder for:
- CSV logs with metrics per epoch
- Training history plots
- TensorBoard event files

## 🔧 Troubleshooting

### Issue: Kaggle API not working

**Solution 1:** Manual download
1. Download PlantVillage dataset from: https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset
2. Extract to: `downloads/plant_images/`
3. Run `python data_collection.py` (it will skip Kaggle download)

**Solution 2:** Use your existing plant dataset
- Copy your plant disease images to: `downloads/plant_images/`
- Run `python data_collection.py`

### Issue: Out of memory during training

**Solution:**
- Reduce batch size in `train_validator.py`: `BATCH_SIZE = 16` (or even 8)
- Close other applications
- Use Google Colab (free GPU)

### Issue: Training is too slow

**Solution:**
- Use Google Colab with free GPU
- Reduce dataset size (use fewer images)
- Reduce number of epochs

### Issue: Low accuracy (<90%)

**Solutions:**
- Train for more epochs
- Collect more diverse training data
- Adjust learning rate
- Try different augmentation strategies

## 🎓 Using Google Colab (Free GPU)

If you don't have a GPU:

1. Upload the scripts to Google Drive
2. Open Google Colab: https://colab.research.google.com
3. Mount Google Drive
4. Run the training script in Colab
5. Download the trained model

**Colab notebook template:**
```python
# Mount Google Drive
from google.colab import drive
drive.mount('/content/drive')

# Navigate to project
%cd /content/drive/MyDrive/agromind/ml-service

# Install dependencies
!pip install -r requirements_validator.txt

# Download data
!python data_collection.py

# Train model
!python train_validator.py

# Test model
!python test_validator.py
```

## 📈 Expected Results

### Metrics
- **Accuracy**: ≥95%
- **Precision**: ≥95%
- **Recall**: ≥95%
- **F1 Score**: ≥95%
- **AUC**: ≥0.98

### Inference Speed
- Single image: <100ms
- Batch of 32: <500ms

## 📁 File Structure

```
ml-service/
├── data_collection.py          # Download and organize datasets
├── train_validator.py          # Train the model
├── test_validator.py           # Test and evaluate
├── requirements_validator.txt  # Python dependencies
├── plant_validator_model.h5    # Trained model (after training)
├── datasets/
│   └── plant_validator/
│       ├── train/
│       ├── validation/
│       └── test/
├── downloads/                  # Downloaded raw data
├── training_logs/              # Training logs and plots
└── test_results/               # Test results and visualizations
```

## 🎯 Next Steps After Training

1. ✅ Verify test accuracy ≥95%
2. ✅ Review confusion matrix and sample predictions
3. ✅ Integrate model into `app.py` (automatic in next phase)
4. ✅ Test with real images through the web interface
5. ✅ Deploy to production

## 💡 Tips for Best Results

1. **Data Quality**: Ensure images are clear and properly labeled
2. **Data Balance**: Keep plant and non-plant images roughly equal
3. **Diverse Data**: Include various types of non-plant images (humans, animals, objects)
4. **Augmentation**: The script already includes good augmentation
5. **Patience**: Let the model train completely, don't stop early

## 📞 Support

If you encounter any issues:
1. Check the error message carefully
2. Review the troubleshooting section above
3. Check training logs for clues
4. Ask for help with specific error messages

---

**Ready to start? Run:**
```bash
python data_collection.py
```
