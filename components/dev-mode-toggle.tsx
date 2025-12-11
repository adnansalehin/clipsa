"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useDevMode } from "./dev-mode-provider"

export function DevModeToggle() {
  const { isDevMode, isLocalDev, toggleDevMode } = useDevMode()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isLocalDev || !mounted) return null

  return (
    <div className="flex items-center gap-2 rounded-full bg-muted/60 px-3 py-2 text-xs font-medium text-foreground shadow-sm">
      <Sparkles className="h-3.5 w-3.5 text-primary" />
      <span className="hidden sm:inline">Dev mode</span>
      <Badge variant={isDevMode ? "default" : "secondary"} className="text-[10px]">
        {isDevMode ? "mocked" : "real api"}
      </Badge>
      <Switch checked={isDevMode} onCheckedChange={toggleDevMode} />
    </div>
  )
}
