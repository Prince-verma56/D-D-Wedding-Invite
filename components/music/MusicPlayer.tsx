"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, MotionConfig } from "motion/react";
import { useMusic } from "./WeddingMusicProvider";
import { useMusicPlacement } from "@/hooks/useMusicPlacement";
import { MusicWidget } from "./MusicWidget";
import "./MusicPlayer.css";

const MusicPanel = dynamic(() => import("./MusicPanel"));

export function MusicPlayer() {
  const music = useMusic();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const expandRef = useRef<HTMLButtonElement>(null);
  useMusicPlacement(root, music.state.ready);
  const close = () => { setOpen(false); requestAnimationFrame(() => expandRef.current?.focus({ preventScroll: true })); };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); expandRef.current?.focus({ preventScroll: true }); }
    };
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onFocus = (event: FocusEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onDialog = () => setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("focusin", onFocus);
    window.addEventListener("wedding:dialog", onDialog);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("focusin", onFocus);
      window.removeEventListener("wedding:dialog", onDialog);
    };
  }, [open]);

  const disabled = music.state.preference === "disabled";
  const status = music.state.status;
  return <MotionConfig reducedMotion="user">
    <div ref={root} className="wedding-music" role="complementary" aria-label="Wedding music" hidden={!music.state.ready}>
      <AnimatePresence>{open && !disabled && <MusicPanel music={music} close={close} />}</AnimatePresence>
      <MusicWidget music={music} open={open && !disabled} toggle={() => setOpen(!open)} expandRef={expandRef} />
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{music.state.error || (disabled ? "Wedding music is off." : status === "playing" ? `Playing ${music.track?.title}.` : status === "loading" ? "Loading wedding music." : status === "paused" ? "Wedding music is paused." : "Wedding music is available.")}</p>
    </div>
  </MotionConfig>;
}
