# 🚀 Electro-Pi Task Manager

A full-stack task management application with real-time updates, built with Node.js, Express, MongoDB, Next.js, and Socket.IO.

## ✨ Features

- ✅ **User Authentication** - JWT-based secure authentication
- ✅ **Project Management** - Create and manage projects
- ✅ **Task Management** - Create, assign, and track tasks
- ✅ **Real-Time Updates** - Socket.IO for instant synchronization
- ✅ **File Uploads** - Cloudinary integration for image uploads
- ✅ **Notifications** - Real-time in-app notifications
- ✅ **Multi-Language** - Support for multiple languages (i18n)
- ✅ **Role-Based Access** - Admin, Manager, and Member roles
- ✅ **Activity Feed** - Track all project activities
- ✅ **Dashboard** - Analytics and overview
- ✅ **API Documentation** - Interactive Swagger documentation
- ✅ **Docker Support** - One-command deployment

## 🐳 Quick Start with Docker (Recommended)

**The easiest way to run the entire application:**

### Windows
```cmd
docker-start.bat
```

### Linux/Mac
```bash
chmod +x docker-start.sh
./docker-start.sh
```

### Access Your Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Documentation**: http://localhost:5000/api-docs

**That's it!** The Docker setup includes:
- MongoDB database
- Backend API server
- Frontend application
- All configured and ready to use

📚 **Docker Documentation:**
- [Quick Start Guide](./DOCKER_QUICK_START.md) - Start in 3 steps
- [Complete Setup Guide](./DOCKER_SETUP.md) - Detailed documentation
- [Test Checklist](./DOCKER_TEST_CHECKLIST.md) - Verify your deployment
- [Files Summary](./DOCKER_FILES_SUMMARY.md) - What was created

---

## 💻 Manual Setup (Alternative)

If you prefer to run services individually:

### Prerequisites
- Node.js 20 or higher
- MongoDB 7 or higher
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   copy .env.example .env
   ```
   Edit `.env` and update configuration

4. Start MongoDB (if not running):
   ```bash
   # Windows
   net start MongoDB
   
   # Linux/Mac
   sudo systemctl start mongod
   ```

5. Seed database (optional):
   ```bash
   npm run seed
   ```

6. Start backend server:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

Backend runs on: http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   copy .env.example .env.local
   ```
   Edit `.env.local` and update API URLs

4. Start frontend server:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

Frontend runs on: http://localhost:3000

---

## 📁 Project Structure

```
electro-pi-task-manager/
├── backend/                    # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── controllers/       # Route controllers
│   │   ├── models/            # MongoDB models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Custom middleware
│   │   ├── config/            # Configuration files
│   │   ├── utils/             # Utility functions
│   │   └── scripts/           # Database seed scripts
│   ├── Dockerfile             # Backend Docker image
│   └── package.json
│
├── frontend/                   # Frontend (Next.js)
│   ├── app/                   # Next.js app directory
│   ├── components/            # React components
│   ├── lib/                   # Utility libraries
│   ├── services/              # API services
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript types
│   ├── messages/              # i18n translations
│   ├── Dockerfile             # Frontend Docker image
│   └── package.json
│
├── docker-compose.yml          # Docker Compose configuration
├── docker-compose.dev.yml      # Development mode configuration
├── .env.docker.example         # Environment template
├── docker-start.bat            # Windows startup script
├── docker-start.sh             # Linux/Mac startup script
├── docker-verify.bat           # Verification script
├── docker-commands.bat         # Command helper
│
├── DOCKER_QUICK_START.md       # Quick Docker guide
├── DOCKER_SETUP.md             # Complete Docker guide
├── DOCKER_TEST_CHECKLIST.md    # Testing guide
├── DOCKER_FILES_SUMMARY.md     # Files overview
│
└── README.md                   # This file
```

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/taskmanager

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars

# CORS
FRONTEND_URL=http://localhost:3000
SOCKET_CORS_ORIGIN=http://localhost:3000

# Optional: Cloudinary (for uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional: Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 📚 API Documentation

Interactive API documentation is available at:
http://localhost:5000/api-docs

