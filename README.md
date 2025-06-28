# Personal Finance Tracker

A full-stack web application for managing personal finances, built with React, Node.js, Express, and MongoDB.

## Features

### Frontend (React)
- **Dashboard**: Overview of financial status with charts and recent transactions
- **Add Transaction**: Form to add income and expense transactions
- **Transaction History**: Searchable and filterable transaction list with pagination
- **Monthly Summary**: Detailed monthly financial analysis with trends
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Backend (Node.js + Express)
- **RESTful API**: Complete CRUD operations for transactions
- **User Authentication**: JWT-based authentication system
- **Data Validation**: Input validation and error handling
- **MongoDB Integration**: Persistent data storage with Mongoose ODM

### Key Features
- 📊 **Visual Charts**: Interactive charts using Chart.js (Doughnut, Bar, Line charts)
- 🔍 **Advanced Filtering**: Filter by date range, category, and transaction type
- 📱 **Responsive Design**: Tailwind CSS for modern, mobile-first design
- 🔐 **Secure Authentication**: JWT tokens with password hashing
- 📈 **Financial Insights**: Monthly trends, category breakdowns, and savings rate tracking
- ⚡ **Real-time Updates**: Instant UI updates after transactions
- 🤖 **AI Financial Assistant**: Smart chat & voice support with Indian finance expertise
- 💰 **Indian Currency Support**: INR as default currency with localized formatting
- 🎯 **Plan-Based Features**: Free, Pro, and Elite tiers with different capabilities
- 🗣️ **Voice Support**: Browser-based voice chat (no external APIs needed)
- 🧠 **Smart Knowledge Base**: Comprehensive local responses for common finance questions

## Tech Stack

### Frontend
- React 18 with functional components and hooks
- React Router for navigation
- Chart.js & react-chartjs-2 for data visualization
- Tailwind CSS for styling
- Axios for API communication
- Date-fns for date manipulation

### Backend
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation
- CORS for cross-origin requests

## Project Structure

```
personal-finance-tracker/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Context providers
│   │   ├── services/       # API services
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Express backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── server.js          # Main server file
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd personal-finance-tracker
   ```

2. **Install dependencies for all parts**
   ```bash
   npm run install-all
   ```
   Or manually:
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

3. **Set up environment variables**
   
   Create `.env` file in the `server/` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/personal-finance-tracker
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   NODE_ENV=development
   ```

   Create `.env` file in the `client/` directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start MongoDB**
   - For local MongoDB: `mongod`
   - For MongoDB Atlas: Update the MONGODB_URI in server/.env

5. **Run the application**
   
   Development mode (runs both frontend and backend):
   ```bash
   npm run dev
   ```
   
   Or run separately:
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Transactions
- `GET /api/transactions` - Get all transactions (with filtering)
- `POST /api/transactions` - Create new transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/summary` - Get financial summary

