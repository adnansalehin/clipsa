import type { ComponentType, ReactNode } from "react"

export interface MediaItem {
  id: string
  name: string
  type: "image" | "video"
  url: string
  thumbnail?: string
  duration?: number
  prompt?: string
  metadata?: {
    model?: string
    seed?: number
    steps?: number
    cfgScale?: number
    sampler?: string
    width?: number
    height?: number
    createdAt?: string
  }
}

export interface GenerationSettings {
  aspectRatio: string
  quality: string
  style: string
}

export type LayoutType = "grid" | "list" | "masonry"

export type EditorMode = "edit" | "imageToVideo"

export interface Scene {
  id: string
  description: string
  motion: "static" | "pan-left" | "pan-right" | "zoom-in" | "zoom-out"
  duration: number
  transition: "cut" | "fade" | "dissolve"
  inputImageId?: string
}

export interface AudioSettings {
  mood: "calm" | "energetic" | "dramatic" | "mysterious" | "uplifting" | "none"
  narration: string
  voiceStyle?: "natural" | "professional" | "warm" | "energetic"
}

export interface VideoGenerationSettings {
  aspectRatio: string
  totalDuration: number
}

export interface VideoTemplate {
  id: string
  name: string
  description: string
  icon: ComponentType
  preset: {
    scenes: number
    defaultMotion: "static" | "pan-left" | "pan-right" | "zoom-in" | "zoom-out"
    defaultTransition: "cut" | "fade" | "dissolve"
    defaultDuration: number
    mood: "calm" | "energetic" | "dramatic" | "mysterious" | "uplifting" | "none"
  }
}