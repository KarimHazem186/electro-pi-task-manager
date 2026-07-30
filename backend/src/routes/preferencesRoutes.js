import express from 'express';
import {
  getPreferences,
  updatePreferences,
} from '../controllers/preferencesController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

/**
 * @swagger
 * /api/preferences:
 *   get:
 *     tags: [Preferences]
 *     summary: Get user preferences
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferences retrieved successfully
 */
router.get('/', getPreferences);

/**
 * @swagger
 * /api/preferences:
 *   patch:
 *     tags: [Preferences]
 *     summary: Update user preferences
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notifications:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: boolean
 *                   weekly:
 *                     type: boolean
 *                   deadlines:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 */
router.patch('/', updatePreferences);

export default router;
