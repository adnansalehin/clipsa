"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Tab {
  id: "all" | "images" | "videos"
  label: string
  icon: LucideIcon
  count: number
}

interface MediaTabsProps {
  tabs: Tab[]
  activeTab: "all" | "images" | "videos"
  onTabChange: (tab: "all" | "images" | "videos") => void
}

export function MediaTabs({ tabs, activeTab, onTabChange }: MediaTabsProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)

  return (
    <div className="relative flex items-center gap-1 rounded-2xl bg-secondary/50 p-1.5 backdrop-blur-sm">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        const isHovered = hoveredTab === tab.id && !isActive
        const Icon = tab.icon

        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            onMouseEnter={() => setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
            className="relative z-10 flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium"
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {/* Active background pill */}
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-xl bg-card shadow-sm"
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 35,
                }}
              />
            )}
            <motion.div
              className="absolute inset-0 rounded-xl bg-foreground/5 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            />
            <span className="relative z-10 flex items-center gap-2">
              <motion.div
                animate={{
                  rotate: isHovered ? 5 : 0,
                  scale: isHovered ? 1.1 : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors duration-300",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                />
              </motion.div>
              <motion.span
                animate={{ x: isHovered ? 2 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={cn("transition-colors duration-300", isActive ? "text-foreground" : "text-muted-foreground")}
              >
                {tab.label}
              </motion.span>
              <motion.span
                animate={{ scale: isHovered ? 1.05 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={cn(
                  "ml-1 rounded-md px-2 py-0.5 text-xs transition-all duration-300",
                  isActive ? "bg-secondary text-secondary-foreground" : "bg-muted/50 text-muted-foreground",
                )}
              >
                {tab.count}
              </motion.span>
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
