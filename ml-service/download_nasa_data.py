"""
NASA POWER API Weather Data Downloader
Downloads real historical weather data for ML training
FREE - No API key required!
"""

import requests
import pandas as pd
from datetime import datetime, timedelta
import time
import os

class NASAWeatherDownloader:
    def __init__(self):
        self.base_url = "https://power.larc.nasa.gov/api/temporal/daily/point"
        
    def download_weather_data(self, lat, lon, start_date, end_date, output_file='weather_historical.csv'):
        """
        Download real historical weather data from NASA POWER API
        
        Args:
            lat: Latitude
            lon: Longitude
            start_date: Start date (YYYYMMDD format)
            end_date: End date (YYYYMMDD format)
            output_file: Output CSV file
        """
        print("\n" + "="*60)
        print("NASA POWER API - REAL WEATHER DATA DOWNLOAD")
        print("="*60 + "\n")
        print(f"Location: {lat}, {lon}")
        print(f"Date Range: {start_date} to {end_date}")
        print(f"Output: {output_file}\n")
        
        # Parameters to download
        # T2M = Temperature at 2 Meters
        # RH2M = Relative Humidity at 2 Meters
        # PRECTOTCORR = Precipitation Corrected
        # WS2M = Wind Speed at 2 Meters
        # PS = Surface Pressure
        # ALLSKY_SFC_SW_DWN = All Sky Surface Shortwave Downward Irradiance
        
        parameters = [
            'T2M',           # Temperature (°C)
            'T2M_MIN',       # Min Temperature
            'T2M_MAX',       # Max Temperature
            'RH2M',          # Relative Humidity (%)
            'PRECTOTCORR',   # Precipitation (mm/day)
            'WS2M',          # Wind Speed (m/s)
            'PS',            # Surface Pressure (kPa)
            'ALLSKY_SFC_SW_DWN'  # Solar Radiation
        ]
        
        params_str = ','.join(parameters)
        
        # Build API URL
        url = f"{self.base_url}?parameters={params_str}&community=AG&longitude={lon}&latitude={lat}&start={start_date}&end={end_date}&format=JSON"
        
        print("Downloading data from NASA POWER API...")
        print("This may take 10-15 minutes for 2 years of data...\n")
        
        try:
            # Make request
            response = requests.get(url, timeout=300)  # 5 min timeout
            response.raise_for_status()
            
            data = response.json()
            
            # Extract parameters
            if 'properties' not in data or 'parameter' not in data['properties']:
                raise ValueError("Invalid response from NASA API")
            
            params_data = data['properties']['parameter']
            
            # Convert to DataFrame
            records = []
            dates = list(params_data['T2M'].keys())
            
            print(f"Processing {len(dates)} days of data...")
            
            for date_str in dates:
                # Parse date
                date_obj = datetime.strptime(date_str, '%Y%m%d')
                
                # Extract values
                temp = params_data['T2M'].get(date_str, None)
                temp_min = params_data['T2M_MIN'].get(date_str, None)
                temp_max = params_data['T2M_MAX'].get(date_str, None)
                humidity = params_data['RH2M'].get(date_str, None)
                rainfall = params_data['PRECTOTCORR'].get(date_str, None)
                wind_speed = params_data['WS2M'].get(date_str, None)
                pressure = params_data['PS'].get(date_str, None)
                cloudiness = 100 - (params_data['ALLSKY_SFC_SW_DWN'].get(date_str, 0) / 10)  # Approximate
                
                # Skip if missing critical data
                if temp is None or humidity is None:
                    continue
                
                # Convert wind speed from m/s to km/h
                if wind_speed is not None:
                    wind_speed = wind_speed * 3.6
                
                # Convert pressure from kPa to hPa
                if pressure is not None:
                    pressure = pressure * 10
                
                records.append({
                    'date': date_obj.strftime('%Y-%m-%d'),
                    'temperature': round(temp, 1) if temp else 0,
                    'temp_min': round(temp_min, 1) if temp_min else 0,
                    'temp_max': round(temp_max, 1) if temp_max else 0,
                    'humidity': round(humidity, 1) if humidity else 0,
                    'pressure': round(pressure, 1) if pressure else 1013,
                    'wind_speed': round(wind_speed, 1) if wind_speed else 0,
                    'cloudiness': max(0, min(100, round(cloudiness, 1))) if cloudiness else 0,
                    'rainfall': round(rainfall, 1) if rainfall else 0,
                    'lat': lat,
                    'lon': lon
                })
            
            # Create DataFrame
            df = pd.DataFrame(records)
            
            # Save to CSV
            df.to_csv(output_file, index=False)
            
            print("\n" + "="*60)
            print("DOWNLOAD COMPLETE")
            print("="*60)
            print(f"\n[OK] Downloaded {len(df)} days of REAL weather data")
            print(f"[OK] Saved to: {output_file}\n")
            
            print("Dataset Statistics:")
            print(f"  Temperature: {df['temperature'].min():.1f}°C to {df['temperature'].max():.1f}°C")
            print(f"  Humidity: {df['humidity'].min():.1f}% to {df['humidity'].max():.1f}%")
            print(f"  Rainfall: {df['rainfall'].min():.1f}mm to {df['rainfall'].max():.1f}mm")
            print(f"  Wind Speed: {df['wind_speed'].min():.1f} to {df['wind_speed'].max():.1f} km/h")
            print(f"  Date range: {df['date'].min()} to {df['date'].max()}\n")
            
            print("="*60)
            print("REAL NASA DATA READY FOR TRAINING")
            print("="*60 + "\n")
            
            return df
            
        except requests.exceptions.Timeout:
            print("\n[ERROR] Request timeout. NASA API might be slow.")
            print("        Try again or use synthetic data.")
            return None
            
        except Exception as e:
            print(f"\n[ERROR] Failed to download: {e}")
            print("        Falling back to synthetic data...")
            return None


def main():
    """Main function to download NASA weather data"""
    
    # Create datasets directory
    os.makedirs('datasets/weather', exist_ok=True)
    
    # Initialize downloader
    downloader = NASAWeatherDownloader()
    
    # Location: Chennai, India
    lat, lon = 13.0827, 80.2707
    
    # Date range: 2 years of data
    end_date = datetime.now()
    start_date = end_date - timedelta(days=730)
    
    start_str = start_date.strftime('%Y%m%d')
    end_str = end_date.strftime('%Y%m%d')
    
    print("\nDownloading 2 years of REAL weather data from NASA POWER API")
    print("Location: Chennai, India")
    print("This is FREE and requires NO API key!\n")
    
    # Download data
    df = downloader.download_weather_data(
        lat=lat,
        lon=lon,
        start_date=start_str,
        end_date=end_str,
        output_file='datasets/weather/weather_historical.csv'
    )
    
    if df is not None:
        print("SUCCESS! Real weather data downloaded.")
        print(f"Total records: {len(df)}")
        print(f"Training samples: ~{len(df) - 37}\n")
        print("Next step: Run training commands")
        print("  python weather_predictor_attention.py")
    else:
        print("Download failed. Using synthetic data instead.")
        print("Run: python generate_dataset.py")


if __name__ == '__main__':
    main()
