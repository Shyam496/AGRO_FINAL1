"""
Simple Dataset Generator for Weather ML Training
Generates 2 years of synthetic weather data
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

def generate_weather_dataset(days=730, output_file='datasets/weather/weather_historical.csv'):
    """Generate synthetic weather dataset"""
    
    print("\n" + "="*60)
    print("GENERATING WEATHER DATASET")
    print("="*60 + "\n")
    print(f"Days: {days} ({days/365:.1f} years)")
    print(f"Output: {output_file}\n")
    
    # Create datasets directory
    os.makedirs('datasets/weather', exist_ok=True)
    
    data = []
    base_temp = 28  # Base temperature for India
    lat, lon = 13.0827, 80.2707  # Chennai
    
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
    
    # Convert to DataFrame
    df = pd.DataFrame(data)
    
    # Save to CSV
    df.to_csv(output_file, index=False)
    
    print(f"[OK] Generated {len(df)} records")
    print(f"[OK] Saved to: {output_file}")
    print(f"\nDataset Statistics:")
    print(f"  Temperature: {df['temperature'].min():.1f}°C to {df['temperature'].max():.1f}°C")
    print(f"  Humidity: {df['humidity'].min()}% to {df['humidity'].max()}%")
    print(f"  Rainfall: {df['rainfall'].min():.1f}mm to {df['rainfall'].max():.1f}mm")
    print(f"  Date range: {df['date'].min()} to {df['date'].max()}")
    
    print("\n" + "="*60)
    print("DATASET READY FOR TRAINING")
    print("="*60 + "\n")
    
    return df

if __name__ == '__main__':
    df = generate_weather_dataset(730)
    print("Dataset is sufficient for training!")
    print(f"Total samples: {len(df)}")
    print(f"Training samples (after sequences): ~{len(df) - 37}")
