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
  removeProjectMember,
} from '../controllers/projectController.js';
import { protect, authorize } from '../middleware/auth.js';
import { checkProjectAccess } from '../middleware/permissions.js';
import { zodValidate } from '../middleware/zodValidate.js';
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
  addProjectMemberSchema,
  removeProjectMemberSchema,
} from '../validators/zodSchemas.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getProjects);
router.post('/', zodValidate(createProjectSchema), createProject);

router.get('/by-slug/:slug', getProjectBySlug);

router.get('/:id', zodValidate(projectIdSchema), getProjectById);
router.patch('/:id', zodValidate(updateProjectSchema), updateProject);
router.delete('/:id', zodValidate(projectIdSchema), deleteProject);

// Project members
router.get('/:projectId/members', checkProjectAccess(), getProjectMembers);
router.post(
  '/:projectId/members',
  checkProjectAccess('owner'),
  zodValidate(addProjectMemberSchema),
  addProjectMember
);
router.delete(
  '/:projectId/members/:memberId',
  checkProjectAccess('owner'),
  zodValidate(removeProjectMemberSchema),
  removeProjectMember
);

export default router;
