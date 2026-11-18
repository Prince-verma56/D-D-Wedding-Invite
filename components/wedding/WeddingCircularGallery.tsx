"use client";

import { useState } from "react";
import { getImageProps } from "next/image";
import { Pause, Play, MoveHorizontal } from "lucide-react";
import CircularGallery from "@/components/CircularGallery";
import { wedding } from "@/data/wedding-content";

const items = wedding.images.gallery.filter(photo => photo.src).map(photo => ({
  image: getImageProps({ src: photo.src!, alt: photo.alt, width: 480, height: 720 }).props.src,
  text: photo.alt,
  description: photo.alt,
}));

export function WeddingCircularGallery() {
  const [paused, setPaused] = useState(false);
  return (
    <div className="wedding-circular-gallery">
      <div className="wedding-circular-gallery-stage" data-reveal>
        <CircularGallery
          items={items}
          bend={1.8}
          textColor="#7a2338"
          font="24px Georgia"
          borderRadius={.035}
          itemAspect={2 / 3}
          itemSize={1.2}
          gap={.17}
          wave={.16}
          fadeEdges={.08}
          shadow={.18}
          showTitles={false}
          autoScroll={paused ? 0 : .35}
          className="wedding-circular-gallery-canvas"
          aria-label="Divya and Deepak’s wedding photographs"
        />
      </div>
      <div className="wedding-circular-gallery-controls" data-reveal>
        <p><MoveHorizontal size={16} aria-hidden="true" /> Drag to explore · Tap a moment to linger</p>
        <button type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused}>
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          {paused ? "Play gallery" : "Pause gallery"}
        </button>
      </div>
    </div>
  );
}
