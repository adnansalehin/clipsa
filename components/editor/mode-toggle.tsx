"use client"

import { motion } from "framer-motion"
import { Pencil, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import type { EditorMode } from "@/lib/types"

interface ModeToggleProps {
  mode: EditorMode
  onModeChange: (mode: EditorMode) => void
  disabled?: boolean
}

const modes = [
  { id: "edit" as const, label: "Edit Media", icon: Pencil },
  { id: "imageToVideo" as const, label: "Image → Video", icon: Video },
]

export function ModeToggle({ mode, onModeChange, disabled }: ModeToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border/50">
      {modes.map((m) => {
        const Icon = m.icon
        const isActive = mode === m.id

        return (
          <button
            key={m.id}
            onClick={() => !disabled && onModeChange(m.id)}
            disabled={disabled}
            className={cn(
              "relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
              "transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
              disabled && "opacity-50 cursor-not-allowed",
              !isActive && "text-muted-foreground hover:text-foreground",
            )}
          >
            {isActive && (
              <motion.div
                layoutId="mode-toggle-bg"
                className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border"
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              />
            )}
            <Icon className={cn("w-4 h-4 relative z-10", isActive && "text-primary")} />
            <span className="relative z-10 hidden sm:inline">{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}
