"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { Swiper as SwiperInstance } from "swiper";
import { Autoplay, EffectCoverflow } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { WeddingImage } from "@/data/wedding-content";
import { PhotoPlaceholder } from "@/components/wedding/PhotoPlaceholder";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "./skiper49.css";

type CarouselProps = {
  images: readonly WeddingImage[];
  className?: string;
  showPagination?: boolean;
  showNavigation?: boolean;
};

const motionQuery = "(prefers-reduced-motion: reduce)";
const subscribeToMotion = (notify: () => void) => {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const readMotionPreference = () => window.matchMedia(motionQuery).matches;
// Start conservatively and hydrate against the same value on both sides.
const serverMotionPreference = () => true;

export function Skiper49({ images }: Pick<CarouselProps, "images">) {
  return <Carousel_003 images={images} showPagination showNavigation />;
}

/** Skiper UI 49 coverflow, with enough slides for Swiper's continuous loop. */
export function Carousel_003({ images, className = "", showPagination = false, showNavigation = false }: CarouselProps) {
  // Swiper rearranges real slides in loop mode. Repeat small collections so
  // both neighbours remain present at every screen width, including the seam.
  const copies = Math.ceil(9 / images.length);
  const slides = Array.from({ length: copies }, () => images).flat();
  const initialSlide = (copies > 1 ? images.length : 0) + Math.floor(images.length / 2);
  const [realIndex, setRealIndex] = useState(initialSlide);
  const slider = useRef<SwiperInstance | null>(null);
  const [instanceVersion, setInstanceVersion] = useState(0);
  const [paused, setPaused] = useState(false);
  const region = useRef<HTMLDivElement>(null);
  const reduced = useSyncExternalStore(subscribeToMotion, readMotionPreference, serverMotionPreference);
  const active = realIndex % images.length;

  useEffect(() => {
    const instance = slider.current;
    if (!instance || !region.current) return;
    // Swiper keeps its own runtime parameters when a media query changes.
    instance.params.speed = reduced ? 0 : 750;
    let visible = false;
    const updatePlayback = () => {
      const shouldPlay = visible && !paused && !reduced && !document.hidden;
      if (!instance.destroyed && typeof instance.params.autoplay === "object") instance.params.autoplay.enabled = shouldPlay;
      if (!instance.destroyed && shouldPlay) instance.autoplay.start();
      else if (!instance.destroyed) instance.autoplay.stop();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; updatePlayback(); }, { threshold: .2 });
    observer.observe(region.current);
    document.addEventListener("visibilitychange", updatePlayback);
    updatePlayback();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updatePlayback);
      if (!instance.destroyed) instance.autoplay.stop();
    };
  }, [instanceVersion, paused, reduced]);

  function goTo(index: number) {
    const instance = slider.current;
    if (!instance) return;
    const distance = (candidate: number) => {
      const delta = Math.abs(candidate - instance.realIndex);
      return Math.min(delta, slides.length - delta);
    };
    const aliases = Array.from({ length: copies }, (_, copy) => index + copy * images.length);
    const nearest = aliases.reduce((best, candidate) => distance(candidate) < distance(best) ? candidate : best);
    instance.slideToLoop(nearest);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const keys: Record<string, () => void> = {
      ArrowLeft: () => slider.current?.slidePrev(),
      ArrowRight: () => slider.current?.slideNext(),
      Home: () => goTo(0),
      End: () => goTo(images.length - 1),
    };
    if (keys[event.key]) { event.preventDefault(); keys[event.key](); }
  }

  return (
    <div
      ref={region}
      className={"skiper-story-carousel " + className}
      role="region"
      aria-label="Portraits of Divya and Deepak"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <Swiper
        modules={[EffectCoverflow, Autoplay]}
        className="skiper-story-swiper"
        effect="coverflow"
        slidesPerView="auto"
        centeredSlides
        loop
        initialSlide={initialSlide}
        spaceBetween={12}
        grabCursor
        slideToClickedSlide
        // Keep the server and first client render identical. The mounted effect
        // applies the visitor's motion preference before enabling autoplay.
        speed={750}
        autoplay={{ enabled: false, delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true, stopOnLastSlide: false }}
        coverflowEffect={{ rotate: 0, stretch: 16, depth: 90, scale: .85, slideShadows: false }}
        onSwiper={(instance) => { slider.current = instance; setInstanceVersion((version) => version + 1); }}
        onRealIndexChange={(instance) => setRealIndex(instance.realIndex)}
      >
        {slides.map((image, index) => (
          <SwiperSlide key={image.id + index} className="skiper-story-slide" role="group" aria-roledescription="portrait" aria-label={"Portrait " + (index % images.length + 1) + " of " + images.length} aria-hidden={index !== realIndex}>
            <div className="skiper-story-frame" aria-current={index === realIndex ? "true" : undefined}>
              <PhotoPlaceholder image={image} sizes="(max-width: 600px) 42vw, (max-width: 1000px) 32vw, 290px" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="skiper-story-controls">
        {showNavigation && <button type="button" className="skiper-story-arrow" aria-label="Previous story portrait" onClick={() => slider.current?.slidePrev()}><ChevronLeft size={18} aria-hidden="true" /></button>}
        {showPagination && <div className="skiper-story-pagination" aria-label="Choose a story portrait">
          {images.map((image, index) => <button key={image.id} type="button" aria-label={"Show story portrait " + (index + 1)} aria-current={active === index ? "true" : undefined} onClick={() => goTo(index)}><span /></button>)}
        </div>}
        {showNavigation && <button type="button" className="skiper-story-arrow" aria-label="Next story portrait" onClick={() => slider.current?.slideNext()}><ChevronRight size={18} aria-hidden="true" /></button>}
        <button type="button" className="skiper-story-arrow skiper-story-playback" aria-label={paused ? "Resume story slideshow" : "Pause story slideshow"} onClick={() => setPaused(!paused)}>{paused ? <Play size={14} fill="currentColor" aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}</button>
      </div>
      <span className="sr-only" aria-live={paused || reduced ? "polite" : "off"} aria-atomic="true">Portrait {active + 1} of {images.length}</span>
    </div>
  );
}

/**
 * Adapted from Skiper 49 Carousel_003 — React + Swiper by @gurvinder-singh02.
 * https://skiper-ui.com · https://gxuri.me
 * Free for personal and commercial use with Skiper UI attribution.
 * Attribution is retained with the component source.
 */

