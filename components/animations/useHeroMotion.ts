"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useWeddingReady } from "@/components/wedding/WeddingPreloader";

gsap.registerPlugin(ScrollTrigger);

/** Runs only after the hero's own DOM is mounted; every target is scoped to it. */
export function useHeroMotion(root: RefObject<HTMLElement | null>) {
  const ready = useWeddingReady();
  useEffect(() => {
    const element = root.current;
    if (!element || !ready) return;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const eyebrow = element.querySelector(".hero-eyebrow");
        const names = element.querySelectorAll(".hero-name");
        const details = element.querySelectorAll(".hero-detail");
        const motion = element.querySelector(".hero-image-motion");
        const sweep = element.querySelector(".hero-reveal-sweep");
        const image = element.querySelector<HTMLImageElement>("[data-hero-image]");
        const entrance = gsap.timeline({ delay: .3, defaults: { ease: "power3.out" } });
        if (eyebrow) entrance.from(eyebrow, { opacity: 0, y: 10, duration: .6 }, .08);
        if (names.length) entrance.from(names, { opacity: 0, y: 18, clipPath: "inset(0% 0% 100% 0%)", stagger: .14, duration: 1, clearProps: "clipPath,transform,opacity" }, .18);
        if (details.length) entrance.from(details, { opacity: 0, y: 10, stagger: .075, duration: .75, clearProps: "opacity,transform" }, .65);

        const imageReveal = gsap.timeline({ paused: true });
        if (motion) imageReveal.fromTo(motion,
          { filter: "blur(4px)", scale: 1.018, opacity: .82 },
          { filter: "blur(0px)", scale: 1, opacity: 1, duration: 1.4, ease: "power2.out", clearProps: "filter,transform,opacity" }, 0);
        if (sweep) imageReveal.fromTo(sweep,
          { xPercent: 0, autoAlpha: .8 },
          { xPercent: 450, autoAlpha: 0, duration: 1.5, ease: "power2.inOut" }, 0);
        const reveal = () => { imageReveal.play(0); };
        if (!image || image.complete) reveal();
        else {
          image.addEventListener("load", reveal, { once: true });
          image.addEventListener("error", reveal, { once: true });
        }
        return () => {
          image?.removeEventListener("load", reveal);
          image?.removeEventListener("error", reveal);
        };
      });
      media.add("(min-width: 1000px) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const layer = element.querySelector("[data-hero-parallax]");
        if (layer) gsap.fromTo(layer, { yPercent: -1 }, {
          yPercent: 1, ease: "none",
          scrollTrigger: { trigger: element, start: "top top", end: "bottom top", scrub: 1 },
        });
      });
    }, element);
    return () => { media.revert(); context.revert(); };
  }, [root, ready]);
}
