import express from 'express';
import {
  getTasks,
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addTaskAttachment,
  deleteTaskAttachment,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { zodValidate } from '../middleware/zodValidate.js';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
  taskQuerySchema,
} from '../validators/zodSchemas.js';
import { upload } from '../utils/uploadHelper.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', zodValidate(taskQuerySchema), getTasks);
router.get('/all', getAllTasks);
router.post('/', zodValidate(createTaskSchema), createTask);

router.get('/:id', zodValidate(taskIdSchema), getTaskById);
router.patch('/:id', zodValidate(updateTaskSchema), updateTask);
router.delete('/:id', zodValidate(taskIdSchema), deleteTask);

// Attachment routes
router.post('/:id/attachments', zodValidate(taskIdSchema), upload.single('image'), addTaskAttachment);
router.delete('/:id/attachments/:attachmentId', deleteTaskAttachment);

export default router;
