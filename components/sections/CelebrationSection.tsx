import { CalendarDays, Clock3, Sparkles } from "lucide-react";
import Image from "next/image";
import { wedding } from "@/data/wedding-content";
import { FlowerMark, Lotus, Rings } from "@/components/wedding/Ornaments";
import "./CelebrationSection.css";

function ProcessionIcon() {
  return <svg width="32" height="28" viewBox="0 0 64 56" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M9 28h46M15 28c0-20 34-20 34 0M32 8V2m-6 0h12M11 28v19m42-19v19M6 47h52M22 29v18m20-18v18M18 52h28" /><path d="M27 35c0-6 10-6 10 0v12H27Z" /></svg>;
}

export function CelebrationSection() {
  return (
    <section id="celebration" className="celebration-scene section-anchor" aria-labelledby="celebration-title" data-nav-theme="dark">
      <div className="celebration-scene-background" aria-hidden="true">
        <div className="celebration-scene-scenery" data-background-parallax><Image src={wedding.images.celebrationBackground.src} alt="" fill sizes="100vw" loading="eager" className="celebration-scene-backgroundImage" /></div>
      </div>
      <svg className="celebration-scene-definitions" width="0" height="0" aria-hidden="true" focusable="false"><defs><clipPath id="celebration-card-wave" clipPathUnits="objectBoundingBox"><path d="M.23 0 C.62 .08 .74 1.22 1 .88 V0Z" /></clipPath></defs></svg>
      <div className="section-shell celebration-scene-content">
        <div className="celebration-scene-heading" data-reveal>
          <p className="celebration-scene-eyebrow">{wedding.celebration.eyebrow}</p>
          <h2 id="celebration-title">{wedding.celebration.heading.lead} <em>{wedding.celebration.heading.accent}</em></h2>
          <p className="celebration-scene-subtitle">{wedding.celebration.line}</p>
        </div>
        <div className="celebration-scene-events">
          {wedding.events.map((event, index) => (
            <article className="wedding-event celebration-card" key={event.id} aria-labelledby={event.id + "-title"}>
              <div className="celebration-card-artwork" aria-hidden="true">
                <Image src={wedding.images.celebration[event.icon].src} alt="" fill sizes="(max-width: 599px) 100vw, (max-width: 999px) 560px, 33vw" className="celebration-card-image" style={{ objectPosition: wedding.images.celebration[event.icon].position }} />
                <svg className="celebration-card-curve" width="500" height="150" viewBox="0 0 500 150" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false"><path d="M115 0 C310 12 370 183 500 132" /></svg>
              </div>
              <div className="celebration-card-icon">{event.icon === "lotus" ? <Lotus /> : event.icon === "rings" ? <Rings /> : <ProcessionIcon />}</div>
              <p className="celebration-card-moment">{event.moment}</p>
              <div className="celebration-card-heading"><h3 id={event.id + "-title"}>{event.name}</h3><span className="celebration-card-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}<span> / {String(wedding.events.length).padStart(2, "0")}</span></span></div>
              <div className="celebration-card-divider" aria-hidden="true" />
              {event.dateTime && event.time ? <time className="celebration-card-schedule" dateTime={event.dateTime}>
                <span className="celebration-card-date"><CalendarDays size={18} aria-hidden="true" />{event.date}</span>
                <span className="celebration-card-time"><Clock3 size={18} aria-hidden="true" /><strong>{event.time.split(" ")[0]}</strong><span>{event.time.split(" ")[1]}</span></span>
              </time> : <div className="celebration-card-pending"><span><Sparkles size={19} aria-hidden="true" />A sacred new beginning</span><p>Schedule to be confirmed</p></div>}
            </article>
          ))}
        </div>
        <div className="celebration-scene-closing" data-reveal><FlowerMark /><p>{wedding.celebration.note}</p></div>
      </div>
    </section>
  );
}
