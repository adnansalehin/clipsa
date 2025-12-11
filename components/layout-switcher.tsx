"use client"

import { motion } from "framer-motion"
import { LayoutGrid, LayoutList } from "lucide-react"
import type { LayoutType } from "@/lib/types"

interface LayoutSwitcherProps {
  layout: LayoutType
  onLayoutChange: (layout: LayoutType) => void
}

const layouts = [
  { id: "grid" as const, icon: LayoutGrid, label: "Grid" },
  { id: "list" as const, icon: LayoutList, label: "List" },
]

export function LayoutSwitcher({ layout, onLayoutChange }: LayoutSwitcherProps) {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-secondary/50 p-1 backdrop-blur-sm">
      {layouts.map((item) => {
        const isActive = layout === item.id
        const Icon = item.icon

        return (
          <motion.button
            key={item.id}
            onClick={() => onLayoutChange(item.id)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg"
            whileHover={{ scale: isActive ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={item.label}
          >
            {isActive && (
              <motion.div
                layoutId="activeLayout"
                className="absolute inset-0 rounded-lg bg-card shadow-sm"
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 35,
                }}
              />
            )}
            {!isActive && (
              <motion.div
                className="absolute inset-0 rounded-lg bg-foreground/5 opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
            <motion.div
              className="relative z-10"
              whileHover={{ rotate: isActive ? 0 : 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Icon
                className={`h-4 w-4 transition-colors duration-300 ${isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
              />
            </motion.div>
          </motion.button>
        )
      })}
    </div>
  )
}
