# Task Manager Backend API

A production-ready task management REST API built with Node.js, Express, and MongoDB featuring JWT authentication, role-based access control, real-time updates with Socket.IO, and comprehensive API documentation.

## 🚀 Features

- ✅ **JWT Authentication** - Dual-token system (access + refresh) with HTTP-only cookies
- ✅ **Enhanced Security** - Helmet, CORS, rate limiting, MongoDB injection prevention, HPP protection
- ✅ **Password Security** - bcrypt hashing with salt rounds
- ✅ **Input Validation** - Zod schema validation on all endpoints
- ✅ **Role-Based Access Control (RBAC)** - Admin, Manager, and Member roles
- ✅ **Project Management** - Create, update, delete projects with member management
- ✅ **Task Management** - Full CRUD operations with filtering, sorting, and search
- ✅ **Real-time Updates** - Socket.IO for live task updates
- ✅ **Audit Logging** - Track all status changes and important actions
- ✅ **Error Handling** - Centralized error handling middleware
- ✅ **API Documentation** - Interactive Swagger/OpenAPI documentation
- ✅ **Rate Limiting** - Brute force protection (5 attempts per 15min on auth)
- ✅ **HTTP-Only Cookies** - XSS and CSRF protection
- ✅ **Pagination & Search** - Efficient data retrieval
- ✅ **Docker Support** - Docker and Docker Compose configuration
- ✅ **Automated Tests** - Jest and Supertest integration

## 📋 Requirements

- Node.js >= 18.x
- MongoDB >= 6.x (local or Atlas)
- npm >= 9.x

## 🛠️ Installation

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmanager

# JWT Configuration (IMPORTANT: Change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-this-in-production
JWT_REFRESH_EXPIRE=7d
COOKIE_EXPIRE=7

# CORS
FRONTEND_URL=http://localhost:3000
SOCKET_CORS_ORIGIN=http://localhost:3000
```

> **💡 Pro Tip for Local Development:** 
> Create a `.env.local` file (git-ignored) for your real credentials:
> ```bash
> cp .env .env.local
> # Edit .env.local with your actual MongoDB URI, API keys, etc.
> ```
> The app will automatically use `.env.local` if it exists, keeping your real credentials safe!

> **🔒 Security Note**: Use strong random secrets in production. Generate with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

4. **Start MongoDB** (if running locally)
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7

# Or using installed MongoDB
mongod
```

5. **Seed the database** (optional but recommended)
```bash
npm run seed
```

6. **Start the server**
```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

The server will be running at `http://localhost:5000`

### Docker Deployment

1. **Using Docker Compose** (recommended)
```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Backend API on port 5000

2. **Using Docker only**
```bash
# Build image
docker build -t taskmanager-backend .

# Run container
docker run -d -p 5000:5000 --env-file .env taskmanager-backend
```

## 📚 API Documentation

Interactive API documentation is available at:
- **Development**: http://localhost:5000/api-docs
- **Production**: https://your-backend-url.com/api-docs

**📊 Complete Coverage:** All **49 endpoints** are fully documented with:
- ✅ Request/Response schemas
- ✅ RBAC requirements
- ✅ Validation rules
- ✅ Error responses
- ✅ Interactive testing

**📖 Documentation Files:**
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Complete API reference
- [RBAC_GUIDE.md](../RBAC_GUIDE.md) - Role-based access control guide
- [SWAGGER_COMPLETE.md](../SWAGGER_COMPLETE.md) - Swagger implementation details

### Quick API Overview

#### Authentication Endpoints
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login user (sets HTTP-only cookies)
POST   /api/auth/refresh        - Refresh access token
POST   /api/auth/logout         - Logout user (clears cookies)
GET    /api/auth/me             - Get current user
PATCH  /api/auth/profile        - Update profile
POST   /api/auth/change-password - Change password
```

#### Project Endpoints
```
GET    /api/projects             - Get all accessible projects
POST   /api/projects             - Create new project
GET    /api/projects/:id         - Get project by ID
GET    /api/projects/by-slug/:slug - Get project by slug
PATCH  /api/projects/:id         - Update project
DELETE /api/projects/:id         - Delete project
GET    /api/projects/:id/members - Get project members
POST   /api/projects/:id/members - Add member to project
DELETE /api/projects/:id/members/:memberId - Remove member
```

