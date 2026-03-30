"""
Farming Advisory Engine
Generates intelligent farming recommendations based on weather forecasts
"""

from datetime import datetime, timedelta
from typing import Dict, List
import random

class FarmingAdvisory:
    def __init__(self):
        self.crop_data = self._load_crop_data()
    
    def generate_advisory(self, forecast: List[Dict], crop_type: str = None) -> Dict:
        """
        Generate comprehensive farming advisory with natural language
        """
        # Determine unique rainy days for the advisory string
        rainy_days = [day['day'] for day in forecast[:5] if day['rainfall'] > 2]
        rain_day_str = ""
        if len(rainy_days) > 1:
            rain_day_str = f"{', '.join(rainy_days[:-1])} and {rainy_days[-1]}"
        elif rainy_days:
            rain_day_str = rainy_days[0]
        else:
            rain_day_str = "the upcoming week"

        advisory = {
            'irrigation': self._get_irrigation_advisory(forecast, rain_day_str),
            'spraying': self._get_spraying_advisory(forecast, rain_day_str),
            'harvesting': self._get_harvesting_advisory(forecast, rain_day_str),
            'alerts': self._get_weather_alerts(forecast, rain_day_str),
            'activities': self._get_recommended_activities(forecast, rain_day_str)
        }
        
        return advisory
    
    def _get_irrigation_advisory(self, forecast: List[Dict], rain_day_str: str) -> Dict:
        """Generate irrigation recommendations with multi-point randomization"""
        next_3_days = forecast[:3]
        total_rainfall = sum(day['rainfall'] for day in next_3_days)
        is_rainy = any(day['rainfall'] > 2.0 for day in next_3_days)
        
        if is_rainy or total_rainfall > 4.0:
            status = random.choice([
                'Skip Irrigation', 'Rain Expected', 'Natural Irrigation', 
                'Delay Watering', 'Wet Forecast', 'High Moisture Risk',
                'Natural Watering', 'Watering Unnecessary', 'Rainy Forecast',
                'Stop Irrigation', 'Saturated Soil', 'Storm Alert'
            ])
            status_type = 'danger' # Red
            
            all_points = [
                f"With the forecasted rainfall on {rain_day_str}, it's advisable to delay irrigation until the weather clears.",
                "Natural precipitation will provide sufficient moisture for the root zone.",
                "Excessive watering during cloudy/rainy periods can lead to root rot and anaerobic soil conditions.",
                f"Rainfall of {total_rainfall}mm is expected in the next 72 hours, making manual irrigation redundant.",
                "Monitor your fields for water accumulation to ensure proper drainage after the rain.",
                "Soil moisture levels are high; supplemental irrigation will be counterproductive today."
            ]
            points = random.sample(all_points, random.randint(2, 3))
        elif any(day['temp_max'] > 30 for day in next_3_days): # Lowered from 32 to 30 for TN locations
            status = random.choice([
                'Heat Stress Alert', 'Intense Irrigation', 'Increase Watering', 
                'Heavy Irrigation', 'Cooling Needed', 'High Evaporation',
                'Thermal Relief', 'Urgent Hydration', 'Afternoon Peak Care'
            ])
            status_type = 'danger' # Red for High Urgency/Hazardous Heat
            all_points = [
                "High temperatures forecasted. Increase water volume to compensate for rapid evaporation.",
                "Heat stress risk detected. Ensure deep irrigation in early morning to protect root systems.",
                "Plants will require extra hydration to maintain vigor during the afternoon peak heat.",
                "Soil is likely to dry out quickly. Maintain a high-volume watering schedule.",
                "Focus on uniform water distribution to prevent localized crop wilting.",
                "Morning irrigation is critical today to help plants build water reserves before the sun peaks."
            ]
            points = random.sample(all_points, 2)
        elif any(day['humidity'] > 80 for day in next_3_days) or (total_rainfall > 0.5):
            status = random.choice([
                'Moderate Watering', 'Reduced Irrigation', 'Light Watering', 
                'Moisture Watch', 'Low Volume Needed', 'Partial Irrigation',
                'Watchful Watering', 'Humidity Guard', 'Limited Schedule',
                'Dampness Watch', 'Fog/Dew Alert'
            ])
            status_type = 'warning' # Yellow/Amber
            all_points = [
                "High humidity levels detected. Soil moisture will evaporate slowly; consider reducing water volume.",
                "Moderate soil moisture levels expected from light drizzles. Monitor before next irrigation cycle.",
                "Atmospheric moisture is high, reducing crop transpiration rates. Avoid over-watering today.",
                "Maintain a light irrigation schedule to prevent waterlogging in the current humid conditions.",
                "Check for dew accumulation; if heavy, postpone the first morning watering cycle."
            ]
            points = random.sample(all_points, 2)
        else:
            status = random.choice([
                'Safe to Irrigate', 'Ideal Window', 'Optimal Schedule', 
                'Perfect for Watering', 'Standard Cycle', 'Good Moisture Window',
                'Regular Irrigation', 'Efficient Watering', 'Clear Sky Watering',
                'Ideal Watering Window', 'Favorable Conditions'
            ])
            status_type = 'success' # Green
            
            all_points = [
                "Weather remains dry. Ensure consistent watering for your crops to prevent moisture stress.",
                "Minimal rain predicted. It is a good time to check your drip systems for uniform distribution.",
                "The low humidity profile suggests plants will transpire faster; maintain regular water levels.",
                "Current soil moisture levels are likely decreasing; consider a deep irrigation cycle today.",
                "Proceed with your regular irrigation schedule, preferably in the early morning.",
                "Stable conditions ahead; maintain your standard fertigation or irrigation routine."
            ]
            points = random.sample(all_points, random.randint(2, 3))

        return {
            'title': 'Irrigation Advice',
            'status': status,
            'status_type': status_type,
            'message': " ".join(points),
            'points': points,
            'icon': 'droplet'
        }

    def _get_spraying_advisory(self, forecast: List[Dict], rain_day_str: str) -> Dict:
        """Generate spraying recommendations with multi-point randomization"""
        next_2_days = forecast[:2]
        high_wind = any(day['wind_speed'] > 20 for day in next_2_days)
        is_rainy = any(day['rainfall'] > 2.5 for day in next_2_days)

        if is_rainy or high_wind:
            reason = []
            if is_rainy: reason.append("rainy periods")
            if high_wind: reason.append("high winds")
            reason_str = " and ".join(reason)
            
            status = random.choice([
                'Avoid Spraying', 'Not Recommended', 'Extremely Risky', 
                'Chemical Washout', 'Spray Postponed', 'High Drift Risk',
                'Abort Spraying', 'Unsafe Window', 'Storm Warning'
            ])
            status_type = 'danger' # Red for Negative
            
            all_points = [
                f"Avoid pesticide application during {reason_str} to prevent runoff and ensure effective coating.",
                f"Conditions are not suitable for spraying. Rain on {rain_day_str} would wash away expensive chemicals.",
                f"High wind levels will cause chemical drift, reducing the effectiveness of the treatment.",
                "Postpone spraying until a clear 24-hour window with low wind speeds is confirmed.",
                "Monitor for pest activity but delay chemical control until the weather stabilizes."
            ]
            points = random.sample(all_points, random.randint(2, 3))
        elif any(day['wind_speed'] > 10 for day in next_2_days) or any(day['humidity'] > 75 for day in next_2_days):
            status = random.choice([
                'Moderate Caution', 'Spray with Care', 'Watch Wind Speed', 
                'Marginal Window', 'Limited Spraying', 'Breeze Alert',
                'Cautionary Window', 'Monitor Weather', 'Careful Application'
            ])
            status_type = 'warning' # Amber for Partial
            all_points = [
                "Moderate winds detected. Use low-drift nozzles if spraying is necessary today.",
                "High humidity may delay the drying of spray droplets. Spray during early morning hours.",
                "Conditions are marginal. Ensure wind direction is away from sensitive neighboring crops.",
                "Slight risk of drift due to afternoon breeze. Plan your spraying activities for early morning."
            ]
            points = random.sample(all_points, 2)
        else:
            status = random.choice([
                'Good to Spray', 'Optimal Window', 'Perfect for Spraying', 
                'Calm Conditions', 'Safe Window', 'Excellent Spray Day',
                'Favorable Spraying', 'Standard Schedule', 'Ready to Spray'
            ])
            status_type = 'success' # Green for Positive
            
            all_points = [
                "Calm winds and clear skies forecasted. This is an ideal window for foliar fertilizer application.",
                "Weather conditions are perfect for field spraying with minimal risk of chemical drift.",
                "No rain expected in the critical 12-hour window after application; good for absorption.",
                "Low humidity and sunny conditions will help in the faster drying of spray residues.",
                "Excellent window for pest control measures to be executed today."
            ]
            points = random.sample(all_points, random.randint(2, 3))

        return {
            'title': 'Pesticide Spraying',
            'status': status,
            'status_type': status_type,
            'message': " ".join(points),
            'points': points,
            'icon': 'check-circle' if status_type == 'success' else 'alert-triangle'
        }

    def _get_harvesting_advisory(self, forecast: List[Dict], rain_day_str: str) -> Dict:
        """Generate harvesting recommendations with multi-point randomization"""
        next_3_days = forecast[:3]
        is_rainy = any(day['rainfall'] > 2 for day in next_3_days)
        is_very_rainy = any(day['rainfall'] > 10 for day in forecast[:5])

        if is_very_rainy:
            status = random.choice([
                'Stop Harvesting', 'High Risk Alert', 'Severe Spoilage', 
                'Critical Delay', 'Emergency Pause', 'Crop Safety Alert',
                'Harvest Postponed', 'Hazardous Window', 'Major Spoilage Risk',
                'Severe Storm Warning', 'Abort Harvest'
            ])
            status_type = 'danger' # Red
            all_points = [
                f"Heavy rain expected around {rain_day_str}. Harvesting now would lead to severe crop spoilage.",
                "Fields will be inaccessible for machinery. Immediate risk of grain rot and sprouting.",
                "High possibility of field flooding. Secure all harvested produce and delay further operations.",
                "Weather conditions are hostile for harvest. Quality will be severely compromised.",
                "Monitor for pest outbreaks following this heavy rain event which can affect crop storage quality."
            ]
            points = random.sample(all_points, 3)
        elif is_rainy or any(day['humidity'] > 85 for day in next_3_days):
            status = random.choice([
                'Delay Harvesting', 'Moderate Caution', 'Rain Delay Expected', 
                'Wait for Drier Skies', 'Moisture Warning', 'Uncertain Window',
                'Postpone Harvest', 'Watchful Delay', 'Brief Interruption',
                'High Humidity Alert', 'Fungal Risk'
            ])
            status_type = 'warning' # Amber
            all_points = [
                f"The upcoming rains on {rain_day_str} may lead to crop damage or grain sprouting.",
                "High moisture levels during harvest increase the risk of post-harvest fungal infections.",
                "Soggy soil conditions will make movement of harvesting machinery difficult.",
                "Rake and protect any crops already drying in the field before the rain starts.",
                "Exposed harvested material should be moved to covered storage as soon as possible."
            ]
            points = random.sample(all_points, 2)
        elif any(day['humidity'] > 70 for day in next_3_days):
            status = random.choice([
                'Monitor Moisture', 'Check Humidity', 'Partial Harvest', 
                'Humidity Guard', 'Watchful Drying', 'Moisture Balance',
                'Fair Conditions', 'Slow Drying Alert', 'Check Crop Quality',
                'Morning Dew Alert'
            ])
            status_type = 'warning' # Amber
            all_points = [
                "Relative humidity is high, which may slow down the drying of harvested produce.",
                "Moderate moisture in the air. Ensure harvested crops are stored in well-ventilated areas.",
                "Conditions are fair, but check grain moisture levels before starting full-scale harvest.",
                "Evening dew might be heavy. Aim for mid-day harvesting for better quality.",
                "Airflow in storage bins should be optimized to handle the elevated moisture levels today."
            ]
            points = random.sample(all_points, 2)
        else:
            status = random.choice([
                'Good to Harvest', 'Peak Harvest Window', 'Optimal Harvest', 
                'Safe for Harvest', 'Excellent Drying Day', 'Harvest Ready',
                'Sunny Harvest Window', 'Ideal Field Prep', 'Clear Field Window',
                'Prime Harvesting Day', 'Perfect Quality Window'
            ])
            status_type = 'success' # Green
            
            all_points = [
                "Dry weather conditions are favorable for harvesting and natural sun-drying processes.",
                "Sunny forecast ahead! It's an excellent time to complete the harvest for peak quality.",
                "The low probability of rain for the next 72 hours provides a safe window for field operations.",
                "Optimal grain moisture levels can be achieved with the current high-temperature forecast.",
                "Proceed with harvesting ripe produce to avoid loss from over-maturing or bird damage.",
                "Labor and machinery should be maximized during this perfect harvesting window."
            ]
            points = random.sample(all_points, random.randint(2, 3))

        return {
            'title': 'Harvesting',
            'status': status,
            'status_type': status_type,
            'message': " ".join(points),
            'points': points,
            'icon': 'sun'
        }
    
    def _get_sowing_advisory(self, forecast: List[Dict]) -> Dict:
        """Generate sowing recommendations"""
        next_7_days = forecast[:7]
        rainfall_pattern = [day['rainfall'] for day in next_7_days]
        total_rain = sum(rainfall_pattern)
        
        if total_rain < 5:
            return {
                'recommendation': 'Ensure irrigation availability',
                'reason': 'Dry conditions expected',
                'action': 'Irrigate after sowing',
                'priority': 'medium'
            }
        elif 10 <= total_rain <= 30:
            return {
                'recommendation': 'Good conditions for sowing',
                'reason': f'Adequate rainfall expected ({total_rain}mm)',
                'action': 'Proceed with sowing as planned',
                'priority': 'optimal'
            }
        else:
            return {
                'recommendation': 'Delay sowing',
                'reason': f'Excessive rainfall expected ({total_rain}mm)',
                'action': 'Wait for soil to drain',
                'priority': 'high'
            }
    
    def _get_general_advisory(self, forecast: List[Dict]) -> List[str]:
        """Generate general farming tips"""
        tips = []
        
        # Check for temperature extremes
        max_temp = max(day['temp_max'] for day in forecast[:3])
        min_temp = min(day['temp_min'] for day in forecast[:3])
        
        if max_temp > 38:
            tips.append(f"⚠️ High temperature alert ({max_temp}°C) - Increase irrigation frequency")
        
        if min_temp < 10:
            tips.append(f"⚠️ Low temperature alert ({min_temp}°C) - Protect sensitive crops")
        
        # Check for wind
        max_wind = max(day['wind_speed'] for day in forecast[:3])
        if max_wind > 40:
            tips.append(f"⚠️ High wind warning ({max_wind} km/h) - Secure structures and equipment")
        
        # General tips
        tips.append("✓ Monitor weather daily for sudden changes")
        tips.append("✓ Keep farm equipment ready for weather changes")
        
        return tips
    
    def _get_weather_alerts(self, forecast: List[Dict], rain_day_str: str) -> List[Dict]:
        """Generate weather alerts with multi-point variations"""
        alerts_list = []
        is_rainy = any(day['rainfall'] > 2 for day in forecast[:3])
        high_hum = any(day['humidity'] > 85 for day in forecast[:3])
        high_temp = any(day['temp_max'] > 35 for day in forecast[:3])
        
        if is_rainy:
            rain_templates = [
                f"Rainfall expected on {rain_day_str}; potential for heavy showers on Sunday.",
                f"Significant precipitation forecast for {rain_day_str}. Monitor field drainage to avoid flooding.",
                f"Light to moderate rain predicted around {rain_day_str}. High possibility of intermittent showers."
            ]
            alerts_list.append({'message': random.choice(rain_templates)})
        
        if high_hum:
            hum_templates = [
                "Air quality may remain poor due to increased humidity and rainfall; sensitive individuals should take precautions.",
                "Sustained high humidity (>85%) detected. Risk of fungal leaf diseases increases significantly.",
                "Muggy conditions expected today. Ensure proper ventilation in storage units and greenhouses."
            ]
            alerts_list.append({'message': random.choice(hum_templates)})

        if high_temp:
            temp_templates = [
                "Heat alert: Temperatures exceeding 35°C expected. Provide adequate shading and hydration for livestock.",
                "Intense solar radiation forecast. Mulching is recommended to prevent soil moisture evaporation.",
                "Heat stress risk for young crops. Consider supplemental irrigation during late evening hours."
            ]
            alerts_list.append({'message': random.choice(temp_templates)})
            
        return alerts_list

    def _get_recommended_activities(self, forecast: List[Dict], rain_day_str: str) -> List[str]:
        """Generate activity list with dynamic multi-point randomization"""
        selected_activities = []
        is_rainy = any(day['rainfall'] > 2 for day in forecast[:3])
        is_windy = any(day['wind_speed'] > 15 for day in forecast[:3])
        
        if is_rainy:
            rain_pool = [
                "Postpone harvesting and pesticide application until early next week.",
                "Ensure proper drainage in fields to prevent waterlogging during the rains.",
                "Move sensitive equipment and harvested grain to waterproof storage.",
                "Conduct a field check for early signs of fungal growth after the rainfall.",
                "Inspect your soil for excessive runoff and implement erosion control measures."
            ]
            selected_activities.extend(random.sample(rain_pool, 2))
        else:
            dry_pool = [
                "Proceed with regular fertilization and weeding activities.",
                "Apply mulch to conserve soil moisture during the dry spell.",
                "Ideal window for field preparation or transplanting new seedlings.",
                "Execute your scheduled pesticide or foliar spray for maximum efficiency.",
                "Conduct soil moisture checks; manual irrigation may be needed."
            ]
            selected_activities.extend(random.sample(dry_pool, 2))

        # General/Random points
        general_pool = [
            "Monitor weather updates regularly to adjust farming activities accordingly.",
            "Inspect your tool sheds and ensure all machinery is in good working order.",
            "Record today's weather observations in your farm management log.",
            "Plan your labor requirements based on the upcoming 7-day weather window.",
            "Ensure that any open water sources are clear of debris."
        ]
        selected_activities.append(random.choice(general_pool))
        
        return selected_activities
    
    def _create_activity_calendar(self, forecast: List[Dict]) -> List[Dict]:
        """Create visual activity calendar with weather-integrated suitability"""
        calendar = []
        
        for day in forecast:
            date_obj = datetime.fromisoformat(day['date'])
            
            # Map condition to icon type
            condition_lower = day['condition'].lower()
            weather_icon = 'sun'
            if 'rain' in condition_lower or 'drizzle' in condition_lower:
                weather_icon = 'cloud-rain'
            elif 'cloud' in condition_lower:
                weather_icon = 'cloud'
            
            activities = {
                'date': day['date'],
                'day_name': day['day'],
                'temp_max': day['temp_max'],
                'temp_min': day['temp_min'],
                'rainfall': day['rainfall'],
                'weather_icon': weather_icon,
                'condition': day['condition'],
                'suitability': {
                    'irrigation': self._assess_activity(day, 'irrigation'),
                    'spraying': self._assess_activity(day, 'spraying'),
                    'harvesting': self._assess_activity(day, 'harvesting'),
                    'fieldwork': self._assess_activity(day, 'fieldwork')
                },
                # AI Suggestion for the day
                'recommendation': random.choice([
                    "Top day for field work", "Ideal for pest control", 
                    "Focus on irrigation", "Good for drying crops",
                    "Perfect for soil prep", "Safe for harvesting"
                ]) if not (day['rainfall'] > 5) else "Avoid heavy field activity"
            }
            calendar.append(activities)
        
        return calendar
    
    def _assess_activity(self, day: Dict, activity: str) -> str:
        """Assess if activity is suitable for the day"""
        rainfall = day['rainfall']
        wind = day['wind_speed']
        humidity = day['humidity']
        
        if activity == 'irrigation':
            if rainfall > 10:
                return 'avoid'  # Red
            elif rainfall > 5:
                return 'caution'  # Yellow
            else:
                return 'optimal'  # Green
        
        elif activity == 'spraying':
            if rainfall > 5 or wind > 15:
                return 'avoid'
            elif wind > 10:
                return 'caution'
            else:
                return 'optimal'
        
        elif activity == 'harvesting':
            if rainfall > 10 or humidity > 85:
                return 'avoid'
            elif rainfall > 5:
                return 'caution'
            else:
                return 'optimal'
        
        elif activity == 'fieldwork':
            if rainfall > 20:
                return 'avoid'
            elif rainfall > 10:
                return 'caution'
            else:
                return 'optimal'
        
        return 'normal'
    
    def _get_crop_specific_advice(self, forecast: List[Dict], crop_type: str) -> str:
        """Get crop-specific recommendations"""
        crop_advice = {
            'rice': 'Monitor water levels in paddy fields',
            'wheat': 'Ensure proper drainage to prevent waterlogging',
            'cotton': 'Watch for pest activity during humid conditions',
            'sugarcane': 'Maintain consistent soil moisture',
            'tomato': 'Protect from heavy rain to prevent fruit splitting',
            'potato': 'Avoid excess moisture to prevent tuber rot'
        }
        
        return crop_advice.get(crop_type.lower(), 
                              f'Monitor {crop_type} for weather-related stress')
    
    def _load_crop_data(self) -> Dict:
        """Load crop-specific data (placeholder)"""
        return {
            'rice': {'water_requirement': 'high', 'temp_range': (20, 35)},
            'wheat': {'water_requirement': 'medium', 'temp_range': (15, 25)},
            'cotton': {'water_requirement': 'medium', 'temp_range': (21, 30)}
        }


# Global instance
farming_advisory = FarmingAdvisory()
