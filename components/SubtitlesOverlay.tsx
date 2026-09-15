"use client";

import React, { useState, useEffect, useRef } from 'react';
import { formatProperSubtitles } from '../lib/subtitleUtils';

interface SubtitlesOverlayProps {
  subtitles: string;
  isSpeaking?: boolean;
}

export default function SubtitlesOverlay({ subtitles, isSpeaking = false }: SubtitlesOverlayProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const raw = (subtitles || "").trim();
    // Exclude standby prompts or empty text from displaying as movie captions
    const isPlaceholder = !raw || 
      raw.toLowerCase().includes("start the mic") ||
      raw === "Start the mic to translate...";

    if (!isPlaceholder) {
      const formatted = formatProperSubtitles(raw, true);
      if (formatted) {
        setDisplayedText(formatted);
        setIsVisible(true);
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
          hideTimerRef.current = null;
        }
        // Comfortable cinema reading duration (4.5s) after speech finishes
        hideTimerRef.current = setTimeout(() => {
          setIsVisible(false);
          hideTimerRef.current = null;
        }, 4500);
        return;
      }
    }

    // If input cleared or empty, gracefully fade out
    if (displayedText && !hideTimerRef.current) {
      hideTimerRef.current = setTimeout(() => {
        setIsVisible(false);
        setDisplayedText("");
        hideTimerRef.current = null;
      }, 4000);
    }
  }, [subtitles]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (!displayedText) return null;

  return (
    <div 
      className={`absolute bottom-28 sm:bottom-32 md:bottom-36 landscape:bottom-20 inset-x-0 flex flex-col items-center z-[100] pointer-events-none px-3 sm:px-6 transition-opacity duration-300 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Cinema-Grade Movie Subtitle Capsule - Stable, High-Contrast, No Layout Jitter */}
      <div 
        className="bg-black/85 backdrop-blur-xl px-6 py-2.5 sm:px-9 sm:py-3.5 landscape:py-2 landscape:px-5 rounded-2xl border border-white/20 shadow-[0_14px_45px_rgba(0,0,0,0.85)] max-w-[92%] sm:max-w-[80%] md:max-w-[72%] max-h-[18vh] sm:max-h-[22vh] landscape:max-h-[18vh] overflow-y-auto no-scrollbar pointer-events-auto select-none flex flex-col items-center justify-center text-center"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <p
          className="text-base sm:text-2xl md:text-3xl landscape:text-lg font-semibold text-center leading-relaxed tracking-wide text-white drop-shadow-md select-none font-sans"
          style={{ 
            textShadow: '0 2px 4px rgba(0,0,0,0.95), 0 0 16px rgba(0,0,0,0.85), 0 1px 2px #000' 
          }}
        >
          {displayedText}
        </p>
      </div>
    </div>
  );
}

