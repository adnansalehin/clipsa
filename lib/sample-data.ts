export const images = [
  {
    id: 1,
    src: "/sunset-mountain-landscape.png",
    prompt:
      "A breathtaking sunset over mountain peaks with golden hour lighting, dramatic clouds, and silhouetted pine trees in the foreground",
    category: "Nature",
    metadata: {
      model: "SDXL 1.0",
      dimensions: "1024 × 1024",
      seed: "4285619273",
      steps: 30,
      cfgScale: 7.5,
      sampler: "DPM++ 2M Karras",
      createdAt: "Dec 1, 2024",
    },
  },
  {
    id: 2,
    src: "/minimal-architecture-building.jpg",
    prompt:
      "Minimalist modern architecture with clean geometric lines, white concrete facade, and dramatic shadows from afternoon sunlight",
    category: "Architecture",
    metadata: {
      model: "SDXL 1.0",
      dimensions: "1024 × 768",
      seed: "7391048265",
      steps: 25,
      cfgScale: 8.0,
      sampler: "Euler a",
      createdAt: "Nov 28, 2024",
    },
  },
  {
    id: 3,
    src: "/abstract-art-geometric.jpg",
    prompt:
      "Abstract geometric art composition with overlapping translucent shapes, soft gradients in pastel colors, minimalist aesthetic",
    category: "Art",
    metadata: {
      model: "Midjourney v6",
      dimensions: "1024 × 1024",
      seed: "1928374650",
      steps: 40,
      cfgScale: 6.5,
      sampler: "DPM++ SDE",
      createdAt: "Nov 25, 2024",
    },
  },
  {
    id: 4,
    src: "/aerial-ocean-waves.png",
    prompt:
      "Aerial drone view of turquoise ocean waves crashing on pristine white sand beach, foam patterns creating natural abstract art",
    category: "Nature",
    metadata: {
      model: "SDXL 1.0",
      dimensions: "1920 × 1080",
      seed: "5847261930",
      steps: 35,
      cfgScale: 7.0,
      sampler: "DPM++ 2M Karras",
      createdAt: "Nov 22, 2024",
    },
  },
  {
    id: 5,
    src: "/portrait-studio.png",
    prompt:
      "Professional studio portrait with soft Rembrandt lighting, neutral background, shallow depth of field, photorealistic skin detail",
    category: "Portrait",
    metadata: {
      model: "SDXL 1.0",
      dimensions: "1024 × 1024",
      seed: "3629184750",
      steps: 28,
      cfgScale: 7.5,
      sampler: "Euler",
      createdAt: "Nov 20, 2024",
    },
  },
  {
    id: 6,
    src: "/city-skyline-night.png",
    prompt:
      "Futuristic city skyline at night with neon lights reflecting on wet streets, cyberpunk atmosphere, rain-soaked urban landscape",
    category: "Urban",
    metadata: {
      model: "Midjourney v6",
      dimensions: "1920 × 1080",
      seed: "9182736450",
      steps: 45,
      cfgScale: 8.5,
      sampler: "DPM++ 2S a",
      createdAt: "Nov 18, 2024",
    },
  },
  {
    id: 7,
    src: "/forest-fog-morning.jpg",
    prompt:
      "Enchanted forest in morning fog with sun rays filtering through ancient trees, mystical atmosphere, soft ethereal lighting",
    category: "Nature",
    metadata: {
      model: "SDXL 1.0",
      dimensions: "1024 × 1024",
      seed: "6473829150",
      steps: 32,
      cfgScale: 7.0,
      sampler: "DPM++ 2M Karras",
      createdAt: "Nov 15, 2024",
    },
  },
  {
    id: 8,
    src: "/minimal-interior.png",
    prompt:
      "Scandinavian minimalist interior design with natural wood accents, large windows with soft natural light, neutral earth tones",
    category: "Interior",
    metadata: {
      model: "SDXL 1.0",
      dimensions: "1024 × 768",
      seed: "2847391650",
      steps: 30,
      cfgScale: 7.5,
      sampler: "Euler a",
      createdAt: "Nov 12, 2024",
    },
  },
]

