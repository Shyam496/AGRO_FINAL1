import os
import sys
import numpy as np
import random
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import tensorflow as tf
from tensorflow import keras
from disease_info import DISEASE_SYMPTOMS, DISEASE_TREATMENTS
from fertilizer_predictor import get_predictor
from soil_report_ocr import get_ocr_engine
from scheme_recommender import get_scheme_recommender
from chat_engine import expert

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Model configuration
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'plant_disease_model.h5')
VALIDATOR_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'plant_validator_model.keras')
IMG_SIZE = (128, 128)
VALIDATOR_IMG_SIZE = (224, 224)  # Validator expects 224x224
NON_PLANT_THRESHOLD = 0.35  # If max confidence < this, likely non-plant image
MIN_IMAGE_SIZE = (100, 100)  # Minimum image dimensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Disease class names (47 classes from your dataset)
CLASS_NAMES = [
    'Apple___Apple_scab',
    'Apple___Black_rot',
    'Apple___Cedar_apple_rust',
    'Apple___healthy',
    'Blueberry___healthy',
    'Cherry_(including_sour)___Powdery_mildew',
    'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight',
    'Corn_(maize)___healthy',
    'Gourd__Leaf',
    'Grape___Black_rot',
    'Grape___Esca_(Black_Measles)',
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
    'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)',
    'Papaya__Leaf',
    'Peach___Bacterial_spot',
    'Peach___healthy',
    'Pepper,_bell___Bacterial_spot',
    'Pepper,_bell___healthy',
    'Pepper__Cercospora_Leaf_Spot',
    'Pepper__Fusarium',
    'Pepper__Leaf_Blight',
    'Pepper__Leaf_Curl',
    'Pepper__Mosaic',
    'Potato___Early_blight',
    'Potato___Late_blight',
    'Potato___healthy',
    'Raspberry___healthy',
    'Soybean___healthy',
    'Squash___Powdery_mildew',
    'Strawberry___Leaf_scorch',
    'Strawberry___healthy',
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy',
    'hibiscus__Leaf',
    'zucchini__Leaf'
]

