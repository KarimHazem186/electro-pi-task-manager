import express from 'express';
import { getUsers, getUserById } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { zodValidate } from '../middleware/zodValidate.js';
import { userIdSchema } from '../validators/zodSchemas.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getUsers);
router.get('/:id', zodValidate(userIdSchema), getUserById);

export default router;
