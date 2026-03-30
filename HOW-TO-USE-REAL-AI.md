# 🚀 How to Run AgroMind with Real AI

## ✅ Current Status:
- Frontend: Running on http://localhost:5173
- ML Service: Running on http://localhost:5001
- Real AI: **ENABLED** ✅

## 📝 Step-by-Step Terminal Commands

### You Already Have Running:
1. **Frontend Server** (Terminal 1) - Keep this open!
2. **ML Service** (Terminal 2) - Keep this open!

### What to Do Now:

**Step 1: Refresh Your Browser**
```
Just press F5 in your browser at http://localhost:5173
```

**Step 2: Test Real AI**
1. Login: `farmer@agromind.com` / `password123`
2. Click "Disease Detection" in sidebar
3. Upload ANY crop image
4. Click "Analyze Image"
5. Wait 2-3 seconds
6. See REAL AI prediction from your trained model!

## 🎯 What Changed:

**Before (Mock Mode):**
- Random predictions
- 70% healthy, 30% disease
- Instant results

**Now (Real AI):**
- Your trained TensorFlow model
- 47 disease classes
- Real confidence scores
- 2-3 second analysis

## 📊 How to Verify It's Working:

### Check ML Service (Terminal 2):
You should see logs like:
```
INFO:werkzeug:127.0.0.1 - - [timestamp] "POST /predict HTTP/1.1" 200 -
```

### Check Browser Console (F12):
You should see:
```
Disease analysis completed (Real AI)
```

## 🔄 To Switch Back to Mock Mode:

If you want to go back to mock mode:

1. Edit: `frontend/src/services/diseaseService.js`
2. Change line 4: `const MOCK_MODE = true`
3. Refresh browser

## 💡 Tips:

**Good Test Images:**
- Tomato leaves with spots
- Potato leaves with blight
- Any crop disease images
- Even healthy crop images

**Expected Results:**
- Disease name (e.g., "Late blight")
- Crop type (e.g., "Tomato")
- Confidence score (e.g., 0.89 = 89%)
- Severity level
- Treatment recommendations

## 🎉 You're All Set!

Your AgroMind is now using **REAL AI** with your trained model!

Just **refresh your browser** and start testing! 🚀
