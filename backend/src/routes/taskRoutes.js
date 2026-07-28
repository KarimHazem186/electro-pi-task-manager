import express from 'express';
import {
  getTasks,
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createTaskValidator,
  updateTaskValidator,
  taskIdValidator,
} from '../validators/taskValidator.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getTasks);
router.get('/all', getAllTasks);
router.post('/', createTaskValidator, validate, createTask);

router.get('/:id', taskIdValidator, validate, getTaskById);
router.patch('/:id', taskIdValidator, updateTaskValidator, validate, updateTask);
router.delete('/:id', taskIdValidator, validate, deleteTask);

export default router;
