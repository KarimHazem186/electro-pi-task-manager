import { uploadToCloudinary, deleteFromCloudinary, extractPublicId, uploadMultipleToCloudinary } from '../utils/uploadHelper.js';

/**
 * @desc    Upload single image
 * @route   POST /api/upload/image
 * @access  Private
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const folder = req.body.folder || 'task-manager/general';
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, folder);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
};

/**
 * @desc    Upload multiple images
 * @route   POST /api/upload/images
 * @access  Private
 */
export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image file'
      });
    }

    const folder = req.body.folder || 'task-manager/general';
    
    // Upload to Cloudinary
    const results = await uploadMultipleToCloudinary(req.files, folder);

    const uploadedImages = results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    }));

    res.status(200).json({
      success: true,
      message: `${results.length} image(s) uploaded successfully`,
      data: uploadedImages
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
};

/**
 * @desc    Upload profile picture
 * @route   POST /api/upload/profile
 * @access  Private
 */
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const folder = 'task-manager/profiles';
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, folder);

    // You can update the user's profile picture in the database here
    // Example: await User.findByIdAndUpdate(req.user.id, { avatar: result.secure_url });

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: error.message
    });
  }
};

/**
 * @desc    Upload task attachment
 * @route   POST /api/upload/task-attachment
 * @access  Private
 */
export const uploadTaskAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const folder = 'task-manager/task-attachments';
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, folder);

    res.status(200).json({
      success: true,
      message: 'Task attachment uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload task attachment',
      error: error.message
    });
  }
};

/**
 * @desc    Delete image from Cloudinary
 * @route   DELETE /api/upload/image
 * @access  Private
 */
export const deleteImage = async (req, res) => {
  try {
    const { publicId, url } = req.body;

    if (!publicId && !url) {
      return res.status(400).json({
        success: false,
        message: 'Please provide publicId or url'
      });
    }

    // Extract publicId from URL if not provided
    const imagePublicId = publicId || extractPublicId(url);

    if (!imagePublicId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid publicId or url'
      });
    }

    // Delete from Cloudinary
    const result = await deleteFromCloudinary(imagePublicId);

    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found or already deleted'
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
};
