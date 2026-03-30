import os
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import matplotlib.pyplot as plt

def train_model(data_dir, model_save_path='plant_disease_model_v2.h5'):
    """
    Retrain the disease detection model using Transfer Learning
    """
    IMG_SIZE = (128, 128)
    BATCH_SIZE = 32
    
    # 1. Data Augmentation
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        validation_split=0.2
    )

    train_generator = train_datagen.flow_from_directory(
        data_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training'
    )

    validation_generator = train_datagen.flow_from_directory(
        data_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation'
    )

    num_classes = len(train_generator.class_indices)
    print(f"✅ Found {num_classes} classes: {list(train_generator.class_indices.keys())}")

    # 2. Build Model (MobileNetV2 for speed and accuracy)
    base_model = tf.keras.applications.MobileNetV2(input_shape=(128, 128, 3),
                                               include_top=False,
                                               weights='imagenet')
    base_model.trainable = False

    model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dense(512, activation='relu'),
        layers.Dropout(0.3),
        layers.Dense(num_classes, activation='softmax')
    ])

    model.compile(optimizer='adam',
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])

    # 3. Training
    print("🚀 Starting training... This might take a while.")
    history = model.fit(
        train_generator,
        validation_data=validation_generator,
        epochs=10
    )

    # 4. Save the model
    model.save(model_save_path)
    print(f"📦 New model saved to: {model_save_path}")
    
    # Update CLASS_NAMES list for app.py
    with open('new_classes.txt', 'w') as f:
        f.write(str(list(train_generator.class_indices.keys())))

if __name__ == "__main__":
    # Change 'dataset' to your folder path containing subfolders for each disease
    DATASET_PATH = 'dataset' 
    if os.path.exists(DATASET_PATH):
        train_model(DATASET_PATH)
    else:
        print(f"❌ Error: Folder '{DATASET_PATH}' not found. Please create it and add disease images.")