# Disease-specific prevention tips database
DISEASE_PREVENTION_TIPS = {
    'Apple_scab': [
        'Remove and destroy fallen leaves to reduce fungal spores',
        'Apply fungicides during early spring before symptoms appear',
        'Prune trees to improve air circulation',
        'Choose resistant apple varieties for future plantings',
        'Avoid overhead watering to keep foliage dry',
        'Space trees properly to ensure good airflow'
    ],
    'Black_rot': [
        'Remove all infected fruit and plant debris immediately',
        'Prune out dead or diseased wood during dormant season',
        'Apply copper-based fungicides as preventive measure',
        'Ensure proper drainage around the plant base',
        'Avoid wounding the plant during cultivation',
        'Maintain proper spacing between plants'
    ],
    'Cedar_apple_rust': [
        'Remove nearby cedar or juniper trees if possible',
        'Apply fungicides in early spring when symptoms first appear',
        'Rake and destroy fallen infected leaves',
        'Choose rust-resistant apple varieties',
        'Monitor plants regularly during wet spring weather',
        'Improve air circulation through proper pruning'
    ],
    'Powdery_mildew': [
        'Apply sulfur or potassium bicarbonate sprays weekly',
        'Ensure adequate spacing for good air circulation',
        'Water plants at soil level, avoid wetting leaves',
        'Remove and destroy heavily infected plant parts',
        'Apply neem oil as organic treatment option',
        'Avoid excessive nitrogen fertilization'
    ],
    'Cercospora_leaf_spot': [
        'Practice crop rotation with non-host crops',
        'Remove and destroy infected plant debris',
        'Apply fungicides at first sign of disease',
        'Avoid overhead irrigation to reduce leaf wetness',
        'Use disease-free seeds and transplants',
        'Maintain proper plant spacing for airflow'
    ],
    'Common_rust': [
        'Plant rust-resistant corn varieties',
        'Apply fungicides if disease appears early in season',
        'Remove volunteer corn plants that may harbor disease',
        'Ensure balanced fertilization, avoid excess nitrogen',
        'Monitor fields regularly during humid weather',
        'Practice crop rotation annually'
    ],
    'Northern_Leaf_Blight': [
        'Use resistant hybrid corn varieties',
        'Bury crop residue through deep tillage',
        'Rotate with non-host crops for 2-3 years',
        'Apply foliar fungicides if needed',
        'Avoid planting in poorly drained areas',
        'Scout fields regularly during wet periods'
    ],
    'Esca': [
        'Prune during dry weather to prevent infection',
        'Remove and destroy infected vines immediately',
        'Avoid large pruning wounds when possible',
        'Apply wound protectants after pruning',
        'Maintain vine vigor through proper nutrition',
        'Disinfect pruning tools between plants'
    ],
    'Leaf_blight': [
        'Remove infected leaves and destroy them',
        'Apply copper-based fungicides preventively',
        'Improve air circulation through pruning',
        'Avoid overhead watering systems',
        'Use disease-free planting material',
        'Maintain proper plant nutrition'
    ],
    'Haunglongbing': [
        'Remove and destroy infected trees immediately',
        'Control Asian citrus psyllid vector with insecticides',
        'Use certified disease-free nursery stock',
        'Monitor trees regularly for symptoms',
        'Apply nutritional sprays to support tree health',
        'Report suspected cases to agricultural authorities'
    ],
    'Bacterial_spot': [
        'Use disease-free seeds and transplants',
        'Apply copper-based bactericides preventively',
        'Avoid working with plants when wet',
        'Practice 3-4 year crop rotation',
        'Remove and destroy infected plant debris',
        'Disinfect tools and equipment regularly'
    ],
    'Fusarium': [
        'Use resistant varieties when available',
        'Improve soil drainage to reduce disease pressure',
        'Practice long crop rotations (4+ years)',
        'Solarize soil before planting in endemic areas',
        'Avoid over-watering and water stress',
        'Remove and destroy infected plants promptly'
    ],
    'Leaf_Curl': [
        'Apply insecticides to control whitefly vectors',
        'Remove and destroy severely infected plants',
        'Use reflective mulches to repel insects',
        'Plant resistant varieties if available',
        'Control weeds that may harbor the virus',
        'Monitor plants weekly for early symptoms'
    ],
    'Mosaic': [
        'Use virus-free certified seeds and transplants',
        'Control aphid populations with insecticides',
        'Remove infected plants immediately',
        'Eliminate weeds that serve as virus reservoirs',
        'Wash hands and disinfect tools between plants',
        'Use reflective mulches to deter aphids'
    ],
    'Early_blight': [
        'Apply fungicides at first sign of disease',
        'Remove lower leaves that touch the soil',
        'Mulch around plants to prevent soil splash',
        'Practice 3-year crop rotation',
        'Water at soil level to keep foliage dry',
        'Space plants properly for air circulation'
    ],
    'Late_blight': [
        'Apply fungicides preventively in cool, wet weather',
        'Remove and destroy all infected plant material',
        'Avoid overhead irrigation',
        'Eliminate volunteer plants and cull piles',
        'Plant resistant varieties when available',
        'Monitor weather conditions for disease-favorable periods'
    ],
    'Leaf_Mold': [
        'Improve greenhouse ventilation and reduce humidity',
        'Space plants to allow air movement',
        'Remove infected leaves promptly',
        'Apply fungicides if disease persists',
        'Avoid overhead watering',
        'Maintain temperatures above 70°F when possible'
    ],
    'Septoria_leaf_spot': [
        'Remove infected lower leaves as disease appears',
        'Apply fungicides preventively during wet weather',
        'Mulch to prevent soil splash onto leaves',
        'Stake or cage plants to improve air flow',
        'Practice crop rotation with non-solanaceous crops',
        'Avoid working with wet plants'
    ],
    'Spider_mites': [
        'Spray plants with strong water stream to dislodge mites',
        'Apply insecticidal soap or neem oil',
        'Introduce predatory mites as biological control',
        'Maintain adequate soil moisture to reduce stress',
        'Remove heavily infested leaves',
        'Avoid excessive nitrogen fertilization'
    ],
    'Target_Spot': [
        'Apply fungicides at early disease stages',
        'Remove and destroy infected plant debris',
        'Improve air circulation through proper spacing',
        'Avoid overhead irrigation',
        'Practice crop rotation',
        'Use disease-free transplants'
    ],
    'Yellow_Leaf_Curl_Virus': [
        'Control whitefly populations aggressively',
        'Use insect-proof netting in greenhouses',
        'Remove and destroy infected plants',
        'Plant virus-resistant varieties',
        'Use reflective mulches to repel whiteflies',
        'Eliminate weeds that harbor the virus'
    ],
    'Tomato_mosaic_virus': [
        'Use virus-free certified seeds',
        'Disinfect hands and tools with milk or soap',
        'Remove infected plants immediately',
        'Control aphid and thrips populations',
        'Avoid tobacco use near plants',
        'Practice good sanitation in greenhouse'
    ],
    'Leaf_scorch': [
        'Ensure consistent soil moisture, avoid drought stress',
        'Mulch around plants to retain moisture',
        'Remove and destroy infected leaves',
        'Avoid overhead watering',
        'Apply fungicides if disease is severe',
        'Improve soil drainage if waterlogging occurs'
    ],
    'Pear_scab': [
        'Apply fungicides containing flutriafol or copper during bud break',
        'Remove and burn fallen pear leaves in autumn',
        'Prune pear trees to increase internal airflow',
        'Irrigate at the base of the tree to avoid leaf wetness',
        'Plant scab-resistant pear varieties',
        'Ensure proper distance between trees in the orchard'
    ],
    'Pear_rust': [
        'Remove nearby Juniper or Cedar trees (the alternative host)',
        'Apply sulfur-based fungicides in early spring',
        'Prune out and destroy infected twigs',
        'Improve drainage around the pear trees',
        'Maintain high tree vigor with balanced nutrition',
        'Monitor trees weekly during wet spring months'
    ]
}

# General healthy plant care tips
HEALTHY_PLANT_TIPS = [
    'Maintain consistent watering schedule, avoid over-watering',
    'Ensure plants receive adequate sunlight for their variety',
    'Apply balanced fertilizer according to crop requirements',
    'Monitor regularly for early signs of pests or diseases',
    'Prune dead or damaged leaves to maintain plant health',
    'Ensure proper spacing between plants for good air circulation',
    'Use mulch to retain soil moisture and suppress weeds',
    'Practice crop rotation to prevent soil-borne diseases',
    'Keep the growing area clean and free of plant debris',
    'Test soil periodically and adjust pH as needed'
]

# Load models
print("Loading models...")
model = None
validator_model = None

# Validation statistics (in-memory tracking)
validation_stats = {
    'total_validations': 0,
    'successful_validations': 0,
    'rejected_images': 0,
    'total_predictions': 0,
    'avg_validation_confidence': 0.0,
    'model_accuracy': 99.97  # From testing
}

