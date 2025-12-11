"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MediaTabs } from "./media-tabs"
import { MediaGrid } from "./media-grid"
import { ThemeToggle } from "./theme-toggle"
import { LayoutSwitcher } from "./layout-switcher"
import type { LayoutType } from "@/lib/types"
import { ImageLightbox } from "./image-lightbox"
import { VideoLightbox } from "./video-lightbox"
import { ImageIcon, Video, Search, X, Plus, LayoutGrid, Film } from "lucide-react"
import { SpeechInputRight } from "@/components/ui/speech-input-right"
import { apiUtils } from "@/lib/api/client"
import { images, videos, type ImageItem, type VideoItem } from "@/lib/sample-data"
import { useMediaUpload } from "@/hooks/use-media-upload"
import { DevModeToggle } from "./dev-mode-toggle"
import { useDevMode } from "@/components/dev-mode-provider"


export function MediaDashboard() {
  const [activeTab, setActiveTab] = useState<"all" | "images" | "videos">("all")
  const [layout, setLayout] = useState<LayoutType>("grid")
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [fetchedImages, setFetchedImages] = useState<ImageItem[]>([])
  const [fetchedVideos, setFetchedVideos] = useState<VideoItem[]>([])
  const [uploadedImages, setUploadedImages] = useState<ImageItem[]>([])
  const [uploadedVideos, setUploadedVideos] = useState<VideoItem[]>([])
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Lightbox states
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null)
  const [imageLightboxOpen, setImageLightboxOpen] = useState(false)
  const [videoLightboxOpen, setVideoLightboxOpen] = useState(false)
  const { isDevMode } = useDevMode()

  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark)
    setIsDark(shouldBeDark)
    document.documentElement.classList.toggle("dark", shouldBeDark)
  }, [])

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await fetch("/api/media")
        if (!response.ok) {
          console.error("Failed to fetch media list")
          return
        }
        const { items } = await response.json()
        const remoteImages: ImageItem[] = []
        const remoteVideos: VideoItem[] = []

        items?.forEach((item: any) => {
          const isVideo = item.type === "video" || item.contentType?.startsWith("video/")
          const basePrompt = item.title || item.description || item.filename || "Uploaded media"
          const baseCategory = "Uploaded"
          const idValue = item.id ?? item.fileId ?? item.filename ?? Math.random()

          if (isVideo) {
            remoteVideos.push({
              id: idValue,
              thumbnail: item.thumbnail || item.url,
              prompt: basePrompt,
              duration: item.duration || "0:00",
              category: baseCategory,
              metadata: {
                model: "Uploaded",
                resolution: "Unknown",
                fps: 30,
                codec: item.contentType || "video/mp4",
                createdAt: item.uploadedAt || new Date().toLocaleDateString(),
              },
            })
          } else {
            remoteImages.push({
              id: idValue,
              src: item.url,
              prompt: basePrompt,
              category: baseCategory,
              metadata: {
                model: "Uploaded",
                dimensions: "Unknown",
                seed: "N/A",
                steps: 0,
                cfgScale: 0,
                sampler: "N/A",
                createdAt: item.uploadedAt || new Date().toLocaleDateString(),
              },
            })
          }
        })

        setFetchedImages(remoteImages)
        setFetchedVideos(remoteVideos)
      } catch (error) {
        console.error("Media fetch error:", error)
      }
    }

    fetchMedia()
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    document.documentElement.classList.toggle("dark", newTheme)
    localStorage.setItem("theme", newTheme ? "dark" : "light")
  }

  const sampleImages = isDevMode ? images : []
  const sampleVideos = isDevMode ? videos : []

  const allImages = [...fetchedImages, ...sampleImages, ...uploadedImages]
  const allVideos = [...fetchedVideos, ...sampleVideos, ...uploadedVideos]

  const filteredImages = allImages.filter(
    (img) =>
      img.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredVideos = allVideos.filter(
    (vid) =>
      vid.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vid.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleMaximize = useCallback((item: ImageItem | VideoItem) => {
    if ("src" in item) {
      setSelectedImage(item as ImageItem)
      setImageLightboxOpen(true)
    } else {
      setSelectedVideo(item as VideoItem)
      setVideoLightboxOpen(true)
    }
  }, [])

  const handleDownload = useCallback(async (item: ImageItem | VideoItem) => {
    const isImage = "src" in item
    const src = isImage ? (item as ImageItem).src : (item as VideoItem).thumbnail
    const filename = `media-${item.id}.${isImage ? "png" : "mp4"}`

    try {
      await apiUtils.downloadMedia(src, filename)
    } catch (error) {
      console.error("Download failed:", error)
      // Fallback: open in new tab
      window.open(src, "_blank")
    }
  }, [])

  const handleEdit = useCallback((item: ImageItem | VideoItem) => {
    const isImage = "src" in item
    // Store media item in sessionStorage for editor to pick up
    const mediaData = {
      id: String(item.id),
      name: item.prompt.slice(0, 30) + "...",
      type: isImage ? "image" : "video",
      url: isImage ? (item as ImageItem).src : (item as VideoItem).thumbnail,
      thumbnail: isImage ? (item as ImageItem).src : (item as VideoItem).thumbnail,
      prompt: item.prompt,
    }
    sessionStorage.setItem("editorInitialMedia", JSON.stringify(mediaData))
    setImageLightboxOpen(false)
    setVideoLightboxOpen(false)
    router.push("/editor")
  }, [router])

  const handleDelete = useCallback(
    async (item: ImageItem | VideoItem) => {
      const idValue = item.id
      if (typeof idValue !== "string") {
        console.warn("Delete is available for uploaded media only.")
        return
      }

      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.add(idValue)
        return next
      })

      try {
        const response = await fetch(`/api/media/${idValue}`, { method: "DELETE" })
        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}))
          throw new Error(errorBody.error || "Failed to delete media")
        }

        setFetchedImages((prev) => prev.filter((img) => String(img.id) !== idValue))
        setFetchedVideos((prev) => prev.filter((vid) => String(vid.id) !== idValue))
        setUploadedImages((prev) => prev.filter((img) => String(img.id) !== idValue))
        setUploadedVideos((prev) => prev.filter((vid) => String(vid.id) !== idValue))
      } catch (error) {
        console.error("Delete failed:", error)
      } finally {
        setDeletingIds((prev) => {
          const next = new Set(prev)
          next.delete(idValue)
          return next
        })
      }
    },
    []
  )

  const { handleUpload: uploadFiles } = useMediaUpload({
    description: 'Uploaded media',
    onSuccess: (mediaItems) => {
      // Convert MediaItem[] to ImageItem[] and VideoItem[]
      const newImages: ImageItem[] = []
      const newVideos: VideoItem[] = []

      mediaItems.forEach((item) => {
        const idValue = String(item.id)
        const promptValue = item.prompt || item.name.replace(/\.[^/.]+$/, '')

        if (item.type === 'video') {
          newVideos.push({
            id: idValue,
            thumbnail: item.url,
            prompt: promptValue,
            duration: item.duration?.toString() || '0:00',
            category: 'Uploaded',
            metadata: {
              model: item.metadata?.model || 'Uploaded',
              resolution: 'Unknown',
              fps: 30,
              codec: 'video/mp4',
              createdAt: item.metadata?.createdAt || new Date().toLocaleDateString(),
            },
          })
        } else {
          newImages.push({
            id: idValue,
            src: item.url,
            prompt: promptValue,
            category: 'Uploaded',
            metadata: {
              model: item.metadata?.model || 'Uploaded',
              dimensions: 'Unknown',
              seed: 'N/A',
              steps: 0,
              cfgScale: 0,
              sampler: 'N/A',
              createdAt: item.metadata?.createdAt || new Date().toLocaleDateString(),
            },
          })
        }
      })

      if (newImages.length > 0) {
        setUploadedImages((prev) => [...newImages, ...prev])
      }
      if (newVideos.length > 0) {
        setUploadedVideos((prev) => [...newVideos, ...prev])
      }
    },
    onError: (error) => {
      console.error('Upload error:', error)
      // Could show a toast notification here
    },
  })

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (!files) return

      uploadFiles(files).finally(() => {
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      })
    },
    [uploadFiles]
  )

  if (!mounted) {
    return null
  }

  const tabs = [
    { id: "all" as const, label: "All", icon: LayoutGrid, count: filteredImages.length + filteredVideos.length },
    { id: "images" as const, label: "Images", icon: ImageIcon, count: filteredImages.length },
    { id: "videos" as const, label: "Videos", icon: Video, count: filteredVideos.length },
  ]

  const getDisplayItems = () => {
    if (activeTab === "all") {
      const combinedItems = [
        ...filteredImages.map((img) => ({ ...img, _type: "image" as const })),
        ...filteredVideos.map((vid) => ({ ...vid, _type: "video" as const })),
      ]
      return combinedItems
    }
    return activeTab === "images" ? filteredImages : filteredVideos
  }

  const displayItems = getDisplayItems()
  const isEmpty = displayItems.length === 0

  return (
    <div className="min-h-screen bg-background transition-colors duration-700 ease-out">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Gallery</h1>
            <p className="mt-1 text-muted-foreground">Your AI-generated media collection</p>
          </div>
          <div className="flex items-center gap-3">
            <DevModeToggle />
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 flex flex-col sm:flex-row gap-3"
        >
          {/* Search Input */}
          <div className="relative flex-1">
            <motion.div
              animate={{
                scale: isSearchFocused ? 1.02 : 1,
                boxShadow: isSearchFocused ? "0 0 0 2px hsl(var(--primary) / 0.2)" : "0 0 0 0px transparent",
              }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-xl overflow-hidden"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-300" />
              <SpeechInputRight
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder=""
                disabled={false}
                className="w-full"
              >
                <input
                  type="text"
                  placeholder="Search by prompt or category..."
                  // value/onChange are injected by the wrapper
                  className="w-full h-12 pl-11 pr-10 rounded-xl bg-card border-none text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-300"
                />
              </SpeechInputRight>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </motion.button>
              )}
            </motion.div>
          </div>

          {/* Image to Video Button */}
          <Link href="/image-to-video">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-primary text-primary-foreground font-medium transition-colors hover:bg-primary/90 cursor-pointer"
            >
              <Film className="h-4 w-4" />
              <span className="hidden sm:inline">Image → Video</span>
              <span className="sm:hidden">Video</span>
            </motion.div>
          </Link>

          {/* Upload Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-foreground text-background font-medium transition-colors hover:bg-foreground/90"
          >
            <Plus className="h-4 w-4" />
            <span>Upload</span>
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 flex flex-wrap items-center justify-between gap-4"
        >
          <MediaTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          <LayoutSwitcher layout={layout} onLayoutChange={setLayout} />
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {/* Empty state */}
          {isEmpty ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground mb-1">No results found</p>
              <p className="text-muted-foreground text-sm">Try adjusting your search or upload new media</p>
            </motion.div>
          ) : (
            <MediaGrid
              items={displayItems}
              type={activeTab}
              layout={layout}
              onMaximize={handleMaximize}
              onDownload={handleDownload}
              onEdit={handleEdit}
              onDelete={handleDelete}
              deletingIds={deletingIds}
            />
          )}
        </motion.div>

        {/* Lightboxes */}
        <ImageLightbox
          item={selectedImage}
          isOpen={imageLightboxOpen}
          onClose={() => setImageLightboxOpen(false)}
          onDownload={handleDownload}
          onEdit={handleEdit}
        />
        <VideoLightbox
          item={selectedVideo}
          isOpen={videoLightboxOpen}
          onClose={() => setVideoLightboxOpen(false)}
          onDownload={handleDownload}
          onEdit={handleEdit}
        />
      </motion.div>
    </div>
  )
}
