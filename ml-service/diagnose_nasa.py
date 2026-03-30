import os
import sys
from datetime import datetime, timedelta

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from weather_service import weather_service
from farming_advisory import farming_advisory

def diagnose_nasa_model():
    print("\n" + "="*50)
    print("🧠 DIAGNOSING NASA LSTM MODEL")
    print("="*50 + "\n")

    # 1. Check Model Files
    print("Step 1: Checking Model Files...")
    model_exists = os.path.exists(weather_service.model_path)
    scaler_exists = os.path.exists(weather_service.scaler_path)
    print(f"   LSTM Model (.h5): {'✅ Found' if model_exists else '❌ Missing'}")
    print(f"   Scaler (.pkl): {'✅ Found' if scaler_exists else '❌ Missing'}")
    print(f"   Model Path: {weather_service.model_path}")
    print(f"   Scaler Path: {weather_service.scaler_path}")

    if not model_exists or not scaler_exists:
        print("\n❌ CRITICAL: Model files are missing from the 'models/' directory.")
        return

    # 2. Check if models are loaded in memory
    print("\nStep 2: Checking Memory Loading...")
    if weather_service.model is None:
        print("   ⚠️ Model is not loaded. Loading now...")
        weather_service._load_models()
    
    if weather_service.model is not None:
        print("   ✅ LSTM Model successfully loaded into memory")
    else:
        print("   ❌ FAILED to load LSTM model")

    # 3. Test NASA Data Fetching
    print("\nStep 3: Testing NASA Data Fetch...")
    lat, lon = 13.0827, 80.2707
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=45)
        s_str = start_date.strftime('%Y%m%d')
        e_str = end_date.strftime('%Y%m%d')
        
        df = weather_service.nasa_downloader.download_weather_data(
            lat=lat, lon=lon, start_date=s_str, end_date=e_str, output_file=None
        )
        if df is not None:
            print(f"   ✅ Successfully fetched {len(df)} days from NASA API")
        else:
            print("   ❌ NASA data downloader returned None")
    except Exception as e:
        print(f"   ❌ Error during NASA fetch: {e}")

    # 4. Test Prediction
    print("\nStep 4: Running get_nasa_prediction...")
    try:
        forecast = weather_service.get_nasa_prediction(lat, lon)
        if forecast:
            is_real = forecast[0].get('is_nasa_prediction', False)
            print(f"   ✅ SUCCESS! Forecast generated ({len(forecast)} days)")
            print(f"   Model used: {'NASA AI MODEL' if is_real else '❌ FALLBACK/MOCK'}")
            if not is_real:
                print("   ⚠️ Warning: System fell back to mock/OpenWeatherMap data.")
        else:
            print("   ❌ Forecast came back empty")
    except Exception as e:
        print(f"   ❌ Prediction error: {e}")
        import traceback
        traceback.print_exc()

    print("\n" + "="*50)
    print("✅ DIAGNOSIS COMPLETE")
    print("="*50 + "\n")

if __name__ == "__main__":
    diagnose_nasa_model()
