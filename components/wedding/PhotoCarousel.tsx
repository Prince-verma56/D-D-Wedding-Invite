"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { WeddingImage } from "@/data/wedding-content";
import { PhotoPlaceholder } from "./PhotoPlaceholder";

export function PhotoCarousel({ images }: { images: readonly WeddingImage[] }) {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const count = images.length;
  const change = (direction: number) => setActive((current) => (current + direction + count) % count);

  return (
    <div className="photo-carousel" role="region" aria-roledescription="carousel" aria-label="Wedding moments" data-reveal>
      <p id="gallery-instructions" className="sr-only">Swipe or use the previous and next buttons. When focused, use the left and right arrow keys.</p>
      <div className="carousel-keyboard" tabIndex={0} aria-label="Photo carousel" aria-describedby="gallery-instructions" onKeyDown={(event) => {
        if (event.key === "ArrowRight") { event.preventDefault(); change(1); }
        if (event.key === "ArrowLeft") { event.preventDefault(); change(-1); }
        if (event.key === "Home") { event.preventDefault(); setActive(0); }
        if (event.key === "End") { event.preventDefault(); setActive(count - 1); }
      }}>
        <motion.div className="carousel-stage" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={.08} onDragEnd={(_, info) => {
          if (info.offset.x < -35 || info.velocity.x < -450) change(1);
          else if (info.offset.x > 35 || info.velocity.x > 450) change(-1);
        }}>
          {images.map((image, index) => {
            let offset = (index - active + count) % count;
            if (offset > Math.floor(count / 2)) offset -= count;
            const distance = Math.abs(offset);
            return <motion.div
              className={"carousel-photo " + (distance === 0 ? "is-active" : "")}
              key={image.id}
              role="group"
              aria-roledescription="slide"
              aria-label={String(index + 1) + " of " + count + ": " + image.alt}
              aria-hidden={distance !== 0}
              initial={false}
              animate={{ x: offset * 69 + "%", y: distance * 13, rotate: offset * 5, scale: 1 - distance * .14, opacity: distance > 2 ? 0 : 1, zIndex: count - distance }}
              transition={{ type: "tween", ease: [.22, 1, .36, 1], duration: reduced ? 0 : .6 }}
            ><PhotoPlaceholder image={image} sizes="(max-width: 767px) 60vw, 24vw" /></motion.div>;
          })}
        </motion.div>
      </div>
      <div className="carousel-bottom">
        <button className="carousel-arrow carousel-prev icon-button" onClick={() => change(-1)} aria-label="Previous photograph"><ChevronLeft size={21} /></button>
        <div className="carousel-dots" aria-label="Choose photograph">{images.map((image, index) => <button key={image.id} aria-label={"Go to photograph " + (index + 1)} aria-pressed={active === index} onClick={() => setActive(index)}><span /></button>)}</div>
        <button className="carousel-arrow carousel-next icon-button" onClick={() => change(1)} aria-label="Next photograph"><ChevronRight size={21} /></button>
      </div>
      <p className="carousel-counter" aria-live="polite" aria-atomic="true">0{active + 1}<span> / 0{count}</span></p>
    </div>
  );
}
