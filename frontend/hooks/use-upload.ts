import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadService } from '@/services/upload.service';
import { toast } from 'sonner';

interface UploadOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
  folder?: string;
}

export function useImageUpload(options?: UploadOptions) {
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      // Validate file
      const validation = uploadService.validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      return uploadService.uploadImage(file, options?.folder);
    },
    onSuccess: (data) => {
      toast.success('Image uploaded successfully');
      options?.onSuccess?.(data.data.url);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Failed to upload image';
      toast.error(message);
      options?.onError?.(message);
    },
  });

  const upload = async (file: File) => {
    // Create preview
    const previewUrl = uploadService.createPreviewUrl(file);
    setPreview(previewUrl);

    try {
      return await mutation.mutateAsync(file);
    } finally {
      // Clean up preview
      if (previewUrl) {
        setTimeout(() => {
          uploadService.revokePreviewUrl(previewUrl);
          setPreview(null);
        }, 1000);
      }
    }
  };

  return {
    upload,
    isUploading: mutation.isPending,
    preview,
    progress,
    error: mutation.error,
  };
}

export function useMultipleImageUpload(options?: UploadOptions) {
  const [previews, setPreviews] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: async (files: File[]) => {
      // Validate all files
      for (const file of files) {
        const validation = uploadService.validateImageFile(file);
        if (!validation.valid) {
          throw new Error(`${file.name}: ${validation.error}`);
        }
      }

      return uploadService.uploadMultipleImages(files, options?.folder);
    },
    onSuccess: (data) => {
      toast.success(`${data.data.length} image(s) uploaded successfully`);
      options?.onSuccess?.(data.data[0].url);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || 'Failed to upload images';
      toast.error(message);
      options?.onError?.(message);
    },
  });

  const upload = async (files: File[]) => {
    // Create previews
    const previewUrls = files.map((file) => uploadService.createPreviewUrl(file));
    setPreviews(previewUrls);

    try {
      return await mutation.mutateAsync(files);
    } finally {
      // Clean up previews
      setTimeout(() => {
        previewUrls.forEach((url) => uploadService.revokePreviewUrl(url));
        setPreviews([]);
      }, 1000);
    }
  };

  return {
    upload,
    isUploading: mutation.isPending,
    previews,
    error: mutation.error,
  };
}

export function useProfilePictureUpload() {
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: uploadService.updateUserAvatar,
    onSuccess: () => {
      toast.success('Profile picture updated successfully');
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update profile picture';
      toast.error(message);
    },
  });

  const upload = async (file: File) => {
    // Validate file
    const validation = uploadService.validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Create preview
    const previewUrl = uploadService.createPreviewUrl(file);
    setPreview(previewUrl);

    try {
      return await mutation.mutateAsync(file);
    } finally {
      setTimeout(() => {
        if (previewUrl) {
          uploadService.revokePreviewUrl(previewUrl);
          setPreview(null);
        }
      }, 1000);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: uploadService.deleteUserAvatar,
    onSuccess: () => {
      toast.success('Profile picture deleted');
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete profile picture';
      toast.error(message);
    },
  });

  return {
    upload,
    deleteAvatar: deleteMutation.mutate,
    isUploading: mutation.isPending,
    isDeleting: deleteMutation.isPending,
    preview,
  };
}

export function useTaskAttachment(taskId: string) {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadService.addTaskAttachment(taskId, file),
    onSuccess: () => {
      toast.success('Attachment added successfully');
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to add attachment';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) => uploadService.deleteTaskAttachment(taskId, attachmentId),
    onSuccess: () => {
      toast.success('Attachment deleted');
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete attachment';
      toast.error(message);
    },
  });

  return {
    uploadAttachment: uploadMutation.mutate,
    deleteAttachment: deleteMutation.mutate,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useProjectCover(projectId: string) {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadService.updateProjectCover(projectId, file),
    onSuccess: () => {
      toast.success('Cover image updated successfully');
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update cover image';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => uploadService.deleteProjectCover(projectId),
    onSuccess: () => {
      toast.success('Cover image deleted');
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete cover image';
      toast.error(message);
    },
  });

  return {
    uploadCover: uploadMutation.mutate,
    deleteCover: deleteMutation.mutate,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
