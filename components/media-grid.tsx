"use client"

import { motion, AnimatePresence } from "framer-motion"
import { MediaCard } from "./media-card"
import { VideoCard } from "./video-card"
import type { LayoutType } from "@/lib/types"

interface MediaGridProps {
  items: any[]
  type: "all" | "images" | "videos"
  layout: LayoutType
  onMaximize: (item: any) => void
  onDownload: (item: any) => void
  onEdit: (item: any) => void
  onDelete?: (item: any) => void
  deletingIds?: Set<string>
}

const smoothEase = [0.22, 1, 0.36, 1] as const

export function MediaGrid({
  items,
  type,
  layout,
  onMaximize,
  onDownload,
  onEdit,
  onDelete,
  deletingIds,
}: MediaGridProps) {
  const getGridClasses = () => {
    switch (layout) {
      case "list":
        return "flex flex-col gap-3"
      default:
        return "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    }
  }

  const isImageItem = (item: any): boolean => {
    if (type === "all") {
      return item._type === "image"
    }
    return type === "images"
  }

  return (
    <div className={`${getGridClasses()} transition-all duration-300 ease-out`}>
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={`${type}-${item.id}-${item._type || type}`}
            layout="position"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            // exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{
              duration: 2,
              delay: index * 0.05,
              ease: smoothEase,
              layout: {
                duration: 1,
                ease: smoothEase,
              },
            }}
          >
            {isImageItem(item) ? (
              <MediaCard
                item={item}
                layout={layout}
                onMaximize={onMaximize}
                onDownload={onDownload}
                onEdit={onEdit}
                onDelete={onDelete}
                isDeleting={deletingIds?.has(String(item.id))}
              />
            ) : (
              <VideoCard
                item={item}
                layout={layout}
                onMaximize={onMaximize}
                onDownload={onDownload}
                onEdit={onEdit}
                onDelete={onDelete}
                isDeleting={deletingIds?.has(String(item.id))}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
