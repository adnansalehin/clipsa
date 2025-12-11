"use client"

import { motion } from "framer-motion"
import {
  ChevronRight,
  Settings2,
  Ratio,
  Clock,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Smartphone,
  Music,
  Mic,
  Move,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { VideoTemplates } from "./video-templates"
import type { AudioSettings, Scene, VideoGenerationSettings, VideoTemplate } from "@/lib/types"

interface VideoSettingsSidebarProps {
  settings: VideoGenerationSettings
  onSettingsChange: (settings: VideoGenerationSettings) => void
  selectedTemplate: string | null
  onSelectTemplate: (template: VideoTemplate) => void
  isOpen: boolean
  onToggle: () => void
  disabled?: boolean
  // Audio settings
  audioSettings?: AudioSettings
  onAudioSettingsChange?: (settings: AudioSettings) => void
  // Scene settings
  selectedScene?: Scene | null
  onSceneChange?: (scene: Scene) => void
}

const aspectRatios = [
  { value: "16:9", label: "Landscape", icon: RectangleHorizontal },
  { value: "9:16", label: "Portrait", icon: RectangleVertical },
  { value: "1:1", label: "Square", icon: Square },
  { value: "4:3", label: "Standard", icon: Smartphone },
]

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
  { value: "pan-left" as const, label: "Pan Left" },
  { value: "pan-right" as const, label: "Pan Right" },
  { value: "zoom-in" as const, label: "Zoom In" },
  { value: "zoom-out" as const, label: "Zoom Out" },
]

export function VideoSettingsSidebar({
  settings,
  onSettingsChange,
  selectedTemplate,
  onSelectTemplate,
  isOpen,
  onToggle,
  disabled,
  audioSettings,
  onAudioSettingsChange,
  selectedScene,
  onSceneChange,
}: VideoSettingsSidebarProps) {
  return (
    <TooltipProvider>
      <div className="relative flex flex-col h-full bg-sidebar border-l border-sidebar-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border shrink-0">
          {isOpen ? (
            <>
              <motion.div
                initial={false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="flex items-center gap-2"
              >
                <Settings2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-sidebar-foreground whitespace-nowrap">Video Settings</span>
              </motion.div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-8 w-8 shrink-0 hover:bg-sidebar-accent transition-colors duration-300"
              >
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 mx-auto hover:bg-sidebar-accent transition-colors duration-300"
            >
              <motion.div initial={false} animate={{ rotate: 180 }} transition={{ duration: 0.3 }}>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className={cn("p-4 space-y-6", !isOpen && "flex flex-col items-center gap-4")}>
            {/* Aspect Ratio */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Ratio className="w-4 h-4 text-primary shrink-0" />
                {isOpen && <Label className="text-sm font-medium text-foreground">Aspect Ratio</Label>}
              </div>

              {isOpen ? (
                <div className="grid grid-cols-2 gap-2">
                  {aspectRatios.map((ratio) => {
                    const Icon = ratio.icon
                    return (
                      <Tooltip key={ratio.value}>
                        <TooltipTrigger asChild>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => !disabled && onSettingsChange({ ...settings, aspectRatio: ratio.value })}
                            disabled={disabled}
                            className={cn(
                              "flex flex-col items-center justify-center p-3 rounded-lg",
                              "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                              "border",
                              settings.aspectRatio === ratio.value
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-sidebar-accent/50 border-transparent text-muted-foreground hover:border-primary/30 hover:text-foreground",
                              disabled && "opacity-50 cursor-not-allowed",
                            )}
                          >
                            <Icon className="w-5 h-5 mb-1" />
                            <span className="text-xs">{ratio.value}</span>
                          </motion.button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>{ratio.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-sidebar-accent/50 border border-transparent hover:border-primary/30 transition-all duration-300">
                      <Ratio className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Aspect Ratio: {settings.aspectRatio}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Total Duration slider removed; duration is derived from scenes in the editor UI. */}

            {/* Audio Settings Section */}
            {audioSettings && onAudioSettingsChange && isOpen && (
              <div className="space-y-4 pt-4 border-t border-sidebar-border">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-primary" />
                  <Label className="text-sm font-medium text-foreground">Audio Settings</Label>
                </div>

                {/* Background Music Mood */}
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground">Background Music Mood</span>
                  <div className="flex flex-wrap gap-1.5">
                    {moodOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => !disabled && onAudioSettingsChange({ ...audioSettings, mood: option.value })}
                        disabled={disabled}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-medium",
                          "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                          "border",
                          audioSettings.mood === option.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-sidebar-accent/50 text-muted-foreground border-transparent hover:border-primary/50 hover:text-foreground",
                          disabled && "opacity-50 cursor-not-allowed",
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
                    disabled={disabled}
                    className={cn(
                      "w-full px-2.5 py-1.5 rounded-lg text-xs font-medium",
                      "bg-sidebar-accent/50 border border-sidebar-border",
                      "focus:outline-none focus:ring-2 focus:ring-primary/30",
                      disabled && "opacity-50 cursor-not-allowed",
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

            {/* Scene Controls Section */}
            {selectedScene && onSceneChange && isOpen && (
              <div className="space-y-4 pt-4 border-t border-sidebar-border">
                <div className="flex items-center gap-2">
                  <Move className="w-4 h-4 text-primary" />
                  <Label className="text-sm font-medium text-foreground">Scene Controls</Label>
                </div>

                {/* Motion */}
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground">Motion</span>
                  <div className="flex flex-wrap gap-1.5">
                    {motionOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => !disabled && onSceneChange({ ...selectedScene, motion: option.value })}
                        disabled={disabled}
                        className={cn(
                          "px-2.5 py-1 rounded text-[10px] font-medium",
                          "transition-all duration-200",
                          selectedScene.motion === option.value
                            ? "bg-primary/20 text-primary"
                            : "bg-sidebar-accent/50 text-muted-foreground hover:text-foreground",
                          disabled && "opacity-50 cursor-not-allowed",
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
                    disabled={disabled}
                    className={cn(
                      "w-full px-2.5 py-1.5 rounded-lg text-xs font-medium",
                      "bg-sidebar-accent/50 border border-sidebar-border",
                      "focus:outline-none focus:ring-2 focus:ring-primary/30",
                      disabled && "opacity-50 cursor-not-allowed",
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
                    onChange={(e) =>
                      onSceneChange({ ...selectedScene, transition: e.target.value as Scene["transition"] })
                    }
                    disabled={disabled}
                    className={cn(
                      "w-full px-2.5 py-1.5 rounded-lg text-xs font-medium",
                      "bg-sidebar-accent/50 border border-sidebar-border",
                      "focus:outline-none focus:ring-2 focus:ring-primary/30",
                      disabled && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <option value="cut">Cut</option>
                    <option value="fade">Fade</option>
                    <option value="dissolve">Dissolve</option>
                  </select>
                </div>
              </div>
            )}

            {/* Video Templates */}
            <VideoTemplates
              selectedTemplate={selectedTemplate}
              onSelectTemplate={onSelectTemplate}
              disabled={disabled}
              isOpen={isOpen}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