#### Task Endpoints
```
GET    /api/tasks               - Get tasks with pagination
GET    /api/tasks/all           - Get all tasks (for Kanban)
POST   /api/tasks               - Create new task
GET    /api/tasks/:id           - Get task by ID
PATCH  /api/tasks/:id           - Update task
DELETE /api/tasks/:id           - Delete task
```

#### User Endpoints
```
GET    /api/users               - Get all users
GET    /api/users/:id           - Get user by ID
```

#### Dashboard Endpoints
```
GET    /api/dashboard/stats     - Get dashboard statistics
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Security audit
npm run security:audit

# Check for outdated packages
npm run security:check
```

### Security Testing

Use the provided `test-security.http` file with REST Client extension in VS Code, or:

```bash
# Test full authentication flow
bash scripts/test-auth.sh  # (if available)

# Or manually test with the 43 test cases in test-security.http
```

## 🗄️ Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['admin', 'manager', 'member'],
  avatarUrl: String,
  timestamps: true
}
```

### Project
```javascript
{
  name: String,
  slug: String (unique, auto-generated),
  description: String,
  status: Enum ['active', 'archived'],
  ownerId: ObjectId (ref: User),
  timestamps: true
}
```

### ProjectMember
```javascript
{
  projectId: ObjectId (ref: Project),
  userId: ObjectId (ref: User),
  role: Enum ['owner', 'editor', 'viewer'],
  joinedAt: Date,
  timestamps: true
}
```

### Task
```javascript
{
  projectId: ObjectId (ref: Project),
  title: String,
  description: String,
  status: Enum ['todo', 'in_progress', 'done'],
  priority: Enum ['low', 'medium', 'high', 'urgent'],
  dueDate: Date,
  assigneeId: ObjectId (ref: User),
  creatorId: ObjectId (ref: User),
  timestamps: true
}
```

### AuditLog
```javascript
{
  userId: ObjectId (ref: User),
  action: Enum ['created', 'updated', 'deleted', 'status_changed'],
  entityType: Enum ['task', 'project', 'user', 'project_member'],
  entityId: ObjectId,
  changes: Mixed,
  metadata: Mixed,
  timestamps: true
}
```

## 🔒 Authentication & Authorization

### Dual-Token System
The API uses a secure dual-token authentication system:

- **Access Token**: Short-lived (15 minutes) - Used for API requests
- **Refresh Token**: Long-lived (7 days) - Used to get new access tokens

### Role-Based Access Control (RBAC)

The application implements a comprehensive two-tier RBAC system:

**Workspace Roles** (Global):
- **Admin**: Full workspace access, user management, sees all projects
- **Manager**: Can create projects, manage owned projects
- **Member**: Can create projects, manage owned projects

**Project Roles** (Scoped):
- **Owner**: Full project control (edit, delete, manage members)
- **Editor**: Can create/edit/delete tasks, view project
- **Viewer**: Read-only access to project and tasks

**Quick Examples:**
```javascript
// A viewer cannot create tasks
POST /api/tasks (as viewer) → 403 Forbidden

// An editor can create and modify tasks
POST /api/tasks (as editor) → 201 Created
PATCH /api/tasks/:id (as editor) → 200 OK

// Only owners can manage project members
POST /api/projects/:id/members (as editor) → 403 Forbidden
POST /api/projects/:id/members (as owner) → 201 Created

// Admins have owner privileges on all projects
DELETE /api/projects/:id (as admin) → 200 OK
```

**📚 Complete RBAC Documentation:**  
See [RBAC_GUIDE.md](../RBAC_GUIDE.md) for detailed role matrix, implementation details, testing guide, and troubleshooting.

### Token Storage Options

#### Option 1: HTTP-Only Cookies (Recommended for Web)
Tokens are automatically stored in secure HTTP-only cookies:
```javascript
// Frontend - just include credentials
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  credentials: 'include', // Important!
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

**Benefits:**
- ✅ Protected from XSS attacks
- ✅ Automatic CSRF protection (SameSite cookies)
- ✅ No manual token management needed

#### Option 2: Authorization Header (For Mobile Apps)
Tokens are also returned in response body:
```javascript
// Response includes tokens
{
  "success": true,
  "data": { /* user */ },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}

// Use in subsequent requests
fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

### Token Refresh
When access token expires (after 15 minutes):
```javascript
// Auto-refresh with refresh token
POST /api/auth/refresh

