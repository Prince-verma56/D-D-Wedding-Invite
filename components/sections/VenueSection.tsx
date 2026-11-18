"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import { MapPin, ArrowUpRight } from "lucide-react";
import { wedding } from "@/data/wedding-content";
import { ActionButton } from "@/components/wedding/WeddingExperience";
import { useVenueMotion } from "@/components/animations/useVenueMotion";
import "./VenueSection.css";

export function VenueSection() {
  const section = useRef<HTMLElement>(null);
  useVenueMotion(section);
  return (
    <section ref={section} id="venue" className="venue-scene section-anchor" aria-labelledby="venue-title" data-nav-theme="dark" style={{
      "--venue-image-position": wedding.images.venue.objectPosition,
      "--venue-image-position-mobile": wedding.images.venue.mobileObjectPosition,
    } as CSSProperties}>
      <div className="venue-scene-media" aria-hidden="true">
        <div className="venue-scene-parallax" data-venue-parallax>
          <div className="venue-scene-imageMotion" data-venue-image-motion>
            <Image src={wedding.images.venue.src} alt="" fill sizes="100vw" className="venue-scene-image" data-venue-image />
          </div>
        </div>
        <div className="venue-scene-shade" />
      </div>
      <div className="section-shell venue-scene-content">
        <div className="venue-scene-copy">
          <p className="venue-scene-eyebrow" data-venue-reveal><span aria-hidden="true" />The venue</p>
          <h2 id="venue-title" data-venue-reveal><span>{wedding.venue.heading.firstLine}</span><em>{wedding.venue.heading.secondLine}</em></h2>
          <p className="venue-scene-location" data-venue-reveal><span className="venue-scene-pin"><MapPin size={19} aria-hidden="true" /></span>{wedding.venue.shortAddress}</p>
          <address data-venue-reveal>{wedding.venue.address}</address>
          <div className="venue-scene-actions" data-venue-reveal><ActionButton action="venue" className="button venue-scene-map">View on Map <ArrowUpRight size={17} aria-hidden="true" /></ActionButton></div>
        </div>
      </div>
    </section>
  );
}
