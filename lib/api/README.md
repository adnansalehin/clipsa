# Clipsa API Client

A centralized TypeScript API client for handling all client-side API calls in the Clipsa application.

## Features

- **Type-safe API calls** with full TypeScript support
- **Centralized error handling** with custom ApiError class
- **Consistent logging** for debugging
- **Reusable utilities** for common operations
- **Extensible architecture** for adding new API endpoints

## Usage

### Importing the API Client

```typescript
import { projectsApi, apiUtils } from '@/lib/api/client'
```

### Creating a Video Generation Project

```typescript
import { projectsApi, type VideoGenerationRequest } from '@/lib/api/client'

const request: VideoGenerationRequest = {
  scenes: [
    {
      id: 'scene-1',
      description: 'A beautiful sunset over mountains',
      duration: 5,
      motion: 'static',
      transition: 'fade'
    }
  ],
  audioSettings: {
    mood: 'calm',
    narration: 'Optional voice narration text'
  },
  videoSettings: {
    aspectRatio: '16:9',
    totalDuration: 15
  }
}

try {
  const response = await projectsApi.createVideoGeneration(request)
  console.log('Project created:', response.projectId)
} catch (error) {
  const errorMessage = apiUtils.handleApiError(error)
  console.error('Failed to create project:', errorMessage)
}
```

### Downloading Media

```typescript
import { apiUtils } from '@/lib/api/client'

try {
  await apiUtils.downloadMedia('/path/to/media.jpg', 'filename.jpg')
} catch (error) {
  console.error('Download failed:', apiUtils.handleApiError(error))
}
```

## API Endpoints

### Projects API

- `projectsApi.createVideoGeneration(request)` - Create a new video generation project

### Utilities

- `apiUtils.downloadMedia(url, filename)` - Download media from URL
- `apiUtils.handleApiError(error)` - Extract user-friendly error messages

## Error Handling

The API client provides comprehensive error handling:

- **Network errors** - Connection issues, timeouts
- **HTTP errors** - Server responses with error status codes
- **Validation errors** - Invalid request data
- **Custom ApiError class** with status codes and details

## Type Definitions

All API types are fully typed for better developer experience:

- `VideoGenerationRequest` - Request payload for video generation
- `VideoGenerationResponse` - Response from video generation API
- `ApiError` - Custom error class with status and details
- `ApiResponse<T>` - Generic API response wrapper

## Adding New API Endpoints

To add new API endpoints, extend the `ApiClient` class or add new methods to existing API modules:

```typescript
// Add to existing API module
export const newApi = {
  async someEndpoint(data: SomeType): Promise<ResponseType> {
    return apiClient.post('/api/some-endpoint', data)
  }
}

// Or create a new API module
export const newFeatureApi = {
  async endpoint1: apiClient.get.bind(apiClient, '/api/feature/endpoint1'),
  async endpoint2: apiClient.post.bind(apiClient, '/api/feature/endpoint2')
}
```

## Testing

See `example-usage.ts` for examples of how to use the API client in tests or development.


