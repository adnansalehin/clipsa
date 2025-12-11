/**
 * Client-side API utilities for Clipsa
 * Centralized API calls with proper error handling and TypeScript types
 */

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Video Generation API types
export interface SceneRequest {
  id: string;
  description: string;
  duration?: number;
  motion?: string;
  transition?: string;
  inputImageId?: string;
}

export interface AudioSettingsRequest {
  mood?: string;
  narration?: string;
  voiceStyle?: string;
}

export interface VideoSettingsRequest {
  aspectRatio?: string;
  totalDuration?: number;
}

export interface VideoGenerationRequest {
  scenes: SceneRequest[];
  audioSettings?: AudioSettingsRequest;
  videoSettings?: VideoSettingsRequest;
}

export interface VideoGenerationResponse {
  success: boolean;
  projectId: string;
  message: string;
}

// Image Generation API types
export interface ImageGenerationRequest {
  prompt: string;
  sourceImageUrl?: string;
}

export interface ImageGenerationResponse {
  success: boolean;
  projectId: string;
  message: string;
}

// API Error class
export class ApiError extends Error {
  public status: number;
  public details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// Base API client class
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    console.log(`[API] ${options.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorDetails: any = undefined;

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          errorDetails = errorData.details || errorData;
        } catch (parseError) {
          // Response wasn't JSON, use default error message
        }

        console.error(`[API] Request failed:`, errorMessage);
        throw new ApiError(errorMessage, response.status, errorDetails);
      }

      const data = await response.json();
      console.log(`[API] Response:`, data);
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network or other errors
      console.error(`[API] Network error:`, error);
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred',
        0,
        error
      );
    }
  }

  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create API client instance
const apiClient = new ApiClient();

// Generation API (video + image)
export const generationApi = {
  /**
   * Start a video generation project
   */
  async createVideoGeneration(
    request: VideoGenerationRequest,
    options?: { useMock?: boolean }
  ): Promise<VideoGenerationResponse> {
    console.log("[CLIENT] Creating video generation project:", request);

    if (options?.useMock) {
      return {
        success: true,
        projectId: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        message: "Video generation mocked in dev mode"
      };
    }

    const response = await apiClient.post<VideoGenerationResponse>('/api/projects', request);

    console.log("[CLIENT] Video generation project created:", response);
    return response;
  },
  /**
   * Start an image generation request
   */
  async createImageGeneration(
    request: ImageGenerationRequest,
    options?: { useMock?: boolean }
  ): Promise<ImageGenerationResponse> {
    console.log("[CLIENT] Creating image generation request:", request);

    if (options?.useMock) {
      return {
        success: true,
        projectId: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        message: "Image generation mocked in dev mode"
      };
    }

    const response = await apiClient.post<ImageGenerationResponse>('/api/generation/image', request);
    console.log("[CLIENT] Image generation started:", response);
    return response;
  }
};

// Utility functions
export const apiUtils = {
  /**
   * Download media from URL
   */
  async downloadMedia(url: string, filename: string): Promise<void> {
    console.log(`[API] Downloading media from: ${url}`);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new ApiError(`Failed to download media: ${response.statusText}`, response.status);
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(objectUrl);

      console.log(`[API] Media downloaded successfully: ${filename}`);
    } catch (error) {
      console.error(`[API] Media download failed:`, error);
      throw error instanceof ApiError ? error : new ApiError('Failed to download media', 0, error);
    }
  },

  /**
   * Generic error handler for API calls
   */
  handleApiError(error: unknown): string {
    if (error instanceof ApiError) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unknown error occurred';
  },
};

// Export the API client for advanced usage
export { apiClient };
export default apiClient;