// Returns new access token
{
  "success": true,
  "accessToken": "new-token..."
}
```

### User Roles
- **Admin**: Full access to all resources
- **Manager**: Can manage their own projects and be assigned to others
- **Member**: Can be assigned to projects with specific roles

For detailed RBAC implementation and role matrix, see [RBAC_GUIDE.md](../RBAC_GUIDE.md).

### Project Member Roles
- **Owner**: Full control over project and members
- **Editor**: Can create, update, and delete tasks
- **Viewer**: Read-only access

## 🔌 Real-time Updates (Socket.IO)

> **Note**: Real-time features work locally and on platforms with persistent connection support (Render, Fly.io, Railway).  
> Not active on Vercel production due to serverless architecture limitations. See [Deployment section](#-deployment) for details.

### Events

**Client → Server**
```javascript
socket.emit('join-project', projectId);
socket.emit('leave-project', projectId);
```

**Server → Client**
```javascript
socket.on('task:created', (task) => { });
socket.on('task:updated', (task) => { });
socket.on('task:deleted', ({ id }) => { });
socket.on('task:status-changed', (task) => { });
```

## 🛡️ Security Features

### Comprehensive Security Implementation

| Feature | Implementation | Status |
|---------|---------------|--------|
| Password Hashing | bcrypt with salt rounds | ✅ |
| JWT Access Tokens | 15-minute expiry | ✅ |
| JWT Refresh Tokens | 7-day expiry | ✅ |
| HTTP-Only Cookies | Primary token storage | ✅ |
| CORS Protection | Restricted origins | ✅ |
| Rate Limiting | 100/15min general, 5/15min auth | ✅ |
| Input Validation | Zod schemas on all routes | ✅ |
| MongoDB Injection | express-mongo-sanitize | ✅ |
| XSS Protection | HTTP-only cookies, CSP | ✅ |
| CSRF Protection | SameSite cookies | ✅ |
| Security Headers | Helmet middleware | ✅ |
| HPP Protection | Parameter pollution prevention | ✅ |
| HTTPS Enforcement | Production mode | ✅ |

### Security Documentation

For detailed security information, see:
- **[SECURITY.md](./SECURITY.md)** - Comprehensive security documentation
- **[SECURITY_IMPLEMENTATION.md](./SECURITY_IMPLEMENTATION.md)** - Implementation guide  
- **[SECURITY_QUICK_REFERENCE.md](./SECURITY_QUICK_REFERENCE.md)** - Quick reference card
- **[FRONTEND_MIGRATION_GUIDE.md](./FRONTEND_MIGRATION_GUIDE.md)** - Frontend integration guide
- **[test-security.http](./test-security.http)** - Security testing suite (43 tests)

### Quick Security Test

```bash
# Test authentication with cookies
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@taskmanager.com","password":"Admin@123456"}' \
  -c cookies.txt

# Access protected route
curl http://localhost:5000/api/auth/me -b cookies.txt

# Test rate limiting (run 6 times quickly)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'
```

## 🧑‍💻 Test Accounts

After running `npm run seed`, you can use these accounts:

### Admin Account
- **Email**: admin@taskmanager.com
- **Password**: Admin@123456
- **Role**: admin

### Manager Account
- **Email**: manager@taskmanager.com
- **Password**: Manager@123456
- **Role**: manager

### Member Account
- **Email**: john@taskmanager.com
- **Password**: Member@123456
- **Role**: member

## 🌐 Deployment

### Deploy to Vercel (Recommended - Serverless)

#### Prerequisites
1. **MongoDB Atlas** (required for production database)
2. **Vercel Account** (free tier available)

#### Deployment Steps

1. **Install Vercel CLI** (optional)
```bash
npm i -g vercel
```

2. **Deploy via CLI** or connect GitHub repo to Vercel Dashboard

3. **Configure Environment Variables in Vercel**
Go to Vercel Dashboard → Project Settings → Environment Variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=<64-char-random-hex-string>
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=<different-64-char-random-hex-string>
JWT_REFRESH_EXPIRE=7d
COOKIE_EXPIRE=7
FRONTEND_URL=https://your-frontend.vercel.app
SOCKET_CORS_ORIGIN=https://your-frontend.vercel.app
```

4. **Deploy**
```bash
# From backend directory
cd backend
vercel --prod
```

#### ⚠️ Important Note: Real-time Features on Vercel

**Socket.IO real-time updates are fully implemented and functional when running locally or on platforms that support persistent connections** (e.g., Render, Fly.io, Railway).

**They are NOT active in the current Vercel production deployment** because Vercel's serverless architecture does not support long-lived WebSocket connections. Each serverless function executes for a single request and terminates, making persistent connections impossible.

