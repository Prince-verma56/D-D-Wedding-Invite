import { ArrowRight } from "lucide-react";
import { Suspense, type CSSProperties } from "react";
import Image from "next/image";
import { wedding } from "@/data/wedding-content";
import { Skiper49 } from "@/components/ui/skiper-ui/skiper49";
import { PhotoPlaceholder } from "@/components/wedding/PhotoPlaceholder";
import "./StorySection.css";

export function StorySection() {
  return (
    <section id="our-story" className="story-scene section-anchor" aria-labelledby="story-title" data-nav-theme="dark" style={{ "--story-background": 'url("' + wedding.images.storyBackground.src + '")' } as CSSProperties}>
      <div className="story-scene-background" aria-hidden="true">
        <Image src={wedding.images.storyBackground.src} alt="" fill sizes="100vw" className="story-scene-backgroundImage" />
      </div>
      <div className="section-shell story-scene-content">
        <div className="story-scene-heading" data-reveal>
          <span className="story-scene-star" aria-hidden="true">✦</span>
          <p className="story-scene-eyebrow">Our story</p>
          <h2 id="story-title">{wedding.story.heading.firstLine} {wedding.story.heading.secondLine} <em>{wedding.story.heading.accent}</em></h2>
          <p className="story-scene-summary">{wedding.story.summary}</p>
        </div>
        <div className="story-scene-portraits" data-reveal>
          <Suspense fallback={<div className="skiper-story-carousel story-scene-fallback" aria-label="Portraits of Divya and Deepak">{wedding.images.story.map((image) => <PhotoPlaceholder key={image.id} image={image} sizes="(max-width: 600px) 40vw, 290px" />)}</div>}>
            <Skiper49 images={wedding.images.story} />
          </Suspense>
        </div>
        <details className="story-scene-details">
          <summary>Read Our Story <ArrowRight size={17} aria-hidden="true" /></summary>
          <p>{wedding.story.expanded}</p>
        </details>
      </div>
    </section>
  );
}
