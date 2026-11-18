import { wedding } from "@/data/wedding-content";
import { PhotoCarousel } from "@/components/wedding/PhotoCarousel";
import { SectionAtmosphere } from "@/components/wedding/Ornaments";

export function GallerySection() {
  return (
    <section id="gallery" className="gallery-section section-anchor" aria-labelledby="gallery-title">
      <SectionAtmosphere variant="blush" />
      <div className="section-shell gallery-layout">
        <div className="gallery-copy" data-reveal>
          <p className="eyebrow">Gallery</p>
          <h2 id="gallery-title">{wedding.gallery.heading.firstLine}<br /><em>{wedding.gallery.heading.secondLine}</em></h2>
          <p className="section-copy">{wedding.gallery.line}</p>
          <span className="gallery-footnote">Little moments. Lasting memories.</span>
        </div>
        <PhotoCarousel images={wedding.images.gallery} />
      </div>
    </section>
  );
}
