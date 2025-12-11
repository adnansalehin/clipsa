"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Music, Mic, Move } from "lucide-react"
import type { GenerationSettings } from "@/lib/types"
import type { AudioSettings, Scene } from "@/lib/types"

interface MobileControlsContentProps {
  settings: GenerationSettings
  onSettingsChange: (settings: GenerationSettings) => void
  isGenerating: boolean
  // Video mode specific props
  editorMode?: "edit" | "imageToVideo"
  audioSettings?: AudioSettings
  onAudioSettingsChange?: (settings: AudioSettings) => void
  selectedScene?: Scene | null
  onSceneChange?: (scene: Scene) => void
}

const aspectRatios = [
  { value: "1:1", label: "Square" },
  { value: "16:9", label: "Wide" },
  { value: "9:16", label: "Tall" },
  { value: "4:3", label: "Standard" },
]

const qualities = ["draft", "standard", "high", "ultra"]
const styles = ["natural", "cinematic", "artistic", "vibrant"]

const moodOptions = [
  { value: "calm" as const, label: "Calm" },
  { value: "energetic" as const, label: "Energetic" },
  { value: "dramatic" as const, label: "Dramatic" },
  { value: "mysterious" as const, label: "Mysterious" },
  { value: "uplifting" as const, label: "Uplifting" },
  { value: "none" as const, label: "None" },
]

const voiceStyleOptions = [
  { value: "natural" as const, label: "Natural" },
  { value: "professional" as const, label: "Professional" },
  { value: "warm" as const, label: "Warm" },
  { value: "energetic" as const, label: "Energetic" },
]

const motionOptions = [
  { value: "static" as const, label: "Static" },
  { value: "pan-left" as const, label: "Pan L" },
  { value: "pan-right" as const, label: "Pan R" },
  { value: "zoom-in" as const, label: "Zoom In" },
  { value: "zoom-out" as const, label: "Zoom Out" },
]

export function MobileControlsContent({
  settings,
  onSettingsChange,
  isGenerating,
  editorMode = "edit",
  audioSettings,
  onAudioSettingsChange,
  selectedScene,
  onSceneChange,
}: MobileControlsContentProps) {
  const isVideoMode = editorMode === "imageToVideo"

  return (
    <div className="p-4 space-y-6">
      {/* Aspect Ratio */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Aspect Ratio</label>
        <div className="flex gap-2">
          {aspectRatios.map((ratio, index) => (
            <motion.button
              key={ratio.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSettingsChange({ ...settings, aspectRatio: ratio.value })}
              disabled={isGenerating}
              className={cn(
                "flex-1 py-3 rounded-xl text-sm font-medium",
                "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                settings.aspectRatio === ratio.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {ratio.value}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quality - only for edit mode */}
      {!isVideoMode && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Quality</label>
          <div className="flex gap-2">
            {qualities.map((q, index) => (
              <motion.button
                key={q}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSettingsChange({ ...settings, quality: q })}
                disabled={isGenerating}
                className={cn(
                  "flex-1 py-3 rounded-xl text-sm font-medium capitalize",
                  "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  settings.quality === q ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {q}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Style - only for edit mode */}
      {!isVideoMode && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Style</label>
          <div className="grid grid-cols-2 gap-2">
            {styles.map((s, index) => (
              <motion.button
                key={s}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSettingsChange({ ...settings, style: s })}
                disabled={isGenerating}
                className={cn(
                  "py-3 rounded-xl text-sm font-medium capitalize",
                  "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  settings.style === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {s}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Audio Settings - Video mode only */}
      {isVideoMode && audioSettings && onAudioSettingsChange && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-primary" />
            <label className="text-sm font-medium text-foreground">Audio Settings</label>
          </div>

          {/* Background Music Mood */}
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">Background Music Mood</span>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => !isGenerating && onAudioSettingsChange({ ...audioSettings, mood: option.value })}
                  disabled={isGenerating}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium",
                    "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    "border",
                    audioSettings.mood === option.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:border-primary/50",
                    isGenerating && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Style */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mic className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Voice Style</span>
            </div>
            <select
              value={audioSettings.voiceStyle || "natural"}
              onChange={(e) =>
                onAudioSettingsChange({
                  ...audioSettings,
                  voiceStyle: e.target.value as AudioSettings["voiceStyle"],
                })
              }
              disabled={isGenerating}
              className={cn(
                "w-full px-3 py-2 rounded-lg text-sm font-medium",
                "bg-muted border border-border",
                "focus:outline-none focus:ring-2 focus:ring-primary/30",
                isGenerating && "opacity-50 cursor-not-allowed",
              )}
            >
              {voiceStyleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Scene Controls - Video mode only */}
      {isVideoMode && selectedScene && onSceneChange && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-primary" />
            <label className="text-sm font-medium text-foreground">Scene Controls</label>
          </div>

          {/* Motion */}
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">Motion</span>
            <div className="flex flex-wrap gap-2">
              {motionOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => !isGenerating && onSceneChange({ ...selectedScene, motion: option.value })}
                  disabled={isGenerating}
                  className={cn(
                    "px-3 py-1.5 rounded text-xs font-medium",
                    "transition-all duration-200",
                    selectedScene.motion === option.value
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                    isGenerating && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">Scene Duration</span>
            <select
              value={selectedScene.duration}
              onChange={(e) => onSceneChange({ ...selectedScene, duration: Number(e.target.value) })}
              disabled={isGenerating}
              className={cn(
                "w-full px-3 py-2 rounded-lg text-sm font-medium",
                "bg-muted border border-border",
                "focus:outline-none focus:ring-2 focus:ring-primary/30",
                isGenerating && "opacity-50 cursor-not-allowed",
              )}
            >
              {[3, 5, 7, 10].map((d) => (
                <option key={d} value={d}>
                  {d}s
                </option>
              ))}
            </select>
          </div>

          {/* Transition */}
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">Transition</span>
            <select
              value={selectedScene.transition}
              onChange={(e) => onSceneChange({ ...selectedScene, transition: e.target.value as Scene["transition"] })}
              disabled={isGenerating}
              className={cn(
                "w-full px-3 py-2 rounded-lg text-sm font-medium",
                "bg-muted border border-border",
                "focus:outline-none focus:ring-2 focus:ring-primary/30",
                isGenerating && "opacity-50 cursor-not-allowed",
              )}
            >
              <option value="cut">Cut</option>
              <option value="fade">Fade</option>
              <option value="dissolve">Dissolve</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