**What works on Vercel:**
- ✅ All REST APIs (Authentication, Projects, Tasks, Users, Dashboard)
- ✅ JWT authentication with HTTP-only cookies
- ✅ All CRUD operations
- ✅ Filtering, pagination, and search
- ✅ Role-based access control
- ✅ Input validation and security features

**What doesn't work on Vercel:**
- ❌ Socket.IO real-time task updates (bonus feature)

**To test Socket.IO locally:**
```bash
npm run dev
# Real-time features work perfectly in local environment
```

**Technical Explanation:**
- Vercel uses **serverless functions** that execute on-demand and terminate after each request
- Socket.IO requires **persistent connections** that stay open for continuous bi-directional communication
- This is an architectural limitation, not an implementation issue
- All Socket.IO code is production-ready and can be deployed to platforms like Render, Fly.io, or Railway

---

### Alternative: Deploy to Render (Full Support)

If you need Socket.IO in production, use Render (requires credit card):

1. Create new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`

4. Add environment variables:
   ```
   NODE_ENV=production
   MONGODB_URI=<your-mongodb-atlas-uri>
   JWT_SECRET=<secure-random-string>
   JWT_REFRESH_SECRET=<different-secure-random-string>
   JWT_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d
   COOKIE_EXPIRE=7
   FRONTEND_URL=<your-vercel-frontend-url>
   SOCKET_CORS_ORIGIN=<your-vercel-frontend-url>
   ```

5. Deploy! ✅ All features including Socket.IO will work

---

### MongoDB Atlas Setup

1. Create free cluster at https://cloud.mongodb.com
2. Create database user with strong password
3. Network Access → Add IP: `0.0.0.0/0` (allow from anywhere)
4. Get connection string from "Connect" → "Connect your application"
5. Replace `<password>` and `<dbname>` in connection string
6. Use in `MONGODB_URI` environment variable

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # MongoDB connection
│   │   ├── socket.js         # Socket.IO setup
│   │   └── swagger.js        # API documentation config
│   ├── controllers/          # Route controllers
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   ├── userController.js
│   │   └── dashboardController.js
│   ├── middleware/           # Express middleware
│   │   ├── auth.js           # JWT authentication
│   │   ├── error.js          # Error handling
│   │   ├── validate.js       # Validation check
│   │   └── permissions.js    # Authorization checks
│   ├── models/               # Mongoose models
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── ProjectMember.js
│   │   ├── Task.js
│   │   └── AuditLog.js
│   ├── routes/               # API routes
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── userRoutes.js
│   │   └── dashboardRoutes.js
│   ├── validators/           # Input validation rules
│   │   ├── authValidator.js
│   │   ├── projectValidator.js
│   │   └── taskValidator.js
│   ├── scripts/
│   │   └── seed.js           # Database seeding
│   ├── app.js                # Express app setup
│   └── server.js             # Server entry point
├── __tests__/                # Test files
│   └── auth.test.js
├── .env                      # Environment variables (not in git)
├── .env.example              # Environment template
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── jest.config.js
├── package.json
└── README.md
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# Check connection string in .env
# Ensure IP whitelist includes your IP on Atlas
```

### Port Already in Use
```bash
# Kill process on port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### JWT Token Issues
- Ensure `JWT_SECRET` is set in `.env`
- Check token format: `Bearer <token>`
- Verify token hasn't expired

## 📝 Environment Variables Reference

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` or `production` | Yes |
| `PORT` | Server port | `5000` | Yes |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/taskmanager` | Yes |
| `JWT_SECRET` | Secret for JWT access token signing | 64-char random hex string | Yes |
| `JWT_EXPIRE` | Access token expiration | `15m`, `1h` | Yes |
| `JWT_REFRESH_SECRET` | Secret for refresh token signing | Different 64-char random hex | Yes |
| `JWT_REFRESH_EXPIRE` | Refresh token expiration | `7d`, `30d` | Yes |
| `COOKIE_EXPIRE` | Cookie expiration in days | `7` | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` | Yes |
| `SOCKET_CORS_ORIGIN` | Socket.IO CORS origin | `http://localhost:3000` | Yes |

### Generating Secure Secrets

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET (use different value!)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📄 License

This project is for assessment purposes.

## 👨‍💻 Author

Built for Full Stack Node.js Technical Assessment

---

**API Base URL (Local)**: http://localhost:5000  
**API Documentation (Local)**: http://localhost:5000/api-docs  
**Health Check**: http://localhost:5000/health
