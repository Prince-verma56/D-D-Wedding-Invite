import { wedding } from "@/data/wedding-content";
import Image from "next/image";
import { WeddingMomentGallery } from "@/components/wedding/WeddingMomentGallery";
import "./GallerySection.css";

export function GallerySection() {
  return (
    <section id="gallery" className="gallery-section circular-gallery-section section-anchor" aria-labelledby="gallery-title">
      <div className="gallery-background" aria-hidden="true">
        <Image src={wedding.images.galleryBackground.src} alt="" fill sizes="100vw" />
      </div>
      <div className="section-shell gallery-layout circular-gallery-layout">
        <div className="gallery-copy" data-reveal>
          <p className="eyebrow">Gallery</p>
          <h2 id="gallery-title">{wedding.gallery.heading.firstLine} <em>{wedding.gallery.heading.secondLine}</em></h2>
          <p className="section-copy">{wedding.gallery.line}</p>
        </div>
        <WeddingMomentGallery />
      </div>
    </section>
  );
}
