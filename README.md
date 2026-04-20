# ☕ Coffeegraphy

A modern, full-stack coffee shop application built with React (Vite) and FastAPI.

## 🚀 Features

- **Menu Browsing** - Explore signature drinks and products
- **Custom Drink Builder** - Craft your perfect beverage
- **Store Locator** - Find nearby Coffeegraphy locations
- **Rewards Program** - Earn and redeem points
- **User Authentication** - Secure JWT-based auth
- **Order Management** - Place and track orders
- **Responsive Design** - Beautiful UI with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 19** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Radix UI** components
- **Axios** for API calls
- **Sonner** for toast notifications

### Backend
- **FastAPI** (Python)
- **MongoDB** with Motor (async driver)
- **JWT** authentication
- **Bcrypt** password hashing
- **Pydantic** data validation

## 📦 Local Development

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (local or Atlas)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/coffeegraphy.git
   cd coffeegraphy
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   
   # Create .env file
   echo "MONGO_URL=mongodb://localhost:27017" > .env
   echo "DB_NAME=coffeegraphy" >> .env
   echo "JWT_SECRET=your-secret-key" >> .env
   
   # Run server
   uvicorn server:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Create .env file
   echo "VITE_BACKEND_URL=http://localhost:8000" > .env
   
   # Run dev server
   npm run dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 🌐 Deployment

See [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for quick Vercel deployment or [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

**Quick Deploy:**
1. Push to GitHub
2. Deploy backend to Vercel (set env vars)
3. Deploy frontend to Vercel (set `VITE_BACKEND_URL`)
4. Update CORS settings
5. Done! ✅

## 📁 Project Structure

```
coffeegraphy/
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and API client
│   │   └── hooks/         # Custom React hooks
│   ├── public/            # Static assets
│   └── package.json
│
├── backend/               # FastAPI backend
│   ├── server.py          # Main application
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables
│
└── README.md
```

## 🔐 Environment Variables

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=coffeegraphy
JWT_SECRET=your-secret-key-change-this
CORS_ORIGINS=http://localhost:3000
ADMIN_EMAIL=admin@coffeegraphy.com
ADMIN_PASSWORD=admin123
```

### Frontend (.env)
```env
VITE_BACKEND_URL=http://localhost:8000
```

## 🧪 Default Credentials

**Admin Account:**
- Email: `admin@coffeegraphy.com`
- Password: `admin123`

**Demo Account:**
- Email: `demo@coffeegraphy.com`
- Password: `demo1234`

## 📝 API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🎨 Design System

The app uses a custom coffee-inspired color palette:
- **Ink** (#050302) - Deep black
- **Espresso** (#2C1A12) - Rich brown
- **Auburn** (#8B4513) - Warm accent
- **Cream** (#F5F0EB) - Light background

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with modern web technologies
- UI components from Radix UI
- Icons from Lucide React
- Fonts from Google Fonts

---

**Made with ☕ and ❤️**