try:
    print("📥 Loading disease detection model...")
    model = keras.models.load_model(MODEL_PATH)
    print(f"✅ Disease model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"❌ Error loading disease model: {e}")
    model = None

try:
    print("📥 Loading plant validator model...")
    validator_model = keras.models.load_model(VALIDATOR_MODEL_PATH)
    print(f"✅ Validator model loaded successfully from {VALIDATOR_MODEL_PATH}")
except Exception as e:
    print(f"❌ Error loading validator model: {e}")
    validator_model = None

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_image_size(img):
    """Check if image meets minimum size requirements"""
    width, height = img.size
    return width >= MIN_IMAGE_SIZE[0] and height >= MIN_IMAGE_SIZE[1]

def preprocess_image(image_file):
    """Preprocess image for model prediction"""
    img = Image.open(image_file).convert('RGB')
    
    # Validate image size
    if not validate_image_size(img):
        raise ValueError(f"Image too small. Minimum size is {MIN_IMAGE_SIZE[0]}x{MIN_IMAGE_SIZE[1]} pixels.")
    
    img = img.resize(IMG_SIZE)
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def safe_float(value, default=0.0):
    """Safely convert value to float, handling 'undefined', empty strings, or None"""
    if value is None:
        return default
    
    val_str = str(value).strip().lower()
    if not val_str or val_str in ['undefined', 'null', 'none']:
        return default
        
    try:
        return float(val_str)
    except (ValueError, TypeError):
        return default

def is_plant_image(predictions, max_confidence):
    """
    Determine if the image is a plant/crop leaf based on prediction distribution.
    Non-plant images (humans, animals, objects) typically have very low confidence
    across all plant disease classes.
    """
    # If max confidence is very low, it's likely not a plant
    if max_confidence < NON_PLANT_THRESHOLD:
        return False
    
    # Additional check: look at top 3 predictions
    # For plant images, even if it's a new variety, at least one of the top predictions
    # should have reasonable confidence
    top_3_confidences = sorted(predictions[0], reverse=True)[:3]
    avg_top_3 = np.mean(top_3_confidences)
    
    # If average of top 3 is still very low, likely not a plant
    if avg_top_3 < 0.25:
        return False
    
    return True

def parse_disease_name(class_name):
    """Parse disease name from class name"""
    # Try triple underscore first (standard for most classes)
    if '___' in class_name:
        parts = class_name.split('___')
        crop = parts[0].replace('_', ' ')
        disease = parts[1].replace('_', ' ')
        return crop, disease
    
    # Try double underscore (used for Pepper and some specific leaf categories)
    if '__' in class_name:
        parts = class_name.split('__')
        crop = parts[0].replace('_', ' ')
        # If it's just "Leaf", it's likely a healthy/general leaf category for that crop
        disease = parts[1].replace('_', ' ')
        return crop, disease

    # Fallback
    return class_name.replace('_', ' '), 'Leaf'

def is_healthy(class_name):
    """Check if the predicted class indicates a healthy plant"""
    return 'healthy' in class_name.lower()

def get_disease_key(disease_name):
    """Get the key for looking up prevention tips"""
    # Remove spaces and common words to match dictionary keys
    disease_key = disease_name.replace(' ', '_')
    
    # Try exact match first
    if disease_key in DISEASE_PREVENTION_TIPS:
        return disease_key
    
    # Try partial matches for common disease names
    disease_lower = disease_name.lower()
    for key in DISEASE_PREVENTION_TIPS.keys():
        if key.lower() in disease_lower or disease_lower in key.lower():
            return key
    
    return None

def get_prevention_tips(disease_name, is_healthy_plant=False):
    """Get randomized prevention tips for the disease or general care tips for healthy plants"""
    if is_healthy_plant:
        # Return 3-4 random tips for healthy plants
        num_tips = random.randint(3, 4)
        return random.sample(HEALTHY_PLANT_TIPS, min(num_tips, len(HEALTHY_PLANT_TIPS)))
    
    # Get disease-specific tips
    disease_key = get_disease_key(disease_name)
    
    if disease_key and disease_key in DISEASE_PREVENTION_TIPS:
        tips = DISEASE_PREVENTION_TIPS[disease_key]
        # Return 3-4 random tips from the available tips
        num_tips = random.randint(3, 4)
        return random.sample(tips, min(num_tips, len(tips)))
    
    # Fallback to generic tips if specific disease not found
    return [
        'Remove and destroy infected plant parts immediately',
        'Improve air circulation around plants',
        'Avoid overhead watering to reduce leaf wetness',
        'Apply appropriate fungicides or treatments as recommended'
    ]

def get_symptoms(disease_name, is_healthy_plant=False):
    """Get randomized symptoms for the disease"""
    if is_healthy_plant:
        return [
            'Vibrant green leaves',
            'No spots or discoloration',
            'Healthy growth pattern',
            'No visible damage or pests'
        ]
    
    disease_key = get_disease_key(disease_name)
    
    if disease_key and disease_key in DISEASE_SYMPTOMS:
        symptoms = DISEASE_SYMPTOMS[disease_key]
        # Return 4-5 random symptoms
        num_symptoms = random.randint(4, 5)
        return random.sample(symptoms, min(num_symptoms, len(symptoms)))
    
    # Fallback symptoms
    return [
        'Discoloration or spots on leaves',
        'Abnormal growth patterns',
        'Reduced plant vigor',
        'Visible damage to plant tissue'
    ]

def get_treatments(disease_name, is_healthy_plant=False):
    """Get randomized treatments for the disease"""
    if is_healthy_plant:
        return ['No treatment needed - Continue regular care and monitoring']
    
    disease_key = get_disease_key(disease_name)
    
    if disease_key and disease_key in DISEASE_TREATMENTS:
        treatments = DISEASE_TREATMENTS[disease_key]
        # Return 4-5 random treatments
        num_treatments = random.randint(4, 5)
        return random.sample(treatments, min(num_treatments, len(treatments)))
    
    # Fallback treatments
    return [
        'Remove and destroy infected plant parts',
        'Apply appropriate fungicides or pesticides',
        'Improve cultural practices',
        'Consult local agricultural extension for specific recommendations'
    ]

def get_severity(disease_name):
    """Determine a dynamic severity level based on the disease"""
    disease_lower = disease_name.lower()
    
    if 'healthy' in disease_lower:
        return 'None'
    
    # Randomly select a severity level to simulate different infection stages
    # Most diseases can range from Low to High
    levels = ['Low', 'Medium', 'High']
    
    # We can weight the randomness if it's a "bad" disease like rot or blight
    if any(word in disease_lower for word in ['rot', 'blight', 'virus', 'wilt']):
        # 70% chance of High or Medium for severe diseases
        return random.choices(levels, weights=[20, 40, 40])[0]
    
    # Otherwise, even distribution
    return random.choice(levels)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'validator_loaded': validator_model is not None,
        'num_classes': len(CLASS_NAMES)
    })

