"use client"

import React from "react"
import { motion } from "framer-motion"
import { Film, Sparkles, Zap, BookOpen, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { VideoTemplate } from "@/lib/types"

const templates: VideoTemplate[] = [
  {
    id: "cinematic",
    name: "Cinematic",
    description: "Slow zooms, dramatic fades",
    icon: Film,
    preset: {
      scenes: 3,
      defaultMotion: "zoom-in",
      defaultTransition: "fade",
      defaultDuration: 7,
      mood: "dramatic",
    },
  },
  {
    id: "product",
    name: "Product",
    description: "Clean, professional look",
    icon: Sparkles,
    preset: {
      scenes: 3,
      defaultMotion: "static",
      defaultTransition: "dissolve",
      defaultDuration: 5,
      mood: "uplifting",
    },
  },
  {
    id: "social",
    name: "Social Reel",
    description: "Quick cuts, energetic",
    icon: Zap,
    preset: {
      scenes: 4,
      defaultMotion: "pan-right",
      defaultTransition: "cut",
      defaultDuration: 3,
      mood: "energetic",
    },
  },
  {
    id: "story",
    name: "Story",
    description: "Narrative flow, smooth",
    icon: BookOpen,
    preset: {
      scenes: 3,
      defaultMotion: "pan-left",
      defaultTransition: "fade",
      defaultDuration: 5,
      mood: "calm",
    },
  },
  {
    id: "custom",
    name: "Custom",
    description: "No preset applied",
    icon: Settings2,
    preset: {
      scenes: 1,
      defaultMotion: "static",
      defaultTransition: "cut",
      defaultDuration: 5,
      mood: "none",
    },
  },
]

interface VideoTemplatesProps {
  selectedTemplate: string | null
  onSelectTemplate: (template: VideoTemplate) => void
  disabled?: boolean
  isOpen?: boolean
}

export function VideoTemplates({ selectedTemplate, onSelectTemplate, disabled, isOpen = true }: VideoTemplatesProps) {
  if (!isOpen) return null

  return (
    <div className="space-y-3">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Video Templates</span>

      <div className="space-y-2">
        {templates.map((template) => {
          const Icon = template.icon as React.ComponentType<{ className?: string }>
          const isSelected = selectedTemplate === template.id

          return (
            <motion.button
              key={template.id}
              whileHover={{ scale: disabled ? 1 : 1.02 }}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
              onClick={() => !disabled && onSelectTemplate(template)}
              disabled={disabled}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg text-left",
                "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                "border",
                isSelected
                  ? "bg-primary/10 border-primary"
                  : "bg-muted/30 border-transparent hover:border-primary/30 hover:bg-muted/50",
                disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", isSelected ? "text-primary" : "text-foreground")}>
                  {template.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{template.description}</p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export { templates as videoTemplates }
