"""
Data Collection Script for Plant Validator Model
Downloads and organizes plant and non-plant images from public datasets
"""

import os
import sys
import requests
import zipfile
import shutil
from pathlib import Path
from tqdm import tqdm
import json

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Configuration
BASE_DIR = Path(__file__).parent
DATASET_DIR = BASE_DIR / 'datasets' / 'plant_validator'
DOWNLOAD_DIR = BASE_DIR / 'downloads'

# Dataset sources (optimized for efficiency and quality)
DATASETS = {
    'plant_images': {
        # PlantVillage dataset - 54,000+ high-quality plant images
        'kaggle': 'abdallahalidev/plantvillage-dataset',
        'size': '~500MB',
        'images': 54000,
        'description': 'High-quality plant disease images'
    },
    'non_plant_images': {
        # COCO 2017 validation set - diverse non-plant images
        'url': 'http://images.cocodataset.org/zips/val2017.zip',
        'size': '~1GB',
        'images': 5000,
        'description': 'Humans, animals, objects, vehicles'
    }
}

def create_directory_structure():
    """Create the dataset directory structure"""
    print("📁 Creating directory structure...")
    
    dirs = [
        DATASET_DIR / 'train' / 'plant',
        DATASET_DIR / 'train' / 'non_plant',
        DATASET_DIR / 'validation' / 'plant',
        DATASET_DIR / 'validation' / 'non_plant',
        DATASET_DIR / 'test' / 'plant',
        DATASET_DIR / 'test' / 'non_plant',
        DOWNLOAD_DIR
    ]
    
    for dir_path in dirs:
        dir_path.mkdir(parents=True, exist_ok=True)
        print(f"  ✓ Created: {dir_path}")
    
    print("✅ Directory structure created!\n")

def download_file(url, destination):
    """Download a file with progress bar"""
    print(f"📥 Downloading from {url}...")
    
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    
    with open(destination, 'wb') as file, tqdm(
        desc=destination.name,
        total=total_size,
        unit='iB',
        unit_scale=True,
        unit_divisor=1024,
    ) as progress_bar:
        for data in response.iter_content(chunk_size=1024):
            size = file.write(data)
            progress_bar.update(size)
    
    print(f"✅ Downloaded: {destination}\n")

def extract_zip(zip_path, extract_to):
    """Extract a zip file"""
    print(f"📦 Extracting {zip_path.name}...")
    
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to)
    
    print(f"✅ Extracted to: {extract_to}\n")

def download_kaggle_dataset(dataset_name, extract_to):
    """Download dataset from Kaggle using Kaggle API"""
    print(f"📥 Downloading Kaggle dataset: {dataset_name}...")
    
    try:
        import kaggle
        
        # Download dataset
        kaggle.api.dataset_download_files(
            dataset_name,
            path=extract_to,
            unzip=True
        )
        
        print(f"✅ Downloaded Kaggle dataset: {dataset_name}\n")
        return True
        
    except ImportError:
        print("❌ Kaggle API not installed!")
        print("   Install with: pip install kaggle")
        print("   Setup instructions: https://github.com/Kaggle/kaggle-api#api-credentials")
        return False
    except Exception as e:
        print(f"❌ Error downloading from Kaggle: {e}")
        return False

def organize_plant_images(source_dir, target_base):
    """Organize plant images into train/val/test splits"""
    print("🗂️  Organizing plant images...")
    
    from sklearn.model_selection import train_test_split
    import random
    
    # Find all image files
    image_extensions = {'.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'}
    all_images = []
    
    for root, dirs, files in os.walk(source_dir):
        for file in files:
            if Path(file).suffix in image_extensions:
                all_images.append(Path(root) / file)
    
    print(f"  Found {len(all_images)} plant images")
    
    # Shuffle and split: 70% train, 20% val, 10% test
    random.shuffle(all_images)
    train_imgs, temp = train_test_split(all_images, test_size=0.3, random_state=42)
    val_imgs, test_imgs = train_test_split(temp, test_size=0.33, random_state=42)
    
    # Copy images to respective directories
    splits = {
        'train': train_imgs,
        'validation': val_imgs,
        'test': test_imgs
    }
    
    for split_name, images in splits.items():
        target_dir = target_base / split_name / 'plant'
        print(f"  Copying {len(images)} images to {split_name}/plant...")
        
        for i, img_path in enumerate(images):
            target_path = target_dir / f"plant_{i:05d}{img_path.suffix}"
            shutil.copy2(img_path, target_path)
    
    print("✅ Plant images organized!\n")

