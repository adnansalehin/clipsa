"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronRight,
  Settings2,
  Ratio,
  Gauge,
  Sparkles,
  Info,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Smartphone,
  Copy,
  Check,
  FileText,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { MediaItem, GenerationSettings } from "@/lib/types"

interface ControlsSidebarProps {
  settings: GenerationSettings
  onSettingsChange: (settings: GenerationSettings) => void
  isOpen: boolean
  onToggle: () => void
  disabled?: boolean
  selectedMedia: MediaItem | null
}

const aspectRatios = [
  { value: "1:1", label: "Square", icon: Square },
  { value: "16:9", label: "Landscape", icon: RectangleHorizontal },
  { value: "9:16", label: "Portrait", icon: RectangleVertical },
  { value: "4:3", label: "Standard", icon: Smartphone },
]

const qualityLevels = [
  { value: "draft", label: "Draft", description: "Fast, lower quality" },
  { value: "standard", label: "Standard", description: "Balanced" },
  { value: "high", label: "High", description: "Better quality" },
  { value: "ultra", label: "Ultra", description: "Best quality, slow" },
]

const styles = [
  { value: "natural", label: "Natural" },
  { value: "cinematic", label: "Cinematic" },
  { value: "artistic", label: "Artistic" },
  { value: "vibrant", label: "Vibrant" },
]

export function ControlsSidebar({
  settings,
  onSettingsChange,
  isOpen,
  onToggle,
  disabled,
  selectedMedia,
}: ControlsSidebarProps) {
  const qualityIndex = qualityLevels.findIndex((q) => q.value === settings.quality)
  const [copiedPrompt, setCopiedPrompt] = useState(false)

  const handleCopyPrompt = async () => {
    if (!selectedMedia?.prompt) return
    try {
      await navigator.clipboard.writeText(selectedMedia.prompt)
      setCopiedPrompt(true)
      setTimeout(() => setCopiedPrompt(false), 2000)
    } catch (err) {
      console.error("Failed to copy prompt:", err)
    }
  }

  return (
    <TooltipProvider>
      <div className="relative flex flex-col h-full bg-sidebar border-l border-sidebar-border">
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
                <span className="text-sm font-medium text-sidebar-foreground whitespace-nowrap">Settings</span>
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

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className={cn("p-4 space-y-6", !isOpen && "flex flex-col items-center gap-4")}>
            {/* Aspect Ratio */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Ratio className="w-4 h-4 text-primary shrink-0" />
                {isOpen && <Label className="text-sm font-medium text-foreground">Aspect Ratio</Label>}
              </div>

              {isOpen ? (
                <div className="grid grid-cols-4 gap-2">
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
                              "flex flex-col items-center justify-center p-2.5 rounded-lg",
                              "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                              "border",
                              settings.aspectRatio === ratio.value
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-sidebar-accent/50 border-transparent text-muted-foreground hover:border-primary/30 hover:text-foreground",
                              disabled && "opacity-50 cursor-not-allowed",
                            )}
                          >
                            <Icon className="w-4 h-4 mb-1" />
                            <span className="text-[10px]">{ratio.value}</span>
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
                    <button
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        "bg-sidebar-accent/50 border border-transparent",
                        "transition-all duration-300",
                        "hover:border-primary/30",
                      )}
                    >
                      <Ratio className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Aspect Ratio: {settings.aspectRatio}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Quality */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-primary shrink-0" />
                {isOpen && <Label className="text-sm font-medium text-foreground">Quality</Label>}
              </div>

              {isOpen ? (
                <div className="space-y-3">
                  <Slider
                    value={[qualityIndex]}
                    max={qualityLevels.length - 1}
                    step={1}
                    disabled={disabled}
                    onValueChange={([value]) => onSettingsChange({ ...settings, quality: qualityLevels[value].value })}
                    className="w-full"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">{qualityLevels[qualityIndex].label}</span>
                    <span className="text-xs text-muted-foreground">{qualityLevels[qualityIndex].description}</span>
                  </div>
                </div>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        "bg-sidebar-accent/50 border border-transparent",
                        "transition-all duration-300",
                        "hover:border-primary/30",
                      )}
                    >
                      <span className="text-xs text-muted-foreground font-medium">
                        {settings.quality.charAt(0).toUpperCase()}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Quality: {settings.quality}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Style */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                {isOpen && <Label className="text-sm font-medium text-foreground">Style</Label>}
              </div>

              {isOpen ? (
                <div className="grid grid-cols-2 gap-2">
                  {styles.map((style) => (
                    <motion.button
                      key={style.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => !disabled && onSettingsChange({ ...settings, style: style.value })}
                      disabled={disabled}
                      className={cn(
                        "px-3 py-2.5 rounded-lg text-sm",
                        "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                        "border",
                        settings.style === style.value
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-sidebar-accent/50 border-transparent text-muted-foreground hover:border-primary/30 hover:text-foreground",
                        disabled && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      {style.label}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        "bg-sidebar-accent/50 border border-transparent",
                        "transition-all duration-300",
                        "hover:border-primary/30",
                      )}
                    >
                      <Sparkles className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Style: {settings.style}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && selectedMedia && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="border-t border-sidebar-border overflow-hidden shrink-0"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="w-3 h-3" />
                  <span>Selected Media</span>
                </div>
                <p className="text-sm font-medium text-foreground truncate">{selectedMedia.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {selectedMedia.type}
                  {selectedMedia.duration && ` · ${selectedMedia.duration}s`}
                </p>

                {/* Full Prompt Section */}
                {selectedMedia.prompt && (
                  <div className="pt-2 space-y-2 border-t border-sidebar-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FileText className="w-3 h-3" />
                        <span>Prompt</span>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCopyPrompt}
                            className="h-6 w-6 hover:bg-sidebar-accent"
                          >
                            {copiedPrompt ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3 text-muted-foreground" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p>{copiedPrompt ? "Copied!" : "Copy prompt"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {/* Full prompt text with scroll */}
                    <div className="max-h-24 overflow-y-auto rounded-md bg-sidebar-accent/30 p-2">
                      <p className="text-xs text-foreground leading-relaxed">{selectedMedia.prompt}</p>
                    </div>
                  </div>
                )}

                {selectedMedia.metadata && (
                  <div className="pt-2 space-y-1 text-xs text-muted-foreground border-t border-sidebar-border">
                    <p>Model: {selectedMedia.metadata.model}</p>
                    <p>
                      Size: {selectedMedia.metadata.width}×{selectedMedia.metadata.height}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}
