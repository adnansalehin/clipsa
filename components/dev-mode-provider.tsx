"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react"
import { isLocalDevRuntime, isBrowser } from "@/lib/env"

type DevModeContextValue = {
  isDevMode: boolean
  isLocalDev: boolean
  toggleDevMode: () => void
}

const DevModeContext = createContext<DevModeContextValue | null>(null)

export function DevModeProvider({ children }: { children: React.ReactNode }) {
  const isLocal = isLocalDevRuntime()
  const [isDevMode, setIsDevMode] = useState<boolean>(isLocal)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!isBrowser()) return
    const stored = window.localStorage.getItem("clipsa-dev-mode")
    if (stored !== null) {
      setIsDevMode(stored === "true")
    }
    setIsReady(true)
  }, [])

  useEffect(() => {
    if (!isBrowser()) return
    if (!isLocal) {
      window.localStorage.removeItem("clipsa-dev-mode")
      return
    }
    window.localStorage.setItem("clipsa-dev-mode", String(isDevMode))
  }, [isDevMode, isLocal])

  const toggleDevMode = useCallback(() => {
    if (!isLocal) return
    setIsDevMode((prev) => !prev)
  }, [isLocal])

  const value = useMemo<DevModeContextValue>(
    () => ({
      isDevMode: isLocal ? isDevMode : false,
      isLocalDev: isLocal,
      toggleDevMode,
    }),
    [isDevMode, isLocal, toggleDevMode],
  )

  if (!isReady && isLocal) {
    return null
  }

  return <DevModeContext.Provider value={value}>{children}</DevModeContext.Provider>
}

export function useDevMode() {
  const ctx = useContext(DevModeContext)
  if (!ctx) {
    throw new Error("useDevMode must be used within DevModeProvider")
  }
  return ctx
}
