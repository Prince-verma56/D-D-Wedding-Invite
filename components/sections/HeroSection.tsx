"use client";

import { useRef, type CSSProperties } from "react";
import { useHeroMotion } from "@/components/animations/useHeroMotion";
import { ArrowDown } from "lucide-react";
import Image from "next/image";
import { wedding } from "@/data/wedding-content";
import { Button } from "@/components/ui/Button";
import { HeroMusicToggle } from "@/components/music/HeroMusicToggle";
import { FlowerMark } from "@/components/wedding/Ornaments";
import "./HeroSection.css";

export function HeroSection() {
  const hero = useRef<HTMLElement>(null);
  useHeroMotion(hero);
  return (
    <section
      ref={hero}
      id="home"
      className="hero section-anchor cinematic-hero-hero"
      aria-labelledby="hero-title"
      style={{
        "--hero-image-position": wedding.images.hero.objectPosition,
        "--hero-image-position-mobile": wedding.images.hero.mobileObjectPosition,
      } as CSSProperties}
    >
      <div className="cinematic-hero-media">
        <div className="cinematic-hero-parallax" data-hero-parallax>
          <div className="hero-image-motion cinematic-hero-imageMotion">
            <Image
              src={wedding.images.hero.src}
              alt={wedding.images.hero.alt}
              fill
              sizes="100vw"
              preload
              className="cinematic-hero-image"
              data-hero-image
            />
          </div>
        </div>
        <div className="cinematic-hero-shade" aria-hidden="true" />
        <div className="hero-reveal-sweep cinematic-hero-sweep" aria-hidden="true" />
      </div>
      <div className="cinematic-hero-content">
        <div className="cinematic-hero-copy">
          <p className="hero-eyebrow cinematic-hero-eyebrow">{wedding.hero.eyebrow}</p>
          <h1 id="hero-title" className="cinematic-hero-title" aria-label={wedding.names}>
            <span className="hero-name">{wedding.bride} <em>&</em></span>
            <span className="hero-name">{wedding.groom}</span>
          </h1>
          <div className="hero-detail cinematic-hero-divider"><FlowerMark /></div>
          <p className="hero-detail cinematic-hero-line">{wedding.hero.line}</p>
          <div className="hero-detail cinematic-hero-actions">
            <Button href="#our-story" className="cinematic-hero-storyButton">Explore Our Story</Button>
            <HeroMusicToggle />
          </div>
          <p className="hero-detail cinematic-hero-date">
            <time dateTime={wedding.date.iso}>{wedding.date.label}</time>
            <span aria-hidden="true">·</span>{wedding.venue.shortAddress}
          </p>
          <a className="hero-detail cinematic-hero-scrollCue" href="#our-story">
            <span>Our story begins</span><ArrowDown size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
