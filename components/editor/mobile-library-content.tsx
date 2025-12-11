"use client"

import type React from "react"
import Image from "next/image"

import { useRef } from "react"
import { motion } from "framer-motion"
import { Film, ImageIcon, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MediaItem } from "@/lib/types"
import { Button } from "@/components/ui/button"

interface MobileLibraryContentProps {
  mediaLibrary: MediaItem[]
  selectedMedia: MediaItem | null
  onSelectMedia: (media: MediaItem) => void
  isGenerating: boolean
  onUpload?: (files: FileList) => void
}

export function MobileLibraryContent({
  mediaLibrary,
  selectedMedia,
  onSelectMedia,
  isGenerating,
  onUpload,
}: MobileLibraryContentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0 && onUpload) {
      onUpload(files)
      e.target.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <div className="px-4 pt-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          variant="outline"
          size="default"
          disabled={isGenerating}
          onClick={handleUploadClick}
          className="w-full gap-2 bg-transparent"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Media</span>
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 px-4 pb-4">
        {mediaLibrary.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectMedia(item)}
            disabled={isGenerating}
            className={cn(
              "relative aspect-square rounded-xl overflow-hidden",
              "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
              selectedMedia?.id === item.id ? "ring-2 ring-primary shadow-lg shadow-primary/20" : "ring-1 ring-border",
              isGenerating && "opacity-50",
            )}
          >
            <Image src={item.thumbnail || item.url} alt={item.name} fill className="object-cover" />

            {/* Type indicator */}
            <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-background/80 backdrop-blur-sm">
              {item.type === "video" ? (
                <Film className="w-3 h-3 text-primary" />
              ) : (
                <ImageIcon className="w-3 h-3 text-primary" />
              )}
            </div>

            {/* Duration for videos */}
            {item.type === "video" && item.duration && (
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-background/80 backdrop-blur-sm text-[10px] tabular-nums">
                {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, "0")}
              </div>
            )}

            {/* Name overlay on hover/selected */}
            {selectedMedia?.id === item.id && (
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-2">
                <p className="text-[10px] font-medium text-foreground truncate">{item.name}</p>
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
