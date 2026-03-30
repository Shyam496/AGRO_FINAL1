import os
import shutil
from pathlib import Path
import random
from sklearn.model_selection import train_test_split
from tqdm import tqdm

# Configuration
BASE_DIR = Path(__file__).parent
DATASET_DIR = BASE_DIR / 'datasets' / 'plant_validator'
LOCAL_PLANT_SOURCE = Path(r'D:\agromind_final\Dataset_old')
# Check if COCO is already extracted in downloads
COCO_SOURCE = BASE_DIR / 'downloads' / 'coco_val2017'

def clear_directory(path):
    if path.exists():
        print(f"Cleaning {path}...")
        try:
            shutil.rmtree(path)
        except Exception as e:
            print(f"Warning: Could not fully remove {path}: {e}")
            # Try to just delete contents
    path.mkdir(parents=True, exist_ok=True)

def get_all_images(source_dir, extensions={'.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'}):
    image_paths = []
    print(f"Scanning {source_dir}...")
    for root, _, files in os.walk(source_dir):
        for file in files:
            if Path(file).suffix in extensions:
                image_paths.append(Path(root) / file)
    return image_paths

def copy_images(images, destination_dir, prefix):
    destination_dir.mkdir(parents=True, exist_ok=True)
    print(f"Copying {len(images)} images to {destination_dir}...")
    for i, src_path in enumerate(tqdm(images)):
        dst_filename = f"{prefix}_{i:05d}{src_path.suffix}"
        try:
            shutil.copy2(src_path, destination_dir / dst_filename)
        except Exception as e:
            print(f"Error copying {src_path}: {e}")

def main():
    print("Starting Local Dataset Preparation...")
    
    # 1. Verify Sources
    if not LOCAL_PLANT_SOURCE.exists():
        print(f"Error: Local plant source not found: {LOCAL_PLANT_SOURCE}")
        return
    
    # Check for COCO in likely locations
    coco_path = COCO_SOURCE
    if not coco_path.exists():
        # Fallback to check if it's inside val2017 folder
        coco_val_path = BASE_DIR / 'downloads' / 'val2017'
        if coco_val_path.exists():
            coco_path = coco_val_path
    
    if not coco_path.exists():
         print(f"Error: COCO dataset not found in downloads ({COCO_SOURCE}). Please run data_collection.py first to download COCO.")
         return

    print(f"Found Plant Source: {LOCAL_PLANT_SOURCE}")
    print(f"Found Non-Plant Source: {coco_path}")

    # 2. Collect Images
    plant_images = get_all_images(LOCAL_PLANT_SOURCE)
    non_plant_images = get_all_images(coco_path)
    
    if not plant_images:
        print("No plant images found!")
        return
    if not non_plant_images:
        print("No non-plant images found!")
        return

    print(f"Found {len(plant_images)} plant images.")
    print(f"Found {len(non_plant_images)} non-plant images.")

    # 3. Clean Target
    print("\nPreparing target directories...")
    for split in ['train', 'validation', 'test']:
        for cls in ['plant', 'non_plant']:
            target_dir = DATASET_DIR / split / cls
            if target_dir.exists():
                shutil.rmtree(target_dir)
            target_dir.mkdir(parents=True, exist_ok=True)

    # 4. Split and Distribute Plant Images
    random.shuffle(plant_images)
    # Use smaller subset if too large for quick testing, but user wants to train on it. 
    # Let's use all.
    train_plant, temp_plant = train_test_split(plant_images, test_size=0.3, random_state=42)
    val_plant, test_plant = train_test_split(temp_plant, test_size=0.33, random_state=42) # 0.3 * 0.33 ~= 0.1 total

    # 5. Split and Distribute Non-Plant Images
    random.shuffle(non_plant_images)
    train_np, temp_np = train_test_split(non_plant_images, test_size=0.3, random_state=42)
    val_np, test_np = train_test_split(temp_np, test_size=0.33, random_state=42)

    # 6. Copy Files
    print("\nProcessing Plant Images...")
    copy_images(train_plant, DATASET_DIR / 'train' / 'plant', 'plant')
    copy_images(val_plant, DATASET_DIR / 'validation' / 'plant', 'plant')
    copy_images(test_plant, DATASET_DIR / 'test' / 'plant', 'plant')

    print("\nProcessing Non-Plant Images...")
    copy_images(train_np, DATASET_DIR / 'train' / 'non_plant', 'non_plant')
    copy_images(val_np, DATASET_DIR / 'validation' / 'non_plant', 'non_plant')
    copy_images(test_np, DATASET_DIR / 'test' / 'non_plant', 'non_plant')

    print("\nDataset Preparation Complete!")
    print(f"Train: {len(train_plant)} plant, {len(train_np)} non-plant")
    print(f"Val:   {len(val_plant)} plant, {len(val_np)} non-plant")
    print(f"Test:  {len(test_plant)} plant, {len(test_np)} non-plant")
    print(f"\nLocation: {DATASET_DIR}")

if __name__ == "__main__":
    main()
