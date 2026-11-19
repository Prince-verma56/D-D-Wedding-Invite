export function AudioVisualizer({ playing }: { playing: boolean }) {
  return <span className="music-visualizer" data-playing={playing} aria-hidden="true">
    <i /><i /><i /><i />
  </span>;
}
