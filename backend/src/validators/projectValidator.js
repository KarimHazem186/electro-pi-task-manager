import { body, param } from 'express-validator';

export const createProjectValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Project name must be between 3 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Project description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

export const updateProjectValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Project name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['active', 'archived'])
    .withMessage('Status must be either active or archived'),
];

export const addMemberValidator = [
  body('userId').notEmpty().withMessage('User ID is required').isMongoId().withMessage('Invalid user ID'),
  body('role')
    .optional()
    .isIn(['owner', 'editor', 'viewer'])
    .withMessage('Role must be owner, editor, or viewer'),
];

export const projectIdValidator = [
  param('id').isMongoId().withMessage('Invalid project ID'),
];
