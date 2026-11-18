"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { wedding } from "@/data/wedding-content";
import { FlowerMark } from "./Ornaments";
import "./WeddingPreloader.css";

// Original wedding implementation of a word sequence and curved curtain reveal.
// This is not the licensed Skiper8 source component.
const WeddingReady = createContext(true);
export const useWeddingReady = () => useContext(WeddingReady);
type Phase = number | "leaving" | "complete";
const words = [...wedding.preloader.words, wedding.names];

export function WeddingEntrance({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>(0);
  const content = useRef<HTMLDivElement>(null);
  const skip = useRef<() => void>(() => {});
  const ready = typeof phase !== "number";

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timers: ReturnType<typeof setTimeout>[] = [];
    const image = document.querySelector<HTMLImageElement>("[data-hero-image]");
    let disposed = false;
    let revealed = false;
    let sequenceFinished = false;
    let imageReady = !image || image.complete;
    let fontsReady = false;

    const later = (callback: () => void, delay: number) => {
      timers.push(setTimeout(callback, delay));
    };
    const reveal = () => {
      if (disposed || revealed) return;
      revealed = true;
      setPhase(reduced.matches ? "complete" : "leaving");
      // Unmount even if the animation is interrupted or the tab is backgrounded.
      later(() => setPhase("complete"), 850);
    };
    const checkReady = () => {
      if (sequenceFinished && imageReady && fontsReady) reveal();
    };
    const onImage = () => { imageReady = true; checkReady(); };
    const onPreference = () => { if (reduced.matches) reveal(); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") reveal(); };
    skip.current = reveal;

    if (reduced.matches) later(reveal, 0);
    else {
      words.slice(1).forEach((_, index) => later(() => {
        if (!revealed) setPhase(index + 1);
      }, 650 + index * 650));
      later(() => { sequenceFinished = true; checkReady(); }, 2300);
      // Only the opening image and fonts matter; slow assets cannot trap visitors.
      later(reveal, 3500);
      image?.addEventListener("load", onImage, { once: true });
      image?.addEventListener("error", onImage, { once: true });
      document.fonts.ready.then(() => {
        if (!disposed) { fontsReady = true; checkReady(); }
      });
    }
    reduced.addEventListener("change", onPreference);
    window.addEventListener("keydown", onKey);
    return () => {
      disposed = true;
      timers.forEach(clearTimeout);
      image?.removeEventListener("load", onImage);
      image?.removeEventListener("error", onImage);
      reduced.removeEventListener("change", onPreference);
      window.removeEventListener("keydown", onKey);
      skip.current = () => {};
    };
  }, []);

  useEffect(() => {
    if (ready) return;
    const element = content.current;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    if (element) element.inert = true;
    document.body.style.overflow = "hidden";
    if (gutter > 0) document.body.style.paddingRight = `${gutter}px`;
    return () => {
      if (element) element.inert = false;
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
    };
  }, [ready]);

  return (
    <WeddingReady.Provider value={ready}>
      <div ref={content} data-wedding-ready={ready}>{children}</div>
      {phase !== "complete" && <motion.div
        className="wedding-preloader"
        data-wedding-preloader
        data-lenis-prevent
        initial={false}
        animate={{ y: ready ? "-115%" : "0%" }}
        transition={{ duration: .8, ease: [.76, 0, .24, 1] }}
      >
        <p className="sr-only" role="status">Opening {wedding.names}’s wedding story.</p>
        <button type="button" className="wedding-preloader-skip" onClick={() => skip.current()}>
          Skip intro <ArrowUpRight size={14} aria-hidden="true" />
        </button>
        <div className="wedding-preloader-content" aria-hidden="true">
          <p className="wedding-preloader-eyebrow">{wedding.subtitle}</p>
          <div className="wedding-preloader-words">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={typeof phase === "number" ? phase : words.length - 1}
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(3px)" }}
                transition={{ duration: .24, ease: "easeOut" }}
              >{words[typeof phase === "number" ? phase : words.length - 1]}</motion.p>
            </AnimatePresence>
          </div>
          <FlowerMark className="wedding-preloader-rule" />
          <p className="wedding-preloader-line">{wedding.preloader.line}</p>
        </div>
        <time className="wedding-preloader-date" dateTime={wedding.date.iso}>{wedding.date.short}</time>
        <svg className="wedding-preloader-curve" width="100" height="100" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 0H100V1Q50 100 0 1Z" />
        </svg>
      </motion.div>}
    </WeddingReady.Provider>
  );
}
