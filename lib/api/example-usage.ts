/**
 * Example usage of the Clipsa API client
 * This file demonstrates how to use the centralized API utilities
 */

import { projectsApi, apiUtils, type VideoGenerationRequest } from './client'

// Example: Creating a video generation project
async function createVideoProject() {
  const request: VideoGenerationRequest = {
    scenes: [
      {
        id: 'scene-1',
        description: 'A beautiful sunset over mountains with flowing colors',
        duration: 5,
        motion: 'static',
        transition: 'fade',
        inputImageId: 'image-123'
      },
      {
        id: 'scene-2',
        description: 'Transition to a vibrant cityscape at night',
        duration: 7,
        motion: 'pan-left',
        transition: 'dissolve'
      }
    ],
    audioSettings: {
      mood: 'uplifting',
      narration: 'Welcome to this amazing journey',
      voiceStyle: 'warm'
    },
    videoSettings: {
      aspectRatio: '16:9',
      totalDuration: 30
    }
  }

  try {
    const response = await projectsApi.createVideoGeneration(request)
    console.log('Video generation started:', response.projectId)
    return response
  } catch (error) {
    const errorMessage = apiUtils.handleApiError(error)
    console.error('Failed to create video project:', errorMessage)
    throw error
  }
}

// Example: Downloading media
async function downloadMedia() {
  try {
    await apiUtils.downloadMedia('/path/to/media.jpg', 'downloaded-image.jpg')
    console.log('Media downloaded successfully')
  } catch (error) {
    const errorMessage = apiUtils.handleApiError(error)
    console.error('Failed to download media:', errorMessage)
  }
}

// Export examples for testing
export { createVideoProject, downloadMedia }


