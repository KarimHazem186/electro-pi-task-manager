import express from 'express';
import { getDashboardStats, getDashboardActivity } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/stats', getDashboardStats);
router.get('/activity', getDashboardActivity);

export default router;
