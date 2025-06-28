# 📡 **API Documentation**

## **RESTful API Reference for Personal Finance Tracker**

This document provides comprehensive API documentation for the Personal Finance Tracker backend, designed for technical interviews and development reference.

---

## 🔗 **Base URL**

```
Production: https://finance-tracker-backend-latest.onrender.com/api
Development: http://localhost:5000/api
```

## 🔐 **Authentication**

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### **Token Format:**
```javascript
{
  "id": "user_id",
  "email": "user@example.com",
  "plan": "free|premium|enterprise",
  "iat": 1640995200,
  "exp": 1641600000
}
```

---

## 📋 **API Endpoints Overview**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | System health check | ❌ |
| POST | `/auth/register` | User registration | ❌ |
| POST | `/auth/login` | User authentication | ❌ |
| GET | `/auth/verify` | Verify JWT token | ✅ |
| GET | `/transactions` | Get user transactions | ✅ |
| POST | `/transactions` | Create new transaction | ✅ |
| PUT | `/transactions/:id` | Update transaction | ✅ |
| DELETE | `/transactions/:id` | Delete transaction | ✅ |
| GET | `/transactions/stats` | Get transaction statistics | ✅ |
| GET | `/user/profile` | Get user profile | ✅ |
| PUT | `/user/profile` | Update user profile | ✅ |

---

## 🏥 **Health Check**

### **GET /health**

Check API server status and connectivity.

#### **Request:**
```http
GET /api/health
```

#### **Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-06-28T10:09:35.421Z",
  "service": "finance-tracker-backend",
  "version": "1.0.0",
  "database": "connected",
  "memory": {
    "rss": 52428800,
    "heapTotal": 20971520,
    "heapUsed": 15728640,
    "external": 1359872,
    "arrayBuffers": 17456
  },
  "uptime": 3600.123
}
```

#### **Response Codes:**
- `200 OK`: Service is healthy
- `503 Service Unavailable`: Service is down

---

## 🔐 **Authentication Endpoints**

### **POST /auth/register**

Register a new user account.

#### **Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}
```

#### **Request Validation:**
```javascript
{
  "name": {
    "required": true,
    "type": "string",
    "maxLength": 50,
    "pattern": "^[a-zA-Z\\s]+$"
  },
  "email": {
    "required": true,
    "type": "string",
    "format": "email",
    "unique": true
  },
  "password": {
    "required": true,
    "type": "string",
    "minLength": 6,
    "pattern": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{6,}$"
  }
}
```

#### **Response (Success):**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "preferences": {
      "currency": "USD",
      "categories": {
        "income": ["Salary", "Freelance", "Investment", "Other Income"],
        "expense": ["Food", "Transportation", "Housing", "Utilities", "Entertainment", "Healthcare", "Shopping", "Other Expense"]
      }
    },
    "subscription": {
      "plan": "free",
      "features": {
        "maxTransactions": 100,
        "aiInsights": false,
        "advancedCharts": false,
        "dataExport": false
      }
    },
    "createdAt": "2025-06-28T10:00:00.000Z"
  }
}
```

#### **Response (Error):**
```json
{
  "message": "Validation Error",
  "errors": [
    "Email already exists",
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  ]
}
```

#### **Response Codes:**
- `201 Created`: User successfully created
- `400 Bad Request`: Validation errors
- `409 Conflict`: Email already exists

### **POST /auth/login**

Authenticate user and receive JWT token.

#### **Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}
```

