"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ResizablePanelProps {
  children: React.ReactNode
  side: "left" | "right"
  defaultWidth: number
  minWidth: number
  maxWidth: number
  isOpen: boolean
  className?: string
}

export function ResizablePanel({
  children,
  side,
  defaultWidth,
  minWidth,
  maxWidth,
  isOpen,
  className,
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isDragging, setIsDragging] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const startWidthRef = useRef(defaultWidth)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      startXRef.current = e.clientX
      startWidthRef.current = width
    },
    [width],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return

      const delta = side === "left" ? e.clientX - startXRef.current : startXRef.current - e.clientX

      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidthRef.current + delta))
      setWidth(newWidth)
    },
    [isDragging, side, minWidth, maxWidth],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <motion.div
      ref={panelRef}
      initial={false}
      animate={{ width: isOpen ? width : 64 }}
      transition={{ duration: isDragging ? 0 : 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={cn("relative flex flex-col h-full flex-shrink-0", className)}
    >
      {children}

      {/* Resize Handle */}
      {isOpen && (
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            "absolute top-0 bottom-0 w-2 cursor-col-resize z-50",
            "transition-colors duration-200",
            "hover:bg-primary/20",
            isDragging && "bg-primary/30",
            side === "left" ? "-right-1" : "-left-1",
          )}
        >
          {/* Visual indicator on hover/drag */}
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-1 h-16 rounded-full",
              "transition-all duration-200",
              side === "left" ? "left-1/2 -translate-x-1/2" : "left-1/2 -translate-x-1/2",
              isDragging ? "bg-primary scale-y-150" : "bg-border hover:bg-primary/50",
            )}
          />
        </div>
      )}
    </motion.div>
  )
}
