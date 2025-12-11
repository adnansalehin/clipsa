"use client"

import type React from "react"

import { useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { X, Download, Sparkles, Calendar, Layers, Cpu, Hash, ImageIcon, Palette, Maximize2 } from "lucide-react"

interface ImageItem {
  id: number
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

interface ImageLightboxProps {
  item: ImageItem | null
  isOpen: boolean
  onClose: () => void
  onDownload: (item: ImageItem) => void
  onEdit: (item: ImageItem) => void
}

export function ImageLightbox({ item, isOpen, onClose, onDownload, onEdit }: ImageLightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, handleKeyDown])

  if (!item) return null

  const metadata = item.metadata || {
    model: "SDXL 1.0",
    dimensions: "1024 × 1024",
    seed: "4285619273",
    steps: 30,
    cfgScale: 7.5,
    sampler: "DPM++ 2M Karras",
    createdAt: new Date().toLocaleDateString(),
  }

  const handleEditClick = () => {
    onEdit(item)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8"
          onClick={onClose}
        >
          {/* Backdrop with blur */}
          <motion.div
            initial={{ backdropFilter: "blur(0px)" }}
            animate={{ backdropFilter: "blur(20px)" }}
            exit={{ backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-background/80"
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex max-h-[90vh] w-full max-w-6xl flex-col gap-4 overflow-hidden rounded-3xl bg-card/95 p-4 shadow-2xl backdrop-blur-xl lg:flex-row lg:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <motion.button
              onClick={onClose}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-secondary/80 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-secondary hover:text-foreground"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="h-5 w-5" />
            </motion.button>

            {/* Image section */}
            <motion.div
              className="relative flex-1 overflow-hidden rounded-2xl bg-secondary/30"
              layoutId={`image-${item.id}`}
            >
              <div className="relative aspect-square w-full lg:h-full lg:aspect-auto">
                <Image
                  src={item.src || "/placeholder.svg"}
                  alt={item.prompt}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </motion.div>

            {/* Info panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex w-full flex-col gap-6 lg:w-80 xl:w-96"
            >
              {/* Prompt section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  Prompt
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">{item.prompt}</p>
              </div>

              {/* Metadata grid */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Layers className="h-3.5 w-3.5" />
                  Generation Details
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MetadataItem icon={Cpu} label="Model" value={metadata.model} />
                  <MetadataItem icon={Maximize2} label="Size" value={metadata.dimensions} />
                  <MetadataItem icon={Hash} label="Seed" value={metadata.seed} />
                  <MetadataItem icon={ImageIcon} label="Steps" value={String(metadata.steps)} />
                  <MetadataItem icon={Palette} label="CFG Scale" value={String(metadata.cfgScale)} />
                  <MetadataItem icon={Calendar} label="Created" value={metadata.createdAt} />
                </div>
                <div className="rounded-xl bg-secondary/50 p-3">
                  <span className="text-xs text-muted-foreground">Sampler</span>
                  <p className="mt-1 text-sm font-medium text-foreground">{metadata.sampler}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto flex gap-3 pt-4">
                <motion.button
                  onClick={handleEditClick}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles className="h-4 w-4" />
                  Edit with AI
                </motion.button>
                <motion.button
                  onClick={() => onDownload(item)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MetadataItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <motion.div
      className="rounded-xl bg-secondary/50 p-3"
      whileHover={{ scale: 1.02, backgroundColor: "hsl(var(--secondary) / 0.7)" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3 w-3" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1 truncate text-sm font-medium text-foreground">{value}</p>
    </motion.div>
  )
}
