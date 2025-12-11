"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SpeechInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SpeechInput({
  value,
  onChange,
  placeholder = "Click the microphone to start speaking...",
  className,
  disabled = false
}: SpeechInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [transcript, setTranscript] = useState('');
  const latestRecognizedRef = useRef('');

  const commitTranscript = useCallback(
    (recognized: string) => {
      latestRecognizedRef.current = recognized;
      const trimmedRecognized = recognized.trim();
      if (!trimmedRecognized) return;

      const currentValue = value?.trim() ?? '';
      const combinedValue = currentValue ? `${currentValue} ${trimmedRecognized}` : trimmedRecognized;

      onChange(combinedValue);
    },
    [onChange, value],
  );

  // Initialize speech recognition
  const initSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      latestRecognizedRef.current = '';
      setIsListening(true);
      setTranscript('');
      setIsProcessing(false);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const combinedRecognized = `${finalTranscript}${interimTranscript}`.trim();
      setTranscript(combinedRecognized || interimTranscript);
      commitTranscript(combinedRecognized);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setIsProcessing(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsProcessing(false);
      if (latestRecognizedRef.current.trim()) {
        commitTranscript(latestRecognizedRef.current);
      }
    };

    return recognition;
  }, [commitTranscript, value]);

  const startListening = useCallback(async () => {
    if (disabled || isListening) return;

    try {
      setIsProcessing(true);

      // Try ElevenLabs Scribe first (if API key is available)
      const hasElevenLabsKey = !!process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

      if (hasElevenLabsKey) {
        try {
          const response = await fetch('/api/elevenlabs/scribe-token', {
            method: 'POST',
          });

          if (response.ok) {
            const { token } = await response.json();
            // TODO: Implement ElevenLabs Scribe WebSocket connection
            console.log('ElevenLabs Scribe token obtained:', token);
          }
        } catch (error) {
          console.warn('ElevenLabs Scribe not available, falling back to Web Speech API:', error);
        }
      }

      // Fallback to Web Speech API
      const recognition = initSpeechRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
      } else {
        alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsProcessing(false);
    }
  }, [disabled, isListening, initSpeechRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const cancelListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsListening(false);
    setIsProcessing(false);
    setTranscript('');
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={isListening ? stopListening : startListening}
          disabled={disabled || isProcessing}
          className={cn(
            "shrink-0 transition-colors",
            isListening && "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
          )}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isListening ? (
            <Square className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </Button>

        <div className="flex-1 min-w-0">
          {isListening ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="sr-only">Listening...</span>
            </div>
          ) : null}
        </div>

        {isListening && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={cancelListening}
            className="shrink-0"
          >
            <MicOff className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default SpeechInput;