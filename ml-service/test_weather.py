"""
Test Weather Service
Quick script to test weather API integration
"""

import os
from weather_service import weather_service
from farming_advisory import farming_advisory

def test_weather_service():
    print("\n" + "="*60)
    print("🌤️  TESTING WEATHER SERVICE")
    print("="*60 + "\n")
    
    # Check API key
    api_key = os.getenv('OPENWEATHER_API_KEY', '')
    if not api_key:
        print("⚠️  WARNING: OPENWEATHER_API_KEY not set in environment")
        print("   Set it in .env file or environment variables")
        print("   Using mock data for testing...\n")
    else:
        print(f"✅ API Key configured: {api_key[:8]}...{api_key[-4:]}\n")
    
    # Test coordinates (Chennai, India)
    lat, lon = 13.0827, 80.2707
    
    print(f"📍 Testing location: Chennai ({lat}, {lon})\n")
    
    # Test 1: Current Weather
    print("Test 1: Current Weather")
    print("-" * 40)
    try:
        weather = weather_service.get_current_weather(lat, lon)
        print(f"✅ Temperature: {weather['temperature']}°C")
        print(f"✅ Humidity: {weather['humidity']}%")
        print(f"✅ Wind Speed: {weather['wind_speed']} km/h")
        print(f"✅ Description: {weather['description']}")
        print(f"✅ Location: {weather['location']}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n")
    
    # Test 2: Forecast
    print("Test 2: 7-Day Forecast")
    print("-" * 40)
    try:
        forecast = weather_service.get_forecast(lat, lon, 7)
        print(f"✅ Got {len(forecast)} days of forecast")
        for day in forecast[:3]:  # Show first 3 days
            print(f"   {day['day']}: {day['temp_min']}°C - {day['temp_max']}°C, {day['condition']}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n")
    
    # Test 3: Farming Advisory
    print("Test 3: Farming Advisory")
    print("-" * 40)
    try:
        forecast = weather_service.get_forecast(lat, lon, 7)
        advisory = farming_advisory.generate_advisory(forecast, 'rice')
        
        print(f"✅ Irrigation: {advisory['irrigation']['recommendation']}")
        print(f"   Reason: {advisory['irrigation']['reason']}")
        print(f"\n✅ Spraying: {advisory['spraying']['recommendation']}")
        print(f"   Reason: {advisory['spraying']['reason']}")
        print(f"\n✅ Harvesting: {advisory['harvesting']['recommendation']}")
        print(f"   Reason: {advisory['harvesting']['reason']}")
        
        if advisory['alerts']:
            print(f"\n⚠️  Alerts: {len(advisory['alerts'])} active")
            for alert in advisory['alerts']:
                print(f"   - {alert['message']}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n")
    
    # Test 4: City Search
    print("Test 4: Weather by City Name")
    print("-" * 40)
    try:
        weather, lat, lon = weather_service.get_weather_by_city("Mumbai")
        print(f"✅ City: {weather['location']}")
        print(f"✅ Coordinates: {lat}, {lon}")
        print(f"✅ Temperature: {weather['temperature']}°C")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "="*60)
    print("✅ TESTING COMPLETE")
    print("="*60 + "\n")


if __name__ == '__main__':
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    test_weather_service()
