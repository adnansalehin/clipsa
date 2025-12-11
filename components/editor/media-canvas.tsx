"use client"

import type React from "react"
import NextImage from "next/image"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ImageIcon, Film, Sparkles, Play, Pause, Volume2, VolumeX, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MediaItem, GenerationSettings } from "@/lib/types"

interface MediaCanvasProps {
  media: MediaItem | null
  isGenerating: boolean
  progress: number
  settings: GenerationSettings
  showSourceBadge?: boolean // New prop for Image-to-Video mode
}

export function MediaCanvas({ media, isGenerating, progress, settings, showSourceBadge }: MediaCanvasProps) {
  const [displayedUrl, setDisplayedUrl] = useState<string | null>(null)
  const [mediaLoaded, setMediaLoaded] = useState(false)
  const [currentMediaType, setCurrentMediaType] = useState<"image" | "video" | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const preloadMedia = useCallback((url: string, type: "image" | "video"): Promise<void> => {
    return new Promise((resolve) => {
      if (type === "image") {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => resolve()
        img.onerror = () => resolve()
        img.src = url
      } else {
        const video = document.createElement("video")
        video.oncanplaythrough = () => resolve()
        video.onerror = () => resolve()
        video.preload = "auto"
        video.src = url
        video.load()
      }
    })
  }, [])

  useEffect(() => {
    if (!media) {
      setDisplayedUrl(null)
      setCurrentMediaType(null)
      return
    }

    const newUrl = media.url

    if (newUrl === displayedUrl) {
      return
    }

    preloadMedia(newUrl, media.type).then(() => {
      setCurrentMediaType(media.type)
      setDisplayedUrl(newUrl)
      setMediaLoaded(true)
    })
  }, [media, displayedUrl, preloadMedia])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration || 0)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener("timeupdate", updateTime)
    video.addEventListener("loadedmetadata", updateDuration)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)

    return () => {
      video.removeEventListener("timeupdate", updateTime)
      video.removeEventListener("loadedmetadata", updateDuration)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
    }
  }, [displayedUrl, currentMediaType])

  useEffect(() => {
    const video = videoRef.current
    if (!video || currentMediaType !== "video" || !displayedUrl) return

    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)

    const handleCanPlay = () => {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false)
        })
    }

    const handleError = () => {
      setIsPlaying(false)
      setMediaLoaded(false)
    }

    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("error", handleError)

    return () => {
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("error", handleError)
    }
  }, [displayedUrl, currentMediaType])

  const handleMouseMove = () => {
    if (currentMediaType !== "video") return

    setShowControls(true)

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 2000)
  }

  const togglePlayPause = () => {
    const video = videoRef.current
    if (!video || !displayedUrl) return

    if (video.paused) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const time = Number.parseFloat(e.target.value)
    video.currentTime = time
    setCurrentTime(time)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const generatingBlur = isGenerating && progress < 100 ? Math.max(0, 24 - (progress / 100) * 24) : 0

  if (!media) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Select media from the library</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      className="h-full flex items-center justify-center p-4 md:p-8 relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Background Ambient Effect */}
      <motion.div
        initial={false}
        animate={{ opacity: isGenerating ? 0.6 : 0 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 pointer-events-none"
      >
        {displayedUrl && currentMediaType === "image" && (
          <NextImage
            src={displayedUrl || "/placeholder.svg"}
            alt=""
            fill
            className="object-cover blur-3xl scale-110 opacity-30"
          />
        )}
      </motion.div>

      {/* Main Media Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 1,
          scale: isGenerating ? 0.98 : 1,
        }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className={cn("relative max-w-4xl w-full rounded-2xl overflow-hidden", "shadow-2xl shadow-background/50")}
        style={{
          aspectRatio: settings.aspectRatio.replace(":", "/"),
        }}
      >
        {/* Current Media Layer */}
        <div
          className="absolute inset-0 z-0 transition-[filter] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            filter: isGenerating && progress < 100 ? `blur(${generatingBlur}px)` : "blur(0px)",
          }}
        >
          {currentMediaType === "image" ? (
            <NextImage
              src={displayedUrl || media.url}
              alt={media.name}
              fill
              className="object-cover"
              onLoad={() => setMediaLoaded(true)}
            />
          ) : (
            displayedUrl && (
              <video
                ref={videoRef}
                key={displayedUrl}
                src={displayedUrl}
                className="w-full h-full object-cover"
                muted={isMuted}
                loop
                playsInline
                onCanPlayThrough={() => setMediaLoaded(true)}
                onClick={togglePlayPause}
              />
            )
          )}
        </div>

        {/* Video Controls */}
        {currentMediaType === "video" && !isGenerating && (
          <AnimatePresence>
            {(showControls || !isPlaying) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 z-10 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none"
              >
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlayPause}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center pointer-events-auto hover:bg-primary/10 transition-colors duration-300"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-foreground fill-foreground" />
                  ) : (
                    <Play className="w-6 h-6 text-foreground fill-foreground ml-1" />
                  )}
                </motion.button>

                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 pointer-events-auto">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-foreground/80 tabular-nums min-w-[40px]">
                      {formatTime(currentTime)}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="flex-1 h-1 bg-foreground/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                    />
                    <span className="text-xs text-foreground/80 tabular-nums min-w-[40px] text-right">
                      {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center justify-end">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleMute}
                      className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-primary/10 transition-colors duration-300"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-foreground" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-foreground" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Generation Overlay */}
        <AnimatePresence>
          {isGenerating && progress < 100 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center"
            >
              <div
                className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/40 to-background/70"
                style={{ opacity: Math.max(0, 1 - (progress / 100) * 0.7) }}
              />

              <div
                className="absolute inset-0 shimmer-overlay"
                style={{ opacity: Math.max(0, 1 - (progress / 100) * 0.9) }}
              />

              <div className="relative z-10 text-center space-y-4 px-4">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                >
                  {media.type === "video" ? (
                    <Film className="w-10 h-10 text-foreground/80 mx-auto" />
                  ) : (
                    <Sparkles className="w-10 h-10 text-foreground/80 mx-auto" />
                  )}
                </motion.div>

                <div className="space-y-2">
                  <p className="text-lg font-medium text-foreground/90">
                    {media.type === "video" ? "Generating Video" : "Generating Image"}
                  </p>
                  <p className="text-sm text-foreground/60">
                    {progress < 30
                      ? "Analyzing content..."
                      : progress < 60
                        ? "Applying transformations..."
                        : progress < 90
                          ? "Refining details..."
                          : "Finalizing..."}
                  </p>
                </div>

                <div className="w-48 mx-auto">
                  <div className="h-1 bg-foreground/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="h-full bg-foreground/60 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-foreground/40 tabular-nums mt-2">{Math.round(progress)}%</p>
                </div>

                {media.type === "video" && progress < 50 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 px-4 py-2 rounded-full bg-foreground/5 border border-foreground/10"
                  >
                    <p className="text-xs text-foreground/50">Videos take longer to process</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Border */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl pointer-events-none z-30",
            "ring-1 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]",
            isGenerating ? "ring-foreground/20" : "ring-border",
          )}
        />
      </motion.div>

      {/* Media Type Badge - updated for showSourceBadge */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: isGenerating ? 0.5 : 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={cn(
          "absolute top-4 left-4 md:top-8 md:left-8 px-3 py-1.5 rounded-full",
          "bg-background/80 backdrop-blur-sm border border-border",
          "flex items-center gap-2",
        )}
      >
        {showSourceBadge ? (
          <>
            <Video className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground">Video Source</span>
          </>
        ) : media.type === "video" ? (
          <>
            <Film className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground capitalize">{media.type}</span>
          </>
        ) : (
          <>
            <ImageIcon className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground capitalize">{media.type}</span>
          </>
        )}
      </motion.div>
    </div>
  )
}
