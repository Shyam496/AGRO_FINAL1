import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fertilizer_predictor import FertilizerPredictor

def test_prediction():
    debug_file = "debug_output.txt"
    try:
        with open(debug_file, "w", encoding="utf-8") as f:
            # Redirect stdout to file
            original_stdout = sys.stdout
            sys.stdout = f
            
            try:
                print("🔄 Initializing Predictor...")
                predictor = FertilizerPredictor()
                
                # Test Case 1: Balanced
                data_1 = {
                    'temperature': 25.0,
                    'humidity': 60.0,
                    'moisture': 40.0,
                    'soil_type': 'Loamy',
                    'crop_type': 'Wheat',
                    'nitrogen': 20.0,
                    'phosphorous': 20.0, 
                    'potassium': 20.0 
                }
                
                print("\n🧪 Test Case 1 (Balanced NPK 20-20-20):")
                result = predictor.predict(data_1)
                print(f"Result: {result.get('data', {}).get('fertilizer_name')} (Confidence: {result.get('data', {}).get('confidence')})")

                # Test Case 2: High Phosphorous
                data_2 = {
                    'temperature': 25.0,
                    'humidity': 60.0,
                    'moisture': 40.0,
                    'soil_type': 'Clayey',
                    'crop_type': 'Rice',
                    'nitrogen': 10.0,
                    'phosphorous': 50.0,
                    'potassium': 10.0
                }
                
                print("\n🧪 Test Case 2 (High P):")
                result = predictor.predict(data_2)
                print(f"Result: {result.get('data', {}).get('fertilizer_name')} (Confidence: {result.get('data', {}).get('confidence')})")
                
                # Test Case 3: High Potassium
                data_3 = {
                    'temperature': 25.0,
                    'humidity': 60.0,
                    'moisture': 40.0,
                    'soil_type': 'Sandy',
                    'crop_type': 'Maize',
                    'nitrogen': 10.0,
                    'phosphorous': 10.0,
                    'potassium': 60.0
                }
                
                print("\n🧪 Test Case 3 (High K):")
                result = predictor.predict(data_3)
                print(f"Result: {result.get('data', {}).get('fertilizer_name')} (Confidence: {result.get('data', {}).get('confidence')})")
                
                # Test Case 4: High Nitrogen (Should NOT predict Ammonium Sulphate/Urea)
                data_4 = {
                    'temperature': 25.0,
                    'humidity': 60.0,
                    'moisture': 40.0,
                    'soil_type': 'Loamy',
                    'crop_type': 'Wheat',
                    'nitrogen': 200.0,  # Very High N
                    'phosphorous': 10.0,
                    'potassium': 10.0
                }
                
                print("\n🧪 Test Case 4 (High N, Low P/K):")
                result = predictor.predict(data_4)
                print(f"Result: {result.get('data', {}).get('fertilizer_name')} (Confidence: {result.get('data', {}).get('confidence')})")

            finally:
                sys.stdout = original_stdout
                print(f"Debug output written to {debug_file}")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_prediction()
