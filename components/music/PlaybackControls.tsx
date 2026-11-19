import { LoaderCircle, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import type { WeddingMusic } from "@/hooks/useWeddingMusic";

export function formatTime(seconds: number) {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

export function PlayButton({ music, compact = false }: { music: WeddingMusic; compact?: boolean }) {
  const { state, controller, track } = music;
  const active = state.status === "playing" || state.status === "loading";
  const label = state.status === "loading" ? "Cancel music loading" : active ? "Pause music" : "Play music";
  const Icon = state.status === "loading" ? LoaderCircle : active ? Pause : Play;
  return <button type="button" className={`music-play${compact ? " music-play-compact" : ""}`} onClick={controller.toggle} aria-label={label} disabled={!state.ready || !track}>
    <Icon size={compact ? 16 : 21} fill={state.status === "loading" ? "none" : "currentColor"} strokeWidth={1.6} aria-hidden="true" className={state.status === "loading" ? "music-loading" : undefined} />
    {compact && <span>{state.status === "loading" ? "Cancel" : active ? "Pause" : "Play"}</span>}
  </button>;
}

export function PlaybackControls({ music }: { music: WeddingMusic }) {
  const { state, controller, tracks } = music;
  return <>
    <div className="music-progress">
      <input type="range" aria-label="Playback position" aria-valuetext={`${formatTime(state.currentTime)} of ${formatTime(state.duration)}`} min="0" max={state.duration || 1} step="1" value={Math.min(state.currentTime, state.duration || 0)} onChange={(event) => controller.seek(Number(event.target.value))} disabled={!state.duration} />
      <div className="music-times"><span>{formatTime(state.currentTime)}</span><span>{formatTime(state.duration)}</span></div>
    </div>
    <div className="music-control-row"><div className="music-transport" role="group" aria-label="Playback controls">
      <button type="button" className="music-icon-button" aria-label="Previous track" onClick={controller.previous} disabled={tracks.length < 2}><SkipBack size={19} aria-hidden="true" /></button>
      <PlayButton music={music} />
      <button type="button" className="music-icon-button" aria-label="Next track" onClick={controller.next} disabled={tracks.length < 2}><SkipForward size={19} aria-hidden="true" /></button>
    </div>
    <div className="music-volume">
      <button type="button" className="music-icon-button" aria-label={state.muted ? "Unmute music" : "Mute music"} aria-pressed={state.muted} onClick={controller.toggleMute}>
        {state.muted || state.volume === 0 ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
      </button>
      <input type="range" aria-label="Music volume" aria-valuetext={`${Math.round(state.volume * 100)} percent${state.muted ? ", muted" : ""}`} min="0" max="1" step="0.01" value={state.volume} onChange={(event) => controller.setVolume(Number(event.target.value))} />
      <span>{state.muted ? "Muted" : `${Math.round(state.volume * 100)}%`}</span>
    </div>
    </div>
  </>;
}
