# 🚀 AGROMIND - INSTANT DEMO MODE

## ⚡ Quick Start
1. Go to folder: `agromind`
2. **Double-click** the file: `START-AGROMIND.bat`
3. Wait for installation (takes 2-5 minutes)
4. Browser will open automatically at http://localhost:5173

## 🔑 Demo Login
- **Email:** `farmer@agromind.com`
- **Password:** `password123`

## ✅ Why "Demo Mode"?
The app is now configured in **Full Mock/Demo Mode**. This means:
- **No Database Needed**: You can log in and navigate even if the backend is not running.
- **Standalone Preview**: Perfect for testing the UI, animations, and "Go with the flow" experience on GitHub or Vercel.
- **Instant Feedback**: No need to worry about server setup for simple demonstrations.

## 📁 Project Structure
```
agromind/
├── START-AGROMIND.bat  ← DOUBLE-CLICK THIS!
├── frontend/           ← React app (Running in Mock Mode)
├── backend/            ← API server (Optional for demo)
└── ml-service/         ← AI models (Optional for demo)
```

## 🔄 For Developers (Switching to Real Mode)
To use a real database and real AI models:
1. Open `frontend/src/services/authService.js` (and others).
2. Set `const MOCK_MODE = false`.
3. Start the backend (`npm run dev`) and ML service (`python app.py`).