#### **Response (Success):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "lastLogin": "2025-06-28T10:15:00.000Z",
    "subscription": {
      "plan": "free"
    }
  }
}
```

#### **Response (Error):**
```json
{
  "message": "Invalid email or password"
}
```

#### **Response Codes:**
- `200 OK`: Login successful
- `401 Unauthorized`: Invalid credentials
- `400 Bad Request`: Missing email or password

### **GET /auth/verify**

Verify JWT token validity.

#### **Request:**
```http
GET /api/auth/verify
Authorization: Bearer <jwt-token>
```

#### **Response (Success):**
```json
{
  "valid": true,
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "subscription": {
      "plan": "free"
    }
  }
}
```

#### **Response Codes:**
- `200 OK`: Token is valid
- `401 Unauthorized`: Invalid or expired token

---

## 💰 **Transaction Endpoints**

### **GET /transactions**

Retrieve user transactions with filtering and pagination.

#### **Request:**
```http
GET /api/transactions?page=1&limit=10&type=expense&category=food&startDate=2025-01-01&endDate=2025-12-31&sort=-date
Authorization: Bearer <jwt-token>
```

#### **Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number for pagination |
| `limit` | integer | 10 | Number of items per page |
| `type` | string | - | Filter by transaction type (`income`, `expense`) |
| `category` | string | - | Filter by category (case-insensitive) |
| `startDate` | date | - | Start date filter (ISO 8601) |
| `endDate` | date | - | End date filter (ISO 8601) |
| `sort` | string | `-date` | Sort field (`date`, `-date`, `amount`, `-amount`) |

#### **Response:**
```json
{
  "transactions": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "type": "expense",
      "category": "Food",
      "amount": 25.50,
      "description": "Lunch at restaurant",
      "date": "2025-06-28T12:00:00.000Z",
      "tags": ["restaurant", "lunch"],
      "location": "Downtown Cafe",
      "createdAt": "2025-06-28T12:05:00.000Z",
      "updatedAt": "2025-06-28T12:05:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 47,
    "itemsPerPage": 10
  }
}
```

#### **Response Codes:**
- `200 OK`: Transactions retrieved successfully
- `401 Unauthorized`: Invalid or missing token
- `400 Bad Request`: Invalid query parameters

### **POST /transactions**

Create a new transaction.

#### **Request:**
```http
POST /api/transactions
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "type": "expense",
  "category": "Food",
  "amount": 25.50,
  "description": "Lunch at restaurant",
  "date": "2025-06-28T12:00:00.000Z",
  "tags": ["restaurant", "lunch"],
  "location": "Downtown Cafe"
}
```

#### **Request Validation:**
```javascript
{
  "type": {
    "required": true,
    "enum": ["income", "expense"]
  },
  "category": {
    "required": true,
    "type": "string",
    "maxLength": 50
  },
  "amount": {
    "required": true,
    "type": "number",
    "min": 0.01,
    "max": 1000000
  },
  "description": {
    "type": "string",
    "maxLength": 200
  },
  "date": {
    "type": "date",
    "default": "now"
  },
  "tags": {
    "type": "array",
    "items": {
      "type": "string",
      "maxLength": 20
    }
  },
  "location": {
    "type": "string",
    "maxLength": 100
  }
}
```

#### **Response (Success):**
```json
{
  "message": "Transaction created successfully",
  "transaction": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "type": "expense",
    "category": "Food",
    "amount": 25.50,
    "description": "Lunch at restaurant",
    "date": "2025-06-28T12:00:00.000Z",
    "tags": ["restaurant", "lunch"],
    "location": "Downtown Cafe",
    "createdAt": "2025-06-28T12:05:00.000Z",
    "updatedAt": "2025-06-28T12:05:00.000Z"
  }
}
```

#### **Response Codes:**
- `201 Created`: Transaction created successfully
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Transaction limit exceeded (free plan)

### **PUT /transactions/:id**

Update an existing transaction.

#### **Request:**
```http
PUT /api/transactions/60f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "amount": 30.00,
  "description": "Updated lunch amount",
  "tags": ["restaurant", "lunch", "updated"]
}
```

#### **Response:**
```json
{
  "message": "Transaction updated successfully",
  "transaction": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "type": "expense",
    "category": "Food",
    "amount": 30.00,
    "description": "Updated lunch amount",
    "date": "2025-06-28T12:00:00.000Z",
    "tags": ["restaurant", "lunch", "updated"],
    "location": "Downtown Cafe",
    "createdAt": "2025-06-28T12:05:00.000Z",
    "updatedAt": "2025-06-28T14:15:00.000Z"
  }
}
```

#### **Response Codes:**
- `200 OK`: Transaction updated successfully
- `404 Not Found`: Transaction not found
- `401 Unauthorized`: Invalid token or not transaction owner
- `400 Bad Request`: Validation errors

### **DELETE /transactions/:id**

Delete a transaction.

#### **Request:**
```http
DELETE /api/transactions/60f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <jwt-token>
```

#### **Response:**
```json
{
  "message": "Transaction deleted successfully"
}
```

#### **Response Codes:**
- `200 OK`: Transaction deleted successfully
- `404 Not Found`: Transaction not found
- `401 Unauthorized`: Invalid token or not transaction owner

### **GET /transactions/stats**

Get aggregated transaction statistics.

#### **Request:**
```http
GET /api/transactions/stats?year=2025&month=6
Authorization: Bearer <jwt-token>
```

#### **Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `year` | integer | Filter by year |
| `month` | integer | Filter by month (1-12) |

#### **Response:**
```json
[
  {
    "type": "expense",
    "total": 1250.75,
    "count": 25,
    "avgAmount": 50.03,
    "categoryBreakdown": {
      "Food": 350.25,
      "Transportation": 200.50,
      "Housing": 700.00
    }
  },
  {
    "type": "income",
    "total": 3500.00,
    "count": 2,
    "avgAmount": 1750.00,
    "categoryBreakdown": {
      "Salary": 3000.00,
      "Freelance": 500.00
    }
  }
]
```

#### **Response Codes:**
- `200 OK`: Statistics retrieved successfully
- `401 Unauthorized`: Invalid or missing token

---

## 👤 **User Profile Endpoints**

### **GET /user/profile**

Get user profile information.

#### **Request:**
```http
GET /api/user/profile
Authorization: Bearer <jwt-token>
```

#### **Response:**
```json
{
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "preferences": {
      "currency": "USD",
      "categories": {
        "income": ["Salary", "Freelance", "Investment", "Other Income"],
        "expense": ["Food", "Transportation", "Housing", "Utilities", "Entertainment", "Healthcare", "Shopping", "Other Expense"]
      },
      "notifications": {
        "email": true,
        "push": false
      }
    },
    "subscription": {
      "plan": "free",
      "expiresAt": null,
      "features": {
        "maxTransactions": 100,
        "aiInsights": false,
        "advancedCharts": false,
        "dataExport": false
      }
    },
    "lastLogin": "2025-06-28T10:15:00.000Z",
    "createdAt": "2025-06-28T10:00:00.000Z",
    "updatedAt": "2025-06-28T10:15:00.000Z"
  }
}
```

### **PUT /user/profile**

Update user profile information.

#### **Request:**
```http
PUT /api/user/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "John Smith",
  "preferences": {
    "currency": "EUR",
    "categories": {
      "income": ["Salary", "Consulting", "Investment", "Other Income"],
      "expense": ["Food", "Transportation", "Housing", "Utilities", "Entertainment", "Healthcare", "Shopping", "Travel", "Other Expense"]
    },
    "notifications": {
      "email": true,
      "push": true
    }
  }
}
```

#### **Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Smith",
    "email": "john.doe@example.com",
    "preferences": {
      "currency": "EUR",
      "categories": {
        "income": ["Salary", "Consulting", "Investment", "Other Income"],
        "expense": ["Food", "Transportation", "Housing", "Utilities", "Entertainment", "Healthcare", "Shopping", "Travel", "Other Expense"]
      },
      "notifications": {
        "email": true,
        "push": true
      }
    },
    "updatedAt": "2025-06-28T14:30:00.000Z"
  }
}
```

