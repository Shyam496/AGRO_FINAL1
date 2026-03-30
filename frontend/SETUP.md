# Frontend Setup Instructions

## Prerequisites
- Node.js 18 or higher
- npm or yarn

## Installation

### Option 1: Using Batch Files (Recommended for Windows)

1. **Install Dependencies**
   - Double-click `install.bat`
   - Wait for installation to complete

2. **Start Development Server**
   - Double-click `start.bat`
   - Frontend will be available at http://localhost:5173

### Option 2: Using Command Line

If you encounter PowerShell execution policy issues, use Command Prompt (cmd) instead:

```cmd
cd "C:\Users\Jayakumar\Downloads\Final yr project\agromind\frontend"
npm install
npm run dev
```

### Option 3: Enable PowerShell Scripts

If you want to use PowerShell, run this command as Administrator:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then you can use npm commands normally.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── common/     # Common components (Sidebar, Loading, etc.)
│   │   ├── auth/       # Authentication components
│   │   ├── dashboard/  # Dashboard components
│   │   ├── disease/    # Disease detection components
│   │   ├── fertilizer/ # Fertilizer components
│   │   ├── weather/    # Weather components
│   │   ├── schemes/    # Government schemes components
│   │   ├── chat/       # Chat components
│   │   └── calendar/   # Calendar components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   └── styles/         # Global styles
├── public/             # Static assets
└── index.html          # HTML entry point
```

## Features Implemented

✅ Authentication (Login/Register)
✅ Dashboard with stats
✅ Disease Detection page
✅ Fertilizer Recommendation page
✅ Weather Analytics page
✅ Government Schemes page
✅ Crop Calendar page
✅ Responsive Sidebar Navigation
✅ API Integration ready
✅ Error Handling
✅ Loading States

## Next Steps

1. Install dependencies
2. Start the development server
3. Test all pages
4. Connect to backend API (ensure backend is running on port 5000)

## Troubleshooting

**Issue: npm commands not working**
- Solution: Use the provided batch files or Command Prompt

**Issue: Port 5173 already in use**
- Solution: Kill the process or change port in vite.config.js

**Issue: API calls failing**
- Solution: Ensure backend is running on http://localhost:5000

## Demo Credentials

Once backend is running:
- Email: farmer@agromind.com
- Password: password123
