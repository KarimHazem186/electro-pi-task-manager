import express from 'express';
import { getDashboardStats, getDashboardActivity } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard statistics
 *     description: Returns stats scoped by user role (admin sees all, others see only accessible projects)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalProjects:
 *                   type: integer
 *                 totalTasks:
 *                   type: integer
 *                 completedTasks:
 *                   type: integer
 *                 pendingTasks:
 *                   type: integer
 */
router.get('/stats', getDashboardStats);

/**
 * @swagger
 * /api/dashboard/activity:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get recent activity
 *     description: Returns recent activity scoped by user's accessible projects
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Activity retrieved successfully
 */
router.get('/activity', getDashboardActivity);

export default router;