export const videos = [
  {
    id: 1,
    thumbnail: "/cinematic-ocean-drone-footage.jpg",
    prompt:
      "Cinematic drone footage flying over turquoise ocean waters, gentle waves rolling toward golden sandy beach, sunrise lighting",
    duration: "2:34",
    category: "Nature",
    metadata: { model: "Runway Gen-3", resolution: "1920 × 1080", fps: 24, codec: "H.264", createdAt: "Dec 2, 2024" },
  },
  {
    id: 2,
    thumbnail: "/urban-timelapse-city-traffic.jpg",
    prompt:
      "Urban timelapse of busy city intersection with flowing traffic light trails, golden hour to blue hour transition, 4K quality",
    duration: "1:45",
    category: "Urban",
    metadata: {
      model: "Pika Labs",
      resolution: "3840 × 2160",
      fps: 30,
      codec: "ProRes 422",
      createdAt: "Nov 30, 2024",
    },
  },
  {
    id: 3,
    thumbnail: "/nature-documentary-wildlife.jpg",
    prompt:
      "Wildlife documentary style footage of majestic deer in misty forest clearing, slow motion movement, natural ambient sounds",
    duration: "4:12",
    category: "Documentary",
    metadata: { model: "Runway Gen-3", resolution: "1920 × 1080", fps: 60, codec: "H.265", createdAt: "Nov 27, 2024" },
  },
  {
    id: 4,
    thumbnail: "/abstract-motion-graphics.png",
    prompt:
      "Abstract motion graphics with flowing liquid metal shapes, iridescent reflections, smooth organic movement, dark background",
    duration: "0:58",
    category: "Art",
    metadata: { model: "Stable Video", resolution: "1024 × 1024", fps: 24, codec: "H.264", createdAt: "Nov 24, 2024" },
  },
  {
    id: 5,
    thumbnail: "/travel-vlog-scenic-mountains.jpg",
    prompt:
      "Epic mountain landscape reveal shot, drone ascending through clouds to reveal snow-capped peaks, cinematic color grading",
    duration: "3:21",
    category: "Travel",
    metadata: {
      model: "Runway Gen-3",
      resolution: "3840 × 2160",
      fps: 24,
      codec: "ProRes 422 HQ",
      createdAt: "Nov 21, 2024",
    },
  },
  {
    id: 6,
    thumbnail: "/aerial-drone-footage-beach.jpg",
    prompt:
      "Aerial beach scene with crystal clear water, coral reef visible beneath surface, gentle camera movement following coastline",
    duration: "2:08",
    category: "Nature",
    metadata: { model: "Pika Labs", resolution: "1920 × 1080", fps: 30, codec: "H.264", createdAt: "Nov 19, 2024" },
  },
]

export type ImageItem = (typeof images)[0]
export type VideoItem = (typeof videos)[0]

import type { MediaItem } from "./types"

// Media editor sample data
export const sampleMedia: MediaItem[] = [
  {
    id: "1",
    name: "Ethereal Landscape",
    type: "image",
    url: "/ethereal-mountain-landscape-with-aurora-borealis.jpg",
    thumbnail: "/ethereal-mountain-landscape-thumbnail.jpg",
    prompt: "An ethereal mountain landscape bathed in the glow of aurora borealis, with mirror-like lake reflections",
    metadata: {
      model: "SDXL 1.0",
      seed: 42857193,
      steps: 30,
      cfgScale: 7.5,
      sampler: "DPM++ 2M Karras",
      width: 1920,
      height: 1080,
      createdAt: "2024-01-15T10:30:00Z",
    },
  },
  {
    id: "2",
    name: "Cyberpunk City",
    type: "image",
    url: "/cyberpunk-city-neon.png",
    thumbnail: "/cyberpunk-city-thumbnail.jpg",
    prompt: "A sprawling cyberpunk megacity at night, neon signs reflecting off rain-slicked streets, flying vehicles",
    metadata: {
      model: "SDXL 1.0",
      seed: 19283746,
      steps: 35,
      cfgScale: 8.0,
      sampler: "Euler a",
      width: 1920,
      height: 1080,
      createdAt: "2024-01-14T15:45:00Z",
    },
  },
  {
    id: "3",
    name: "Ocean Waves",
    type: "video",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "/ocean-waves-thumbnail.jpg",
    duration: 45,
    prompt: "Cinematic ocean waves crashing against rocky cliffs at sunset, golden hour lighting, slow motion",
    metadata: {
      model: "Runway Gen-2",
      seed: 55667788,
      steps: 50,
      cfgScale: 12,
      sampler: "DDIM",
      width: 1280,
      height: 720,
      createdAt: "2024-01-13T09:20:00Z",
    },
  },
  {
    id: "4",
    name: "Abstract Art",
    type: "image",
    url: "/vibrant-fluid-abstract.png",
    thumbnail: "/abstract-art-thumbnail.png",
    prompt: "Abstract fluid art piece with vibrant flowing colors, metallic gold accents, high contrast",
    metadata: {
      model: "Midjourney v5",
      seed: 33445566,
      steps: 40,
      cfgScale: 9.0,
      sampler: "DPM++ SDE",
      width: 1024,
      height: 1024,
      createdAt: "2024-01-12T18:00:00Z",
    },
  },
  {
    id: "5",
    name: "Forest Path",
    type: "video",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "/mystical-forest-path-thumbnail.jpg",
    duration: 120,
    prompt: "Walking through an enchanted forest path with magical particles floating in sunbeams, fantasy atmosphere",
    metadata: {
      model: "Pika Labs",
      seed: 77889900,
      steps: 60,
      cfgScale: 10,
      sampler: "Euler",
      width: 1920,
      height: 1080,
      createdAt: "2024-01-11T12:15:00Z",
    },
  },
  {
    id: "6",
    name: "Portrait Study",
    type: "image",
    url: "/artistic-portrait-with-dramatic-lighting.jpg",
    thumbnail: "/portrait-thumbnail.png",
    prompt: "Artistic portrait with dramatic Rembrandt lighting, oil painting style, renaissance aesthetic",
    metadata: {
      model: "SDXL 1.0",
      seed: 12345678,
      steps: 45,
      cfgScale: 7.0,
      sampler: "DPM++ 2M Karras",
      width: 768,
      height: 1152,
      createdAt: "2024-01-10T20:30:00Z",
    },
  },
]

export const generatedResults: Record<string, { image: string; video: string }> = {
  default: {
    image: "/ai-enhanced-vibrant-colors-artistic-transformation.jpg",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
}