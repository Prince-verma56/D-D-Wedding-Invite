"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useWeddingReady } from "@/components/wedding/WeddingPreloader";

gsap.registerPlugin(ScrollTrigger);

/** One GSAP context and one desktop scroll ticker, both reverted on unmount. */
export function AnimationProvider({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const ready = useWeddingReady();
  useEffect(() => {
    const element = root.current;
    if (!ready || !element) return;
    const media = gsap.matchMedia();
    let lenis: Lenis | undefined;
    let tick: ((time: number) => void) | undefined;
    const context = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const header = root.current?.querySelector(".site-header");
        if (header) gsap.from(header, { opacity: 0, y: -8, delay: .25, duration: .6, ease: "power2.out", clearProps: "opacity,transform" });
        element.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
          const content = element.querySelector(".invitation-scene-content") || element;
          const grouped = content.matches(".story-scene-heading, .celebration-scene-heading, .gallery-copy, .invitation-scene-content, .site-footer");
          const targets = grouped
            ? Array.from(content.children).filter((child) => !child.matches(".footer-background"))
            : [content];
          const timeline = gsap.timeline({
            paused: true,
            defaults: { duration: .85, ease: "power3.out", clearProps: "opacity,transform,clipPath" },
          });
          targets.forEach((target, index) => {
            // Mask complete text blocks without splitting accessible text or changing layout.
            const heading = target.matches("h2, h3");
            timeline.from(target, {
              opacity: 0, y: heading ? 20 : 14,
              ...(heading ? { clipPath: "inset(0% 0% 100% 0%)" } : {}),
            }, index * .11);
          });
          // Register only after the timeline has its children. Keep the trigger
          // until context cleanup so refresh cannot lose entries mid-iteration.
          ScrollTrigger.create({ animation: timeline, trigger: element, start: "top 91%", toggleActions: "play none none none" });
        });
        element.querySelectorAll<HTMLElement>("[data-soft-divider]").forEach((element) => {
          const line = element.querySelector(".soft-section-divider-line");
          if (line) gsap.from(line, { scaleX: .8, opacity: 0, duration: 1.15, ease: "power2.out", clearProps: "opacity,transform", scrollTrigger: { trigger: element, start: "top 96%", toggleActions: "play none none none" } });
        });
        const events = Array.from(element.querySelectorAll<HTMLElement>(".wedding-event"));
        events.forEach((card, index) => {
          const timeline = gsap.timeline({ paused: true });
          timeline.from(card, { opacity: 0, y: 26, duration: .8, delay: window.innerWidth >= 1000 ? index * .1 : 0, ease: "power3.out", clearProps: "opacity,transform" });
          const title = card.querySelector("h3");
          const schedule = card.querySelector(".celebration-card-schedule, .celebration-card-pending");
          if (title) timeline.from(title, { clipPath: "inset(0% 0% 100% 0%)", y: 10, duration: .7, ease: "power3.out", clearProps: "clipPath,transform" }, .2);
          if (schedule) timeline.from(schedule, { opacity: 0, y: 8, duration: .55, clearProps: "opacity,transform" }, .35);
          ScrollTrigger.create({ animation: timeline, trigger: card, start: "top 91%", toggleActions: "play none none none" });
        });
      });
      media.add("(min-width: 1000px) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        // Handle desktop anchors once, instead of racing native hash scrolling.
        lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false, anchors: false });
        lenis.on("scroll", ScrollTrigger.update);
        tick = (time: number) => lenis?.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
        // Move only oversized interior layers; section geometry stays in normal flow.
        gsap.utils.toArray<HTMLElement>("[data-background-parallax]").forEach((layer) => {
          gsap.fromTo(layer, { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: layer.closest("section"), start: "top bottom", end: "bottom top", scrub: 1 } });
        });
        gsap.utils.toArray<HTMLElement>("[data-photo-parallax]").forEach((layer) => {
          gsap.fromTo(layer, { yPercent: -2 }, { yPercent: 2, ease: "none", scrollTrigger: { trigger: layer.closest("section"), start: "top bottom", end: "bottom top", scrub: 1 } });
        });
        return () => {
          if (tick) gsap.ticker.remove(tick);
          gsap.ticker.lagSmoothing(500, 33);
          lenis?.off("scroll", ScrollTrigger.update);
          lenis?.destroy();
          lenis = undefined;
        };
      });
    }, element);
    const onDialog = (event: Event) => {
      if ((event as CustomEvent<boolean>).detail) lenis?.stop();
      else lenis?.start();
    };
    const onToggle = (event: Event) => {
      if (event.target instanceof HTMLDetailsElement) ScrollTrigger.refresh();
    };
    const onAnchor = (event: MouseEvent) => {
      if (!lenis || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      let target: HTMLElement | null;
      try { target = document.getElementById(decodeURIComponent(hash.slice(1))); } catch { return; }
      if (!target) return;
      event.preventDefault();
      if (window.location.hash !== hash) window.history.pushState(null, "", hash);
      // Lenis reads the single CSS scroll-padding value for the fixed header.
      lenis.scrollTo(target);
    };
    window.addEventListener("wedding:dialog", onDialog);
    root.current?.addEventListener("toggle", onToggle, true);
    root.current?.addEventListener("click", onAnchor);
    let disposed = false;
    document.fonts.ready.then(() => { if (!disposed) ScrollTrigger.refresh(); });
    return () => {
      disposed = true;
      window.removeEventListener("wedding:dialog", onDialog);
      element?.removeEventListener("toggle", onToggle, true);
      element?.removeEventListener("click", onAnchor);
      media.revert();
      context.revert();
    };
  }, [ready]);
  return <div ref={root} className="wedding-experience">{children}</div>;
}
