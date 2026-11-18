"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/** One GSAP context and one desktop scroll ticker, both reverted on unmount. */
export function AnimationProvider({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = gsap.matchMedia();
    let lenis: Lenis | undefined;
    let tick: ((time: number) => void) | undefined;
    const context = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const header = root.current?.querySelector(".site-header");
        if (header) gsap.from(header, { opacity: 0, y: -8, duration: .45, ease: "power2.out" });
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
          gsap.from(element, { opacity: 0, y: 24, duration: .8, ease: "power2.out", scrollTrigger: { trigger: element, start: "top 93%", once: true } });
        });
        const events = gsap.utils.toArray<HTMLElement>(".wedding-event");
        if (events.length) gsap.from(events, { opacity: 0, y: 18, stagger: .16, duration: .65, scrollTrigger: { trigger: events[0].parentElement, start: "top 88%", once: true } });
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
    }, root);
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
    const element = root.current;
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
  }, []);
  return <div ref={root} className="wedding-experience">{children}</div>;
}
