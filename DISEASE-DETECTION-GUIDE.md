# 🔬 Disease Detection Module - User Guide

## ✨ Features

The Disease Detection module helps you identify crop diseases using:
1. **Image Analysis** - Upload photos of affected crops
2. **Symptom Analysis** - Describe symptoms to get diagnosis

## 📸 How to Use Image Analysis

### Step 1: Navigate to Disease Detection
- Login to your dashboard
- Click **"Disease Detection"** in the sidebar
- Or use the quick action card on dashboard

### Step 2: Upload Image
1. Click the upload area (or drag & drop)
2. Select a clear photo of your crop
3. Image preview will appear
4. Click **"Analyze Image"** button

### Step 3: View Results
After 2-3 seconds, you'll see:
- **Disease Name** (e.g., "Tomato Late Blight")
- **Confidence Score** (e.g., 92%)
- **Severity Level** (High/Medium/Low)
- **Symptoms** list
- **Treatment** recommendations
- **Prevention** tips

### Step 4: Take Action
Follow the treatment recommendations:
- Remove infected plants
- Apply recommended fungicides
- Improve growing conditions

## 📝 How to Use Symptom Analysis

### Step 1: Select Crop Type
Choose from:
- Tomato
- Wheat
- Rice
- Potato
- Cotton
- Maize

### Step 2: Describe Symptoms
Enter symptoms separated by commas:
```
brown spots, yellowing leaves, wilting
```

### Step 3: Analyze
Click **"Analyze Symptoms"** button

### Step 4: Review Matches
You'll see top 3 possible diseases with:
- Disease name
- Match percentage
- Severity level

## 🎯 Mock Mode Diseases

Currently available in demo mode:

### 1. Tomato Late Blight
- **Severity:** High
- **Symptoms:** Dark brown spots, white fuzzy growth
- **Treatment:** Copper fungicides, remove infected plants

### 2. Wheat Rust
- **Severity:** Medium
- **Symptoms:** Orange-red pustules, yellow spots
- **Treatment:** Propiconazole fungicide

### 3. Rice Blast
- **Severity:** High
- **Symptoms:** Diamond-shaped lesions
- **Treatment:** Tricyclazole fungicide

### 4. Potato Early Blight
- **Severity:** Medium
- **Symptoms:** Dark brown spots with rings
- **Treatment:** Mancozeb fungicide

### 5. Healthy Crop
- **Severity:** None
- **Result:** No treatment needed!

## 💡 Tips for Best Results

### Image Quality
✅ **Good:**
- Clear, well-lit photos
- Close-up of affected area
- Multiple angles
- Focus on symptoms

❌ **Avoid:**
- Blurry images
- Too far away
- Poor lighting
- Entire field shots

### Symptom Description
✅ **Good:**
- Specific details
- Multiple symptoms
- Accurate descriptions

❌ **Avoid:**
- Vague descriptions
- Single symptom only
- Unrelated symptoms

## 🔄 How Mock Mode Works

In demo mode, the AI:
1. **Simulates 2-second analysis** (like real AI)
2. **70% chance** of "Healthy Crop"
3. **30% chance** of random disease
4. **Provides realistic results** with treatment plans

## 🚀 Upgrading to Production

To use real AI models:
1. Train TensorFlow model on disease images
2. Deploy ML service (Python Flask)
3. Update `diseaseService.js` - set `MOCK_MODE = false`
4. Connect to real API endpoint

## 📊 Understanding Results

### Confidence Score
- **90-100%:** Very confident
- **80-89%:** Confident
- **70-79%:** Moderately confident
- **Below 70%:** Low confidence (verify manually)

### Severity Levels
- **High:** Immediate action required
- **Medium:** Monitor and treat soon
- **Low:** Preventive measures
- **None:** Healthy crop

## 🎨 UI Features

- ✅ Drag & drop image upload
- ✅ Image preview before analysis
- ✅ Loading animation during analysis
- ✅ Color-coded results (red=disease, green=healthy)
- ✅ Detailed treatment plans
- ✅ Prevention tips
- ✅ Reset button to analyze another image

## 📱 Try It Now!

1. Go to http://localhost:5173
2. Login with demo credentials
3. Click "Disease Detection"
4. Upload any image (even non-crop images work in demo!)
5. See the AI analysis results

---

**Built with ❤️ for farmers - Making disease detection accessible to everyone!**
