import { api } from '@/lib/api/client';

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    publicId: string;
    width?: number;
    height?: number;
    format?: string;
    size?: number;
  };
}

export interface MultipleUploadResponse {
  success: boolean;
  message: string;
  data: Array<{
    url: string;
    publicId: string;
    width?: number;
    height?: number;
    format?: string;
    size?: number;
  }>;
}

class UploadService {
  /**
   * Upload a single image
   */
  async uploadImage(file: File, folder?: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await api.post<UploadResponse>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(files: File[], folder?: string): Promise<MultipleUploadResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await api.post<MultipleUploadResponse>('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<UploadResponse>('/upload/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Upload task attachment
   */
  async uploadTaskAttachment(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<UploadResponse>('/upload/task-attachment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Delete image by publicId or url
   */
  async deleteImage(publicIdOrUrl: string): Promise<{ success: boolean; message: string }> {
    const payload = publicIdOrUrl.startsWith('http')
      ? { url: publicIdOrUrl }
      : { publicId: publicIdOrUrl };

    const response = await api.delete('/upload/image', { data: payload });
    return response.data;
  }

  /**
   * Update user avatar (using user endpoint)
   */
  async updateUserAvatar(file: File): Promise<{ success: boolean; message: string; data: { avatarUrl: string } }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.put('/users/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Delete user avatar
   */
  async deleteUserAvatar(): Promise<{ success: boolean; message: string }> {
    const response = await api.delete('/users/profile/avatar');
    return response.data;
  }

  /**
   * Add task attachment
   */
  async addTaskAttachment(taskId: string, file: File): Promise<{ success: boolean; message: string; data: any }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Delete task attachment
   */
  async deleteTaskAttachment(taskId: string, attachmentId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
    return response.data;
  }

  /**
   * Update project cover image
   */
  async updateProjectCover(projectId: string, file: File): Promise<{ success: boolean; message: string; data: { coverImage: string } }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.put(`/projects/${projectId}/cover`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Delete project cover image
   */
  async deleteProjectCover(projectId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/projects/${projectId}/cover`);
    return response.data;
  }

  /**
   * Validate image file
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Only image files are allowed' };
    }

    // Check file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'Image size must be less than 5MB' };
    }

    return { valid: true };
  }

  /**
   * Create image preview URL
   */
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Revoke preview URL to free memory
   */
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
}

export const uploadService = new UploadService();
