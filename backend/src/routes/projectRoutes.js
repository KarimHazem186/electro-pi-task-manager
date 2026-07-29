import express from 'express';
import {
  getProjects,
  getProjectById,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  updateProjectMember,
  removeProjectMember,
  updateProjectCover,
  deleteProjectCover,
} from '../controllers/projectController.js';
import { protect, authorize } from '../middleware/auth.js';
import { checkProjectAccess } from '../middleware/permissions.js';
import { zodValidate } from '../middleware/zodValidate.js';
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
  addProjectMemberSchema,
  updateProjectMemberSchema,
  removeProjectMemberSchema,
} from '../validators/zodSchemas.js';
import { upload } from '../utils/uploadHelper.js';

const router = express.Router();

router.use(protect); // All routes require authentication

/**
 * @swagger
 * /api/projects:
 *   get:
 *     tags: [Projects]
 *     summary: Get all accessible projects
 *     description: Returns projects the user has access to (admin sees all, others see only their projects)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', getProjects);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     tags: [Projects]
 *     summary: Create a new project
 *     description: Create a new project (available to all authenticated users)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', zodValidate(createProjectSchema), createProject);

/**
 * @swagger
 * /api/projects/by-slug/{slug}:
 *   get:
 *     tags: [Projects]
 *     summary: Get project by slug
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *       404:
 *         description: Project not found
 */
router.get('/by-slug/:slug', getProjectBySlug);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Get project by ID
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
 *         description: Project retrieved successfully
 *       403:
 *         description: No access to this project
 *       404:
 *         description: Project not found
 */
router.get('/:id', zodValidate(projectIdSchema), getProjectById);

/**
 * @swagger
 * /api/projects/{id}:
 *   patch:
 *     tags: [Projects]
 *     summary: Update project (Owner only)
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, archived]
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       403:
 *         description: Only project owners can update
 */
router.patch(
  '/:id',
  zodValidate(updateProjectSchema),
  checkProjectAccess('owner'),
  updateProject
);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     tags: [Projects]
 *     summary: Delete project (Owner only)
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
 *         description: Project deleted successfully
 *       403:
 *         description: Only project owners can delete
 */
router.delete(
  '/:id',
  zodValidate(projectIdSchema),
  checkProjectAccess('owner'),
  deleteProject
);

// Cover image routes — owner only
/**
 * @swagger
 * /api/projects/{id}/cover:
 *   put:
 *     tags: [Projects]
 *     summary: Upload project cover image (Owner only)
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
 *         description: Cover image uploaded successfully
 *       403:
 *         description: Only project owners can upload cover
 */
router.put(
  '/:id/cover',
  zodValidate(projectIdSchema),
  checkProjectAccess('owner'),
  upload.single('image'),
  updateProjectCover
);

/**
 * @swagger
 * /api/projects/{id}/cover:
 *   delete:
 *     tags: [Projects]
 *     summary: Delete project cover image (Owner only)
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
 *         description: Cover image deleted successfully
 *       403:
 *         description: Only project owners can delete cover
 */
router.delete(
  '/:id/cover',
  zodValidate(projectIdSchema),
  checkProjectAccess('owner'),
  deleteProjectCover
);

// Project members
/**
 * @swagger
 * /api/projects/{projectId}/members:
 *   get:
 *     tags: [Projects]
 *     summary: Get project members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Members retrieved successfully
 *       403:
 *         description: No access to this project
 */
router.get('/:projectId/members', checkProjectAccess(), getProjectMembers);

/**
 * @swagger
 * /api/projects/{projectId}/members:
 *   post:
 *     tags: [Projects]
 *     summary: Add member to project (Owner only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
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
 *               - userId
 *               - role
 *             properties:
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [owner, editor, viewer]
 *     responses:
 *       201:
 *         description: Member added successfully
 *       403:
 *         description: Only project owners can add members
 */
router.post(
  '/:projectId/members',
  checkProjectAccess('owner'),
  zodValidate(addProjectMemberSchema),
  addProjectMember
);

/**
 * @swagger
 * /api/projects/{projectId}/members/{memberId}:
 *   delete:
 *     tags: [Projects]
 *     summary: Remove member from project (Owner only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       403:
 *         description: Only project owners can remove members
 */
router.delete(
  '/:projectId/members/:memberId',
  checkProjectAccess('owner'),
  zodValidate(removeProjectMemberSchema),
  removeProjectMember
);

/**
 * @swagger
 * /api/projects/{projectId}/members/{memberId}:
 *   patch:
 *     tags: [Projects]
 *     summary: Update member role (Owner only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
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
 *                 enum: [owner, editor, viewer]
 *     responses:
 *       200:
 *         description: Member role updated successfully
 *       403:
 *         description: Only project owners can update roles
 */
router.patch(
  '/:projectId/members/:memberId',
  checkProjectAccess('owner'),
  zodValidate(updateProjectMemberSchema),
  updateProjectMember
);

export default router;