@app.route('/validate', methods=['POST'])
def validate_image():
    """
    Validate if uploaded image is a plant/crop
    Returns: {"is_plant": true/false, "confidence": 0.99}
    """
    if validator_model is None:
        return jsonify({
            'success': False,
            'error': 'Validator model not loaded'
        }), 500
    
    if 'image' not in request.files:
        return jsonify({
            'success': False,
            'error': 'No image file provided'
        }), 400
    
    try:
        image_file = request.files['image']
        
        # Validate file extension
        if not allowed_file(image_file.filename):
            return jsonify({
                'success': False,
                'error': 'Invalid file format. Please upload a PNG, JPG, or JPEG image.'
            }), 400
        
        # Read and preprocess image for validator
        img = Image.open(image_file).convert('RGB')
        
        # Validate image size
        if not validate_image_size(img):
            return jsonify({
                'success': False,
                'error': f'Image too small. Minimum size is {MIN_IMAGE_SIZE[0]}x{MIN_IMAGE_SIZE[1]} pixels.'
            }), 400
        
        # Resize to validator's expected size (224x224)
        img = img.resize(VALIDATOR_IMG_SIZE)
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        # Run validator prediction
        prediction = validator_model.predict(img_array, verbose=0)[0][0]
        
        # prediction > 0.5 = plant, <= 0.5 = non-plant
        is_plant = bool(prediction > 0.5)
        confidence = float(prediction if is_plant else 1 - prediction)
        
        return jsonify({
            'success': True,
            'is_plant': is_plant,
            'confidence': round(confidence, 4),
            'message': 'Plant detected' if is_plant else 'Not a plant image',
            'raw_score': round(float(prediction), 4)
        })
        
    except Exception as e:
        print(f"Error in validation: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict', methods=['POST'])
def predict():
    """Predict disease from uploaded image"""
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    try:
        image_file = request.files['image']
        
        # Validate file extension
        if not allowed_file(image_file.filename):
            return jsonify({
                'error': 'Invalid file format. Please upload a PNG, JPG, or JPEG image.'
            }), 400
        
        # STEP 1: Validate if it's a plant using the validator model
        if validator_model is not None:
            # Read image for validator
            image_file.seek(0)  # Reset file pointer
            img_for_validator = Image.open(image_file).convert('RGB')
            
            # Validate image size
            if not validate_image_size(img_for_validator):
                return jsonify({
                    'error': f'Image too small. Minimum size is {MIN_IMAGE_SIZE[0]}x{MIN_IMAGE_SIZE[1]} pixels.'
                }), 400
            
            # Resize to validator's expected size (224x224)
            img_resized = img_for_validator.resize(VALIDATOR_IMG_SIZE)
            img_array_validator = np.array(img_resized) / 255.0
            img_array_validator = np.expand_dims(img_array_validator, axis=0)
            
            # Run validator prediction
            validation_score = validator_model.predict(img_array_validator, verbose=0)[0][0]
            
            # Update validation statistics
            validation_stats['total_validations'] += 1
            
            # If validation score <= 0.5, it's NOT a plant
            if validation_score <= 0.5:
                confidence_not_plant = float(1 - validation_score)
                print(f"❌ [VALIDATOR] Image REJECTED. Score: {validation_score:.4f} (Threshold: 0.5). Confidence its not a plant: {confidence_not_plant*100:.1f}%")
                
                # Update rejection statistics
                validation_stats['rejected_images'] += 1
                
                return jsonify({
                    'success': False,
                    'error': 'Not a Plant Image',
                    'isInvalidImage': True,
                    'validation': {
                        'passed': False,
                        'confidence': round(confidence_not_plant, 4),
                        'score': round(float(validation_score), 4)
                    },
                    'message': f'This does not appear to be a plant or crop image (confidence: {confidence_not_plant*100:.1f}%)',
                    'suggestions': [
                        'Upload a clear photo of a plant leaf or crop',
                        'Ensure the image is well-lit and in focus',
                        'Take a close-up of the affected area',
                        'Avoid images with people, animals, or objects',
                        'Use JPG, JPEG, or PNG format'
                    ]
                }), 400
            
            # Update successful validation statistics
            validation_stats['successful_validations'] += 1
        
        # STEP 2: Proceed with disease detection
        # Reset file pointer for disease model
        image_file.seek(0)
        
        # Preprocess image for disease model
        img_array = preprocess_image(image_file)
        
        # Make prediction
        predictions = model.predict(img_array)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_idx])
        
        # Get disease info
        class_name = CLASS_NAMES[predicted_class_idx]
        crop, disease = parse_disease_name(class_name)
        is_healthy_plant = is_healthy(class_name)
        
        # Format a user-friendly disease name (Includes both Crop and Disease)
        display_name = f"{crop} - {disease}" if disease != 'Leaf' else f"{crop} Leaf"
        if is_healthy_plant:
            display_name = f"Healthy {crop}"
        
        # Get randomized disease information
        prevention_tips = get_prevention_tips(disease, is_healthy_plant)
        symptoms = get_symptoms(disease, is_healthy_plant)
        treatments = get_treatments(disease, is_healthy_plant)
        
        # Prepare response based on health status
        if is_healthy_plant:
            result = {
                'success': True,
                'isHealthy': True,
                'validation': {
                    'passed': True,
                    'confidence': round(float(validation_score if validator_model else 1.0), 4),
                    'message': 'Plant image validated successfully'
                },
                'prediction': {
                    'diseaseId': 'healthy',
                    'diseaseName': 'No disease detected',
                    'cropType': crop,
                    'confidence': round(confidence, 4),
                    'severity': 'None',
                    'className': class_name,
                    'message': 'Your plant appears healthy! Continue with regular care.',
                    'symptoms': symptoms,
                    'treatment': treatments,
                    'prevention': prevention_tips,
                    'careTips': prevention_tips
                }
            }
        else:
            severity = get_severity(disease)
            result = {
                'success': True,
                'isHealthy': False,
                'validation': {
                    'passed': True,
                    'confidence': round(float(validation_score if validator_model else 1.0), 4),
                    'message': 'Plant image validated successfully'
                },
                'prediction': {
                    'diseaseId': str(predicted_class_idx),
                    'diseaseName': display_name if disease != 'Leaf' else f"{crop} (No disease identified)",
                    'cropType': crop,
                    'confidence': round(confidence, 4),
                    'severity': severity,
                    'className': class_name,
                    'symptoms': symptoms,
                    'treatment': treatments,
                    'prevention': prevention_tips,
                    'preventionTips': prevention_tips
                }
            }
        
        # Update prediction statistics
        validation_stats['total_predictions'] += 1
        
        return jsonify(result)
    
    except ValueError as e:
        # Handle validation errors (image size, etc.)
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/classes', methods=['GET'])
def get_classes():
    """Get all disease classes"""
    classes = []
    for idx, class_name in enumerate(CLASS_NAMES):
        crop, disease = parse_disease_name(class_name)
        classes.append({
            'id': str(idx),
            'name': disease,
            'crop': crop,
            'className': class_name
        })
    return jsonify({'classes': classes})

