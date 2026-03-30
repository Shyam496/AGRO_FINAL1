# AgroMind ML Service

Flask-based ML service for plant disease prediction using TensorFlow.

## Setup

1. **Install Python 3.9+**

2. **Install Dependencies**
```bash
cd ml-service
pip install -r requirements.txt
```

3. **Copy Model File**
Copy `plant_disease_model.h5` from `D:\AgroMind_Project\AI_model\models\` to this directory.

Or run:
```cmd
copy "D:\AgroMind_Project\AI_model\models\plant_disease_model.h5" .
```

4. **Start Service**
```bash
python app.py
```

The service will run on http://localhost:5001

## API Endpoints

### Health Check
```
GET /health
```

### Predict Disease
```
POST /predict
Content-Type: multipart/form-data

Body:
- image: Image file
```

Response:
```json
{
  "success": true,
  "prediction": {
    "diseaseId": "37",
    "diseaseName": "Late blight",
    "cropType": "Tomato",
    "confidence": 0.9234,
    "severity": "High",
    "className": "Tomato___Late_blight"
  }
}
```

### Get All Classes
```
GET /classes
```

## Disease Classes (47 total)

The model can detect 47 different plant diseases and healthy states across multiple crops:
- Apple (4 classes)
- Blueberry (1 class)
- Cherry (2 classes)
- Corn/Maize (4 classes)
- Grape (4 classes)
- Orange (1 class)
- Peach (2 classes)
- Pepper/Bell Pepper (7 classes)
- Potato (3 classes)
- Tomato (10 classes)
- And more...

## Integration with Backend

Update `backend/.env`:
```
ML_SERVICE_URL=http://localhost:5001
```

The backend will automatically use the ML service when available.

## Troubleshooting

**Model not loading:**
- Ensure `plant_disease_model.h5` is in the ml-service directory
- Check TensorFlow version compatibility

**Port already in use:**
- Change port in `app.py` (line 177)

**Dependencies error:**
- Use Python 3.9-3.11 (TensorFlow compatibility)
- Install exact versions from requirements.txt
