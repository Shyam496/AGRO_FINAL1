# 🌾 AgroMind - Multi-Module Agricultural System

AI-powered farm management platform for disease prediction, fertilizer optimization, scheme discovery, weather analytics & chat AI.

## 📋 Features

- **Disease Detection**: AI-powered crop disease identification with treatment recommendations
- **Fertilizer Optimization**: Personalized fertilizer recommendations based on soil analysis
- **Weather Analytics**: 7-day weather forecast with farming advisories
- **Government Schemes**: Discover and apply for agricultural subsidies
- **AI Chat Assistant**: 24/7 support for farming queries
- **Crop Calendar**: Smart task scheduling and reminders
- **Dashboard**: Comprehensive farm management overview

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- Python 3.9+ (for ML service - optional)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd "C:\Users\Jayakumar\Downloads\Final yr project\agromind"
```

2. **Backend Setup**
```bash
cd backend
npm install

# Configure environment variables
# Edit .env file with your database credentials

# Run Prisma migrations (requires PostgreSQL running)
npx prisma generate
npx prisma migrate dev

# Start backend server
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install

# Start frontend development server
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🔐 Demo Credentials

```
Email: farmer@agromind.com
Password: password123
```

## 📁 Project Structure

```
agromind/
├── frontend/          # React.js application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── context/     # React context
│   │   └── utils/       # Utilities
│   └── package.json
│
├── backend/           # Node.js Express API
│   ├── src/
│   │   ├── controllers/ # Route controllers
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Custom middleware
│   │   ├── services/    # Business logic
│   │   ├── prisma/      # Database schema
│   │   └── utils/       # Utilities & mock data
│   └── package.json
│
├── ml-service/        # Python ML service (optional)
└── database/          # Database migrations & seeds
```

## 🛠️ Technology Stack

### Frontend
- React.js 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Chart.js
- Lucide Icons

### Backend
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Bcrypt
- Multer (file uploads)

### ML Service (Optional)
- Python Flask
- TensorFlow
- OpenCV

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/agromind"
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
OPENWEATHER_API_KEY=your-api-key
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=AgroMind
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Disease Detection
- `POST /api/disease/predict-image` - Upload image for disease detection
- `POST /api/disease/predict-symptoms` - Symptom-based diagnosis
- `GET /api/disease/list` - List all diseases
- `GET /api/disease/history` - User's detection history

### Fertilizer
- `POST /api/fertilizer/recommend` - Get fertilizer recommendations
- `POST /api/fertilizer/calculate-npk` - Calculate NPK requirements
- `GET /api/fertilizer/list` - List fertilizers

### Weather
- `GET /api/weather/current` - Current weather
- `GET /api/weather/forecast` - 7-day forecast
- `GET /api/weather/advisory` - Farming advisories

### Schemes
- `GET /api/schemes` - List all schemes
- `GET /api/schemes/:id` - Scheme details
- `POST /api/schemes/check-eligibility` - Check eligibility

### Chat
- `POST /api/chat/message` - Send message to AI
- `GET /api/chat/history` - Chat history

### Crops & Tasks
- `GET /api/crops` - Get user's crops
- `POST /api/crops` - Add new crop
- `POST /api/crops/:id/tasks` - Add task
- `PUT /api/tasks/:id` - Update task

## 🧪 Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Database Management
```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Open Prisma Studio
npx prisma studio
```

## 🚀 Deployment

### Using Docker (Recommended)
```bash
docker-compose up -d
```

### Manual Deployment

1. Build frontend
```bash
cd frontend
npm run build
```

2. Start backend in production
```bash
cd backend
npm start
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation
- SQL injection prevention (Prisma ORM)
- XSS protection
- CORS configuration

## 📝 Mock Data

The application currently uses mock data for development. All controllers have mock implementations that can be easily replaced with real ML models and external APIs.

### Upgrading to Production

1. **Database**: Mock data → PostgreSQL (already configured)
2. **ML Models**: Mock predictions → TensorFlow models
3. **Weather API**: Mock data → OpenWeatherMap API
4. **File Storage**: Local storage → AWS S3

## 🤝 Contributing

This is a final year project. For any queries or suggestions, please contact the development team.

## 📄 License

This project is developed as part of academic requirements.

## 👥 Team

- Project: AgroMind - Multi-Module Agricultural System
- Purpose: Final Year Project
- Year: 2026

## 🙏 Acknowledgments

- OpenWeatherMap for weather API
- Government of India for agricultural schemes data
- TensorFlow team for ML frameworks
- All open-source contributors

---

**Built with ❤️ for farmers**
