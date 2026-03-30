# 🌾 AgroMind - Quick Reference

## 🎯 What is This?

AgroMind is a **farm management web application** with:
- Disease detection
- Fertilizer recommendations
- Weather forecasts
- Government schemes
- AI chat assistant
- Crop calendar

## 📂 Important Files

| File | What It Does |
|------|-------------|
| `START-AGROMIND.bat` | **START HERE!** Runs everything |
| `STOP-AGROMIND.bat` | Stops the server |
| `BEGINNER-GUIDE.md` | Step-by-step instructions |
| `README.md` | Full technical documentation |

## ⚡ Quick Commands

### To Start
```
Double-click: START-AGROMIND.bat
```

### To Stop
```
Double-click: STOP-AGROMIND.bat
OR
Press Ctrl+C in the terminal window
```

### To Restart
```
1. Stop the server
2. Wait 5 seconds
3. Start again
```

## 🌐 URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000 (when backend is running)

## 🔑 Demo Login

```
Email: farmer@agromind.com
Password: password123
```

## 📱 Pages Available

1. `/` - Home page
2. `/login` - Login page
3. `/register` - Registration
4. `/dashboard` - Main dashboard
5. `/disease` - Disease detection
6. `/fertilizer` - Fertilizer recommendations
7. `/weather` - Weather forecast
8. `/schemes` - Government schemes
9. `/calendar` - Crop calendar

## 🛠️ Tech Stack

- **Frontend:** React.js + Vite + Tailwind CSS
- **Backend:** Node.js + Express + PostgreSQL
- **Database:** Prisma ORM
- **Authentication:** JWT

## 📊 Project Status

✅ Frontend - Complete and working
✅ Backend - Complete (needs database setup)
⏳ Database - Needs PostgreSQL installation
⏳ ML Models - Using mock data
⏳ Deployment - Local only

## 🔄 Development Workflow

1. Make changes to code
2. Save the file
3. Browser auto-refreshes
4. See changes instantly!

## 📝 File Structure

```
agromind/
├── frontend/          # React application
│   ├── src/
│   │   ├── pages/     # All page components
│   │   ├── components/# Reusable components
│   │   ├── services/  # API calls
│   │   └── utils/     # Helper functions
│   └── package.json
│
├── backend/           # Node.js API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── prisma/
│   └── package.json
│
└── START-AGROMIND.bat # Your starting point!
```

## 🎨 Customization

Want to change colors? Edit:
```
frontend/tailwind.config.js
```

Want to change API URL? Edit:
```
frontend/.env
```

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| npm not found | Install Node.js |
| Port in use | Run STOP-AGROMIND.bat |
| Page not loading | Check terminal for errors |
| Can't login | Backend not running (use mock mode) |

## 📞 Getting Help

1. Check `BEGINNER-GUIDE.md`
2. Read error messages in terminal
3. Google the error
4. Ask for help with screenshots

## 🚀 Next Steps

After frontend works:
1. ✅ Test all pages
2. ⏳ Set up backend
3. ⏳ Connect database
4. ⏳ Deploy online

---

**Made with ❤️ for farmers**
