import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../utils/uploadHelper.js';
import {
  uploadImage,
  uploadMultipleImages,
  uploadProfilePicture,
  uploadTaskAttachment,
  deleteImage
} from '../controllers/uploadController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: Upload a single image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *                 description: Cloudinary folder name (optional)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: No image file provided
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/image', upload.single('image'), uploadImage);

/**
 * @swagger
 * /api/upload/images:
 *   post:
 *     summary: Upload multiple images
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               folder:
 *                 type: string
 *                 description: Cloudinary folder name (optional)
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *       400:
 *         description: No image files provided
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/images', upload.array('images', 10), uploadMultipleImages);

/**
 * @swagger
 * /api/upload/profile:
 *   post:
 *     summary: Upload profile picture
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
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
 *         description: Profile picture uploaded successfully
 *       400:
 *         description: No image file provided
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/profile', upload.single('image'), uploadProfilePicture);

/**
 * @swagger
 * /api/upload/task-attachment:
 *   post:
 *     summary: Upload task attachment
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
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
 *         description: Task attachment uploaded successfully
 *       400:
 *         description: No image file provided
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/task-attachment', upload.single('image'), uploadTaskAttachment);

/**
 * @swagger
 * /api/upload/image:
 *   delete:
 *     summary: Delete an image from Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               publicId:
 *                 type: string
 *                 description: Cloudinary public ID
 *               url:
 *                 type: string
 *                 description: Cloudinary URL (alternative to publicId)
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       400:
 *         description: Invalid publicId or url
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Image not found
 *       500:
 *         description: Server error
 */
router.delete('/image', deleteImage);

export default router;
