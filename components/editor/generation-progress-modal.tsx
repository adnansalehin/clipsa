"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Film, Music, Wand2, Sparkles, X, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Scene } from "@/lib/types"

interface GenerationProgressModalProps {
  isOpen: boolean
  progress: number
  currentPhase: "analyzing" | "scene1" | "scene2" | "scene3" | "audio" | "finalizing"
  scenes: Scene[]
  estimatedTime?: number
  onCancel?: () => void
}

const phaseConfig = {
  analyzing: {
    label: "Analyzing source image",
    icon: Wand2,
    description: "Understanding composition and content...",
  },
  scene1: {
    label: "Generating Scene 1",
    icon: Film,
    description: "Creating motion and transformations...",
  },
  scene2: {
    label: "Generating Scene 2",
    icon: Film,
    description: "Building visual continuity...",
  },
  scene3: {
    label: "Generating Scene 3",
    icon: Film,
    description: "Rendering final scene details...",
  },
  audio: {
    label: "Adding audio",
    icon: Music,
    description: "Generating background music and narration...",
  },
  finalizing: {
    label: "Finalizing video",
    icon: Sparkles,
    description: "Combining scenes and rendering output...",
  },
}

const phases = ["analyzing", "scene1", "scene2", "scene3", "audio", "finalizing"] as const

export function GenerationProgressModal({
  isOpen,
  progress,
  currentPhase,
  scenes,
  estimatedTime,
  onCancel,
}: GenerationProgressModalProps) {
  const currentPhaseIndex = phases.indexOf(currentPhase)
  const config = phaseConfig[currentPhase]
  const Icon = config.icon

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ backdropFilter: "blur(0px)" }}
            animate={{ backdropFilter: "blur(20px)" }}
            exit={{ backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-background/80"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 w-full max-w-lg mx-4 p-8 rounded-2xl bg-card border border-border shadow-2xl"
          >
            {/* Cancel Button */}
            {onCancel && (
              <button
                onClick={onCancel}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors duration-200"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}

            {/* Icon Animation */}
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"
              >
                <Icon className="w-8 h-8 text-primary" />
              </motion.div>
            </div>

            {/* Phase Info */}
            <div className="text-center mb-8">
              <motion.h3
                key={currentPhase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-lg font-semibold text-foreground mb-2"
              >
                {config.label}
              </motion.h3>
              <motion.p
                key={`${currentPhase}-desc`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-sm text-muted-foreground"
              >
                {config.description}
              </motion.p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted-foreground">Overall Progress</span>
                <span className="text-xs font-medium text-foreground tabular-nums">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>

            {/* Phase Steps */}
            <div className="space-y-2 mb-6">
              {phases.slice(0, Math.max(3, scenes.length + 2)).map((phase, index) => {
                const phaseConf = phaseConfig[phase]
                const PhaseIcon = phaseConf.icon
                const isComplete = index < currentPhaseIndex
                const isCurrent = index === currentPhaseIndex
                const isPending = index > currentPhaseIndex

                return (
                  <motion.div
                    key={phase}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg",
                      isCurrent && "bg-primary/5",
                      isComplete && "opacity-60",
                    )}
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                        isComplete && "bg-primary/20 text-primary",
                        isCurrent && "bg-primary text-primary-foreground",
                        isPending && "bg-muted text-muted-foreground",
                      )}
                    >
                      {isComplete ? (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.3 }}
                            d="M5 13l4 4L19 7"
                          />
                        </motion.svg>
                      ) : (
                        <PhaseIcon className="w-3 h-3" />
                      )}
                    </div>

                    <span
                      className={cn(
                        "text-sm",
                        isComplete && "text-muted-foreground line-through",
                        isCurrent && "text-foreground font-medium",
                        isPending && "text-muted-foreground",
                      )}
                    >
                      {phaseConf.label}
                    </span>

                    {isCurrent && (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                        className="ml-auto flex items-center gap-1"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animation-delay-200" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animation-delay-400" />
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>

            {/* Estimated Time */}
            {estimatedTime && estimatedTime > 0 && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Estimated time remaining: {formatTime(estimatedTime)}</span>
              </div>
            )}

            {/* Video generation note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 p-3 rounded-lg bg-muted/30 border border-border"
            >
              <p className="text-xs text-center text-muted-foreground">
                Video generation typically takes 1-2 minutes. You can cancel anytime.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
