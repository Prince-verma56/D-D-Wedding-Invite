"use client";

import { useEffect, type RefObject } from "react";

/** Keep the compact widget clear of nearby page actions without moving content. */
export function useMusicPlacement(root: RefObject<HTMLDivElement | null>, ready: boolean) {
  useEffect(() => {
    const element = root.current;
    if (!ready || !element) return;
    let frame = 0;
    let offset = 0;
    let disposed = false;
    const place = () => {
      frame = 0;
      const widget = element.querySelector<HTMLElement>(".music-widget, .music-enable");
      if (!widget) return;
      const box = widget.getBoundingClientRect();
      const baseline = box.top + offset;
      let top = baseline;
      const actions = Array.from(document.querySelectorAll<HTMLElement>("main a, main button, main summary, footer a"))
        .map((action) => action.getBoundingClientRect())
        .filter((action) => action.width > 0 && action.height > 0 && action.height <= 100 && action.bottom > 0 && action.top < window.innerHeight && action.left < box.right + 10 && action.right > box.left - 10)
        .sort((a, b) => b.bottom - a.bottom);
      for (const action of actions) {
        if (action.top < top + box.height + 10 && action.bottom > top - 10) top = action.top - box.height - 10;
      }
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 80;
      const next = Math.max(0, Math.ceil(baseline - Math.max(header + 12, top)));
      if (next !== offset) {
        offset = next;
        element.style.setProperty("--music-avoidance", `${offset}px`);
      }
    };
    const schedule = () => { if (!disposed && !frame) frame = requestAnimationFrame(place); };
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.fonts.ready.then(schedule);
    schedule();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      element.style.removeProperty("--music-avoidance");
    };
  }, [root, ready]);
}
