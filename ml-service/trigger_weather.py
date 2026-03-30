import requests
import json

url = "http://localhost:5001/api/ml/weather/advisory"
payload = {"lat": 13.0827, "lon": 80.2707, "crop_type": "rice"}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    print(f"Status Code: {response.status_code}")
    data = response.json()
    if data['success']:
        print(f"Irrigation Status: {data['advisory']['irrigation']['status']}")
        print(f"Spraying Status: {data['advisory']['spraying']['status']}")
        print(f"Harvesting Status: {data['advisory']['harvesting']['status']}")
    else:
        print(f"Error: {data.get('error')}")
except Exception as e:
    print(f"Error: {e}")
