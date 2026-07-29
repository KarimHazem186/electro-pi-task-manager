import { z } from 'zod';

// Auth Schemas
export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .trim(),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Please provide a valid email')
      .toLowerCase()
      .trim(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password cannot exceed 100 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Please provide a valid email')
      .toLowerCase()
      .trim(),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string({ required_error: 'Current password is required' }),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(6, 'New password must be at least 6 characters')
      .max(100, 'New password cannot exceed 100 characters'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .trim()
      .optional(),
    email: z
      .string()
      .email('Please provide a valid email')
      .toLowerCase()
      .trim()
      .optional(),
  }),
});

// Project Schemas
export const createProjectSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Project name is required' })
      .min(3, 'Project name must be at least 3 characters')
      .max(100, 'Project name cannot exceed 100 characters')
      .trim(),
    description: z
      .string({ required_error: 'Project description is required' })
      .min(1, 'Description is required')
      .max(500, 'Description cannot exceed 500 characters')
      .trim(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  }),
  body: z.object({
    name: z
      .string()
      .min(3, 'Project name must be at least 3 characters')
      .max(100, 'Project name cannot exceed 100 characters')
      .trim()
      .optional(),
    description: z
      .string()
      .min(1, 'Description cannot be empty')
      .max(500, 'Description cannot exceed 500 characters')
      .trim()
      .optional(),
    status: z.enum(['active', 'archived']).optional(),
  }),
});

export const projectIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  }),
});

export const addProjectMemberSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  }),
  body: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
    role: z.enum(['owner', 'manager', 'member'], {
      required_error: 'Role is required',
    }),
  }),
});

export const updateProjectMemberSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
    memberId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid member ID'),
  }),
  body: z.object({
    role: z.enum(['owner', 'manager', 'member'], {
      required_error: 'Role is required',
    }),
  }),
});

export const removeProjectMemberSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
    memberId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid member ID'),
  }),
});

// Task Schemas
export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Task title is required' })
      .min(3, 'Task title must be at least 3 characters')
      .max(200, 'Task title cannot exceed 200 characters')
      .trim(),
    description: z
      .string()
      .max(2000, 'Description cannot exceed 2000 characters')
      .trim()
      .optional(),
    projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
    assigneeId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid assignee ID')
      .optional()
      .nullable(),
    status: z.enum(['todo', 'in_progress', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dueDate: z
      .string()
      .datetime({ message: 'Invalid date format' })
      .or(z.date())
      .optional()
      .nullable(),
    tags: z.array(z.string().trim()).optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID'),
  }),
  body: z.object({
    title: z
      .string()
      .min(3, 'Task title must be at least 3 characters')
      .max(200, 'Task title cannot exceed 200 characters')
      .trim()
      .optional(),
    description: z
      .string()
      .max(2000, 'Description cannot exceed 2000 characters')
      .trim()
      .optional()
      .nullable(),
    assigneeId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid assignee ID')
      .optional()
      .nullable(),
    status: z.enum(['todo', 'in_progress', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dueDate: z
      .string()
      .datetime({ message: 'Invalid date format' })
      .or(z.date())
      .optional()
      .nullable(),
    tags: z.array(z.string().trim()).optional(),
  }),
});

export const taskIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID'),
  }),
});

export const taskQuerySchema = z.object({
  query: z.object({
    projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID').optional(),
    status: z.enum(['todo', 'in_progress', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    assigneeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid assignee ID').optional(),
    search: z.string().trim().optional(),
    sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'title']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

// User Schema
export const userIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  }),
});
