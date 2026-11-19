"use client";

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";
import { weddingPlaylist } from "@/data/wedding-playlist";
import { WeddingMusicController } from "@/lib/wedding-music";

/** Mounted only by the root music player; scrolling never recreates its audio. */
export function useWeddingMusic(audioRef: RefObject<HTMLAudioElement | null>) {
  const [controller] = useState(() => new WeddingMusicController(weddingPlaylist));
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getServerSnapshot);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let storage: Storage | null = null;
    try { storage = window.localStorage; } catch { /* Playback also works without storage. */ }
    return controller.attach(audio, storage);
  }, [audioRef, controller]);

  return { state, controller, track: weddingPlaylist[state.index], tracks: weddingPlaylist };
}

export type WeddingMusic = ReturnType<typeof useWeddingMusic>;
