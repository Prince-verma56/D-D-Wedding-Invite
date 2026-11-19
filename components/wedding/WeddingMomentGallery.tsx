"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { wedding } from "@/data/wedding-content";

export function WeddingMomentGallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const viewerRef = useRef<HTMLDialogElement>(null);
  const previousOverflow = useRef<string | null>(null);
  const photos = wedding.images.gallery.filter(photo => photo.src);
  const selectedPhoto = selectedIndex === null ? null : photos[selectedIndex];

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (selectedIndex !== null && !viewer.open) {
      previousOverflow.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      viewer.showModal();
      window.dispatchEvent(new CustomEvent("wedding:dialog", { detail: true }));
    }
    if (selectedIndex === null && viewer.open) viewer.close();
  }, [selectedIndex]);

  const releaseViewer = () => {
    if (previousOverflow.current === null) return;
    document.body.style.overflow = previousOverflow.current;
    previousOverflow.current = null;
    window.dispatchEvent(new CustomEvent("wedding:dialog", { detail: false }));
  };
  const closeViewer = () => setSelectedIndex(null);
  const showPrevious = () => setSelectedIndex(index => index === null ? null : (index - 1 + photos.length) % photos.length);
  const showNext = () => setSelectedIndex(index => index === null ? null : (index + 1) % photos.length);

  return (
    <div className="wedding-moments">
      <div className="wedding-moments-grid">
        {photos.map((photo, index) => {
          const size = index % 8 === 0 ? "feature" : index % 7 === 4 ? "tall" : "standard";
          return (
            <figure className="wedding-moment" key={photo.id} data-size={size} data-reveal>
              <button
                type="button"
                className="wedding-moment-open"
                aria-label={`View photo ${index + 1}: ${photo.alt}`}
                onClick={() => setSelectedIndex(index)}
              >
                <span className="wedding-moment-image-layer" data-photo-parallax>
                  <Image
                    src={photo.src!}
                    alt=""
                    fill
                    sizes="(max-width: 600px) 48vw, (max-width: 1000px) 31vw, 23vw"
                    className="wedding-moment-image"
                  />
                </span>
                <span className="wedding-moment-zoom" aria-hidden="true">+</span>
              </button>
              <figcaption className="wedding-moment-caption">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{photo.alt}</p>
              </figcaption>
            </figure>
          );
        })}
      </div>
      <dialog
        ref={viewerRef}
        className="wedding-photo-viewer"
        aria-label="Wedding photo viewer"
        onClose={() => { releaseViewer(); closeViewer(); }}
        onClick={event => { if (event.target === event.currentTarget) closeViewer(); }}
        onKeyDown={event => {
          if (event.key === "ArrowLeft") { event.preventDefault(); showPrevious(); }
          if (event.key === "ArrowRight") { event.preventDefault(); showNext(); }
        }}
      >
        {selectedPhoto && (
          <div className="wedding-photo-viewer-content">
            <header className="wedding-photo-viewer-header">
              <p>{String(selectedIndex! + 1).padStart(2, "0")} <span>/ {String(photos.length).padStart(2, "0")}</span></p>
              <button type="button" className="wedding-photo-viewer-close" onClick={closeViewer} aria-label="Close photo viewer">
                <X size={21} aria-hidden="true" />
              </button>
            </header>
            <div className="wedding-photo-viewer-stage">
              <button type="button" className="wedding-photo-viewer-nav" onClick={showPrevious} aria-label="Previous photo">
                <ChevronLeft size={24} aria-hidden="true" />
              </button>
              <div className="wedding-photo-viewer-image">
                <Image src={selectedPhoto.src!} alt={selectedPhoto.alt} fill sizes="100vw" className="wedding-photo-viewer-full-image" />
              </div>
              <button type="button" className="wedding-photo-viewer-nav" onClick={showNext} aria-label="Next photo">
                <ChevronRight size={24} aria-hidden="true" />
              </button>
            </div>
            <p className="wedding-photo-viewer-caption" aria-live="polite">{selectedPhoto.alt}</p>
          </div>
        )}
      </dialog>
    </div>
  );
}
