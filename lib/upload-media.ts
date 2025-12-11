import type { MediaItem } from './types';

export interface UploadMediaOptions {
  title?: string;
  description?: string;
  uploadedBy?: string;
}

export interface UploadMediaResult {
  success: boolean;
  fileId?: string;
  error?: string;
  mediaItem?: MediaItem;
}

/**
 * Uploads a single file to the server and returns the result
 */
export async function uploadMediaFile(
  file: File,
  options: UploadMediaOptions = {}
): Promise<UploadMediaResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', options.title || file.name.replace(/\.[^/.]+$/, ''));
    formData.append('description', options.description || 'Uploaded media - ready for editing');
    formData.append('uploadedBy', options.uploadedBy || 'user'); // TODO: Get from auth context

    const response = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      return {
        success: false,
        error: error.error || 'Upload failed',
      };
    }

    const result = await response.json();
    const fileId = result.fileId;

    const isVideo = file.type.startsWith('video/');
    const serverUrl = `/api/media/${fileId}`;

    const mediaItem: MediaItem = {
      id: fileId,
      name: file.name,
      type: isVideo ? 'video' : 'image',
      url: serverUrl,
      thumbnail: serverUrl,
      prompt: options.description || 'Uploaded media - ready for editing',
      metadata: {
        createdAt: new Date().toISOString(),
        model: 'Uploaded',
      },
    };

    return {
      success: true,
      fileId,
      mediaItem,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Uploads multiple files to the server and returns MediaItem array
 */
export async function uploadMediaFiles(
  files: FileList | File[],
  options: UploadMediaOptions = {}
): Promise<MediaItem[]> {
  const fileArray = Array.from(files);
  const uploadPromises = fileArray.map((file) => uploadMediaFile(file, options));

  const results = await Promise.all(uploadPromises);
  const successfulUploads = results
    .filter((result) => result.success && result.mediaItem)
    .map((result) => result.mediaItem!);

  // For failed uploads, create fallback items with local URLs
  const failedUploads: MediaItem[] = [];
  results.forEach((result, index) => {
    if (!result.success) {
      const file = fileArray[index];
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');

      failedUploads.push({
        id: `uploaded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: (isVideo ? 'video' : 'image') as 'image' | 'video',
        url,
        thumbnail: url,
        prompt: options.description || 'Uploaded media - ready for editing',
        metadata: {
          createdAt: new Date().toISOString(),
          model: 'Uploaded (local fallback)',
        },
      });
    }
  });

  return [...successfulUploads, ...failedUploads];
}
