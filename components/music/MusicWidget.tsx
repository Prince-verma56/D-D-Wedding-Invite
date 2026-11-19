import { ChevronDown, ChevronUp, VolumeX } from "lucide-react";
import type { RefObject } from "react";
import type { WeddingMusic } from "@/hooks/useWeddingMusic";
import { AudioVisualizer } from "./AudioVisualizer";
import { PlayButton } from "./PlaybackControls";

export function MusicWidget({ music, open, toggle, expandRef }: { music: WeddingMusic; open: boolean; toggle: () => void; expandRef: RefObject<HTMLButtonElement | null> }) {
  const { state, controller, track } = music;
  if (state.preference === "disabled") return <button ref={expandRef} type="button" className="music-enable" onClick={() => void controller.play()} aria-label="Enable wedding music"><VolumeX size={16} aria-hidden="true" /><span>Music off · Enable</span></button>;
  const invitation = !state.hasPlayed && (state.status === "idle" || state.status === "blocked");
  return <div className={`music-widget${invitation ? " music-widget-invitation" : ""}`}>
    <PlayButton music={music} compact />
    <button ref={expandRef} type="button" className="music-widget-details" onClick={toggle} aria-expanded={open} aria-controls="wedding-music-panel" aria-label={open ? "Collapse music player" : "Expand music player"}>
      <span className="music-widget-copy">
        {invitation ? <><span className="music-invitation-title">A little music, with love</span><span className="music-widget-label">Tap to play music</span></> : <>
          <span className="music-widget-label">{state.status === "error" ? "Music unavailable" : state.status === "loading" ? "Loading your soundtrack…" : state.status === "playing" ? "Wedding music · Playing" : "Wedding music · Paused"}</span>
          <span className="music-widget-title"><AudioVisualizer playing={state.status === "playing"} /><span>{track?.title || "Our wedding soundtrack"}</span></span>
        </>}
      </span>
      {open ? <ChevronDown size={16} aria-hidden="true" /> : <ChevronUp size={16} aria-hidden="true" />}
    </button>
  </div>;
}
