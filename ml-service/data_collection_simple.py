"""
Simplified Data Collection Script - No Kaggle Required
Uses existing plant disease dataset and downloads COCO dataset directly
"""

import os
import sys
import requests
import zipfile
import shutil
from pathlib import Path
from tqdm import tqdm

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Configuration
BASE_DIR = Path(__file__).parent
DATASET_DIR = BASE_DIR / 'datasets' / 'plant_validator'
DOWNLOAD_DIR = BASE_DIR / 'downloads'
EXISTING_PLANT_DATA = Path(r'D:\agromind_final\Dataset_old')  # User's existing dataset

def create_directory_structure():
    """Create the dataset directory structure"""
    print("Creating directory structure...")
    
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
        print(f"  Created: {dir_path}")
    
    print("Directory structure created!\n")

def download_file(url, destination):
    """Download a file with progress bar"""
    print(f"Downloading from {url}...")
    
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
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
        
        print(f"Downloaded: {destination}\n")
        return True
    except Exception as e:
        print(f"Error downloading: {e}")
        return False

def extract_zip(zip_path, extract_to):
    """Extract a zip file"""
    print(f"Extracting {zip_path.name}...")
    
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to)
    
    print(f"Extracted to: {extract_to}\n")

def organize_images(source_dir, target_base, class_name, max_images=None):
    """Organize images into train/val/test splits"""
    print(f"Organizing {class_name} images...")
    
    from sklearn.model_selection import train_test_split
    import random
    
    # Find all image files
    image_extensions = {'.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'}
    all_images = []
    
    for root, dirs, files in os.walk(source_dir):
        for file in files:
            if Path(file).suffix in image_extensions:
                all_images.append(Path(root) / file)
                if max_images and len(all_images) >= max_images:
                    break
        if max_images and len(all_images) >= max_images:
            break
    
    print(f"  Found {len(all_images)} {class_name} images")
    
    if len(all_images) == 0:
        print(f"  WARNING: No images found in {source_dir}")
        return 0
    
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
    
    total_copied = 0
    for split_name, images in splits.items():
        target_dir = target_base / split_name / class_name
        print(f"  Copying {len(images)} images to {split_name}/{class_name}...")
        
        for i, img_path in enumerate(images):
            target_path = target_dir / f"{class_name}_{i:05d}{img_path.suffix}"
            shutil.copy2(img_path, target_path)
            total_copied += 1
    
    print(f"  Organized {total_copied} {class_name} images!\n")
    return total_copied

def print_dataset_summary():
    """Print summary of collected dataset"""
    print("\n" + "="*60)
    print("DATASET SUMMARY")
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
    print("Data collection complete!")
    print("="*60)

def main():
    """Main data collection pipeline"""
    print("\n" + "="*60)
    print("PLANT VALIDATOR - DATA COLLECTION (SIMPLIFIED)")
    print("="*60 + "\n")
    
    # Step 1: Create directory structure
    create_directory_structure()
    
    # Step 2: Use existing plant disease dataset
    print("STEP 1: Organizing plant images from existing dataset...")
    
    if EXISTING_PLANT_DATA.exists():
        print(f"  Using existing dataset: {EXISTING_PLANT_DATA}")
        plant_count = organize_images(EXISTING_PLANT_DATA, DATASET_DIR, 'plant')
    else:
        print(f"  WARNING: Existing dataset not found at {EXISTING_PLANT_DATA}")
        print("  Please manually copy plant images to: downloads/plant_images/")
        print("  Then run this script again.\n")
        plant_count = 0
    
    # Step 3: Download non-plant images (COCO dataset - smaller subset)
    print("STEP 2: Downloading non-plant images...")
    
    # Use a smaller COCO subset for faster download
    coco_url = "http://images.cocodataset.org/zips/val2017.zip"
    coco_zip = DOWNLOAD_DIR / 'val2017.zip'
    
    if not coco_zip.exists():
        print("  Downloading COCO validation set (~1GB)...")
        print("  This may take 10-30 minutes depending on your internet speed...")
        success = download_file(coco_url, coco_zip)
        
        if not success:
            print("  WARNING: Failed to download COCO dataset")
            print("  You can manually download from: http://images.cocodataset.org/zips/val2017.zip")
            print("  And place it in: downloads/val2017.zip\n")
    else:
        print(f"  Already downloaded: {coco_zip}\n")
    
    # Extract COCO dataset
    if coco_zip.exists():
        coco_extract_dir = DOWNLOAD_DIR / 'coco_val2017'
        if not coco_extract_dir.exists():
            extract_zip(coco_zip, coco_extract_dir)
        
        # Organize non-plant images (limit to 10,000 to match plant images)
        non_plant_count = organize_images(coco_extract_dir, DATASET_DIR, 'non_plant', max_images=10000)
    else:
        non_plant_count = 0
    
    # Step 4: Print summary
    print_dataset_summary()
    
    # Check if we have enough data
    total_images = plant_count + non_plant_count
    if total_images < 1000:
        print("\nWARNING: Not enough images collected!")
        print("  Minimum recommended: 10,000 total images")
        print("  Current: {} images".format(total_images))
        print("\nPlease:")
        print("  1. Add plant images to: downloads/plant_images/")
        print("  2. Ensure COCO dataset downloaded successfully")
        print("  3. Run this script again\n")
    else:
        print("\nNext steps:")
        print("  1. Review the dataset in: datasets/plant_validator/")
        print("  2. Run: python train_validator.py")
        print("  3. Wait for training to complete (~2-4 hours)")
        print("  4. Integrate the model into app.py\n")

if __name__ == '__main__':
    # Check for required packages
    try:
        import sklearn
    except ImportError:
        print("Missing required package: scikit-learn")
        print("Install with: pip install scikit-learn")
        sys.exit(1)
    
    main()