### Query Parameters for Transactions
- `type` - Filter by 'income' or 'expense'
- `category` - Filter by category name
- `startDate` - Filter from date (YYYY-MM-DD)
- `endDate` - Filter to date (YYYY-MM-DD)
- `page` - Pagination page number
- `limit` - Number of items per page

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  preferences: {
    currency: String,
    categories: {
      income: [String],
      expense: [String]
    }
  },
  timestamps: true
}
```

### Transaction Model
```javascript
{
  amount: Number,
  category: String,
  date: Date,
  type: String (income/expense),
  note: String,
  userId: ObjectId (ref: User),
  timestamps: true
}
```

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Add Transactions**: Use the "Add Transaction" form to record income and expenses
3. **View Dashboard**: Monitor your financial overview with charts and recent transactions
4. **Browse History**: View all transactions with powerful filtering options
5. **Analyze Trends**: Use the Monthly Summary to understand spending patterns

## Features in Detail

### Dashboard
- Current balance, total income, and expenses
- Visual charts showing income vs expenses
- Expense breakdown by category
- Recent transactions list
- Time period filtering (current month, last 30 days, all time)

### Transaction Management
- Add income and expense transactions
- Categorize transactions with predefined categories
- Add notes and custom dates
- Delete transactions
- Advanced filtering and search

### Financial Analytics
- Monthly trend analysis
- Category-wise expense breakdown
- Savings rate calculation
- 6-month comparison charts
- Visual representation with multiple chart types

## Development

### Available Scripts

In the project directory:
- `npm run dev` - Runs both frontend and backend in development mode
- `npm run client` - Runs only the frontend
- `npm run server` - Runs only the backend
- `npm run install-all` - Installs dependencies for all parts

### Code Structure

#### Frontend Components
- `Dashboard.js` - Main dashboard with charts and summary
- `AddTransaction.js` - Transaction creation form
- `TransactionHistory.js` - Transaction list with filtering
- `MonthlySummary.js` - Monthly analysis and trends
- `Login.js` / `Register.js` - Authentication forms
- `Navbar.js` - Navigation component
- `PrivateRoute.js` - Protected route wrapper

#### Backend Structure
- `server.js` - Express server setup
- `models/` - Mongoose data models
- `routes/` - API route handlers
- `middleware/` - Custom middleware (authentication)

## Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- Input validation and sanitization
- Protected API routes
- CORS configuration
- Environment variable protection

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Future Enhancements

- [ ] Data export to CSV/PDF
- [ ] Budget planning and tracking
- [ ] Recurring transaction support
- [ ] Multi-currency support
- [ ] Mobile app development
- [ ] Email notifications and reports
- [ ] Advanced analytics and insights
- [ ] Social features (shared budgets)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email your-email@example.com or create an issue in the repository.

### AI Financial Assistant
- **Intelligent Chat Support**: Answers budgeting, investment, and tax questions specific to India
- **Voice Interface**: Browser-based speech recognition and text-to-speech (no API keys required)
- **Local Knowledge Base**: Comprehensive responses for common financial topics without internet
- **API Integration Ready**: Optional free AI APIs (Hugging Face, Cohere, Gemini) for advanced features
- **Smart Fallbacks**: Graceful handling when APIs are unavailable
- **Indian Finance Focus**: Specific advice for SIP, PPF, 80C deductions, and rupee-based planning

### Subscription Plans
- **Free Plan**: Individual users, basic features, local AI knowledge
- **Pro Plan**: Small business features, priority AI support, advanced analytics
- **Elite Plan**: Enterprise features, unlimited AI queries, custom insights

## 🐳 **Docker Deployment**

### **Quick Start with Docker**

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/personal-finance-tracker.git
cd personal-finance-tracker
```

2. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your actual values
```

3. **Run with Docker Compose**
```bash
# Windows
./deploy-local.bat

# Linux/Mac
chmod +x deploy-local.sh
./deploy-local.sh
```

4. **Access the application**
- Frontend: http://localhost
- Backend API: http://localhost:5000/api
- Database: MongoDB on port 27017

### **Production Deployment on Render**

#### **Prerequisites:**
- Docker Hub account
- GitHub repository
- Render account
- MongoDB Atlas database (recommended)

#### **Setup GitHub Secrets:**
1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub access token
   - `REACT_APP_API_URL`: Your backend URL (e.g., https://your-app-backend.onrender.com/api)
   - `RENDER_DEPLOY_WEBHOOK`: (Optional) Render deploy webhook URL

#### **Deploy to Render:**
1. **Create Backend Service:**
   - New Web Service on Render
   - Connect GitHub repository
   - Use Docker
   - Docker Command: `docker run -p $PORT:5000 yourusername/finance-tracker-backend:latest`
   - Environment variables: `MONGODB_URI`, `JWT_SECRET`

2. **Create Frontend Service:**
   - New Web Service on Render
   - Connect GitHub repository  
   - Use Docker
   - Docker Command: `docker run -p $PORT:80 yourusername/finance-tracker-frontend:latest`

3. **Auto-deployment:**
   - Push to `main` branch triggers automatic build and deployment
   - Docker images are automatically built and pushed to Docker Hub
   - Render pulls latest images and redeploys

### **Docker Commands**

```bash
# Build images locally
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose down && docker-compose build && docker-compose up -d

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### **CI/CD Pipeline**

The GitHub Actions workflow automatically:
- ✅ Runs tests on push/PR
- ✅ Builds Docker images
- ✅ Pushes to Docker Hub
- ✅ Triggers Render deployment
- ✅ Runs security scans

**Workflow triggers:**
- Push to `main`: Full build and deploy
- Push to `develop`: Build and test only
- Pull requests: Test only

## 🚀 **Deployment Architecture**

```
GitHub Repository
    ↓ (push to main)
GitHub Actions CI/CD
    ↓ (build & push)
Docker Hub Registry
    ↓ (pull images)
Render Platform
    ↓ (deploy containers)
Production Environment
```

### **Environment Variables**

**Backend (.env):**
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `NODE_ENV`: production
- `PORT`: 5000

**Frontend (.env):**
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_GEMINI_API_KEY`: Google Gemini API key
- `REACT_APP_HUGGING_FACE_TOKEN`: Hugging Face API token

## 🔧 **Tech Stack