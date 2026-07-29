'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2, Trash2, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  value?: string;
  name?: string;
  onFileSelect?: (file: File) => void;
  onDelete?: () => void;
  disabled?: boolean;
  isUploading?: boolean;
  isDeleting?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
  xl: 'h-40 w-40',
};

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
};

export function AvatarUpload({
  value,
  name = '',
  onFileSelect,
  onDelete,
  disabled = false,
  isUploading = false,
  isDeleting = false,
  size = 'lg',
  className,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayImage = preview || value;
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Call callback
    onFileSelect?.(file);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onDelete?.();
  };

  const isLoading = isUploading || isDeleting;

  return (
    <div className={cn('relative inline-block', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        className="hidden"
        disabled={disabled || isLoading}
      />

      <div className="relative">
        <Avatar className={cn(sizeClasses[size], 'relative cursor-pointer transition-opacity hover:opacity-80')}>
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm">
              <Loader2 className={cn(iconSizes[size], 'animate-spin text-primary')} />
            </div>
          )}
          <AvatarImage src={displayImage} alt={name} />
          <AvatarFallback>
            {initials || <User className={iconSizes[size]} />}
          </AvatarFallback>
        </Avatar>

        {/* Upload Button */}
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className={cn(
            'absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md',
            size === 'sm' && 'h-6 w-6',
            size === 'xl' && 'h-10 w-10',
          )}
          onClick={handleClick}
          disabled={disabled || isLoading}
        >
          <Camera className={cn('h-4 w-4', size === 'sm' && 'h-3 w-3', size === 'xl' && 'h-5 w-5')} />
        </Button>

        {/* Delete Button */}
        {(value || preview) && onDelete && (
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className={cn(
              'absolute -right-2 top-0 h-8 w-8 rounded-full shadow-md',
              size === 'sm' && 'h-6 w-6',
              size === 'xl' && 'h-10 w-10',
            )}
            onClick={handleDelete}
            disabled={disabled || isLoading}
          >
            <Trash2 className={cn('h-4 w-4', size === 'sm' && 'h-3 w-3', size === 'xl' && 'h-5 w-5')} />
          </Button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
