import express from 'express';
import { getUsers, getAllUsers, getUserById, inviteUser, deleteUser, updateAvatar, deleteAvatar } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { zodValidate } from '../middleware/zodValidate.js';
import { userIdSchema, inviteUserSchema } from '../validators/zodSchemas.js';
import { upload } from '../utils/uploadHelper.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getUsers);
router.get('/all', getAllUsers);
router.post('/invite', authorize('admin', 'manager'), zodValidate(inviteUserSchema), inviteUser);
router.put('/profile/avatar', upload.single('image'), updateAvatar);
router.delete('/profile/avatar', deleteAvatar);
router.get('/:id', zodValidate(userIdSchema), getUserById);
router.delete('/:id', authorize('admin'), zodValidate(userIdSchema), deleteUser);

export default router;
