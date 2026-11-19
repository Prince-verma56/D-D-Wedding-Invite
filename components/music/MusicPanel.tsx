"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Disc3, Music2, X } from "lucide-react";
import type { WeddingMusic } from "@/hooks/useWeddingMusic";
import { wedding } from "@/data/wedding-content";
import { PlaybackControls } from "./PlaybackControls";
import { Playlist } from "./Playlist";

export default function MusicPanel({ music, close }: { music: WeddingMusic; close: () => void }) {
  const { track, state, controller } = music;
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => { closeRef.current?.focus({ preventScroll: true }); }, []);

  return <motion.section id="wedding-music-panel" className="music-panel" role="region" aria-labelledby="music-panel-title" data-lenis-prevent
    initial={{ opacity: 0, y: reduced ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : 10 }} transition={{ duration: reduced ? 0 : .2 }}>
    <header className="music-panel-header"><div><p>{wedding.names}</p><h2 id="music-panel-title">A soundtrack to remember</h2></div><button ref={closeRef} type="button" className="music-icon-button" aria-label="Close music panel" onClick={close}><X size={18} aria-hidden="true" /></button></header>
    <div className="music-panel-body" data-lenis-prevent>
    <div className="music-now-playing">
      <div className="music-cover" data-playing={state.status === "playing"} aria-hidden="true">
        {track?.cover ? <span className="music-cover-image" style={{ backgroundImage: `url(${JSON.stringify(track.cover)})` }} /> : <><Disc3 size={46} strokeWidth={.8} /><span>{wedding.monogram.first} <i>&amp;</i> {wedding.monogram.second}</span></>}
      </div>
      <motion.div className="music-current-copy" key={track?.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : .25 }}>
        <p className="music-kicker">{state.status === "playing" ? "Now playing" : state.status === "loading" ? "Loading your soundtrack" : "Selected for the celebration"}</p>
        <h3>{track?.title || "Our wedding soundtrack"}</h3>
        {track?.artist && <p className="music-artist">{track.artist}</p>}
      </motion.div>
    </div>
    {state.error && <div className="music-feedback"><p>{state.error}</p>{state.status === "error" && <button type="button" onClick={() => void controller.play()}>Try again</button>}</div>}
    <PlaybackControls music={music} />
    <Playlist music={music} />
    </div>
    <footer className="music-panel-footer"><span><Music2 size={12} aria-hidden="true" /> With love, in every note</span><button type="button" onClick={() => { controller.disable(); close(); }}>Turn music off</button></footer>
  </motion.section>;
}
