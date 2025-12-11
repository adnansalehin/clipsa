"use client"

import { useEffect, useRef } from "react"
import { motion, Reorder, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Plus, X, GripVertical, ImageIcon, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MediaItem, Scene } from "@/lib/types"

interface SceneTimelineProps {
  scenes: Scene[]
  selectedSceneId: string | null
  onSelectScene: (id: string) => void
  onScenesChange: (scenes: Scene[]) => void
  onAddScene: () => void
  onRemoveScene: (id: string) => void
  maxScenes?: number
  disabled?: boolean
  // Media library props for per-scene image selection
  mediaLibrary?: MediaItem[]
  selectedMedia?: MediaItem | null
  onSceneImageSelect?: (sceneId: string, imageId: string | null) => void
}

export function SceneTimeline({
  scenes,
  selectedSceneId,
  onSelectScene,
  onScenesChange,
  onAddScene,
  onRemoveScene,
  maxScenes = 4,
  disabled,
  mediaLibrary = [],
  selectedMedia,
  onSceneImageSelect,
}: SceneTimelineProps) {
  const canAddScene = scenes.length < maxScenes
  const initialFirstSceneIdRef = useRef<string | null>(null)

  // Capture the initial first scene id so its image persists across reorders
  useEffect(() => {
    if (scenes.length === 0) return
    if (!initialFirstSceneIdRef.current) {
      initialFirstSceneIdRef.current = scenes[0].id
    }
  }, [scenes])

  // Ensure the initial first scene keeps the selected media even after reordering
  useEffect(() => {
    if (!onSceneImageSelect || !selectedMedia) return
    const initialSceneId = initialFirstSceneIdRef.current
    if (!initialSceneId) return
    const targetScene = scenes.find(scene => scene.id === initialSceneId)
    if (!targetScene) return
    if (!targetScene.inputImageId) {
      onSceneImageSelect(initialSceneId, selectedMedia.id)
    }
  }, [scenes, selectedMedia, onSceneImageSelect])
  // Compute total duration from all scenes (read-only badge)
  const totalDurationSeconds = scenes.reduce((acc, s) => acc + (typeof s.duration === "number" ? s.duration : 0), 0)
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) return `${hrs}h ${mins}m`
    if (mins > 0) return `${mins}m ${secs}s`
    return `${secs}s`
  }
  const formattedTotal = formatDuration(totalDurationSeconds)

  // Helper function to get the image for a scene
  const getSceneImage = (scene: Scene, index: number): MediaItem | null => {
    // If the scene has an explicitly assigned image, always use it (regardless of position)
    if (scene.inputImageId) {
      return mediaLibrary.find(m => m.id === scene.inputImageId) || null
    }
    // Scene at index 0 without an assigned image uses the globally selected media
    if (index === 0) {
      return selectedMedia || null
    }
    // Other scenes without assigned images show smart transition
    return null
  }

  return (
    <div className="w-full px-4 py-3 bg-muted/30 border-t border-border">
      <div className="flex items-center gap-2 mb-2 justify-between w-full">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Scene Timeline</span>
          <span className="text-xs text-muted-foreground">
            ({scenes.length}/{maxScenes})
          </span>
        </div>
        <span className="text-xs text-muted-foreground bg-background/70 px-2 py-0.5 rounded">
          Total: {formattedTotal}
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Reorder.Group axis="x" values={scenes} onReorder={onScenesChange} className="flex items-center gap-2">
          <AnimatePresence mode="popLayout">
            {scenes.map((scene, index) => {
              const sceneImage = getSceneImage(scene, index)
              const isFirstScene = index === 0
              const showSmartTransition = !isFirstScene && !sceneImage

              return (
                <Reorder.Item key={scene.id} value={scene}>
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    onClick={() => !disabled && onSelectScene(scene.id)}
                    className={cn(
                      "relative flex items-stretch gap-0 rounded-lg cursor-grab active:cursor-grabbing select-none overflow-hidden",
                      "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                      "border min-w-[180px] h-[72px]",
                      selectedSceneId === scene.id
                        ? "bg-primary/10 border-primary text-primary shadow-sm"
                        : "bg-background/80 border-border text-foreground hover:border-primary/50",
                      disabled && "opacity-50 pointer-events-none",
                    )}
                  >
                    {/* Image Thumbnail Section */}
                    <div
                      className="w-[72px] shrink-0 relative bg-muted/50 flex items-center justify-center border-r border-border/50"
                      onDragStart={(event) => event.preventDefault()}
                    >
                      {sceneImage ? (
                        <Image
                          src={sceneImage.thumbnail || sceneImage.url}
                          alt={sceneImage.name}
                          fill
                          draggable={false}
                          onDragStart={(event) => event.preventDefault()}
                          className="object-cover"
                        />
                      ) : showSmartTransition ? (
                        <div className="flex flex-col items-center justify-center p-1.5 text-center">
                          <Sparkles className="w-4 h-4 text-primary/70 mb-0.5" />
                          <span className="text-[8px] leading-tight text-muted-foreground">Smart</span>
                          <span className="text-[8px] leading-tight text-muted-foreground">Transition</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-1.5">
                          <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
                          <span className="text-[8px] text-muted-foreground/50">No image</span>
                        </div>
                      )}
                      {/* Type badge for assigned images */}
                      {sceneImage && (
                        <div className="absolute top-1 right-1 p-0.5 rounded bg-background/80 backdrop-blur-sm">
                          <ImageIcon className="w-2.5 h-2.5 text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Scene Info Section */}
                    <div className="flex-1 flex items-center gap-2 px-2 py-2">
                      <GripVertical className="w-3 h-3 text-muted-foreground shrink-0 cursor-grab active:cursor-grabbing" />

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">Scene {index + 1}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {scene.duration}s · {scene.motion}
                        </p>
                        {showSmartTransition && (
                          <p className="text-[9px] text-primary/70 font-medium">from prev scene</p>
                        )}
                      </div>

                      {scenes.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!disabled) onRemoveScene(scene.id)
                          }}
                          className="w-5 h-5 rounded-full bg-muted/50 hover:bg-destructive/20 hover:text-destructive flex items-center justify-center transition-colors duration-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                </Reorder.Item>
              )
            })}
          </AnimatePresence>
        </Reorder.Group>

        {/* Add Scene Button */}
        <motion.button
          whileHover={{ scale: canAddScene ? 1.05 : 1 }}
          whileTap={{ scale: canAddScene ? 0.95 : 1 }}
          onClick={() => canAddScene && !disabled && onAddScene()}
          disabled={!canAddScene || disabled}
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg border-2 border-dashed",
            "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            canAddScene && !disabled
              ? "border-primary/50 text-primary/70 hover:border-primary hover:text-primary hover:bg-primary/5"
              : "border-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  )
}
