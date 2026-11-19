"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useWeddingMusic, type WeddingMusic } from "@/hooks/useWeddingMusic";

const MusicContext = createContext<WeddingMusic | null>(null);

/** The hero and floating controls share one audio element for the whole site. */
export function WeddingMusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const music = useWeddingMusic(audioRef);
  const { state, controller } = music;

  useEffect(() => {
    if (state.status !== "blocked" || state.preference === "paused" || state.preference === "disabled") return;
    const onInteraction = (event: MouseEvent | KeyboardEvent) => {
      if (!event.isTrusted || (event instanceof KeyboardEvent && (event.repeat || !["Enter", " "].includes(event.key)))) return;
      // Music buttons handle their own gesture. Avoid starting then immediately
      // pausing in the same click, and leave typing in guest forms undisturbed.
      if (event.target instanceof Element && event.target.closest("[data-music-control], .wedding-music, input, textarea, select")) return;
      document.removeEventListener("click", onInteraction);
      document.removeEventListener("keydown", onInteraction);
      controller.resumeAutoplay();
    };
    document.addEventListener("click", onInteraction);
    document.addEventListener("keydown", onInteraction);
    return () => {
      document.removeEventListener("click", onInteraction);
      document.removeEventListener("keydown", onInteraction);
    };
  }, [state.status, state.preference, controller]);

  return <MusicContext.Provider value={music}>
    <audio ref={audioRef} preload="none" aria-hidden="true" />
    {children}
  </MusicContext.Provider>;
}

export function useMusic() {
  const music = useContext(MusicContext);
  if (!music) throw new Error("Music controls must be inside WeddingMusicProvider.");
  return music;
}
