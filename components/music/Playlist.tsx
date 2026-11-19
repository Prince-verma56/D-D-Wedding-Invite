import type { WeddingMusic } from "@/hooks/useWeddingMusic";
import { AudioVisualizer } from "./AudioVisualizer";

export function Playlist({ music }: { music: WeddingMusic }) {
  const { tracks, state, controller } = music;
  return <div className="music-queue">
    <div className="music-queue-heading"><h3 id="music-queue-title">Our soundtrack</h3><span>{tracks.length} {tracks.length === 1 ? "track" : "tracks"}</span></div>
    {tracks.length ? <ol aria-labelledby="music-queue-title" data-lenis-prevent>
      {tracks.map((track, index) => <li key={track.id}>
        <button type="button" className="music-track" aria-current={index === state.index ? "true" : undefined} aria-label={`Play ${track.title}${track.artist ? ` by ${track.artist}` : ""}`} onClick={() => controller.select(index)}>
          <span className="music-track-number">{index === state.index ? <AudioVisualizer playing={state.status === "playing"} /> : String(index + 1).padStart(2, "0")}</span>
          <span className="music-track-copy"><span>{track.title}</span>{track.artist && <small>{track.artist}</small>}</span>
          {track.duration && <span className="music-track-duration">{track.duration}</span>}
          {index === state.index && <span className="sr-only">{state.status === "playing" ? "Now playing" : "Selected track"}</span>}
        </button>
      </li>)}
    </ol> : <p className="music-empty">Our soundtrack is on its way. Enjoy the celebration.</p>}
  </div>;
}
