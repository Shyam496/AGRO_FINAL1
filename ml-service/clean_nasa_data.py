"""
Clean NASA Weather Dataset
Removes missing values (-999) and interpolates
"""

import pandas as pd
import numpy as np

def clean_nasa_data(input_file='datasets/weather/weather_historical.csv', 
                    output_file='datasets/weather/weather_historical.csv'):
    """Clean NASA weather data"""
    
    print("\n" + "="*60)
    print("CLEANING NASA WEATHER DATA")
    print("="*60 + "\n")
    
    # Load data
    df = pd.read_csv(input_file)
    print(f"Loaded {len(df)} records")
    
    # Replace -999 (NASA missing value indicator) with NaN
    df = df.replace(-999, np.nan)
    df = df.replace(-999.0, np.nan)
    
    # Check missing values
    missing_before = df.isnull().sum().sum()
    print(f"Missing values: {missing_before}")
    
    # Interpolate missing values
    numeric_cols = ['temperature', 'temp_min', 'temp_max', 'humidity', 
                   'pressure', 'wind_speed', 'cloudiness', 'rainfall']
    
    for col in numeric_cols:
        if col in df.columns:
            # Linear interpolation
            df[col] = df[col].interpolate(method='linear', limit_direction='both')
            
            # Fill any remaining NaN with column mean
            df[col] = df[col].fillna(df[col].mean())
    
    # Ensure no negative values (except temp_min can be negative)
    df['humidity'] = df['humidity'].clip(0, 100)
    df['pressure'] = df['pressure'].clip(900, 1100)
    df['wind_speed'] = df['wind_speed'].clip(0, 200)
    df['cloudiness'] = df['cloudiness'].clip(0, 100)
    df['rainfall'] = df['rainfall'].clip(0, None)
    
    # Check after cleaning
    missing_after = df.isnull().sum().sum()
    print(f"Missing values after cleaning: {missing_after}")
    
    # Save cleaned data
    df.to_csv(output_file, index=False)
    
    print(f"\n[OK] Cleaned dataset saved to: {output_file}")
    print(f"\nCleaned Dataset Statistics:")
    print(f"  Temperature: {df['temperature'].min():.1f}°C to {df['temperature'].max():.1f}°C")
    print(f"  Humidity: {df['humidity'].min():.1f}% to {df['humidity'].max():.1f}%")
    print(f"  Rainfall: {df['rainfall'].min():.1f}mm to {df['rainfall'].max():.1f}mm")
    print(f"  Wind Speed: {df['wind_speed'].min():.1f} to {df['wind_speed'].max():.1f} km/h")
    print(f"  Records: {len(df)}")
    
    print("\n" + "="*60)
    print("DATASET READY FOR TRAINING")
    print("="*60 + "\n")
    
    return df

if __name__ == '__main__':
    df = clean_nasa_data()
    print("Dataset cleaned successfully!")
    print(f"Total records: {len(df)}")
    print(f"Training samples: ~{len(df) - 37}")
