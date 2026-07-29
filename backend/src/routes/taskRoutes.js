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
  checkTaskAccess,
  getEffectiveProjectRole,
  hasProjectRoleAtLeast,
} from '../middleware/permissions.js';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
  taskQuerySchema,
} from '../validators/zodSchemas.js';
import { upload } from '../utils/uploadHelper.js';

const router = express.Router();

router.use(protect); // All routes require authentication

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Get tasks with pagination and filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in_progress, done, all]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent, all]
 *       - in: query
 *         name: assigneeId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 */
router.get('/', zodValidate(taskQuerySchema), getTasks);

/**
 * @swagger
 * /api/tasks/all:
 *   get:
 *     tags: [Tasks]
 *     summary: Get all tasks (for Kanban board)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All tasks retrieved successfully
 */
router.get('/all', getAllTasks);

// Create: any member of the project body must have editor or higher
const requireBodyProjectEditor = async (req, res, next) => {
  const projectId = req.body?.projectId;
  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: 'Project ID is required in the request body',
    });
  }
  try {
    const role = await getEffectiveProjectRole(projectId, req.user);
    if (!role) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this project',
      });
    }
    if (!hasProjectRoleAtLeast(role, 'editor')) {
      return res.status(403).json({
        success: false,
        message: "This action requires 'editor' role on the project",
      });
    }
    req.projectRole = role;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a new task (Editor+ only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - projectId
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *               description:
 *                 type: string
 *               projectId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               assigneeId:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Task created successfully
 *       403:
 *         description: Only editors and owners can create tasks
 */
router.post(
  '/',
  zodValidate(createTaskSchema),
  requireBodyProjectEditor,
  createTask
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get task by ID
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
 *         description: Task retrieved successfully
 *       403:
 *         description: No access to this task
 *       404:
 *         description: Task not found
 */
router.get('/:id', zodValidate(taskIdSchema), getTaskById);

/**
 * @swagger
 * /api/tasks/{id}:
 *   patch:
 *     tags: [Tasks]
 *     summary: Update task (Editor+ only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               assigneeId:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       403:
 *         description: Only editors and owners can update tasks
 */
router.patch(
  '/:id',
  zodValidate(updateTaskSchema),
  checkTaskAccess('editor'),
  updateTask
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete task (Editor+ only)
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
 *         description: Task deleted successfully
 *       403:
 *         description: Only editors and owners can delete tasks
 */
router.delete(
  '/:id',
  zodValidate(taskIdSchema),
  checkTaskAccess('editor'),
  deleteTask
);

// Attachment routes
/**
 * @swagger
 * /api/tasks/{id}/attachments:
 *   post:
 *     tags: [Tasks]
 *     summary: Add attachment to task (Editor+ only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Attachment added successfully
 *       403:
 *         description: Only editors and owners can add attachments
 */
router.post(
  '/:id/attachments',
  zodValidate(taskIdSchema),
  checkTaskAccess('editor'),
  upload.single('image'),
  addTaskAttachment
);

/**
 * @swagger
 * /api/tasks/{id}/attachments/{attachmentId}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete task attachment (Editor+ only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attachment deleted successfully
 *       403:
 *         description: Only editors and owners can delete attachments
 */
router.delete(
  '/:id/attachments/:attachmentId',
  checkTaskAccess('editor'),
  deleteTaskAttachment
);

export default router;
