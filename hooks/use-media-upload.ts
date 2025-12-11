'use client';

import { useCallback } from 'react';
import { uploadMediaFiles, type UploadMediaOptions } from '@/lib/upload-media';
import type { MediaItem } from '@/lib/types';

export interface UseMediaUploadOptions extends UploadMediaOptions {
  onSuccess?: (mediaItems: MediaItem[]) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for handling media uploads
 * Returns a function that uploads files and handles callbacks
 */
export function useMediaUpload(options: UseMediaUploadOptions = {}) {
  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      try {
        const mediaItems = await uploadMediaFiles(files, {
          title: options.title,
          description: options.description,
          uploadedBy: options.uploadedBy,
        });

        options.onSuccess?.(mediaItems);
        return mediaItems;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Upload failed');
        options.onError?.(err);
        throw err;
      }
    },
    [options]
  );

  return { handleUpload };
}
