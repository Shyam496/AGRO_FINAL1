"""
Weather Service - OpenWeatherMap API Integration
Provides real-time weather data with caching and microclimate adjustments
"""

import os
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import json
from functools import lru_cache
import joblib
import numpy as np
import pandas as pd
from tensorflow import keras
from weather_predictor_attention import AttentionLayer
from download_nasa_data import NASAWeatherDownloader

# Fallback coordinates for common Indian cities if API key is missing
FALLBACK_COORDS = {
    'chennai': (13.0827, 80.2707),
    'mumbai': (19.0760, 72.8777),
    'delhi': (28.6139, 77.2090),
    'bangalore': (12.9716, 77.5946),
    'hyderabad': (17.3850, 78.4867),
    'kolkata': (22.5726, 88.3639),
    'pune': (18.5204, 73.8567),
    'jaipur': (26.9124, 75.7873),
    'coimbatore': (11.0168, 76.9558),
    'madurai': (9.9252, 78.1198)
}

class WeatherService:
    def __init__(self):
        # Get API key from environment variable
        self.api_key = os.getenv('OPENWEATHER_API_KEY', '')
        self.base_url = "https://api.openweathermap.org/data/2.5"
        self.cache = {}
        self.cache_ttl = 3600  # 1 hour
        self.nasa_downloader = NASAWeatherDownloader()
        
        # Paths
        base_path = os.path.dirname(__file__)
        self.model_path = os.path.join(base_path, 'models', 'weather_lstm_attention.h5')
        self.scaler_path = os.path.join(base_path, 'models', 'weather_scaler.pkl')
        self.xgb_temp_path = os.path.join(base_path, 'models', 'error_corrector_temp.pkl')
        self.xgb_rain_path = os.path.join(base_path, 'models', 'error_corrector_rain.pkl')
        self.xgb_hum_path = os.path.join(base_path, 'models', 'error_corrector_humidity.pkl')

        self.model = None
        self.scaler = None
        self.xgb_temp = None
        self.xgb_rain = None
        self.xgb_hum = None
        self._load_models()

    def _load_models(self):
        """Lazy load models when needed"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
                self.model = keras.models.load_model(
                    self.model_path,
                    custom_objects={'AttentionLayer': AttentionLayer},
                    compile=False
                )
                self.scaler = joblib.load(self.scaler_path)
                print(f"✅ NASA LSTM model loaded successfully")
            
            if os.path.exists(self.xgb_temp_path):
                self.xgb_temp = joblib.load(self.xgb_temp_path)
                self.xgb_rain = joblib.load(self.xgb_rain_path)
                self.xgb_hum = joblib.load(self.xgb_hum_path)
                print(f"✅ XGBoost error correctors loaded")
        except Exception as e:
            print(f"⚠️ Error loading weather models: {e}")
        
    def get_current_weather(self, lat: float, lon: float) -> Dict:
        """
        Get current weather for given coordinates
        
        Args:
            lat: Latitude
            lon: Longitude
            
        Returns:
            Dictionary with current weather data
        """
        cache_key = f"current_{lat}_{lon}"
        
        # Check cache
        if self._is_cache_valid(cache_key):
            return self.cache[cache_key]['data']
        
        try:
            # Call OpenWeatherMap API
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
            
            # Format response
            weather = {
                'temperature': round(data['main']['temp'], 1),
                'feels_like': round(data['main']['feels_like'], 1),
                'temp_min': round(data['main']['temp_min'], 1),
                'temp_max': round(data['main']['temp_max'], 1),
                'humidity': data['main']['humidity'],
                'pressure': data['main']['pressure'],
                'wind_speed': round(data['wind']['speed'] * 3.6, 1),  # Convert m/s to km/h
                'wind_direction': data['wind'].get('deg', 0),
                'cloudiness': data['clouds']['all'],
                'visibility': data.get('visibility', 10000) / 1000,  # Convert to km
                'description': data['weather'][0]['description'].title(),
                'icon': data['weather'][0]['icon'],
                'sunrise': datetime.fromtimestamp(data['sys']['sunrise']).strftime('%H:%M'),
                'sunset': datetime.fromtimestamp(data['sys']['sunset']).strftime('%H:%M'),
                'location': data['name'],
                'timestamp': datetime.now().isoformat()
            }
            
            # Add rainfall if available
            if 'rain' in data:
                weather['rainfall_1h'] = data['rain'].get('1h', 0)
            else:
                weather['rainfall_1h'] = 0
            
            # Cache the result
            self._cache_data(cache_key, weather)
            
            return weather
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching current weather from OpenWeatherMap: {e}")
            
            # Fallback 1: Try Open-Meteo (Free, No API Key)
            try:
                print(f"🔄 Falling back to Open-Meteo for current weather...")
                om_url = "https://api.open-meteo.com/v1/forecast"
                om_params = {
                    'latitude': lat,
                    'longitude': lon,
                    'current_weather': True
                }
                om_response = requests.get(om_url, params=om_params, timeout=10)
                om_response.raise_for_status()
                om_data = om_response.json()['current_weather']
                
                # Map Open-Meteo weather codes to descriptions
                weather_codes = {
                    0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
                    45: 'Fog', 48: 'Depositing Rime Fog',
                    51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
                    61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
                    71: 'Slight Snow Fall', 73: 'Moderate Snow Fall', 75: 'Heavy Snow Fall',
                    77: 'Snow Grains', 80: 'Slight Rain Showers', 81: 'Moderate Rain Showers', 82: 'Violent Rain Showers',
                    95: 'Thunderstorm', 96: 'Thunderstorm with Slight Hail', 99: 'Thunderstorm with Heavy Hail'
                }
                description = weather_codes.get(om_data.get('weathercode'), 'Cloudy')
                
                weather = {
                    'temperature': round(om_data['temperature'], 1),
                    'feels_like': round(om_data['temperature'], 1), # Simplified
                    'temp_min': round(om_data['temperature'] - 2, 1),
                    'temp_max': round(om_data['temperature'] + 2, 1),
                    'humidity': 65, # Open-Meteo current requires more params, using default
                    'pressure': 1013,
                    'wind_speed': round(om_data['windspeed'], 1),
                    'wind_direction': om_data['winddirection'],
                    'cloudiness': 40 if om_data['weathercode'] < 3 else 80,
                    'visibility': 10,
                    'description': description,
                    'icon': '02d' if om_data['is_day'] else '02n',
                    'sunrise': '06:00',
                    'sunset': '18:00',
                    'location': 'Your Location',
                    'timestamp': datetime.now().isoformat(),
                    'rainfall_1h': 0,
                    'is_fallback': True
                }
                
                # Cache and return
                self._cache_data(cache_key, weather)
                return weather
                
            except Exception as om_err:
                print(f"Error fetching from Open-Meteo: {om_err}")
                return self._get_mock_current_weather()
    
    def get_forecast(self, lat: float, lon: float, days: int = 7) -> List[Dict]:
        """
        Get weather forecast for given coordinates
        
        Args:
            lat: Latitude
            lon: Longitude
            days: Number of days (max 7 for free tier)
            
        Returns:
            List of daily forecast data
        """
        cache_key = f"forecast_{lat}_{lon}_{days}"
        
        # Check cache
        if self._is_cache_valid(cache_key):
            return self.cache[cache_key]['data']
        
        try:
            # Call OpenWeatherMap 5-day forecast API
            url = f"{self.base_url}/forecast"
            params = {
                'lat': lat,
                'lon': lon,
                'appid': self.api_key,
                'units': 'metric',
                'cnt': min(days * 8, 40)  # 8 forecasts per day (3-hour intervals)
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # Group by day and calculate daily aggregates
            daily_forecast = self._aggregate_daily_forecast(data['list'], days)
            
            # Cache the result
            self._cache_data(cache_key, daily_forecast)
            
            return daily_forecast
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching forecast from OpenWeatherMap: {e}")
            
            # Fallback 1: Try Open-Meteo (Free, No API Key)
            try:
                print(f"🔄 Falling back to Open-Meteo for forecast...")
                om_url = "https://api.open-meteo.com/v1/forecast"
                om_params = {
                    'latitude': lat,
                    'longitude': lon,
                    'daily': 'temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode',
                    'timezone': 'auto'
                }
                om_response = requests.get(om_url, params=om_params, timeout=10)
                om_response.raise_for_status()
                om_data = om_response.json()['daily']
                
                weather_codes = {
                    0: 'Sunny', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Cloudy',
                    45: 'Foggy', 48: 'Foggy', 51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle',
                    61: 'Rainy', 63: 'Rainy', 65: 'Heavy Rain', 80: 'Rain Showers',
                    95: 'Thunderstorm'
                }
                
                om_forecast = []
                for i in range(min(days, len(om_data['time']))):
                    date_str = om_data['time'][i]
                    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                    
                    om_forecast.append({
                        'date': date_str,
                        'day': date_obj.strftime('%a'),
                        'temp_min': round(om_data['temperature_2m_min'][i], 1),
                        'temp_max': round(om_data['temperature_2m_max'][i], 1),
                        'temp_avg': round((om_data['temperature_2m_min'][i] + om_data['temperature_2m_max'][i]) / 2, 1),
                        'humidity': 65,
                        'wind_speed': round(om_data['windspeed_10m_max'][i], 1),
                        'rainfall': round(om_data['precipitation_sum'][i], 1),
                        'condition': weather_codes.get(om_data['weathercode'][i], 'Cloudy'),
                        'is_fallback': True
                    })
                
                self._cache_data(cache_key, om_forecast)
                return om_forecast
                
            except Exception as om_err:
                print(f"Error fetching forecast from Open-Meteo: {om_err}")
                return self._get_mock_forecast(days)

    def get_nasa_prediction(self, lat: float, lon: float) -> List[Dict]:
        """
        Generate 7-day forecast using trained NASA LSTM model
        """
        if self.model is None or self.scaler is None:
            print("⚠️ NASA model not loaded, falling back to basic forecast")
            return self.get_forecast(lat, lon)

        print(f"🔮 Generating NASA prediction for location: {lat}, {lon}")
        try:
            # 1. Download last 30 days of data from NASA POWER
            end_date = datetime.now()
            start_date = end_date - timedelta(days=45) 
            
            start_str = start_date.strftime('%Y%m%d')
            end_str = end_date.strftime('%Y%m%d')
            
            df_recent = self.nasa_downloader.download_weather_data(
                lat=lat, lon=lon, 
                start_date=start_str, 
                end_date=end_str,
                output_file=None # Don't save to disk
            )

            if df_recent is None or len(df_recent) < 30:
                print("⚠️ Insufficient NASA data, using fallback")
                return self.get_forecast(lat, lon)

            # 2. Preprocess sequence (last 30 days)
            feature_cols = ['temperature', 'humidity', 'pressure', 'wind_speed', 
                           'cloudiness', 'rainfall', 'lat', 'lon']
            
            # Take last 30 days
            recent_data = df_recent[feature_cols].tail(30).values
            scaled_data = self.scaler.transform(recent_data)
            X = scaled_data.reshape(1, 30, 8)

            # 3. Predict 7 days
            preds_scaled = self.model.predict(X, verbose=0)[0] # Shape (7, 5)

            # 4. Inverse transform
            # The model predicts (temp, rain, humidity, pressure, wind)
            dummy = np.zeros((7, 8))
            dummy[:, :5] = preds_scaled
            preds_unscaled = self.scaler.inverse_transform(dummy)[:, :5]

            # 5. Correct with XGBoost if available
            final_forecast = []
            for i in range(7):
                date = datetime.now() + timedelta(days=i+1)
                
                # The model predicts first 5 features: [temp, humidity, pressure, wind_speed, cloudiness]
                temp = float(preds_unscaled[i, 0])
                hum = max(0, min(100, float(preds_unscaled[i, 1])))
                pres = float(preds_unscaled[i, 2])
                wind = max(0.0, float(preds_unscaled[i, 3]))
                cloud = max(0, min(100, float(preds_unscaled[i, 4])))
                rain = 0.0 # Model only predicts 5 features; rainfall is index 5

                # Apply XGBoost corrections if models exist
                if self.xgb_temp:
                    features = np.array([[temp, rain, hum, pres, wind, date.timetuple().tm_yday, date.month, 12, lat, lon]])
                    temp += self.xgb_temp.predict(features)[0]
                    rain = max(0, rain + self.xgb_rain.predict(features)[0])
                    hum = max(0, min(100, hum + self.xgb_hum.predict(features)[0]))

                # Map condition based on prediction
                condition = "Sunny"
                if rain > 5: condition = "Rainy"
                elif rain > 1: condition = "Drizzle"
                elif hum > 80: condition = "Cloudy"
                elif hum > 60: condition = "Partly Cloudy"

                final_forecast.append({
                    'date': date.isoformat(),
                    'day': date.strftime('%a'),
                    'temp_min': round(temp - 2, 1),
                    'temp_max': round(temp + 2, 1),
                    'temp_avg': round(temp, 1),
                    'humidity': round(hum),
                    'wind_speed': round(wind, 1),
                    'rainfall': round(rain, 1),
                    'condition': condition,
                    'is_nasa_prediction': True
                })

            return final_forecast

        except Exception as e:
            print(f"❌ Error in NASA prediction: {e}")
            return self.get_forecast(lat, lon)
    
    def get_weather_by_city(self, city_name: str) -> Tuple[Dict, float, float]:
        """
        Get weather by city name
        
        Args:
            city_name: Name of the city
            
        Returns:
            Tuple of (weather_data, latitude, longitude)
        """
        try:
            # 1. Check fallbacks first
            city_lower = city_name.lower().strip()
            if city_lower in FALLBACK_COORDS:
                print(f"📍 Using fallback coordinates for: {city_name}")
                lat, lon = FALLBACK_COORDS[city_lower]
                weather = self.get_current_weather(lat, lon)
                weather['location'] = city_name.title()
                return weather, lat, lon

            # 2. Try Nominatim (OpenStreetMap) for Villages/Towns
            print(f"🔍 Searching Nominatim for village/town: {city_name}")
            nom_url = "https://nominatim.openstreetmap.org/search"
            headers = {
                'User-Agent': 'AgroMind_FinalProject_Assistant' # Required by Nominatim policy
            }
            nom_params = {
                'q': city_name,
                'format': 'json',
                'limit': 1,
                'addressdetails': 1
            }
            
            response = requests.get(nom_url, params=nom_params, headers=headers, timeout=10)
            response.raise_for_status()
            nom_data = response.json()
            
            if nom_data:
                lat = float(nom_data[0]['lat'])
                lon = float(nom_data[0]['lon'])
                display_name = nom_data[0].get('display_name', city_name).split(',')[0]
                print(f"✅ Found via Nominatim: {display_name} ({lat}, {lon})")
                
                weather = self.get_current_weather(lat, lon)
                weather['location'] = display_name
                return weather, lat, lon

            # 3. Fallback to OpenWeatherMap Geocoding for Cities
            if self.api_key:
                print(f"🔍 Falling back to OpenWeatherMap for: {city_name}")
                geo_url = "http://api.openweathermap.org/geo/1.0/direct"
                geo_params = {
                    'q': city_name,
                    'limit': 1,
                    'appid': self.api_key
                }
                response = requests.get(geo_url, params=geo_params, timeout=10)
                response.raise_for_status()
                geo_data = response.json()
                
                if geo_data:
                    lat = geo_data[0]['lat']
                    lon = geo_data[0]['lon']
                    weather = self.get_current_weather(lat, lon)
                    return weather, lat, lon
            
            raise ValueError(f"Village or city '{city_name}' not found. Try 'Use My Location'.")
            
        except requests.exceptions.RequestException:
            # Network/Timeout error likely means the place doesn't specific enough or server is busy
            print(f"❌ Nominatim Timeout/Error for '{city_name}'")
            raise ValueError(f"Could not find weather for '{city_name}'. Please check the city name or try 'Use My Location'.")
        except Exception as e:
            print(f"❌ Geocoding Error for '{city_name}': {e}")
            # If it was already a specific ValueError (like not found), use that message, otherwise generic
            if "not found" in str(e):
                 raise ValueError(f"Invalid location: '{city_name}'. Please check the spelling or try 'Use My Location' for automatic detection.")
            raise ValueError(f"Invalid location: '{city_name}'. Please check the spelling or try 'Use My Location' for automatic detection.")
    
    def get_weather_by_coords(self, lat: float, lon: float) -> Tuple[Dict, float, float]:
        """
        Get weather using exact GPS coordinates (Most efficient for farmers)
        """
        try:
            weather = self.get_current_weather(lat, lon)
            return weather, lat, lon
        except Exception as e:
            print(f"❌ Error fetching weather by coordinates: {e}")
            raise ValueError("Could not fetch weather for these coordinates.")
    
    def apply_microclimate_correction(self, weather: Dict, elevation: float = 0, 
                                     terrain_type: str = 'plain') -> Dict:
        """
        Apply microclimate corrections to weather data
        
        Args:
            weather: Base weather data
            elevation: Elevation in meters above sea level
            terrain_type: 'plain', 'valley', 'hill', 'coastal'
            
        Returns:
            Adjusted weather data
        """
        adjusted = weather.copy()
        
        # Temperature adjustment for elevation (-0.6°C per 100m)
        if elevation > 0:
            temp_adjustment = -(elevation / 100) * 0.6
            adjusted['temperature'] += temp_adjustment
            adjusted['temp_min'] += temp_adjustment
            adjusted['temp_max'] += temp_adjustment
        
        # Terrain-specific adjustments
        if terrain_type == 'valley':
            # Valleys are cooler at night (frost pockets)
            adjusted['temp_min'] -= 2
        elif terrain_type == 'coastal':
            # Coastal areas have moderated temperatures
            adjusted['temperature'] += 1
            adjusted['humidity'] += 5
        elif terrain_type == 'hill':
            # Hills are windier
            adjusted['wind_speed'] *= 1.2
        
        return adjusted
    
    def _aggregate_daily_forecast(self, forecast_list: List[Dict], days: int) -> List[Dict]:
        """Aggregate 3-hour forecasts into daily forecasts"""
        daily_data = {}
        
        for item in forecast_list:
            date = datetime.fromtimestamp(item['dt']).date()
            
            if date not in daily_data:
                daily_data[date] = {
                    'temps': [],
                    'humidity': [],
                    'wind_speed': [],
                    'rainfall': 0,
                    'conditions': []
                }
            
            daily_data[date]['temps'].append(item['main']['temp'])
            daily_data[date]['humidity'].append(item['main']['humidity'])
            daily_data[date]['wind_speed'].append(item['wind']['speed'])
            
            if 'rain' in item:
                daily_data[date]['rainfall'] += item['rain'].get('3h', 0)
            
            daily_data[date]['conditions'].append(item['weather'][0]['description'])
        
        # Convert to list format
        forecast = []
        for date, data in sorted(daily_data.items())[:days]:
            forecast.append({
                'date': date.isoformat(),
                'day': date.strftime('%a'),
                'temp_min': round(min(data['temps']), 1),
                'temp_max': round(max(data['temps']), 1),
                'temp_avg': round(sum(data['temps']) / len(data['temps']), 1),
                'humidity': round(sum(data['humidity']) / len(data['humidity'])),
                'wind_speed': round(sum(data['wind_speed']) / len(data['wind_speed']) * 3.6, 1),
                'rainfall': round(data['rainfall'], 1),
                'condition': max(set(data['conditions']), key=data['conditions'].count).title()
            })
        
        return forecast
    
    def _is_cache_valid(self, key: str) -> bool:
        """Check if cached data is still valid"""
        if key not in self.cache:
            return False
        
        cache_time = self.cache[key]['timestamp']
        return (datetime.now() - cache_time).seconds < self.cache_ttl
    
    def _cache_data(self, key: str, data: any):
        """Cache data with timestamp"""
        self.cache[key] = {
            'data': data,
            'timestamp': datetime.now()
        }
    
    def _get_mock_current_weather(self) -> Dict:
        """Return mock weather data as fallback"""
        return {
            'temperature': 28,
            'feels_like': 30,
            'temp_min': 24,
            'temp_max': 32,
            'humidity': 65,
            'pressure': 1013,
            'wind_speed': 12,
            'wind_direction': 180,
            'cloudiness': 40,
            'visibility': 10,
            'description': 'Partly Cloudy',
            'icon': '02d',
            'sunrise': '06:30',
            'sunset': '18:45',
            'rainfall_1h': 0,
            'location': 'Demo Location',
            'timestamp': datetime.now().isoformat()
        }
    
    def _get_mock_forecast(self, days: int) -> List[Dict]:
        """Return highly randomized mock forecast data for demo exploration"""
        forecast = []
        for i in range(days):
            date = datetime.now().date() + timedelta(days=i)
            
            # High randomization for Demo WOW factor
            # 30% chance of rain, 20% chance of high wind, 20% chance of extreme heat
            scenario = random.random()
            
            if scenario < 0.2: # Extreme Heat (Red Irrigation)
                temp_max = random.uniform(31, 35)
                rain_val = 0.0
                wind_val = random.uniform(5, 12)
                hum_val = random.randint(30, 50)
                condition = 'Sunny'
            elif scenario < 0.5: # Rainy (Red Spraying/Harvesting)
                temp_max = random.uniform(22, 26)
                rain_val = random.uniform(5, 15)
                wind_val = random.uniform(10, 20)
                hum_val = random.randint(75, 95)
                condition = 'Rainy'
            elif scenario < 0.7: # Windy (Amber/Red Spraying)
                temp_max = random.uniform(26, 30)
                rain_val = 0.0
                wind_val = random.uniform(25, 45)
                hum_val = random.randint(40, 60)
                condition = 'Partly Cloudy'
            else: # Perfect Weather (Green)
                temp_max = random.uniform(27, 30)
                rain_val = 0.0
                wind_val = random.uniform(5, 15)
                hum_val = random.randint(50, 65)
                condition = 'Mainly Clear'
            
            forecast.append({
                'date': date.isoformat(),
                'day': date.strftime('%a'),
                'temp_min': round(temp_max - random.uniform(4, 7), 1),
                'temp_max': round(temp_max, 1),
                'temp_avg': round(temp_max - 2, 1),
                'humidity': hum_val,
                'wind_speed': round(wind_val, 1),
                'rainfall': round(rain_val, 1),
                'condition': condition
            })
        
        return forecast


# Global instance
weather_service = WeatherService()
