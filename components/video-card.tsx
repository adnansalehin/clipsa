"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Play, Clock, Sparkles, Download, Maximize2, Trash2 } from "lucide-react"
import type { LayoutType } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface VideoItem {
  id: string | number
  thumbnail: string
  prompt: string
  duration: string
  category: string
  metadata?: {
    model: string
    resolution: string
    fps: number
    codec: string
    createdAt: string
  }
}

interface VideoCardProps {
  item: VideoItem
  layout: LayoutType
  onMaximize: (item: VideoItem) => void
  onDownload: (item: VideoItem) => void
  onEdit: (item: VideoItem) => void
  onDelete?: (item: VideoItem) => void
  isDeleting?: boolean
  canDelete?: boolean
}

export function VideoCard({
  item,
  layout,
  onMaximize,
  onDownload,
  onEdit,
  onDelete,
  isDeleting,
  canDelete,
}: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const isListLayout = layout === "list"
  const deletable = canDelete ?? typeof item.id === "string"

  const renderDeleteDialog = () =>
    deletable && onDelete ? (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <ActionButton icon={Trash2} variant="danger" disabled={isDeleting} />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this video?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently remove the video file and its metadata from the library. You cannot undo this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive"
              onClick={() => onDelete(item)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Confirm delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ) : null

  if (isListLayout) {
    return (
      <motion.div
        className="group flex flex-col gap-3 overflow-hidden rounded-2xl bg-card p-3 transition-colors hover:bg-card/80"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ x: 4 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <div className="flex items-center gap-4">
          {/* Thumbnail with play icon */}
          <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-xl">
            <Image
              src={item.thumbnail || "/placeholder.svg"}
              alt={item.prompt}
              fill
              className={`object-cover transition-all duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90">
                <Play className="ml-0.5 h-3 w-3 fill-gray-900 text-gray-900" />
              </div>
            </div>
            <div className="absolute bottom-1 right-1">
              <span className="rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {item.duration}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm text-foreground/90">{item.prompt}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{item.category}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {item.duration}
              </span>
            </div>
          </div>

          {/* Actions */}
          <motion.div
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
            transition={{ duration: 0.2 }}
            className="flex gap-2"
          >
            <ActionButton icon={Sparkles} onClick={() => onEdit(item)} />
            <ActionButton icon={Download} onClick={() => onDownload(item)} />
            <ActionButton icon={Maximize2} onClick={() => onMaximize(item)} />
            {renderDeleteDialog()}
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl bg-card"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden">
        <motion.div
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="h-full w-full"
        >
          <Image
            src={item.thumbnail || "/placeholder.svg"}
            alt={item.prompt}
            fill
            className={`object-cover transition-all duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
        </motion.div>

        {/* Overlay */}
        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black/30"
        />

        {/* Play Button */}
        <motion.button
          initial={false}
          animate={{
            scale: isHovered ? 1 : 0.8,
            opacity: isHovered ? 1 : 0.7,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-xl backdrop-blur-sm"
        >
          <Play className="ml-1 h-6 w-6 fill-gray-900 text-gray-900" />
        </motion.button>

        {/* Action Buttons */}
        <motion.div
          initial={false}
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10,
          }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-3 top-3 flex gap-2"
        >
          <motion.button
            onClick={() => onEdit(item)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Edit with AI"
          >
            <Sparkles className="h-4 w-4 text-gray-700" />
          </motion.button>
          <motion.button
            onClick={() => onDownload(item)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Download"
          >
            <Download className="h-4 w-4 text-gray-700" />
          </motion.button>
          <motion.button
            onClick={() => onMaximize(item)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Expand"
          >
            <Maximize2 className="h-4 w-4 text-gray-700" />
          </motion.button>
          {renderDeleteDialog()}
        </motion.div>

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3">
          <span className="flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <Clock className="h-3 w-3" />
            {item.duration}
          </span>
        </div>

        {/* Category Badge */}
        <motion.div
          initial={false}
          animate={{
            opacity: isHovered ? 1 : 0,
            x: isHovered ? 0 : -10,
          }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-3 left-3"
        >
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-800 backdrop-blur-sm">
            {item.category}
          </span>
        </motion.div>
      </div>

      {/* Prompt */}
      <div className="p-4">
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.prompt}</p>
      </div>
    </motion.div>
  )
}

function ActionButton({
  icon: Icon,
  onClick,
  variant = "default",
  disabled = false,
}: {
  icon: React.ElementType
  onClick?: () => void
  variant?: "default" | "danger"
  disabled?: boolean
}) {
  const base =
    "flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
  const styles =
    variant === "danger"
      ? "bg-destructive/20 text-destructive hover:bg-destructive/30 focus-visible:ring-destructive"
      : "bg-secondary/80 text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:ring-ring"
  return (
    <motion.button
      onClick={onClick}
      className={`${base} ${styles} disabled:cursor-not-allowed disabled:opacity-60`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      disabled={disabled}
    >
      <Icon className="h-4 w-4" />
    </motion.button>
  )
}
