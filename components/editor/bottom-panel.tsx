"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Music, Mic, ChevronUp, Sparkles } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { SpeechInputRight } from "@/components/ui/speech-input-right"
import type { AudioSettings, Scene } from "@/lib/types"

interface BottomPanelProps {
  audioSettings: AudioSettings
  onAudioSettingsChange: (settings: AudioSettings) => void
  selectedScene: Scene | null
  onSceneChange: (scene: Scene) => void
  onGenerate: () => void
  isGenerating: boolean
  disabled?: boolean
}

export function BottomPanel({
  audioSettings,
  onAudioSettingsChange,
  selectedScene,
  onSceneChange,
  onGenerate,
  isGenerating,
  disabled,
}: BottomPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <motion.div
      initial={false}
      animate={{ height: isExpanded ? "auto" : 56 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="border-t border-border bg-background/95 backdrop-blur-xl overflow-hidden"
    >
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <Music className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Audio & Scene Configuration</span>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-4 space-y-4"
          >
            {/* Narration Input */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Mic className="w-3 h-3" />
                <span>Narration Text (optional)</span>
              </div>
            <SpeechInputRight
              value={audioSettings.narration}
              onChange={(value) => onAudioSettingsChange({ ...audioSettings, narration: value })}
              placeholder=""
                disabled={disabled}
                className="mt-2 w-full"
            >
              <div
                className={cn(
                  "relative flex items-end gap-3 p-3 rounded-2xl",
                  "bg-muted/30",
                  "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  "bg-muted/50 shadow-lg shadow-primary/5"
                )}>
              <textarea
                rows={2}
                placeholder="Enter text for AI voice narration..."
                disabled={disabled}
                className={cn(
                  "flex-1 bg-transparent border-none outline-none resize-none",
                  "text-sm text-foreground placeholder:text-muted-foreground",
                  "min-h-[24px] max-h-[120px] py-1",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              />
              </div>
            </SpeechInputRight>
            </div>

            {/* Scene Configuration Section */}
            {selectedScene && (
              <div className="space-y-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Scene Details
                  </span>
                  <span className="text-xs text-primary font-medium">Editing Scene</span>
                </div>

                {/* Scene Description */}
                <div className="flex gap-3">
                  <SpeechInputRight
                    value={selectedScene.description}
                    onChange={(value) => onSceneChange({ ...selectedScene, description: value })}
                    placeholder=""
                    disabled={disabled}
                    className="flex-1"
                  >
                  <div
                    className={cn(
                    "relative flex items-end gap-3 p-3 rounded-2xl",
                    "bg-muted/30",
                    "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    "bg-muted/50 shadow-lg shadow-primary/5"
                  )}>
                    <textarea
                      value={selectedScene.description}
                      onChange={(e) => onSceneChange({ ...selectedScene, description: e.target.value })}
                      placeholder="Describe what happens in this scene..."
                      disabled={disabled}
                      rows={2}
                      className={cn(
                        "flex-1 bg-transparent border-none outline-none resize-none",
                        "text-sm text-foreground placeholder:text-muted-foreground",
                        "min-h-[24px] max-h-[120px] py-1",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                      )}
                    />
                  </div>
                  </SpeechInputRight>

                  {/* Generate Button */}
                  <motion.button
                    whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                    whileTap={{ scale: isGenerating ? 1 : 0.98 }}
                    onClick={onGenerate}
                    disabled={disabled || isGenerating}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg",
                      "bg-primary text-primary-foreground font-medium text-sm",
                      "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                      "hover:bg-primary/90",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      isGenerating && "animate-pulse",
                    )}
                  >
                    <Sparkles className={cn("w-4 h-4", isGenerating && "animate-spin")} />
                    <span className="whitespace-nowrap">{isGenerating ? "Generating..." : "Generate"}</span>
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

