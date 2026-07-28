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
import { validate } from '../middleware/validate.js';
import {
  createProjectValidator,
  updateProjectValidator,
  addMemberValidator,
  projectIdValidator,
} from '../validators/projectValidator.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getProjects);
router.post('/', createProjectValidator, validate, createProject);

router.get('/by-slug/:slug', getProjectBySlug);

router.get('/:id', projectIdValidator, validate, getProjectById);
router.patch('/:id', projectIdValidator, updateProjectValidator, validate, updateProject);
router.delete('/:id', projectIdValidator, validate, deleteProject);

// Project members
router.get('/:projectId/members', checkProjectAccess(), getProjectMembers);
router.post(
  '/:projectId/members',
  checkProjectAccess('owner'),
  addMemberValidator,
  validate,
  addProjectMember
);
router.delete('/:projectId/members/:memberId', checkProjectAccess('owner'), removeProjectMember);

export default router;
