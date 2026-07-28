import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  remember: z.boolean().optional(),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name is too short").max(100),
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email").max(255),
    password: z.string().min(8, "Password must be at least 8 characters").max(72),
    confirmPassword: z.string().min(8, "Please confirm your password").max(72),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type RegisterValues = z.infer<typeof registerSchema>;

export const projectSchema = z.object({
  name: z.string().trim().min(3, "Project name must be at least 3 characters").max(80),
  description: z.string().trim().min(10, "Add a short description").max(500),
});
export type ProjectValues = z.infer<typeof projectSchema>;

export const taskSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().trim().max(1000),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  dueDate: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
});
export type TaskValues = z.infer<typeof taskSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
});
export type ProfileValues = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Enter your current password").max(72),
    newPassword: z.string().min(8, "Password must be at least 8 characters").max(72),
    confirmPassword: z.string().min(8, "Please confirm your password").max(72),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const inviteSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  role: z.enum(["admin", "manager", "member"]),
});
export type InviteValues = z.infer<typeof inviteSchema>;
