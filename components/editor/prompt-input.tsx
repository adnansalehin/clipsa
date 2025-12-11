"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Send, Sparkles, Loader2, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SpeechInput } from "@/components/ui/speech-input"
import { cn } from "@/lib/utils"

interface PromptInputProps {
  onGenerate: (prompt: string) => void
  isGenerating: boolean
  mediaType: "image" | "video"
  value?: string
  onChange?: (value: string) => void
}

const suggestions = [
  "Enhance colors and contrast",
  "Apply cinematic color grading",
  "Add dramatic lighting",
  "Transform to oil painting style",
  "Make it more vibrant",
  "Add depth of field blur",
]

export function PromptInput({ onGenerate, isGenerating, mediaType, value, onChange }: PromptInputProps) {
  const isControlled = value !== undefined && onChange !== undefined
  const [internalPrompt, setInternalPrompt] = useState("")
  const prompt = isControlled ? value : internalPrompt
  const setPrompt = isControlled ? onChange : setInternalPrompt

  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px"
    }
  }, [prompt])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion)
    textareaRef.current?.focus()
  }

  return (
    <div className="relative border-t border-border bg-background/80 backdrop-blur-xl">
      {/* Suggestions - Show when focused and no prompt */}
      <motion.div
        initial={false}
        animate={{
          height: isFocused && !prompt && !isGenerating ? "auto" : 0,
          opacity: isFocused && !prompt && !isGenerating ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="overflow-hidden border-b border-border"
      >
        <div className="px-4 py-3">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
            <Wand2 className="w-3 h-3" />
            Quick suggestions
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs",
                  "bg-muted/50 text-muted-foreground",
                  "border border-transparent",
                  "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  "hover:bg-primary/10 hover:text-primary hover:border-primary/20",
                )}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4">
        <div
          className={cn(
            "relative flex items-end gap-3 p-3 rounded-2xl",
            "bg-muted/30",
            "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            isFocused
              ? "bg-muted/50 shadow-lg shadow-primary/5"
              : "hover:bg-muted/40",
          )}
        >
          {/* Magic Icon */}
          <div
            className={cn(
              "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
              "transition-all duration-300",
              isGenerating ? "bg-primary/20" : "bg-primary/10",
            )}
          >
            <motion.div
              animate={isGenerating ? { rotate: 360 } : { rotate: 0 }}
              transition={isGenerating ? { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" } : {}}
            >
              <Sparkles
                className={cn(
                  "w-4 h-4 transition-colors duration-300",
                  isGenerating ? "text-primary" : "text-primary/60",
                )}
              />
            </motion.div>
          </div>

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder={`Describe how to edit this ${mediaType}...`}
              disabled={isGenerating}
              rows={1}
              className={cn(
                "w-full bg-transparent border-none outline-none resize-none",
                "text-sm text-foreground placeholder:text-muted-foreground",
                "min-h-[24px] max-h-[120px] py-1 pr-10",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            />
            <div className="absolute right-0 bottom-0 flex items-center h-8">
              <SpeechInput value={prompt} onChange={setPrompt} placeholder="" disabled={isGenerating} />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="icon"
            disabled={!prompt.trim() || isGenerating}
            className={cn(
              "shrink-0 h-8 w-8 rounded-lg",
              "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
              prompt.trim() && !isGenerating
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground",
            )}
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>

        {/* Helper Text */}
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Press Enter to generate · Shift + Enter for new line
        </p>
      </form>
    </div>
  )
}
