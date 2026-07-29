import express from 'express';
import { globalSearch } from '../controllers/searchController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/search:
 *   get:
 *     tags: [Search]
 *     summary: Global search across projects and tasks
 *     description: Search for projects and tasks by query string
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query (minimum 2 characters)
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projects:
 *                   type: array
 *                   items:
 *                     type: object
 *                 tasks:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Query too short (minimum 2 characters)
 */
router.get('/', globalSearch);

export default router;