---

## 🚨 **Error Handling**

### **Error Response Format**

All API errors follow a consistent format:

```json
{
  "message": "Human-readable error message",
  "error": "ERROR_CODE",
  "details": {
    "field": "Additional error details",
    "timestamp": "2025-06-28T10:00:00.000Z"
  }
}
```

### **Common Error Codes**

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Request validation failed |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_SERVER_ERROR | Server error |

### **Validation Error Example**

```json
{
  "message": "Validation Error",
  "error": "VALIDATION_ERROR",
  "details": {
    "errors": [
      {
        "field": "email",
        "message": "Email already exists"
      },
      {
        "field": "password",
        "message": "Password must contain at least one uppercase letter"
      }
    ]
  }
}
```

---

## 📊 **Rate Limiting**

The API implements rate limiting to prevent abuse:

- **Standard Endpoints:** 100 requests per 15 minutes per IP
- **Authentication Endpoints:** 5 login attempts per 15 minutes per IP
- **Statistics Endpoints:** 10 requests per minute per user

### **Rate Limit Headers**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 🔧 **API Testing Examples**

### **cURL Examples**

#### **Register a new user:**
```bash
curl -X POST https://finance-tracker-backend-latest.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

#### **Login:**
```bash
curl -X POST https://finance-tracker-backend-latest.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

#### **Create a transaction:**
```bash
curl -X POST https://finance-tracker-backend-latest.onrender.com/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "expense",
    "category": "Food",
    "amount": 25.50,
    "description": "Lunch"
  }'
```

#### **Get transactions:**
```bash
curl -X GET "https://finance-tracker-backend-latest.onrender.com/api/transactions?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **JavaScript/Axios Examples**

#### **API Service Setup:**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://finance-tracker-backend-latest.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### **Authentication:**
```javascript
// Register
const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Login
const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
```

#### **Transaction Management:**
```javascript
// Create transaction
const createTransaction = async (transactionData) => {
  try {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get transactions with filters
const getTransactions = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/transactions?${params}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
```

---

## 📝 **API Versioning**

The API follows semantic versioning:

- **Current Version:** v1
- **Base URL:** `/api/v1/` (optional, defaults to `/api/`)
- **Deprecation Policy:** 6 months notice for breaking changes

### **Version Headers**

```http
Accept: application/json; version=1
API-Version: 1.0.0
```

---

## 🔒 **Security Considerations**

### **Authentication Security**
- JWT tokens expire after 7 days
- Passwords hashed with bcrypt (12 salt rounds)
- Rate limiting on authentication endpoints
- Account lockout after 5 failed login attempts

### **Data Protection**
- Input validation and sanitization
- SQL/NoSQL injection prevention
- XSS protection headers
- CORS configured for specific origins

### **API Security**
- HTTPS required in production
- Security headers (Helmet.js)
- Request size limits
- Error message sanitization

---

## 📈 **Performance Considerations**

### **Database Optimization**
- Indexed fields: `userId`, `date`, `type`, `category`
- Aggregation pipelines for complex queries
- Lean queries for read-only operations
- Connection pooling

### **Caching Strategy**
- API response caching (Redis)
- Database query result caching
- Static asset caching
- CDN for global distribution

### **Monitoring**
- Health check endpoints
- Performance metrics
- Error tracking
- Uptime monitoring

---

This comprehensive API documentation provides all the technical details needed to understand, integrate with, and maintain the Personal Finance Tracker backend API. It demonstrates professional API design, comprehensive documentation practices, and production-ready implementation standards.
