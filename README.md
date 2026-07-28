# Task Manager - Full Stack Application

A production-ready task management system built with Node.js, Express, MongoDB, Next.js, and TypeScript.

## Features

- **Authentication**: JWT-based with secure password hashing
- **Projects**: Create and manage projects with team members
- **Tasks**: Full CRUD with status tracking, priorities, and assignments
- **Real-time Updates**: Socket.IO for instant collaboration
- **Role-Based Access**: Admin, Manager, and Member roles
- **API Documentation**: Interactive Swagger/OpenAPI docs
- **Testing**: Automated test suite with Jest
- **Docker**: Complete containerized setup

## Tech Stack

**Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Socket.IO  
**Frontend**: Next.js 15, TypeScript, Tailwind CSS, TanStack Query  
**Testing**: Jest, Supertest  
**DevOps**: Docker, Docker Compose

## Quick Start

### Prerequisites
- Node.js >= 18.x
- MongoDB (local or Atlas)
- npm >= 9.x

### Installation

```bash
# Clone repository
git clone https://github.com/KarimHazem186/electro-pi-task-manager.git
cd electro-pi-task-manager

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run seed
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api-docs

### Docker Setup

```bash
cd backend
docker-compose up -d
```

## Test Accounts

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@taskmanager.com | Admin@123456 |
| Manager | manager@taskmanager.com | Manager@123456 |
| Member | john@taskmanager.com | Member@123456 |

## API Endpoints

### Authentication
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login user
GET    /api/auth/me             - Get current user
```

### Projects
```
GET    /api/projects            - List projects
POST   /api/projects            - Create project
GET    /api/projects/:id        - Get project details
PATCH  /api/projects/:id        - Update project
DELETE /api/projects/:id        - Delete project
```

### Tasks
```
GET    /api/tasks               - List tasks (paginated)
POST   /api/tasks               - Create task
GET    /api/tasks/:id           - Get task details
PATCH  /api/tasks/:id           - Update task
DELETE /api/tasks/:id           - Delete task
```

Full API documentation available at: http://localhost:5000/api-docs

## Testing

```bash
cd backend
npm test
```

All 9 tests should pass.

## Project Structure

```
electro-pi-task-manager/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── models/         # Mongoose schemas
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, validation, errors
│   │   └── config/         # Database, Socket.IO, Swagger
│   ├── __tests__/          # Jest tests
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── frontend/               # Next.js + TypeScript
    ├── app/                # Next.js App Router
    ├── components/         # React components
    ├── services/           # API services
    └── types/              # TypeScript types
```

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
SOCKET_CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

## Deployment

### Backend (Render)
1. Connect GitHub repository
2. Set environment variables
3. Deploy

### Frontend (Vercel)
1. Import project
2. Set `NEXT_PUBLIC_API_BASE_URL`
3. Deploy

### Database (MongoDB Atlas)
1. Create free cluster
2. Get connection string
3. Update backend `MONGODB_URI`

Detailed deployment guide available in `DEPLOYMENT.md`

## Key Features Implemented

### Core Requirements ✅
- JWT authentication with password hashing
- Role-based access control
- Project CRUD with member management
- Task CRUD with filtering and search
- Protected routes with authorization
- Responsive frontend
- Input validation (client & server)
- Centralized error handling
- Automated tests (9 test cases)

### Bonus Features ✅
- Docker Compose setup
- Swagger/OpenAPI documentation
- Real-time updates (Socket.IO)
- Pagination and sorting
- Audit logging
- Deployment ready

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS configuration
- Helmet security headers
- Rate limiting
- Input sanitization
- MongoDB injection prevention

## License

This project is for technical assessment purposes.

## Contact

For questions or issues, please open an issue on GitHub.

---

**Status**: Production-ready  
**Version**: 1.0.0  
**Last Updated**: July 2026
