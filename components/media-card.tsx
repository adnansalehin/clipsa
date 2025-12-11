"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Sparkles, Download, Maximize2, Trash2 } from "lucide-react"
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

interface ImageItem {
  id: string | number
  src: string
  prompt: string
  category: string
  metadata: {
    model: string
    dimensions: string
    seed: string
    steps: number
    cfgScale: number
    sampler: string
    createdAt: string
  }
}

interface MediaCardProps {
  item: ImageItem
  layout: LayoutType
  onMaximize: (item: ImageItem) => void
  onDownload: (item: ImageItem) => void
  onEdit: (item: ImageItem) => void
  onDelete?: (item: ImageItem) => void
  isDeleting?: boolean
  canDelete?: boolean
}

export function MediaCard({
  item,
  layout,
  onMaximize,
  onDownload,
  onEdit,
  onDelete,
  isDeleting,
  canDelete,
}: MediaCardProps) {
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
            <AlertDialogTitle>Delete this image?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently remove the image file and its metadata from the library. You cannot undo this action.
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
          {/* Thumbnail */}
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
            <Image
              src={item.src || "/placeholder.svg"}
              alt={item.prompt}
              fill
              className={`object-cover transition-all duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm text-foreground/90">{item.prompt}</p>
            <span className="mt-1 inline-block rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              {item.category}
            </span>
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
      {/* Image Container */}
      <div className={`relative overflow-hidden ${layout === "masonry" ? "" : "aspect-4/3"}`}>
        <motion.div
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="h-full w-full"
        >
          <Image
            src={item.src || "/placeholder.svg"}
            alt={item.prompt}
            fill={layout !== "masonry"}
            width={layout === "masonry" ? 400 : undefined}
            height={layout === "masonry" ? 300 : undefined}
            className={`object-cover transition-all duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"} ${layout === "masonry" ? "h-auto w-full" : ""}`}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
        </motion.div>

        {/* Overlay */}
        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
        />

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
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-transform"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Edit with AI"
          >
            <Sparkles className="h-4 w-4 text-gray-700" />
          </motion.button>
          <motion.button
            onClick={() => onDownload(item)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-transform"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Download"
          >
            <Download className="h-4 w-4 text-gray-700" />
          </motion.button>
          <motion.button
            onClick={() => onMaximize(item)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-transform"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Expand"
          >
            <Maximize2 className="h-4 w-4 text-gray-700" />
          </motion.button>
          {renderDeleteDialog()}
        </motion.div>

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

      {/* Prompt - smaller text to accommodate longer prompts */}
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
