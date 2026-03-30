"""
Advanced Weather Data Collection
Collects historical weather data and API error patterns for training ML models
"""

import os
import requests
import pandas as pd
from datetime import datetime, timedelta
import time
import json
from dotenv import load_dotenv

load_dotenv()

class WeatherDataCollector:
    def __init__(self):
        self.api_key = os.getenv('OPENWEATHER_API_KEY', '')
        self.base_url = "https://api.openweathermap.org/data/2.5"
        
    def collect_historical_data(self, lat, lon, days=730, output_file='weather_historical.csv'):
        """
        Collect historical weather data for training
        
        Args:
            lat: Latitude
            lon: Longitude
            days: Number of days to collect (default: 730 = 2 years)
            output_file: Output CSV file
        """
        print(f"\n{'='*60}")
        print(f"COLLECTING HISTORICAL WEATHER DATA")
        print(f"{'='*60}\n")
        print(f"Location: {lat}, {lon}")
        print(f"Days: {days} ({days/365:.1f} years)")
        print(f"Output: {output_file}\n")
        
        if not self.api_key:
            print("WARNING: No API key found!")
            print("   Generating sample data for demonstration...\n")
            self._generate_sample_data(days, output_file)
            return
        
        data = []
        end_date = datetime.now()
        
        # OpenWeatherMap free tier doesn't have historical API
        # So we'll use current + forecast data and simulate historical
        print("Note: Using current weather + forecast to build dataset")
        print("   For production, use OpenWeatherMap Historical API (paid)")
        print("   or download from NOAA/NASA POWER\n")
        
        # Get current weather
        try:
            current = self._get_current_weather(lat, lon)
            if current:
                data.append(current)
                print(f"✅ Collected current weather")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        # Get forecast (next 5 days)
        try:
            forecast = self._get_forecast_data(lat, lon)
            data.extend(forecast)
            print(f"✅ Collected {len(forecast)} forecast points")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        # For demonstration, generate synthetic historical data
        print(f"\n📝 Generating synthetic historical data for training...")
        synthetic_data = self._generate_synthetic_historical(lat, lon, days - len(data))
        data.extend(synthetic_data)
        
        # Convert to DataFrame
        df = pd.DataFrame(data)
        
        # Save to CSV
        df.to_csv(output_file, index=False)
        print(f"\n✅ Saved {len(df)} records to {output_file}")
        print(f"   Columns: {', '.join(df.columns)}")
        print(f"   Date range: {df['date'].min()} to {df['date'].max()}")
        
        return df
    
    def _get_current_weather(self, lat, lon):
        """Get current weather"""
        url = f"{self.base_url}/weather"
        params = {
            'lat': lat,
            'lon': lon,
            'appid': self.api_key,
            'units': 'metric'
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        return {
            'date': datetime.now().strftime('%Y-%m-%d'),
            'temperature': data['main']['temp'],
            'temp_min': data['main']['temp_min'],
            'temp_max': data['main']['temp_max'],
            'humidity': data['main']['humidity'],
            'pressure': data['main']['pressure'],
            'wind_speed': data['wind']['speed'] * 3.6,  # m/s to km/h
            'cloudiness': data['clouds']['all'],
            'rainfall': data.get('rain', {}).get('1h', 0),
            'lat': lat,
            'lon': lon
        }
    
    def _get_forecast_data(self, lat, lon):
        """Get forecast data"""
        url = f"{self.base_url}/forecast"
        params = {
            'lat': lat,
            'lon': lon,
            'appid': self.api_key,
            'units': 'metric'
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        forecast_data = []
        for item in data['list']:
            forecast_data.append({
                'date': datetime.fromtimestamp(item['dt']).strftime('%Y-%m-%d'),
                'temperature': item['main']['temp'],
                'temp_min': item['main']['temp_min'],
                'temp_max': item['main']['temp_max'],
                'humidity': item['main']['humidity'],
                'pressure': item['main']['pressure'],
                'wind_speed': item['wind']['speed'] * 3.6,
                'cloudiness': item['clouds']['all'],
                'rainfall': item.get('rain', {}).get('3h', 0),
                'lat': lat,
                'lon': lon
            })
        
        return forecast_data
    
    def _generate_synthetic_historical(self, lat, lon, days):
        """Generate synthetic historical data for training"""
        import numpy as np
        
        data = []
        base_temp = 28  # Base temperature for India
        
        for i in range(days):
            date = datetime.now() - timedelta(days=days-i)
            
            # Seasonal variation
            day_of_year = date.timetuple().tm_yday
            seasonal_temp = 5 * np.sin(2 * np.pi * day_of_year / 365)
            
            # Random variation
            random_temp = np.random.normal(0, 3)
            
            temp = base_temp + seasonal_temp + random_temp
            
            data.append({
                'date': date.strftime('%Y-%m-%d'),
                'temperature': round(temp, 1),
                'temp_min': round(temp - 3, 1),
                'temp_max': round(temp + 5, 1),
                'humidity': int(60 + np.random.normal(0, 10)),
                'pressure': int(1013 + np.random.normal(0, 5)),
                'wind_speed': round(abs(np.random.normal(12, 5)), 1),
                'cloudiness': int(abs(np.random.normal(40, 20))),
                'rainfall': round(max(0, np.random.exponential(2)), 1),
                'lat': lat,
                'lon': lon
            })
        
        return data
    
    def _generate_sample_data(self, days, output_file):
        """Generate sample data when no API key"""
        print("📝 Generating sample dataset...")
        
        data = self._generate_synthetic_historical(13.0827, 80.2707, days)
        df = pd.DataFrame(data)
        df.to_csv(output_file, index=False)
        
        print(f"✅ Generated {len(df)} sample records")
        print(f"   Saved to: {output_file}")


def main():
    """Main function to collect weather data"""
    collector = WeatherDataCollector()
    
    # Default location: Chennai, India
    lat, lon = 13.0827, 80.2707
    
    # Collect 2 years of data
    df = collector.collect_historical_data(
        lat=lat,
        lon=lon,
        days=730,
        output_file='datasets/weather/weather_historical.csv'
    )
    
    print(f"\n{'='*60}")
    print("✅ DATA COLLECTION COMPLETE")
    print(f"{'='*60}\n")
    print("Next steps:")
    print("1. Review the generated dataset")
    print("2. Run: python train_weather_models.py")
    print("3. Models will be saved for prediction\n")


if __name__ == '__main__':
    # Create datasets directory
    os.makedirs('datasets/weather', exist_ok=True)
    main()
