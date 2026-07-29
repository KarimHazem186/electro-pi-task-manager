import swaggerJsDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Manager API',
      version: '1.0.0',
      description: `
Task Management System with Role-Based Access Control (RBAC)

## Features
- JWT Authentication with dual-token system (access + refresh)
- Role-Based Access Control (Workspace + Project roles)
- Real-time updates via Socket.IO
- File uploads with Cloudinary
- Comprehensive validation and security

## Workspace Roles
- **Admin**: Full access, user management, sees all projects
- **Manager**: Create projects, manage owned projects
- **Member**: Create projects, manage owned projects

## Project Roles
- **Owner**: Full project control (edit, delete, manage members)
- **Editor**: Create/edit/delete tasks
- **Viewer**: Read-only access

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
\`Authorization: Bearer <access_token>\`

Alternatively, tokens can be sent as HTTP-only cookies.
      `,
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : (process.env.API_URL || 'https://your-backend.vercel.app'),
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication and authorization endpoints',
      },
      {
        name: 'Projects',
        description: 'Project management endpoints (RBAC enforced)',
      },
      {
        name: 'Tasks',
        description: 'Task management endpoints (RBAC enforced)',
      },
      {
        name: 'Users',
        description: 'User management endpoints (some require admin)',
      },
      {
        name: 'Dashboard',
        description: 'Dashboard statistics and activity',
      },
      {
        name: 'Notifications',
        description: 'User notifications',
      },
      {
        name: 'Search',
        description: 'Global search across projects and tasks',
      },
      {
        name: 'Upload',
        description: 'File upload endpoints (Cloudinary)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your access token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            role: {
              type: 'string',
              enum: ['admin', 'manager', 'member'],
              example: 'member',
            },
            avatarUrl: {
              type: 'string',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Project: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            name: {
              type: 'string',
              example: 'Q4 Marketing Campaign',
            },
            slug: {
              type: 'string',
              example: 'q4-marketing-campaign',
            },
            description: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['active', 'archived'],
            },
            ownerId: {
              type: 'string',
            },
            coverImage: {
              type: 'string',
              nullable: true,
            },
            taskCount: {
              type: 'integer',
            },
            completedTaskCount: {
              type: 'integer',
            },
            members: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ProjectMember',
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        ProjectMember: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            userId: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['owner', 'editor', 'viewer'],
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        Task: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            title: {
              type: 'string',
              example: 'Design landing page',
            },
            description: {
              type: 'string',
            },
            projectId: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['todo', 'in_progress', 'done'],
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
            },
            assigneeId: {
              type: 'string',
              nullable: true,
            },
            createdBy: {
              type: 'string',
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            attachments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string' },
                  publicId: { type: 'string' },
                },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

export const swaggerSpec = swaggerJsDoc(options);
