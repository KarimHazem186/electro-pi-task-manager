import express from 'express';
import {
  getUsers,
  getAllUsers,
  getUserById,
  inviteUser,
  deleteUser,
  updateAvatar,
  deleteAvatar,
  updateUserRole,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { zodValidate } from '../middleware/zodValidate.js';
import { 
  userIdSchema, 
  inviteUserSchema, 
  updateUserRoleSchema 
} from '../validators/zodSchemas.js';
import { upload } from '../utils/uploadHelper.js';

const router = express.Router();

router.use(protect); // All routes require authentication

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all workspace users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/', getUsers);

/**
 * @swagger
 * /api/users/all:
 *   get:
 *     tags: [Users]
 *     summary: Get all users (for dropdowns)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All users retrieved successfully
 */
router.get('/all', getAllUsers);

// Admin-only: invite, delete, change role
/**
 * @swagger
 * /api/users/invite:
 *   post:
 *     tags: [Users]
 *     summary: Invite user to workspace (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [admin, manager, member]
 *     responses:
 *       201:
 *         description: User invited successfully
 *       403:
 *         description: Admin access required
 */
router.post(
  '/invite',
  authorize('admin', 'manager'),
  zodValidate(inviteUserSchema),
  inviteUser
);

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     tags: [Users]
 *     summary: Change user workspace role (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, manager, member]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       403:
 *         description: Admin access required
 */
router.patch(
  '/:id/role',
  authorize('admin'),
  zodValidate(updateUserRoleSchema),
  updateUserRole
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user from workspace (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Admin access required
 */
router.delete(
  '/:id',
  authorize('admin'),
  zodValidate(userIdSchema),
  deleteUser
);

// Profile-scoped routes (any authenticated user)
/**
 * @swagger
 * /api/users/profile/avatar:
 *   put:
 *     tags: [Users]
 *     summary: Upload profile avatar
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 */
router.put('/profile/avatar', upload.single('image'), updateAvatar);

/**
 * @swagger
 * /api/users/profile/avatar:
 *   delete:
 *     tags: [Users]
 *     summary: Delete profile avatar
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar deleted successfully
 */
router.delete('/profile/avatar', deleteAvatar);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/:id', zodValidate(userIdSchema), getUserById);

export default router;
