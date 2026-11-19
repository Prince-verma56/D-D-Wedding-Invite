"use client";

import { LoaderCircle, Pause, Play } from "lucide-react";
import { useMusic } from "./WeddingMusicProvider";

export function HeroMusicToggle() {
  const { state, controller, track } = useMusic();
  const loading = state.status === "loading";
  const active = state.status === "playing" || loading;
  const Icon = loading ? LoaderCircle : active ? Pause : Play;
  return <button
    type="button"
    className="cinematic-hero-introButton hero-music-toggle"
    data-music-control
    aria-label={loading ? "Cancel background music loading" : active ? "Pause background music" : "Play background music"}
    aria-pressed={active}
    disabled={!state.ready || !track}
    onClick={controller.toggle}
  >
    <span className="cinematic-hero-playIcon"><Icon size={15} fill={loading ? "none" : "currentColor"} className={loading ? "music-loading" : undefined} aria-hidden="true" /></span>
    <span>{loading ? "Starting music…" : active ? "Pause music" : "Play music"}</span>
  </button>;
}
