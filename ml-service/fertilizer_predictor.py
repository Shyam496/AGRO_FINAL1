"""
Fertilizer Prediction Module
Handles fertilizer recommendations with land size calculations
"""

import numpy as np
import pandas as pd
import joblib
import json
import os
from tensorflow import keras

class FertilizerPredictor:
    def __init__(self):
        """Initialize the fertilizer predictor with models and encoders"""
        self.model = None
        self.nn_model = None
        self.encoders = None
        self.scaler = None
        self.fertilizer_info = None
        self.metadata = None
        self.model_type = None
        
        # Land unit conversions to acres
        self.LAND_UNIT_TO_ACRE = {
            'acre': 1.0,
            'hectare': 2.47105,
            'cent': 0.01,
            'ground': 0.055,
            'guntha': 0.025,
            'bigha': 0.625,
            'sq_m': 0.000247105
        }
        
        self.load_models()
    
    def load_models(self):
        """Load all models and supporting files"""
        try:
            # Load metadata to determine best model
            metadata_path = os.path.join(os.path.dirname(__file__), 'fertilizer_model_metadata.json')
            if os.path.exists(metadata_path):
                with open(metadata_path, 'r') as f:
                    self.metadata = json.load(f)
                    self.model_type = self.metadata.get('best_model', 'Neural Network')
            else:
                self.model_type = 'Neural Network'
            
            # Load encoders and scaler
            encoders_path = os.path.join(os.path.dirname(__file__), 'fertilizer_encoders.pkl')
            scaler_path = os.path.join(os.path.dirname(__file__), 'fertilizer_scaler.pkl')
            
            self.encoders = joblib.load(encoders_path)
            self.scaler = joblib.load(scaler_path)
            
            # Load appropriate model
            if self.model_type in ['Random Forest', 'XGBoost']:
                model_path = os.path.join(os.path.dirname(__file__), 'fertilizer_model.pkl')
                self.model = joblib.load(model_path)
                print(f"✅ Loaded {self.model_type} model")
            else:
                nn_model_path = os.path.join(os.path.dirname(__file__), 'fertilizer_model_nn.keras')
                self.nn_model = keras.models.load_model(nn_model_path)
                print(f"✅ Loaded Neural Network model")
            
            # Load fertilizer info
            info_path = os.path.join(os.path.dirname(__file__), 'fertilizer_info.json')
            with open(info_path, 'r') as f:
                self.fertilizer_info = json.load(f)
            
            print(f"✅ Fertilizer predictor initialized ({self.model_type})")
            
        except Exception as e:
            print(f"❌ Error loading fertilizer models: {e}")
            raise
    
    def convert_land_size(self, size, unit):
        """Convert land size to acres"""
        unit_lower = unit.lower()
        if unit_lower not in self.LAND_UNIT_TO_ACRE:
            raise ValueError(f"Invalid land unit: {unit}. Must be one of: acre, cent, ground")
        
        return float(size) * self.LAND_UNIT_TO_ACRE[unit_lower]
    
    def preprocess_input(self, data):
        """
        Preprocess input data for prediction
        
        Args:
            data: dict with keys:
                - temperature (float)
                - humidity (float)
                - moisture (float)
                - soil_type (str): Sandy, Loamy, Clayey, Red, Black
                - crop_type (str): Wheat, Rice, Tomato, etc.
                - nitrogen (float)
                - phosphorous (float)
                - potassium (float)
        
        Returns:
            Preprocessed numpy array
        """
        # Create DataFrame with correct column order
        df = pd.DataFrame([{
            'Temperature': data['temperature'],
            'Humidity': data['humidity'],
            'Moisture': data['moisture'],
            'Soil Type': data['soil_type'],
            'Crop Type': data['crop_type'],
            'Nitrogen': data['nitrogen'],
            'Phosphorous': data['phosphorous'],
            'Potassium': data['potassium']
        }])
        
        # Create interaction features (MUST match training features)
        df['N_P_ratio'] = df['Nitrogen'] / (df['Phosphorous'] + 1)
        df['N_K_ratio'] = df['Nitrogen'] / (df['Potassium'] + 1)
        df['P_K_ratio'] = df['Phosphorous'] / (df['Potassium'] + 1)
        df['NPK_sum'] = df['Nitrogen'] + df['Phosphorous'] + df['Potassium']
        df['Temp_Humidity'] = df['Temperature'] * df['Humidity'] / 100
        df['Moisture_Humidity'] = df['Moisture'] * df['Humidity'] / 100
        
        # Encode categorical features
        for col in ['Soil Type', 'Crop Type']:
            if col in self.encoders:
                try:
                    df[col] = self.encoders[col].transform(df[col])
                except ValueError as e:
                    # Handle unknown categories
                    print(f"Warning: Unknown {col} value, using default")
                    df[col] = 0
        
        # Ensure correct column order matching the trained model
        if self.metadata and 'features' in self.metadata:
            required_features = self.metadata['features']
            # Check if all features exist
            missing_features = [f for f in required_features if f not in df.columns]
            if missing_features:
                print(f"Warning: Missing features in input: {missing_features}")
                # Add missing features with 0
                for f in missing_features:
                    df[f] = 0
            
            # Reorder columns
            df = df[required_features]
            
        return df
    
    def predict(self, data, land_size=1.0, land_unit='acre'):
        """
        Predict fertilizer recommendation
        
        Args:
            data: dict with soil parameters
            land_size: float, size of land
            land_unit: str, unit of land (acre/cent/ground)
        
        Returns:
            dict with prediction results
        """
        try:
            # Preprocess input
            X = self.preprocess_input(data)
            
            print(f"🔮 Input Features (Processed):\n{X}")
            
            # Make prediction
            predicted_idx = 0
            confidence = 0.0
            
            if self.nn_model is not None:
                # Use Neural Network
                X_scaled = self.scaler.transform(X)
                predictions = self.nn_model.predict(X_scaled, verbose=0)[0]
                
                # ALWAYS use probabilistic sampling for variety
                # Raise to power < 1.0 to flatten distribution (increase diversity)
                # Raise to power > 1.0 to sharpen distribution (decrease diversity)
                temperature = 0.7  # Good balance for variety
                
                # Avoid division by zero and numerical instability
                predictions = np.clip(predictions, 1e-7, 1.0)
                
                weighted_probs = np.power(predictions, temperature) 
                weighted_probs = weighted_probs / np.sum(weighted_probs)
                
                # Sample from the distribution
                predicted_idx = np.random.choice(len(predictions), p=weighted_probs)
                    
                confidence = float(predictions[predicted_idx])
            else:
                # Use traditional ML model from self.model
                if hasattr(self.model, 'predict_proba'):
                    proba = self.model.predict_proba(X)[0]
                    
                    # Logic: Flatten distribution for variety
                    temperature = 0.7
                    proba = np.clip(proba, 1e-7, 1.0)
                    
                    weighted_probs = np.power(proba, temperature)
                    weighted_probs = weighted_probs / np.sum(weighted_probs)
                    
                    predicted_idx = np.random.choice(len(proba), p=weighted_probs)
                    
                    confidence = float(proba[predicted_idx])
                else:
                    predicted_idx = self.model.predict(X)[0]
                    confidence = 0.95
            
            # Get fertilizer name
            fertilizer_name = self.encoders['Fertilizer Name'].inverse_transform([predicted_idx])[0]
            print(f"🎯 Predicted Fertilizer: {fertilizer_name} (Index: {predicted_idx})")
            
            # Convert land size to acres
            land_size_acres = self.convert_land_size(land_size, land_unit)
            
            # Get fertilizer details
            fertilizer_details = self.get_fertilizer_details(
                fertilizer_name,
                land_size_acres,
                land_size,
                land_unit
            )
            
            # Add prediction metadata
            fertilizer_details['confidence'] = round(confidence, 4)
            fertilizer_details['model_used'] = self.model_type
            
            return {
                'success': True,
                'data': fertilizer_details
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_fertilizer_details(self, fertilizer_name, land_size_acres, original_size, original_unit):
        """Get detailed fertilizer information with quantity calculations"""
        
        # Get fertilizer info
        fert_info = self.fertilizer_info.get(fertilizer_name, {})
        
        # Calculate quantities
        base_rate = float(fert_info.get('application_rate_per_acre', 50))
        total_quantity_kg = base_rate * float(land_size_acres)
        cost_per_kg = float(fert_info.get('cost_per_kg', 20))
        total_cost = total_quantity_kg * cost_per_kg
        
        # Format fertilizer name with code
        full_name = fert_info.get('full_name')
        code = fert_info.get('code')
        
        if full_name:
            display_name = full_name
        elif code and code != fertilizer_name:
            display_name = f"{fertilizer_name} ({code})"
        else:
            display_name = fertilizer_name
        
        # Composition
        composition = fert_info.get('composition', {'N': 0, 'P': 0, 'K': 0})
        
        return {
            'fertilizer_name': fertilizer_name,
            'fertilizer_code': code,
            'display_name': display_name,
            'composition': composition,
            'description': fert_info.get('description', 'Recommended fertilizer for your soil conditions'),
            'land_size': {
                'value': original_size,
                'unit': original_unit,
                'acres': round(land_size_acres, 4)
            },
            'quantity': {
                'total_kg': round(total_quantity_kg, 2),
                'per_acre_kg': base_rate,
                'bags_50kg': round(total_quantity_kg / 50, 2) if total_quantity_kg >= 50 else 0
            },
            'cost': {
                'per_kg': cost_per_kg,
                'total': round(total_cost, 2),
                'currency': 'INR'
            },
            'application_method': self._get_random_choice(fert_info.get('application_method', 'Basal application')),
            'application_timing': self._get_random_choice(fert_info.get('application_timing', 'At sowing stage')),
            'secondary_nutrients': self._calculate_secondary_quantity(
                self._get_quantitative_choice(fert_info.get('secondary_nutrients', 'None')),
                total_quantity_kg,
                land_size_acres
            ),
            'precautions': self._get_random_points(fert_info.get('precautions', ['Apply uniformly in soil']), min_count=2, max_count=4),
            'expected_benefit': self._get_random_points(fert_info.get('expected_benefit', ['Enhances plant growth']), min_count=2, max_count=3),
            'application_instructions': self.get_application_instructions(fertilizer_name, composition)
        }

    def _get_quantitative_choice(self, options):
        """
        Select a secondary nutrient option that explicitly contains percentages or rates.
        Matches the parsing logic in _calculate_secondary_quantity.
        """
        import random
        import re
        
        if not isinstance(options, list) or not options:
            return options
            
        # Filter for options containing quantitative patterns used in calculation
        # Pattern 1: (24%)
        # Pattern 2: 10 kg/ha or kg/acre
        quantitative_options = []
        for opt in options:
            if re.search(r'\(\d+(?:\.\d+)?%\)', opt) or re.search(r'\d+(?:\.\d+)?\s*kg/(ha|acre)', opt, re.IGNORECASE):
                quantitative_options.append(opt)
        
        if quantitative_options:
            return random.choice(quantitative_options)
        
        return random.choice(options)

    def _calculate_secondary_quantity(self, nutrient_str, total_fert_kg, land_acres):
        """
        Calculate specific quantity for secondary nutrients if possible.
        Handles percentages (e.g., "Sulphur (24%)") and rates (e.g., "Sulphur 10 kg/ha").
        """
        import re
        
        if not nutrient_str or nutrient_str.lower() == 'none':
            return nutrient_str
            
        try:
            # Case 1: Percentage-based (e.g., "Sulphur (24%)")
            # content relative to the main fertilizer quantity
            pct_match = re.search(r'\((\d+(?:\.\d+)?)%\)', nutrient_str)
            if pct_match:
                percent = float(pct_match.group(1))
                qty = (total_fert_kg * percent) / 100
                clean_name = re.sub(r'\(\d+%\)', '', nutrient_str).strip()
                return f"{clean_name} - {round(qty, 1)} kg (via {percent}%)"
            
            # Case 2: Rate-based (e.g., "Sulphur 10 kg/ha" or "10 kg/acre")
            # This is an additional requirement, independent of the main fertilizer qty
            rate_match = re.search(r'(\d+(?:\.\d+)?)\s*kg/(ha|acre)', nutrient_str, re.IGNORECASE)
            if rate_match:
                rate = float(rate_match.group(1))
                unit = rate_match.group(2).lower()
                
                if unit == 'ha':
                    # Convert ha rate to total acres: rate (kg/ha) * (acres / 2.471)
                    # Actually: Total = Rate(kg/ha) * Hectares. 
                    # Hectares = Acres / 2.471
                    # So Total = Rate * (Acres / 2.471)
                    qty = rate * (land_acres / 2.47105)
                else: # acre
                    qty = rate * land_acres
                    
                clean_name = re.sub(r'\d+\s*kg/(ha|acre)', '', nutrient_str, flags=re.IGNORECASE).strip()
                return f"{clean_name} - {round(qty, 1)} kg"
                
            # Default: Return as is if no pattern matches
            return nutrient_str
            
        except Exception as e:
            print(f"Error parsing secondary nutrient: {e}")
            return nutrient_str

    def _get_random_choice(self, options):
        """Randomly select a single item from a list or return the string"""
        import random
        if isinstance(options, list) and len(options) > 0:
            return random.choice(options)
        return options

    def _get_random_points(self, points, min_count=2, max_count=3):
        """Randomly select a variable subset of points from a list"""
        import random
        if not isinstance(points, list):
            return [points]
        
        # Determine actual count within range, but not exceeding list length
        target_count = random.randint(min_count, max_count)
        return random.sample(points, min(len(points), target_count))
    
    def get_application_instructions(self, fertilizer_name, composition):
        """Generate application instructions based on fertilizer type"""
        instructions = []
        
        # General instructions
        instructions.append("Apply fertilizer evenly across the field")
        
        # Specific instructions based on composition
        if composition['N'] > 30:
            instructions.append("High nitrogen content - Apply in split doses for better efficiency")
            instructions.append("First dose at sowing, second dose 30-40 days after sowing")
        elif composition['P'] > 30:
            instructions.append("High phosphorus - Apply as basal dose before sowing")
            instructions.append("Mix well with soil for better root contact")
        elif composition['K'] > 30:
            instructions.append("High potassium - Apply during flowering and fruiting stage")
        
        # Timing
        if 'Urea' in fertilizer_name or composition['N'] > 20:
            instructions.append("Best applied during active growth period")
            instructions.append("Avoid application during heavy rain")
        
        # Safety
        instructions.append("Water the field after application")
        instructions.append("Store remaining fertilizer in a cool, dry place")
        
        return instructions[:5]  # Return top 5 instructions
    
    def get_available_crops(self):
        """Get list of available crop types"""
        if self.metadata and 'crop_types' in self.metadata:
            return sorted(self.metadata['crop_types'])
        return []
    
    def get_available_soil_types(self):
        """Get list of available soil types"""
        if self.metadata and 'soil_types' in self.metadata:
            return sorted(self.metadata['soil_types'])
        return []
    
    def get_all_fertilizers(self):
        """Get information about all fertilizers"""
        fertilizers = []
        for name, info in self.fertilizer_info.items():
            code = info.get('code')
            display_name = f"{name} ({code})" if code else name
            
            fertilizers.append({
                'name': name,
                'code': code,
                'display_name': display_name,
                'composition': info.get('composition', {}),
                'description': info.get('description', '')
            })
        
        return sorted(fertilizers, key=lambda x: x['name'])


# Global instance
_predictor = None

def get_predictor():
    """Get or create global predictor instance"""
    global _predictor
    if _predictor is None:
        _predictor = FertilizerPredictor()
    return _predictor
