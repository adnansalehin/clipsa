"use client"

import type React from "react"
import Image from "next/image"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ImageIcon, Film, Upload, Search, Images } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { MediaItem } from "@/lib/types"

interface MediaLibrarySidebarProps {
  media: MediaItem[]
  selectedMedia: MediaItem | null
  onSelectMedia: (media: MediaItem) => void
  isOpen: boolean
  onToggle: () => void
  disabled?: boolean
  onUpload?: (files: FileList) => void
  filterType?: "image" | "video"
}

export function MediaLibrarySidebar({
  media,
  selectedMedia,
  onSelectMedia,
  isOpen,
  onToggle,
  disabled,
  onUpload,
  filterType,
}: MediaLibrarySidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "image" | "video">("all")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const effectiveFilter = filterType || filter

  const filteredMedia = media.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.prompt?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = effectiveFilter === "all" || item.type === effectiveFilter
    return matchesSearch && matchesFilter
  })

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

  const acceptedFiles = filterType === "image" ? "image/*" : filterType === "video" ? "video/*" : "image/*,video/*"

  return (
    <div
      className="relative flex flex-col h-full w-full bg-sidebar border-r border-sidebar-border"
    >
      {/* Header - fixed height */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border shrink-0">
        <motion.div
          initial={false}
          animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="flex items-center gap-2 overflow-hidden"
        >
          <Images className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-sidebar-foreground whitespace-nowrap">Media Library</span>
        </motion.div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 shrink-0 hover:bg-sidebar-accent transition-colors duration-300"
        >
          <motion.div initial={false} animate={{ rotate: isOpen ? 0 : 180 }} transition={{ duration: 0.3 }}>
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="shrink-0 border-b border-sidebar-border"
          >
            <div className="p-3 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search media..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-sidebar-accent/50 border-transparent focus:outline-none"
                />
              </div>

              {/* Filter Tabs */}
              {!filterType && (
                <div className="flex gap-1 p-1 bg-sidebar-accent/50 rounded-lg">
                  {[
                    { value: "all", label: "All" },
                    { value: "image", label: "Images", icon: ImageIcon },
                    { value: "video", label: "Videos", icon: Film },
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setFilter(tab.value as typeof filter)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium",
                        "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                        filter === tab.value
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {tab.icon && <tab.icon className="w-3 h-3" />}
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              {filterType === "image" && (
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary/10 text-primary">
                  <ImageIcon className="w-3 h-3" />
                  <span className="text-xs font-medium">Images only (Video source)</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className={cn("p-3", isOpen ? "space-y-2" : "flex flex-col items-center gap-2")}>
          <AnimatePresence mode="popLayout">
            {filteredMedia.map((item, index) => (
              <motion.button
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.03,
                  ease: [0.4, 0, 0.2, 1],
                }}
                onClick={() => onSelectMedia(item)}
                disabled={disabled}
                className={cn(
                  "group relative overflow-hidden rounded-xl",
                  "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  isOpen ? "w-full aspect-video" : "w-10 h-10",
                  selectedMedia?.id === item.id
                    ? "ring-2 ring-primary shadow-lg shadow-primary/20"
                    : "ring-1 ring-border hover:ring-primary/40",
                  disabled && "opacity-50 cursor-not-allowed",
                )}
              >
                <Image
                  src={item.thumbnail || item.url}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105"
                />

                {/* Overlay with info - only when expanded */}
                {isOpen && (
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
                      <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                      {item.prompt && <p className="text-[10px] text-muted-foreground line-clamp-2">{item.prompt}</p>}
                    </div>
                  </div>
                )}

                {/* Type Badge */}
                <div
                  className={cn(
                    "absolute top-1.5 right-1.5 rounded-full bg-background/80 backdrop-blur-sm",
                    isOpen ? "p-1.5" : "p-1",
                  )}
                >
                  {item.type === "video" ? (
                    <Film className={cn("text-primary", isOpen ? "w-3 h-3" : "w-2.5 h-2.5")} />
                  ) : (
                    <ImageIcon className={cn("text-primary", isOpen ? "w-3 h-3" : "w-2.5 h-2.5")} />
                  )}
                </div>

                {/* Duration for videos */}
                {item.type === "video" && item.duration && isOpen && (
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-background/80 backdrop-blur-sm text-[10px] text-foreground tabular-nums">
                    {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, "0")}
                  </div>
                )}

                {/* Selected indicator */}
                {selectedMedia?.id === item.id && (
                  <motion.div
                    layoutId="selected-indicator"
                    className="absolute inset-0 ring-2 ring-primary rounded-xl pointer-events-none"
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  />
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Upload Button - fixed at bottom */}
      <div className={cn("p-3 border-t border-sidebar-border shrink-0", !isOpen && "flex justify-center")}>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFiles}
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          variant="outline"
          size={isOpen ? "default" : "icon"}
          disabled={disabled}
          onClick={handleUploadClick}
          className={cn("transition-all duration-300", isOpen ? "w-full gap-2" : "w-10 h-10")}
        >
          <Upload className="w-4 h-4" />
          {isOpen && <span>Upload {filterType === "image" ? "Images" : "Media"}</span>}
        </Button>
      </div>
    </div>
  )
}