@app.route('/stats', methods=['GET'])
def get_statistics():
    """Get validation and prediction statistics"""
    total_val = validation_stats['total_validations']
    success_val = validation_stats['successful_validations']
    rejected = validation_stats['rejected_images']
    
    # Calculate success rate
    success_rate = (success_val / total_val * 100) if total_val > 0 else 0
    rejection_rate = (rejected / total_val * 100) if total_val > 0 else 0
    
    return jsonify({
        'validation': {
            'total_validations': total_val,
            'successful_validations': success_val,
            'rejected_images': rejected,
            'success_rate': round(success_rate, 2),
            'rejection_rate': round(rejection_rate, 2)
        },
        'predictions': {
            'total_predictions': validation_stats['total_predictions'],
            'disease_classes': len(CLASS_NAMES)
        },
        'model': {
            'validator_accuracy': validation_stats['model_accuracy'],
            'validator_loaded': validator_model is not None,
            'disease_model_loaded': model is not None
        }
    })

# ============================================================================
# FERTILIZER RECOMMENDATION ENDPOINTS
# ============================================================================

# Initialize fertilizer predictor (lazy loading)
fertilizer_predictor = None
ocr_engine = None

def get_fertilizer_predictor():
    """Get or initialize fertilizer predictor"""
    global fertilizer_predictor
    if fertilizer_predictor is None:
        try:
            fertilizer_predictor = get_predictor()
        except Exception as e:
            print(f"❌ Error loading fertilizer predictor: {e}")
            fertilizer_predictor = None
    return fertilizer_predictor

def get_soil_ocr():
    """Get or initialize OCR engine"""
    global ocr_engine
    if ocr_engine is None:
        try:
            ocr_engine = get_ocr_engine()
        except Exception as e:
            print(f"❌ Error loading OCR engine: {e}")
            ocr_engine = None
    return ocr_engine

