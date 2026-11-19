import Image from "next/image";
import { wedding } from "@/data/wedding-content";

export function WeddingMomentGallery() {
  return (
    <div className="wedding-moments">
      <div className="wedding-moments-grid">
        {wedding.images.gallery.map((photo, index) => {
          if (!photo.src) return null;
          return (
            <figure className="wedding-moment" key={photo.id} data-reveal>
              <div className="wedding-moment-image-layer" data-photo-parallax>
                <Image
                  src={photo.src}
                  alt=""
                  fill
                  sizes="(max-width: 600px) 48vw, (max-width: 1000px) 31vw, 23vw"
                  className="wedding-moment-image"
                />
              </div>
              <figcaption className="wedding-moment-caption">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{photo.alt}</p>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
