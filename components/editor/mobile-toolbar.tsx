"use client"

import { motion } from "framer-motion"
import { FolderOpen, Settings2, ImageIcon, Film } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MediaItem } from "@/lib/types"

interface MobileToolbarProps {
  onOpenLibrary: () => void
  onOpenControls: () => void
  selectedMedia: MediaItem | null
  isGenerating: boolean
}

export function MobileToolbar({ onOpenLibrary, onOpenControls, selectedMedia, isGenerating }: MobileToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-border safe-area-top">
      {/* Library Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onOpenLibrary}
        disabled={isGenerating}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl",
          "bg-muted/50 text-foreground",
          "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isGenerating && "opacity-50 pointer-events-none",
        )}
      >
        <FolderOpen className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Library</span>
      </motion.button>

      {/* Selected Media Info */}
      <motion.div
        animate={isGenerating ? { scale: [1, 1.02, 1] } : {}}
        transition={isGenerating ? { duration: 1.5, repeat: Number.POSITIVE_INFINITY } : {}}
        className={cn(
          "flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg",
          "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isGenerating && "bg-primary/10",
        )}
      >
        {selectedMedia && (
          <>
            {selectedMedia.type === "video" ? (
              <Film className={cn("w-4 h-4", isGenerating && "text-primary")} />
            ) : (
              <ImageIcon className={cn("w-4 h-4", isGenerating && "text-primary")} />
            )}
            <span className={cn("max-w-[100px] truncate text-muted-foreground", isGenerating && "text-primary")}>
              {isGenerating ? "Generating..." : selectedMedia.name}
            </span>
          </>
        )}
      </motion.div>

      {/* Settings Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onOpenControls}
        disabled={isGenerating}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl",
          "bg-muted/50 text-foreground",
          "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isGenerating && "opacity-50 pointer-events-none",
        )}
      >
        <Settings2 className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Settings</span>
      </motion.button>
    </div>
  )
}