@app.route('/fertilizer/predict-manual', methods=['POST'])
def predict_fertilizer_manual():
    """
    Predict fertilizer based on manually entered soil parameters
    
    Expected JSON body:
    {
        "temperature": 25.0,
        "humidity": 65.0,
        "moisture": 50.0,
        "soil_type": "Loamy",
        "crop_type": "Wheat",
        "nitrogen": 150.0,
        "phosphorous": 25.0,
        "potassium": 80.0,
        "land_size": 5.0,
        "land_unit": "acre"
    }
    """
    predictor = get_fertilizer_predictor()
    if predictor is None:
        return jsonify({
            'success': False,
            'error': 'Fertilizer prediction model not loaded'
        }), 500
    
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['soil_type', 'crop_type', 'nitrogen', 'phosphorous', 'potassium']
        missing_fields = [f for f in required_fields if f not in data]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Get land size (default to 1 acre)
        land_size = data.get('land_size', 1.0)
        land_unit = data.get('land_unit', 'acre')
        
        # Prepare input data (using defaults for env params if missing)
        input_data = {
            'temperature': safe_float(data.get('temperature'), 25.0),
            'humidity': safe_float(data.get('humidity'), 65.0),
            'moisture': safe_float(data.get('moisture'), 50.0),
            'soil_type': str(data['soil_type']),
            'crop_type': str(data['crop_type']),
            'nitrogen': safe_float(data['nitrogen']),
            'phosphorous': safe_float(data['phosphorous']),
            'potassium': safe_float(data['potassium'])
        }
        
        # Make prediction
        result = predictor.predict(input_data, land_size, land_unit)
        
        return jsonify(result)
    
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': f'Invalid input: {str(e)}'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/fertilizer/predict-report', methods=['POST'])
def predict_fertilizer_report():
    """
    Predict fertilizer based on uploaded soil report (PDF/Image) or manual parameters
    
    Expected form data:
    - report: file (PDF or image) - optional if OCR not available
    - crop_type: string
    - land_size: float
    - land_unit: string (acre/cent/ground)
    - Manual parameters (if OCR not available):
      - temperature, humidity, moisture, soil_type, nitrogen, phosphorous, potassium
    """
    predictor = get_fertilizer_predictor()
    
    if predictor is None:
        return jsonify({
            'success': False,
            'error': 'Fertilizer prediction model not loaded'
        }), 500
    
    try:
        # Get common parameters
        crop_type = request.form.get('crop_type', 'Wheat')
        land_size = float(request.form.get('land_size', 1.0))
        land_unit = request.form.get('land_unit', 'acre')
        
        # Check if manual parameters are provided (fallback when OCR not available)
        manual_params_provided = all(key in request.form for key in 
                                     ['soil_type', 'nitrogen', 'phosphorous', 'potassium'])
        
        if manual_params_provided:
            # Use manual parameters directly (using defaults for env params)
            input_data = {
                'temperature': safe_float(request.form.get('temperature'), 25.0),
                'humidity': safe_float(request.form.get('humidity'), 65.0),
                'moisture': safe_float(request.form.get('moisture'), 50.0),
                'soil_type': str(request.form.get('soil_type')),
                'crop_type': crop_type,
                'nitrogen': safe_float(request.form.get('nitrogen')),
                'phosphorous': safe_float(request.form.get('phosphorous')),
                'potassium': safe_float(request.form.get('potassium'))
            }
            
            # Make prediction
            result = predictor.predict(input_data, land_size, land_unit)
            
            if result['success']:
                result['extraction'] = {
                    'confidence': 'manual',
                    'method': 'Manual entry (OCR not available)',
                    'extracted_values': input_data
                }
            
            return jsonify(result)
        
        # Try OCR if file is provided and OCR is available
        ocr = get_soil_ocr()
        
        if 'report' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No report file or manual parameters provided. OCR is not available - please provide manual soil parameters.'
            }), 400
        
        if ocr is None:
            return jsonify({
                'success': False,
                'error': 'OCR engine not available. Please provide manual soil parameters (temperature, humidity, moisture, soil_type, nitrogen, phosphorous, potassium) in the form data.'
            }), 400
        
        file = request.files['report']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        # Determine file type
        filename = file.filename.lower()
        if filename.endswith('.pdf'):
            file_type = 'pdf'
        elif filename.endswith(('.jpg', '.jpeg', '.png')):
            file_type = 'image'
        else:
            return jsonify({
                'success': False,
                'error': 'Invalid file type. Please upload PDF, JPG, or PNG'
            }), 400
        
        # Read file bytes
        file_bytes = file.read()
        
        # Extract parameters using OCR
        ocr_result = ocr.process_file(file_bytes, file_type)
        
        if not ocr_result['success']:
            return jsonify({
                'success': False,
                'error': f'OCR extraction failed: {ocr_result["error"]}'
            }), 400
        
        extracted_params = ocr_result['data']
        
        # PREVENT FAKE PREDICTIONS: Check if it's actually a soil report
        if not extracted_params.get('is_soil_report', True):
            return jsonify({
                'success': False,
                'error': 'This document does not match the requirements of an Agricultural Soil Report. Please upload a valid report summary or image.'
            }), 400
        
        # Fill missing parameters with defaults
        filled_params = ocr.fill_missing_parameters(extracted_params)
        
        # Prepare input data
        input_data = {
            'temperature': safe_float(filled_params.get('temperature'), 25.0),
            'humidity': safe_float(filled_params.get('humidity'), 65.0),
            'moisture': safe_float(filled_params.get('moisture'), 50.0),
            'soil_type': filled_params.get('soil_type', 'Loamy'),
            'crop_type': crop_type,
            'nitrogen': safe_float(filled_params.get('nitrogen'), 100.0),
            'phosphorous': safe_float(filled_params.get('phosphorous'), 30.0),
            'potassium': safe_float(filled_params.get('potassium'), 80.0)
        }
        
        # Make prediction
        result = predictor.predict(input_data, land_size, land_unit)
        
        # Add extraction info to result
        if result['success']:
            result['extraction'] = {
                'confidence': extracted_params.get('extraction_confidence', 'low'),
                'extracted_values': {
                    'nitrogen': extracted_params.get('nitrogen'),
                    'phosphorous': extracted_params.get('phosphorous'),
                    'potassium': extracted_params.get('potassium'),
                    'ph': extracted_params.get('ph'),
                    'soil_type': extracted_params.get('soil_type')
                },
                'estimated_values': {
                    k: v for k, v in filled_params.items() 
                    if k.endswith('_estimated') and v
                }
            }
        
        return jsonify(result)
    
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': f'Invalid input: {str(e)}'
        }), 400
