"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useWeddingReady } from "@/components/wedding/WeddingPreloader";

gsap.registerPlugin(ScrollTrigger);

/** Venue-only choreography; the layout and all text remain visible without JS. */
export function useVenueMotion(root: RefObject<HTMLElement | null>) {
  const ready = useWeddingReady();
  useEffect(() => {
    const element = root.current;
    if (!element || !ready) return;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const details = element.querySelectorAll("[data-venue-reveal]");
        const motion = element.querySelector("[data-venue-image-motion]");
        const image = element.querySelector<HTMLImageElement>("[data-venue-image]");
        if (details.length) gsap.from(details, {
          opacity: 0, y: 16, stagger: .085, duration: .85, ease: "power3.out", clearProps: "opacity,transform",
          scrollTrigger: { trigger: element, start: "top 82%", once: true },
        });
        const title = element.querySelector("h2");
        if (title) gsap.from(title, {
          clipPath: "inset(0% 0% 100% 0%)", duration: 1, ease: "power3.out", clearProps: "clipPath",
          scrollTrigger: { trigger: title, start: "top 88%", once: true },
        });
        if (!motion) return;
        const reveal = gsap.fromTo(motion, { scale: 1.025, opacity: .8 }, {
          scale: 1, opacity: 1, duration: 1.4, ease: "power2.out", paused: true, clearProps: "opacity,transform",
        });
        let inView = false;
        let ready = !image || image.complete;
        const play = () => { if (inView && ready) reveal.play(); };
        const onReady = () => { ready = true; play(); };
        if (!ready) {
          image?.addEventListener("load", onReady, { once: true });
          image?.addEventListener("error", onReady, { once: true });
        }
        ScrollTrigger.create({ trigger: element, start: "top 96%", once: true, onEnter: () => { inView = true; play(); } });
        return () => {
          image?.removeEventListener("load", onReady);
          image?.removeEventListener("error", onReady);
        };
      });
      media.add("(min-width: 1000px) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const layer = element.querySelector("[data-venue-parallax]");
        if (layer) gsap.fromTo(layer, { yPercent: -1.25 }, {
          yPercent: 1.25, ease: "none",
          scrollTrigger: { trigger: element, start: "top bottom", end: "bottom top", scrub: 1.4 },
        });
      });
    }, element);
    return () => { media.revert(); context.revert(); };
  }, [root, ready]);
}