def organize_non_plant_images(source_dir, target_base, max_images=10000):
    """Organize non-plant images into train/val/test splits"""
    print("🗂️  Organizing non-plant images...")
    
    from sklearn.model_selection import train_test_split
    import random
    
    # Find all image files
    image_extensions = {'.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'}
    all_images = []
    
    for root, dirs, files in os.walk(source_dir):
        for file in files:
            if Path(file).suffix in image_extensions:
                all_images.append(Path(root) / file)
                if len(all_images) >= max_images:
                    break
        if len(all_images) >= max_images:
            break
    
    print(f"  Found {len(all_images)} non-plant images")
    
    # Shuffle and split: 70% train, 20% val, 10% test
    random.shuffle(all_images)
    train_imgs, temp = train_test_split(all_images, test_size=0.3, random_state=42)
    val_imgs, test_imgs = train_test_split(temp, test_size=0.33, random_state=42)
    
    # Copy images to respective directories
    splits = {
        'train': train_imgs,
        'validation': val_imgs,
        'test': test_imgs
    }
    
    for split_name, images in splits.items():
        target_dir = target_base / split_name / 'non_plant'
        print(f"  Copying {len(images)} images to {split_name}/non_plant...")
        
        for i, img_path in enumerate(images):
            target_path = target_dir / f"non_plant_{i:05d}{img_path.suffix}"
            shutil.copy2(img_path, target_path)
    
    print("✅ Non-plant images organized!\n")

def print_dataset_summary():
    """Print summary of collected dataset"""
    print("\n" + "="*60)
    print("📊 DATASET SUMMARY")
    print("="*60)
    
    for split in ['train', 'validation', 'test']:
        plant_dir = DATASET_DIR / split / 'plant'
        non_plant_dir = DATASET_DIR / split / 'non_plant'
        
        plant_count = len(list(plant_dir.glob('*'))) if plant_dir.exists() else 0
        non_plant_count = len(list(non_plant_dir.glob('*'))) if non_plant_dir.exists() else 0
        
        print(f"\n{split.upper()}:")
        print(f"  Plant images:     {plant_count:,}")
        print(f"  Non-plant images: {non_plant_count:,}")
        print(f"  Total:            {plant_count + non_plant_count:,}")
    
    print("\n" + "="*60)
    print("✅ Data collection complete!")
    print("="*60)

def main():
    """Main data collection pipeline"""
    print("\n" + "="*60)
    print("🌱 PLANT VALIDATOR - DATA COLLECTION")
    print("="*60 + "\n")
    
    # Step 1: Create directory structure
    create_directory_structure()
    
    # Step 2: Download plant images from Kaggle
    print("📥 STEP 1: Downloading plant images...")
    plant_download_dir = DOWNLOAD_DIR / 'plant_images'
    plant_download_dir.mkdir(exist_ok=True)
    
    kaggle_success = download_kaggle_dataset(
        DATASETS['plant_images']['kaggle'],
        plant_download_dir
    )
    
    if not kaggle_success:
        print("\n⚠️  Kaggle download failed. Alternative options:")
        print("   1. Install Kaggle API and setup credentials")
        print("   2. Manually download from: https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset")
        print("   3. Use your existing plant disease dataset")
        print("\nFor now, we'll skip plant images. You can add them manually later.\n")
    
    # Step 3: Download non-plant images (COCO dataset)
    print("📥 STEP 2: Downloading non-plant images...")
    coco_zip = DOWNLOAD_DIR / 'val2017.zip'
    
    if not coco_zip.exists():
        download_file(DATASETS['non_plant_images']['url'], coco_zip)
    else:
        print(f"  ✓ Already downloaded: {coco_zip}\n")
    
    # Extract COCO dataset
    coco_extract_dir = DOWNLOAD_DIR / 'coco_val2017'
    if not coco_extract_dir.exists():
        extract_zip(coco_zip, coco_extract_dir)
    
    # Step 4: Organize images
    if kaggle_success:
        organize_plant_images(plant_download_dir, DATASET_DIR)
    
    organize_non_plant_images(coco_extract_dir, DATASET_DIR, max_images=10000)
    
    # Step 5: Print summary
    print_dataset_summary()
    
    print("\n🎯 Next steps:")
    print("   1. Review the dataset in: datasets/plant_validator/")
    print("   2. Run: python train_validator.py")
    print("   3. Wait for training to complete (~2-4 hours)")
    print("   4. Integrate the model into app.py\n")

if __name__ == '__main__':
    # Check for required packages
    try:
        import sklearn
        import tqdm
    except ImportError:
        print("❌ Missing required packages!")
        print("   Install with: pip install scikit-learn tqdm requests")
        sys.exit(1)
    
    main()