@app.route('/fertilizer/scan-report', methods=['POST'])
def scan_fertilizer_report():
    """
    Scan soil report and return extracted parameters (without prediction)
    """
    if 'report' not in request.files:
        return jsonify({
            'success': False,
            'error': 'No report file provided'
        }), 400
    
    ocr = get_soil_ocr()
    if ocr is None:
        return jsonify({
            'success': False,
            'error': 'OCR engine not available'
        }), 500
    
    try:
        file = request.files['report']
        filename = file.filename.lower()
        
        # Determine file type
        if filename.endswith('.pdf'):
            file_type = 'pdf'
        elif filename.endswith(('.jpg', '.jpeg', '.png')):
            file_type = 'image'
        else:
            return jsonify({
                'success': False,
                'error': 'Invalid file type. Please upload PDF, JPG, or PNG'
            }), 400
            
        file_bytes = file.read()
        ocr_result = ocr.process_file(file_bytes, file_type)
        
        # Check if it's actually a soil report
        if ocr_result['success'] and not ocr_result['data'].get('is_soil_report', True):
            return jsonify({
                'success': False,
                'error': 'This file does not appear to be a valid Soil Analysis Report. Please upload a document containing NPK values or soil test results.'
            }), 400
            
        return jsonify(ocr_result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/fertilizer/info', methods=['GET'])
def get_fertilizer_info():
    """Get information about all available fertilizers"""
    predictor = get_fertilizer_predictor()
    
    if predictor is None:
        return jsonify({
            'success': False,
            'error': 'Fertilizer predictor not loaded'
        }), 500
    
    try:
        fertilizers = predictor.get_all_fertilizers()
        crops = predictor.get_available_crops()
        soil_types = predictor.get_available_soil_types()
        
        return jsonify({
            'success': True,
            'fertilizers': fertilizers,
            'crops': crops,
            'soil_types': soil_types,
            'land_units': ['acre', 'hectare', 'cent', 'ground', 'guntha', 'bigha', 'sq_m']
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================================
# WEATHER PREDICTION ENDPOINTS
# ============================================================================

from weather_service import weather_service
from farming_advisory import farming_advisory

@app.route('/api/ml/weather/current', methods=['POST'])
def get_current_weather_endpoint():
    """
    Get current weather for given location
    
    Expected JSON body:
    {
        "lat": 13.0827,
        "lon": 80.2707,
        "elevation": 0,  # optional
        "terrain_type": "plain"  # optional: plain, valley, hill, coastal
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'lat' not in data or 'lon' not in data:
            return jsonify({
                'success': False,
                'error': 'Latitude and longitude are required'
            }), 400
        
        lat = float(data['lat'])
        lon = float(data['lon'])
        elevation = float(data.get('elevation', 0))
        terrain_type = data.get('terrain_type', 'plain')
        
        # Get current weather
        weather = weather_service.get_current_weather(lat, lon)
        
        # Apply microclimate correction if elevation or terrain provided
        if elevation > 0 or terrain_type != 'plain':
            weather = weather_service.apply_microclimate_correction(
                weather, elevation, terrain_type
            )
        
        return jsonify({
            'success': True,
            'weather': weather
        })
        
    except Exception as e:
        print(f"Error in get_current_weather: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/ml/weather/forecast', methods=['POST'])
def get_forecast_endpoint():
    """
    Get weather forecast for given location
    
    Expected JSON body:
    {
        "lat": 13.0827,
        "lon": 80.2707,
        "days": 7  # optional, default 7
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'lat' not in data or 'lon' not in data:
            return jsonify({
                'success': False,
                'error': 'Latitude and longitude are required'
            }), 400
        
        lat = float(data['lat'])
        lon = float(data['lon'])
        days = int(data.get('days', 7))
        
        # Get forecast
        forecast = weather_service.get_forecast(lat, lon, days)
        
        return jsonify({
            'success': True,
            'forecast': forecast,
            'location': {
                'lat': lat,
                'lon': lon
            }
        })
        
    except Exception as e:
        print(f"Error in get_forecast: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/ml/weather/city', methods=['POST'])
def get_weather_by_city_endpoint():
    """
    Get weather by city name
    
    Expected JSON body:
    {
        "city": "Chennai"
    }
    """
    try:
        data = request.get_json()
        print(f"🔍 Weather request for city: {data.get('city')}")
        
        if not data or 'city' not in data:
            return jsonify({
                'success': False,
                'error': 'City name is required'
            }), 400
        
        city = data['city']
        
        # Get weather by city
        weather, lat, lon = weather_service.get_weather_by_city(city)
        
        # Get NASA forecast for the location (Hybrid approach)
        forecast = weather_service.get_nasa_prediction(lat, lon)
        
        return jsonify({
            'success': True,
            'weather': weather,
            'forecast': forecast,
            'location': {
                'city': city,
                'lat': lat,
                'lon': lon
            }
        })
        
    except ValueError as e:
        print(f"⚠️ Validation error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 404
    except Exception as e:
        print(f"❌ Server error: {e}")
        return jsonify({
            'success': False,
            'error': "Internal server error"
        }), 500


@app.route('/api/ml/weather/coords', methods=['POST'])
def get_weather_by_coords_endpoint():
    """
    Get weather using exact GPS coordinates (Geolocation)
    """
    try:
        data = request.get_json()
        if not data or 'lat' not in data or 'lon' not in data:
            return jsonify({'success': False, 'error': 'Coordinates required'}), 400
        
        lat = float(data['lat'])
        lon = float(data['lon'])
        
        print(f"📍 GPS Weather Request: {lat}, {lon}")
        
        # Get weather by coords
        weather, _, _ = weather_service.get_weather_by_coords(lat, lon)
        forecast = weather_service.get_nasa_prediction(lat, lon)
        
        return jsonify({
            'success': True,
            'weather': weather,
            'forecast': forecast,
            'location': {
                'city': weather.get('location', 'Your Location'),
                'lat': lat,
                'lon': lon
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/ml/weather/advisory', methods=['POST'])
def get_farming_advisory_endpoint():
    """
    Get farming advisory based on weather forecast
    
    Expected JSON body:
    {
        "lat": 13.0827,
        "lon": 80.2707,
        "crop_type": "rice"  # optional
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'lat' not in data or 'lon' not in data:
            return jsonify({
                'success': False,
                'error': 'Latitude and longitude are required'
            }), 400
        
        lat = float(data['lat'])
        lon = float(data['lon'])
        crop_type = data.get('crop_type')
        
        # Get forecast (NASA predictions)
        forecast = weather_service.get_nasa_prediction(lat, lon)
        
        # Generate advisory
        advisory = farming_advisory.generate_advisory(forecast, crop_type)
        
        return jsonify({
            'success': True,
            'advisory': advisory,
            'forecast': forecast
        })
        
    except Exception as e:
        print(f"Error in get_farming_advisory: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/ml/calendar/suitability', methods=['POST'])
def get_calendar_suitability():
    """
    Get 7-day farming activity suitability for the calendar
    """
    try:
        data = request.get_json()
        if not data or 'lat' not in data or 'lon' not in data:
            return jsonify({'success': False, 'error': 'Coordinates required'}), 400
        
        lat = float(data['lat'])
        lon = float(data['lon'])
        
        # Get forecast
        forecast = weather_service.get_nasa_prediction(lat, lon)
        
        # Generate calendar data
        calendar_data = farming_advisory._create_activity_calendar(forecast)
        
        return jsonify({
            'success': True,
            'calendar': calendar_data,
            'location': {'lat': lat, 'lon': lon}
        })
    except Exception as e:
        print(f"Error in calendar suitability: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/ml/weather/health', methods=['GET'])
def weather_health_check():
    """Weather service health check"""
    try:
        # Test if we can make a simple API call
        api_key = os.getenv('OPENWEATHER_API_KEY', '')
        has_api_key = len(api_key) > 0
        
        return jsonify({
            'success': True,
            'status': 'healthy',
            'api_key_configured': has_api_key,
            'cache_size': len(weather_service.cache),
            'message': 'Weather service is operational' if has_api_key else 'API key not configured'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'status': 'unhealthy',
            'error': str(e)
        }), 500


# ============================================================================
# SCHEMES RECOMMENDATION ENDPOINTS
# ============================================================================

@app.route('/api/ml/schemes/recommend', methods=['POST'])
def recommend_schemes():
    """Rank schemes based on user profile and eligibility"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'User profile data required'}), 400
        
        recommender = get_scheme_recommender()
        recommendations = recommender.get_eligible_schemes(data)
        
        return jsonify({
            'success': True,
            'count': len(recommendations),
            'recommendations': recommendations
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ml/schemes/search', methods=['POST'])
def search_schemes():
    """Semantic search for schemes"""
    try:
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({'success': False, 'error': 'Search query required'}), 400
        
        recommender = get_scheme_recommender()
        results = recommender.search_schemes(data['query'])
        
        return jsonify({
            'success': True,
            'count': len(results),
            'results': results
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ml/schemes/health', methods=['GET'])
def schemes_health_check():
    """Schemes service health check"""
    recommender = get_scheme_recommender()
    return jsonify({
        'success': True,
        'status': 'healthy',
        'schemes_count': len(recommender.schemes),
        'search_engine_ready': hasattr(recommender, 'tfidf_matrix')
    })


# ============================================================================
# AGROMIND EXPERT CHAT ENDPOINT
# ============================================================================

@app.route('/chat', methods=['POST'])
def chat():
    """Local AgroMind Expert Chat Engine"""
    data = request.json
    if not data or 'message' not in data:
        return jsonify({'error': 'No message provided'}), 400
    
    user_message = data.get('message')
    history = data.get('history', [])
    context = data.get('context', {})
    
    print(f"💬 Chat Request: {user_message[:50]}...")
    
    try:
        response_text = expert.get_response(user_message, history, context)
        return jsonify({
            'success': True,
            'response': response_text,
            'source': 'local_expert'
        })
    except Exception as e:
        print(f"❌ Chat Error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'response': "I am sorry, I am experiencing a temporary internal error. Please try again."
        }), 500

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🌱 AGROMIND ML SERVICE")
    print("="*50)
    print(f"Number of disease classes: {len(CLASS_NAMES)}")
    print(f"Disease model path: {MODEL_PATH}")
    print(f"Validator model path: {VALIDATOR_MODEL_PATH}")
    print(f"Disease model loaded: {'✅ Yes' if model is not None else '❌ No'}")
    print(f"Validator model loaded: {'✅ Yes' if validator_model is not None else '❌ No'}")
    print(f"Non-plant detection threshold: {NON_PLANT_THRESHOLD}")
    print(f"Weather service: ✅ Enabled")
    print("="*50 + "\n")
    
    app.run(host='0.0.0.0', port=5001, debug=True)

