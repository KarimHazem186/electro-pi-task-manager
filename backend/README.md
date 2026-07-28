# Task Manager Backend API

A production-ready task management REST API built with Node.js, Express, and MongoDB featuring JWT authentication, role-based access control, real-time updates with Socket.IO, and comprehensive API documentation.

## 🚀 Features

- ✅ **JWT Authentication** - Secure user authentication with JWT tokens
- ✅ **Role-Based Access Control (RBAC)** - Admin, Manager, and Member roles
- ✅ **Project Management** - Create, update, delete projects with member management
- ✅ **Task Management** - Full CRUD operations with filtering, sorting, and search
- ✅ **Real-time Updates** - Socket.IO for live task updates
- ✅ **Audit Logging** - Track all status changes and important actions
- ✅ **Input Validation** - Comprehensive validation with express-validator
- ✅ **Error Handling** - Centralized error handling middleware
- ✅ **API Documentation** - Interactive Swagger/OpenAPI documentation
- ✅ **Rate Limiting** - Protection against API abuse
- ✅ **Security** - Helmet, CORS, password hashing
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
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
SOCKET_CORS_ORIGIN=http://localhost:3000
```

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

### Quick API Overview

#### Authentication Endpoints
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login user
POST   /api/auth/logout         - Logout user
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

### JWT Token
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### User Roles
- **Admin**: Full access to all resources
- **Manager**: Can manage their own projects and be assigned to others
- **Member**: Can be assigned to projects with specific roles

### Project Member Roles
- **Owner**: Full control over project and members
- **Editor**: Can create, update, and delete tasks
- **Viewer**: Read-only access

## 🔌 Real-time Updates (Socket.IO)

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

### Deploy to Render

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
   JWT_EXPIRE=7d
   FRONTEND_URL=<your-vercel-frontend-url>
   SOCKET_CORS_ORIGIN=<your-vercel-frontend-url>
   ```

5. Deploy!

### MongoDB Atlas Setup

1. Create cluster at https://cloud.mongodb.com
2. Create database user
3. Whitelist IP: `0.0.0.0/0` (allow from anywhere)
4. Get connection string
5. Use connection string in `MONGODB_URI`

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
| `JWT_SECRET` | Secret for JWT signing | Random secure string | Yes |
| `JWT_EXPIRE` | Token expiration | `7d`, `24h`, `60m` | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` | Yes |
| `SOCKET_CORS_ORIGIN` | Socket.IO CORS origin | `http://localhost:3000` | Yes |

## 📄 License

This project is for assessment purposes.

## 👨‍💻 Author

Built for Full Stack Node.js Technical Assessment

---

**API Base URL (Local)**: http://localhost:5000  
**API Documentation (Local)**: http://localhost:5000/api-docs  
**Health Check**: http://localhost:5000/health
