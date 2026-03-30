# 🚀 AgroMind - Complete Setup with Real AI

## ✅ Current Status

- ✅ Frontend: Working (mock mode)
- ✅ ML Model: Integrated (`plant_disease_model.h5`)
- ✅ ML Service: Created (Flask API)
- ⏳ Need to: Start ML service & connect

## 🎯 Quick Start (3 Options)

### Option A: Frontend Only (Current - Works Now!)
**What you have:** Beautiful UI with mock AI predictions

**To use:**
1. Frontend is already running at http://localhost:5173
2. Login and test all features
3. Disease detection uses mock data

### Option B: Frontend + Real AI (Recommended)
**What you get:** Real disease predictions from your trained model

**Steps:**

1. **Install Python dependencies** (one-time):
```bash
cd ml-service
pip install tensorflow==2.15.0 keras==2.15.0 flask==3.0.0 flask-cors==4.0.0 pillow==10.1.0 numpy==1.24.3
```

2. **Test the model** (optional but recommended):
```bash
python test_model.py
```

3. **Start ML service** (keep window open):
```bash
python app.py
```
Or double-click: `ml-service/start-ml-service.bat`

4. **Update frontend** to use real AI:
Edit `frontend/src/services/diseaseService.js`:
```javascript
// Line 4: Change from true to false
const MOCK_MODE = false
```

5. **Refresh browser** - Now using real AI! 🎉

### Option C: Full Stack (Backend + ML + Frontend)
**What you get:** Complete system with database

**Additional steps:**
1. Set up PostgreSQL
2. Run backend server
3. Connect all services

## 📁 Project Structure

```
agromind/
├── frontend/              ✅ React app (running)
│   ├── START-AGROMIND.bat ← Double-click to start
│   └── src/
├── backend/               ⏳ Node.js API (optional)
│   └── src/
├── ml-service/            ✅ Python ML API (ready)
│   ├── plant_disease_model.h5  ✅ Your trained model
│   ├── app.py             ✅ Flask server
│   ├── test_model.py      ✅ Test script
│   └── start-ml-service.bat ← Double-click to start
└── README.md
```

## 🔧 ML Service Details

**Your Model:**
- **File:** `plant_disease_model.h5`
- **Size:** ~85 MB
- **Classes:** 47 plant diseases
- **Crops:** Tomato, Potato, Apple, Grape, Corn, Pepper, etc.

**ML Service API:**
- **URL:** http://localhost:5001
- **Endpoints:**
  - `GET /health` - Check if service is running
  - `POST /predict` - Upload image, get prediction
  - `GET /classes` - List all 47 disease classes

## 🧪 Testing

### Test 1: Model Works
```bash
cd ml-service
python test_model.py
```

Expected output:
```
✅ Model loaded successfully!
✅ Prediction successful!
   Total classes: 47
✅ All tests passed!
```

### Test 2: ML Service Running
```bash
# After starting ML service:
curl http://localhost:5001/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "num_classes": 47
}
```

### Test 3: Real Prediction
1. Start ML service
2. Update frontend (MOCK_MODE = false)
3. Upload crop disease image
4. Get real AI prediction!

## 🎨 Features Available

### With Mock Mode (Current):
- ✅ Login/Register
- ✅ Dashboard with stats
- ✅ Disease detection (mock predictions)
- ✅ Fertilizer recommendations
- ✅ Weather forecast
- ✅ Government schemes
- ✅ Crop calendar
- ✅ All UI features

### With Real AI (After ML Service):
- ✅ Everything above PLUS:
- ✅ Real disease predictions
- ✅ 47 disease classes
- ✅ Accurate confidence scores
- ✅ Crop-specific detection

## 💡 Common Issues

**Python not found:**
```bash
# Install Python 3.9-3.11 from python.org
python --version
```

**TensorFlow installation fails:**
```bash
# Try installing one by one:
pip install tensorflow==2.15.0
pip install keras==2.15.0
pip install flask flask-cors pillow numpy
```

**Port 5001 in use:**
- Change port in `ml-service/app.py` (line 177)
- Update frontend ML_SERVICE_URL accordingly

**Model not loading:**
- Verify file exists: `ml-service/plant_disease_model.h5`
- Check file size: should be ~85 MB
- Run `test_model.py` to diagnose

## 📊 Performance

**First Prediction:**
- ~2-3 seconds (model loading)

**Subsequent Predictions:**
- ~0.5-1 second (fast!)

**Accuracy:**
- Depends on your training
- Test with real crop images

## 🔄 Switching Modes

**Mock Mode → Real AI:**
1. Start ML service
2. Change `MOCK_MODE = false` in `diseaseService.js`
3. Refresh browser

**Real AI → Mock Mode:**
1. Change `MOCK_MODE = true` in `diseaseService.js`
2. Refresh browser
3. Can stop ML service

## 📝 Next Steps

**Current (Working):**
- ✅ Frontend with mock data

**Next (Recommended):**
1. Install Python dependencies
2. Test model with `test_model.py`
3. Start ML service
4. Switch to real AI

**Future (Optional):**
1. Set up backend API
2. Connect to PostgreSQL
3. Deploy to cloud

---

**Questions? Check:**
- `ml-service/INTEGRATION-GUIDE.md` - Detailed ML setup
- `BEGINNER-GUIDE.md` - Frontend setup
- `README.md` - Full documentation

**Ready to use Real AI? Run:** `cd ml-service && python test_model.py` 🚀
