import { MapPin, ArrowUpRight } from "lucide-react";
import { wedding } from "@/data/wedding-content";
import { PhotoPlaceholder } from "@/components/wedding/PhotoPlaceholder";
import { Botanical } from "@/components/wedding/Ornaments";
import { ActionButton } from "@/components/wedding/WeddingExperience";

export function VenueSection() {
  return (
    <section id="venue" className="venue-section section-anchor" aria-labelledby="venue-title">
      <figure className="venue-visual" data-reveal>
        <PhotoPlaceholder image={wedding.images.venue} className="venue-photo" sizes="(max-width: 767px) 100vw, 55vw" />
        <figcaption className="venue-image-note">Venue illustration · Photograph to follow</figcaption>
      </figure>
      <div className="venue-copy" data-reveal>
        <p className="eyebrow">The venue</p>
        <h2 id="venue-title">{wedding.venue.heading.firstLine}<br /><em>{wedding.venue.heading.secondLine}</em></h2>
        <p className="venue-location"><MapPin size={20} fill="currentColor" aria-hidden="true" />{wedding.venue.shortAddress}</p>
        <address>{wedding.venue.address}</address>
        <ActionButton action="venue" className="button button-outline">View on Map <ArrowUpRight size={17} aria-hidden="true" /></ActionButton>
        <Botanical className="venue-botanical" />
      </div>
    </section>
  );
}
