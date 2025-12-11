"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MediaLibrarySidebar } from "./editor/media-library-sidebar"
import { ControlsSidebar } from "./editor/controls-sidebar"
import { VideoSettingsSidebar } from "./editor/video-settings-sidebar"
import { MediaCanvas } from "./editor/media-canvas"
import { PromptInput } from "./editor/prompt-input"
import { MobileBottomSheet } from "./editor/mobile-bottom-sheet"
import { MobileLibraryContent } from "./editor/mobile-library-content"
import { MobileControlsContent } from "./editor/mobile-controls-content"
import { ResizablePanel } from "./editor/resizable-panel"
import { ModeToggle } from "./editor/mode-toggle"
import { SceneTimeline } from "./editor/scene-timeline"
import { BottomPanel } from "./editor/bottom-panel"
import { GenerationProgressModal } from "./editor/generation-progress-modal"
import type { VideoTemplate, EditorMode, Scene, AudioSettings, VideoGenerationSettings } from "@/lib/types"
import { FolderOpen, Settings2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { generationApi, apiUtils, type VideoGenerationRequest } from "@/lib/api/client"
import { sampleMedia, generatedResults } from "@/lib/sample-data"
import type { MediaItem, GenerationSettings } from "@/lib/types"
import { useMediaUpload } from "@/hooks/use-media-upload"
import { useDevMode } from "@/components/dev-mode-provider"
import { DevModeToggle } from "./dev-mode-toggle"

interface AIMediaEditorProps {
  initialMedia?: MediaItem | null
  mediaLibrary?: MediaItem[]
  onPromptChange?: (prompt: string) => void
  initialMode?: EditorMode
}

const createDefaultScene = (index: number): Scene => ({
  id: `scene-${Date.now()}-${index}`,
  description: "",
  motion: "static",
  duration: 5,
  transition: "fade",
  inputImageId: undefined, // Will use smart transition for scenes 2+
})

type GenerationPhase = "analyzing" | "scene1" | "scene2" | "scene3" | "audio" | "finalizing"

export function AIMediaEditor({ initialMedia, mediaLibrary: externalLibrary, initialMode }: AIMediaEditorProps) {
  const { isDevMode } = useDevMode()
  const defaultLibrary = externalLibrary || (isDevMode ? sampleMedia : [])
  const defaultSelected = initialMedia || defaultLibrary[0] || null

  const [fetchedLibrary, setFetchedLibrary] = useState<MediaItem[]>([])
  const [uploadedLibrary, setUploadedLibrary] = useState<MediaItem[]>([])
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>(defaultLibrary)
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(defaultSelected)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [settings, setSettings] = useState<GenerationSettings>({
    aspectRatio: "16:9",
    quality: "high",
    style: "natural",
  })
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileSheet, setMobileSheet] = useState<"library" | "controls" | null>(null)
  const [currentPrompt, setCurrentPrompt] = useState("")

  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const mergeMedia = (...lists: MediaItem[][]) => {
      const seen = new Set<string>()
      const merged: MediaItem[] = []

      lists.forEach((list) => {
        list.forEach((item) => {
          const key = String(item.id)
          if (seen.has(key)) return
          seen.add(key)
          merged.push(item)
        })
      })

      return merged
    }

    if (externalLibrary) {
      setMediaLibrary(externalLibrary)
      setSelectedMedia((prev) => prev ?? externalLibrary[0] ?? null)
      return
    }

    const combined = mergeMedia(uploadedLibrary, fetchedLibrary, isDevMode ? sampleMedia : [])
    setMediaLibrary(combined)
    setSelectedMedia((prev) => prev ?? combined[0] ?? null)
  }, [externalLibrary, fetchedLibrary, uploadedLibrary, isDevMode])

  useEffect(() => {
    if (externalLibrary) return

    let isCancelled = false

    const mapApiItemToMedia = (item: any): MediaItem => {
      const isVideo = item.type === "video" || item.contentType?.startsWith("video/")
      const baseName = item.title || item.filename || item.description || "Uploaded media"
      const basePrompt = item.description || item.title || item.filename || ""

      return {
        id: String(item.id ?? item.fileId ?? item._id ?? item.filename ?? crypto.randomUUID?.() ?? Date.now()),
        name: baseName,
        type: isVideo ? "video" : "image",
        url: item.url,
        thumbnail: item.thumbnail || item.url,
        duration: isVideo ? Number(item.duration ?? 0) : undefined,
        prompt: basePrompt,
        metadata: {
          model: item.metadata?.model || "Uploaded",
          createdAt: item.uploadedAt ? new Date(item.uploadedAt).toISOString() : undefined,
        },
      }
    }

    const fetchLibrary = async () => {
      try {
        const response = await fetch("/api/media")
        if (!response.ok) {
          console.error("[CLIENT] Failed to fetch media library")
          return
        }

        const { items } = await response.json()
        const mapped = Array.isArray(items) ? items.map(mapApiItemToMedia) : []
        if (isCancelled) return

        setFetchedLibrary(mapped)
        setSelectedMedia((prev) => prev ?? mapped[0] ?? null)
      } catch (error) {
        if (!isCancelled) {
          console.error("[CLIENT] Error loading media library:", error)
        }
      }
    }

    fetchLibrary()

    return () => {
      isCancelled = true
    }
  }, [externalLibrary])

  // Load initial media from sessionStorage (when navigating from gallery)
  useEffect(() => {
    const storedMedia = sessionStorage.getItem("editorInitialMedia")
    if (storedMedia) {
      try {
        const parsed = JSON.parse(storedMedia) as MediaItem
        setSelectedMedia(parsed)
        if (parsed.prompt) {
          setCurrentPrompt(parsed.prompt)
        }
        // Clear after reading to avoid stale data on refresh
        sessionStorage.removeItem("editorInitialMedia")
      } catch (e) {
        console.error("Failed to parse editorInitialMedia:", e)
      }
    }
  }, [])


  const [editorMode, setEditorMode] = useState<EditorMode>(initialMode || "edit")
  const [scenes, setScenes] = useState<Scene[]>([createDefaultScene(0)])
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null)
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    mood: "none",
    narration: "",
  })
  const [videoSettings, setVideoSettings] = useState<VideoGenerationSettings>({
    aspectRatio: "16:9",
    totalDuration: 15,
  })
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const [showProgressModal, setShowProgressModal] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<GenerationPhase>("analyzing")
  const [estimatedTime, setEstimatedTime] = useState(120)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (editorMode === "imageToVideo" && scenes.length > 0 && !selectedSceneId) {
      setSelectedSceneId(scenes[0].id)
    }
  }, [editorMode, scenes, selectedSceneId])

  const handleGenerate = useCallback(
    async (prompt: string) => {
      if (!selectedMedia || isGenerating) return

      setMobileSheet(null)
      setIsGenerating(true)
      setGenerationProgress(0)

      if (isDevMode) {
        const isVideo = selectedMedia.type === "video" || editorMode === "imageToVideo"
        const totalTime = isVideo ? 8000 : 3000
        const intervalTime = 50
        const steps = totalTime / intervalTime
        let currentStep = 0

        const progressInterval = setInterval(() => {
          currentStep++
          const progress = 1 - Math.pow(1 - currentStep / steps, 3)
          setGenerationProgress(Math.min(progress * 100, 99))

          if (currentStep >= steps) {
            clearInterval(progressInterval)
          }
        }, intervalTime)

        await new Promise((resolve) => setTimeout(resolve, totalTime))

        clearInterval(progressInterval)
        setGenerationProgress(100)

        const newUrl = isVideo ? generatedResults.default.video : generatedResults.default.image

        setSelectedMedia((prev) =>
          prev
            ? {
                ...prev,
                url: newUrl,
                type: editorMode === "imageToVideo" ? "video" : prev.type,
                prompt: prompt,
                metadata: {
                  ...prev.metadata,
                  createdAt: new Date().toISOString(),
                },
              }
            : null,
        )

        await new Promise((resolve) => setTimeout(resolve, 800))
      } else {
        try {
          await generationApi.createImageGeneration(
            {
              prompt,
              sourceImageUrl: selectedMedia.url,
            },
            { useMock: false },
          )
          setGenerationProgress(100)
        } catch (error) {
          console.error("[CLIENT] Error during image generation:", error)
          const errorMessage = apiUtils.handleApiError(error)
          alert(`Image generation failed: ${errorMessage}`)
        }
      }

      setIsGenerating(false)
      setGenerationProgress(0)
    },
    [selectedMedia, isGenerating, editorMode, isDevMode],
  )

  const handleVideoGenerate = useCallback(async () => {
    if (!selectedMedia || isGenerating || editorMode !== "imageToVideo") return

    console.log("[CLIENT] Starting video generation with scenes:", scenes)
    console.log("[CLIENT] Audio settings:", audioSettings)
    console.log("[CLIENT] Video settings:", videoSettings)

    setIsGenerating(true)
    setShowProgressModal(true)
    setGenerationProgress(0)
    setCurrentPhase("analyzing")
    setEstimatedTime(120)

    try {
      // Prepare the payload for the backend API
      const payload: VideoGenerationRequest = {
        scenes: scenes.map(scene => ({
          id: scene.id,
          description: scene.description,
          duration: scene.duration,
          motion: scene.motion,
          transition: scene.transition,
          inputImageId: scene.inputImageId
        })),
        audioSettings,
        videoSettings
      }

      // Call the backend API using the centralized API client
      const useMock = isDevMode
      const result = await generationApi.createVideoGeneration(payload, { useMock })

      if (useMock) {
        // Start progress simulation while waiting for webhooks
        const phaseSequence: GenerationPhase[] = ["analyzing", "scene1", "scene2", "scene3", "audio", "finalizing"]
        const phaseDurations = [2000, 3000, 3000, 3000, 2000, 2000] // ms per phase
        const totalDuration = phaseDurations.reduce((a, b) => a + b, 0)

        let elapsedTime = 0

        for (let i = 0; i < phaseSequence.length; i++) {
          const phase = phaseSequence[i]
          const phaseDuration = phaseDurations[i]

          setCurrentPhase(phase)

          const phaseStartProgress = (elapsedTime / totalDuration) * 100
          const phaseEndProgress = ((elapsedTime + phaseDuration) / totalDuration) * 100

          const startTime = Date.now()

          while (Date.now() - startTime < phaseDuration) {
            const phaseProgress = (Date.now() - startTime) / phaseDuration
            const currentProgress = phaseStartProgress + (phaseEndProgress - phaseStartProgress) * phaseProgress
            setGenerationProgress(Math.min(currentProgress, 99))

            const remainingTime = Math.ceil((totalDuration - elapsedTime - (Date.now() - startTime)) / 1000)
            setEstimatedTime(Math.max(0, remainingTime))

            await new Promise((resolve) => setTimeout(resolve, 50))
          }

          elapsedTime += phaseDuration
        }

        setGenerationProgress(100)

        setSelectedMedia((prev) =>
          prev
            ? {
                ...prev,
                url: generatedResults.default.video,
                type: "video",
                metadata: {
                  ...prev.metadata,
                  createdAt: new Date().toISOString(),
                },
              }
            : null,
        )

        console.log("[CLIENT] Video generation completed successfully (mock)")
      } else {
        console.log("[CLIENT] Video generation started with project ID:", result.projectId)
        setGenerationProgress(60)
        setCurrentPhase("finalizing")
      }

    } catch (error) {
      console.error("[CLIENT] Error during video generation:", error)
      // Show error to user using the API utility error handler
      const errorMessage = apiUtils.handleApiError(error)
      alert(`Video generation failed: ${errorMessage}`)
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setShowProgressModal(false)
      setIsGenerating(false)
      setGenerationProgress(0)
    }
  }, [selectedMedia, isGenerating, editorMode, scenes, audioSettings, videoSettings, isDevMode])

  const handleCancelGeneration = useCallback(() => {
    setShowProgressModal(false)
    setIsGenerating(false)
    setGenerationProgress(0)
  }, [])

  const handleSelectMedia = useCallback(
    async (media: MediaItem) => {
      if (isGenerating) return

      // In imageToVideo mode, when a scene is selected, assign the image to that scene
      if (editorMode === "imageToVideo" && selectedSceneId) {
        const sceneIndex = scenes.findIndex(s => s.id === selectedSceneId)
        if (sceneIndex >= 0) {
          setScenes((prev) => prev.map((s) =>
            s.id === selectedSceneId ? { ...s, inputImageId: media.id } : s
          ))
          // Show toast for scene image assignment
          const toast = document.createElement("div")
          toast.className =
            "fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium z-50 animate-in fade-in slide-in-from-bottom-2 duration-300"
          toast.textContent = `Image assigned to Scene ${sceneIndex + 1}`
          document.body.appendChild(toast)
          setTimeout(() => {
            toast.classList.add("animate-out", "fade-out", "slide-out-to-bottom-2")
            setTimeout(() => toast.remove(), 300)
          }, 2000)

          if (isMobile) {
            setMobileSheet(null)
          }

          // For scenes beyond the first, keep the previous behavior (don't change global selection)
          if (sceneIndex > 0) {
            return
          }
        }
      }

      // Default behavior: set as globally selected media
      setSelectedMedia(media)

      if (media.prompt) {
        setCurrentPrompt(media.prompt)

        try {
          await navigator.clipboard.writeText(media.prompt)
          const toast = document.createElement("div")
          toast.className =
            "fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium z-50 animate-in fade-in slide-in-from-bottom-2 duration-300"
          toast.textContent = "Prompt copied to clipboard"
          document.body.appendChild(toast)
          setTimeout(() => {
            toast.classList.add("animate-out", "fade-out", "slide-out-to-bottom-2")
            setTimeout(() => toast.remove(), 300)
          }, 2000)
        } catch (err) {
          console.error("Failed to copy prompt:", err)
        }
      }

      if (isMobile) {
        setMobileSheet(null)
      }
    },
    [isGenerating, isMobile, editorMode, selectedSceneId, scenes],
  )

  const { handleUpload: uploadFiles } = useMediaUpload({
    description: 'Uploaded media - ready for editing',
    onSuccess: (newMedia) => {
      setUploadedLibrary((prev) => [...newMedia, ...prev])

      if (newMedia.length > 0) {
        setSelectedMedia(newMedia[0])
        if (newMedia[0].prompt) {
          setCurrentPrompt(newMedia[0].prompt)
        }
      }

      const toast = document.createElement("div")
      toast.className =
        "fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium z-50 animate-in fade-in slide-in-from-bottom-2 duration-300"
      toast.textContent = `${newMedia.length} file${newMedia.length > 1 ? "s" : ""} uploaded successfully`
      document.body.appendChild(toast)
      setTimeout(() => {
        toast.classList.add("animate-out", "fade-out", "slide-out-to-bottom-2")
        setTimeout(() => toast.remove(), 300)
      }, 2000)
    },
    onError: (error) => {
      console.error('Upload error:', error)
      const toast = document.createElement("div")
      toast.className =
        "fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium z-50 animate-in fade-in slide-in-from-bottom-2 duration-300"
      toast.textContent = `Upload failed: ${error.message}`
      document.body.appendChild(toast)
      setTimeout(() => {
        toast.classList.add("animate-out", "fade-out", "slide-out-to-bottom-2")
        setTimeout(() => toast.remove(), 300)
      }, 3000)
    },
  })

  const handleUpload = useCallback(
    async (files: FileList) => {
      await uploadFiles(files)
    },
    [uploadFiles]
  )

  const handleAddScene = useCallback(() => {
    const newScene = createDefaultScene(scenes.length)
    setScenes((prev) => [...prev, newScene])
    setSelectedSceneId(newScene.id)
  }, [scenes.length])

  const handleRemoveScene = useCallback((id: string) => {
    setScenes((prev) => {
      const filtered = prev.filter((s) => s.id !== id)
      return filtered
    })
    setSelectedSceneId((prev) => (prev === id ? null : prev))
  }, [])

  const handleSceneChange = useCallback((updatedScene: Scene) => {
    setScenes((prev) => prev.map((s) => (s.id === updatedScene.id ? updatedScene : s)))
  }, [])

  // Handler for per-scene image selection
  const handleSceneImageSelect = useCallback((sceneId: string, imageId: string | null) => {
    setScenes((prev) => prev.map((s) =>
      s.id === sceneId ? { ...s, inputImageId: imageId || undefined } : s
    ))
  }, [])

  const handleSelectTemplate = useCallback((template: VideoTemplate) => {
    setSelectedTemplate(template.id)

    setAudioSettings((prev: AudioSettings) => ({ ...prev, mood: template.preset.mood }))

    const newScenes: Scene[] = []
    for (let i = 0; i < template.preset.scenes; i++) {
      newScenes.push({
        id: `scene-${Date.now()}-${i}`,
        description: "",
        motion: template.preset.defaultMotion,
        duration: template.preset.defaultDuration,
        transition: template.preset.defaultTransition,
        inputImageId: undefined, // Smart transition for scenes 2+
      })
    }
    setScenes(newScenes)
    setSelectedSceneId(newScenes[0]?.id || null)
  }, [])

  const filteredMediaLibrary =
    editorMode === "imageToVideo" ? mediaLibrary.filter((m) => m.type === "image") : mediaLibrary

  const selectedScene = scenes.find((s) => s.id === selectedSceneId) || null

  // Compute the media to display in the canvas based on selected scene
  const displayMedia = (() => {
    // In edit mode or when no scene selected, use globally selected media
    if (editorMode !== "imageToVideo" || !selectedSceneId) {
      return selectedMedia
    }

    const sceneIndex = scenes.findIndex(s => s.id === selectedSceneId)
    const scene = scenes[sceneIndex]

    // If the scene has an explicitly assigned image, always use it (regardless of position)
    if (scene?.inputImageId) {
      return filteredMediaLibrary.find(m => m.id === scene.inputImageId) || selectedMedia
    }

    // Scene at index 0 without an assigned image uses the globally selected media
    if (sceneIndex === 0) {
      return selectedMedia
    }

    // Smart transition - show previous scene's image (if available) or global selected
    // Walk backwards to find the most recent scene with an image
    for (let i = sceneIndex - 1; i >= 0; i--) {
      const prevScene = scenes[i]
      // Check if this scene has an assigned image
      if (prevScene?.inputImageId) {
        return filteredMediaLibrary.find(m => m.id === prevScene.inputImageId) || selectedMedia
      }
      // If we reach index 0 without finding an assigned image, use global
      if (i === 0) {
        return selectedMedia
      }
    }

    return selectedMedia
  })()

  if (isMobile) {
    return (
      <div className="flex flex-col h-dvh overflow-hidden bg-background">
        <div className="flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center gap-3">
            <DevModeToggle />
            <ModeToggle mode={editorMode} onModeChange={setEditorMode} disabled={isGenerating} />
          </div>
          <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <MediaCanvas
            media={displayMedia}
            isGenerating={isGenerating}
            progress={generationProgress}
            settings={
              editorMode === "imageToVideo" ? { ...settings, aspectRatio: videoSettings.aspectRatio } : settings
            }
            showSourceBadge={editorMode === "imageToVideo"}
          />
        </div>

        {editorMode === "imageToVideo" && (
          <SceneTimeline
            scenes={scenes}
            selectedSceneId={selectedSceneId}
            onSelectScene={setSelectedSceneId}
            onScenesChange={setScenes}
            onAddScene={handleAddScene}
            onRemoveScene={handleRemoveScene}
            disabled={isGenerating}
            mediaLibrary={filteredMediaLibrary}
            selectedMedia={selectedMedia}
            onSceneImageSelect={handleSceneImageSelect}
          />
        )}

        {editorMode === "edit" ? (
          <PromptInput
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            mediaType={selectedMedia?.type || "image"}
            value={currentPrompt}
            onChange={setCurrentPrompt}
          />
        ) : (
          <BottomPanel
            audioSettings={audioSettings}
            onAudioSettingsChange={setAudioSettings}
            selectedScene={selectedScene}
            onSceneChange={handleSceneChange}
            onGenerate={handleVideoGenerate}
            isGenerating={isGenerating}
            disabled={isGenerating}
          />
        )}

        <div className="flex items-center justify-center gap-3 px-4 py-3 bg-background/80 backdrop-blur-xl border-t border-border">
          <button
            onClick={() => setMobileSheet("library")}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-muted/50 text-foreground transition-all duration-300 active:scale-95 disabled:opacity-50"
          >
            <FolderOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Library</span>
          </button>
          <button
            onClick={() => setMobileSheet("controls")}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-muted/50 text-foreground transition-all duration-300 active:scale-95 disabled:opacity-50"
          >
            <Settings2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>

        <MobileBottomSheet
          isOpen={mobileSheet === "library"}
          onClose={() => setMobileSheet(null)}
          title="Media Library"
        >
          <MobileLibraryContent
            mediaLibrary={filteredMediaLibrary}
            selectedMedia={selectedMedia}
            onSelectMedia={handleSelectMedia}
            isGenerating={isGenerating}
            onUpload={handleUpload}
          />
        </MobileBottomSheet>

        <MobileBottomSheet
          isOpen={mobileSheet === "controls"}
          onClose={() => setMobileSheet(null)}
          title={editorMode === "imageToVideo" ? "Video Settings" : "Generation Settings"}
        >
          <MobileControlsContent
            settings={settings}
            onSettingsChange={setSettings}
            isGenerating={isGenerating}
            editorMode={editorMode}
            audioSettings={audioSettings}
            onAudioSettingsChange={setAudioSettings}
            selectedScene={selectedScene}
            onSceneChange={handleSceneChange}
          />
        </MobileBottomSheet>

        <GenerationProgressModal
          isOpen={showProgressModal}
          progress={generationProgress}
          currentPhase={currentPhase}
          scenes={scenes}
          estimatedTime={estimatedTime}
          onCancel={handleCancelGeneration}
        />
      </div>
    )
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <ResizablePanel side="left" defaultWidth={280} minWidth={200} maxWidth={400} isOpen={leftSidebarOpen}>
        <MediaLibrarySidebar
          media={filteredMediaLibrary}
          selectedMedia={selectedMedia}
          onSelectMedia={handleSelectMedia}
          isOpen={leftSidebarOpen}
          onToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
          disabled={isGenerating}
          onUpload={handleUpload}
          filterType={editorMode === "imageToVideo" ? "image" : undefined}
        />
      </ResizablePanel>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <DevModeToggle />
            <ModeToggle mode={editorMode} onModeChange={setEditorMode} disabled={isGenerating} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/")}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className={cn("flex-1 relative overflow-hidden", editorMode === "imageToVideo" && "pb-0")}>
          <MediaCanvas
            media={displayMedia}
            isGenerating={isGenerating}
            progress={generationProgress}
            settings={
              editorMode === "imageToVideo" ? { ...settings, aspectRatio: videoSettings.aspectRatio } : settings
            }
            showSourceBadge={editorMode === "imageToVideo"}
          />
        </div>

        {editorMode === "imageToVideo" && (
          <SceneTimeline
            scenes={scenes}
            selectedSceneId={selectedSceneId}
            onSelectScene={setSelectedSceneId}
            onScenesChange={setScenes}
            onAddScene={handleAddScene}
            onRemoveScene={handleRemoveScene}
            disabled={isGenerating}
            mediaLibrary={filteredMediaLibrary}
            selectedMedia={selectedMedia}
            onSceneImageSelect={handleSceneImageSelect}
          />
        )}

        {editorMode === "edit" ? (
          <PromptInput
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            mediaType={selectedMedia?.type || "image"}
            value={currentPrompt}
            onChange={setCurrentPrompt}
          />
        ) : (
          <BottomPanel
            audioSettings={audioSettings}
            onAudioSettingsChange={setAudioSettings}
            selectedScene={selectedScene}
            onSceneChange={handleSceneChange}
            onGenerate={handleVideoGenerate}
            isGenerating={isGenerating}
            disabled={isGenerating}
          />
        )}
      </div>

      <ResizablePanel side="right" defaultWidth={288} minWidth={200} maxWidth={400} isOpen={rightSidebarOpen}>
        {editorMode === "edit" ? (
          <ControlsSidebar
            settings={settings}
            onSettingsChange={setSettings}
            isOpen={rightSidebarOpen}
            onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
            disabled={isGenerating}
            selectedMedia={selectedMedia}
          />
        ) : (
          <VideoSettingsSidebar
            settings={videoSettings}
            onSettingsChange={setVideoSettings}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={handleSelectTemplate}
            isOpen={rightSidebarOpen}
            onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
            disabled={isGenerating}
            audioSettings={audioSettings}
            onAudioSettingsChange={setAudioSettings}
            selectedScene={selectedScene}
            onSceneChange={handleSceneChange}
          />
        )}
      </ResizablePanel>

      <GenerationProgressModal
        isOpen={showProgressModal}
        progress={generationProgress}
        currentPhase={currentPhase}
        scenes={scenes}
        estimatedTime={estimatedTime}
        onCancel={handleCancelGeneration}
      />
    </div>
  )
}