### Main Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/logout` | POST | Logout user |
| `/api/projects` | GET | Get all projects |
| `/api/projects` | POST | Create project |
| `/api/projects/:id` | GET | Get project details |
| `/api/tasks` | GET | Get all tasks |
| `/api/tasks` | POST | Create task |
| `/api/tasks/:id` | PUT | Update task |
| `/api/notifications` | GET | Get notifications |
| `/api/users/profile` | GET | Get user profile |

Full API documentation: [backend/API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md)

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Docker Deployment Testing
Follow the comprehensive test checklist:
```bash
# See DOCKER_TEST_CHECKLIST.md
docker-verify.bat
```

---

## 🗄️ Database

### Seed Database
```bash
# Docker
docker-compose exec backend npm run seed

# Manual
cd backend
npm run seed
```

Sample data includes:
- 3 demo users (admin, manager, member)
- 5 sample projects
- 20 sample tasks
- Activity feed entries
- Notifications

### Database Schema
See [backend/README.md](./backend/README.md) for detailed schema documentation.

---

## 🚀 Deployment

### Docker Deployment (Recommended)

1. **Configure environment**:
   ```bash
   copy .env.docker.example .env
   ```
   Update with production values

2. **Build and start**:
   ```bash
   docker-compose up --build -d
   ```

3. **Verify**:
   ```bash
   docker-verify.bat
   ```

See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for production deployment guide.

### Vercel Deployment (Frontend)
The frontend is configured for Vercel deployment:
```bash
vercel deploy
```

### Railway/Render (Backend)
Backend can be deployed to Railway or Render using the provided Dockerfile.

---

## 🛠️ Development

### Development Mode with Docker
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```
Features:
- Hot reload for backend and frontend
- Volume mounting for live updates
- Debug port exposed (9229)

### Development Commands
```bash
# Backend
cd backend
npm run dev        # Start with hot reload
npm run seed       # Seed database
npm test           # Run tests

# Frontend
cd frontend
npm run dev        # Start with hot reload
npm run build      # Build for production
npm run lint       # Run linter
```

### Using Helper Script
```bash
docker-commands.bat start      # Start all services
docker-commands.bat stop       # Stop all services
docker-commands.bat logs       # View logs
docker-commands.bat shell backend  # Access backend shell
docker-commands.bat seed       # Seed database
docker-commands.bat help       # Show all commands
```

---

## 🔐 Security

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Request rate limiting
- XSS protection (helmet, xss-clean)
- MongoDB injection protection (express-mongo-sanitize)
- HPP (HTTP Parameter Pollution) protection
- CORS configuration
- Secure HTTP headers

See [backend/SECURITY.md](./backend/SECURITY.md) for security details.

---

## 🌍 Multi-Language Support

Supported languages:
- English (en)
- Arabic (ar)
- Add more in `frontend/messages/`

---

## 📊 Tech Stack

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Real-time**: Socket.IO
- **File Upload**: Multer + Cloudinary
- **Validation**: Zod, express-validator
- **API Docs**: Swagger (swagger-jsdoc, swagger-ui-express)
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Real-time**: Socket.IO Client
- **i18n**: next-intl
- **Charts**: Recharts

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (Frontend), Docker (Backend)

---

## 📈 Performance

- Server-side rendering (SSR) with Next.js
- Optimized Docker images (Alpine Linux)
- Database indexing for fast queries
- Connection pooling
- Response caching
- Code splitting
- Image optimization

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License.

---

## 👥 Authors

- **Backend**: Full-stack task management API
- **Frontend**: Modern React/Next.js application
- **DevOps**: Complete Docker deployment

---

## 🆘 Support

### Documentation
- [Docker Quick Start](./DOCKER_QUICK_START.md)
- [Docker Complete Guide](./DOCKER_SETUP.md)
- [Testing Checklist](./DOCKER_TEST_CHECKLIST.md)
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [API Documentation](./backend/API_DOCUMENTATION.md)

### Common Issues
See [DOCKER_SETUP.md → Troubleshooting](./DOCKER_SETUP.md#troubleshooting)

---

## ⭐ Features Roadmap

- [ ] Mobile app (React Native)
- [ ] Calendar integration
- [ ] Gantt charts
- [ ] Time tracking
- [ ] File attachments to tasks
- [ ] Comments and mentions
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Team chat

---

## 📸 Screenshots

*Add screenshots of your application here*

---

**Made with ❤️ using Node.js, Next.js, and Docker**

**🐳 Ready to start? Run `docker-start.bat` now!**
