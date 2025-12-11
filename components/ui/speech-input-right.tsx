'use client'

import React from 'react'
import { SpeechInput } from './speech-input'
import { cn } from '@/lib/utils'

type TextareaWithSpeechInputRightProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  children: React.ReactElement
}

/**
 * A wrapper that embeds a SpeechInput overlay to the right bottom of a textarea-like input.
 * The wrapper clones the provided child and injects value/onChange so it remains controlled
 * by the parent, while SpeechInput handles live dictation updates.
 */
export function SpeechInputRight({
  value,
  onChange,
  placeholder = "Listening...",
  disabled,
  className,
  children,
}: TextareaWithSpeechInputRightProps) {
  const clonedChild = React.cloneElement(children as React.ReactElement<{ value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; disabled?: boolean }>, {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange((e.target as HTMLInputElement | HTMLTextAreaElement).value),
    disabled,
  })

  return (
    <div className={cn("relative", className)}>
      {clonedChild}
      <div className="absolute right-3 bottom-3">
        <SpeechInput value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} />
      </div>
    </div>
  )
}

export default SpeechInputRight
