import Image from "next/image";
import type { CSSProperties } from "react";
import { ArrowUpRight, Heart } from "lucide-react";
import { wedding } from "@/data/wedding-content";
import { ActionButton } from "@/components/wedding/WeddingExperience";
import { Lotus } from "@/components/wedding/Ornaments";
import "./InvitationSection.css";

export function InvitationSection() {
  return (
    <section id="blessings" className="invitation-scene section-anchor" aria-labelledby="invitation-title" style={{ "--invitation-card-background": 'url("' + wedding.images.invitationCard.src + '")' } as CSSProperties}>
      <div className="invitation-scene-background" aria-hidden="true"><Image src={wedding.images.invitationBackground.src} alt="" fill sizes="100vw" className="invitation-scene-backgroundImage" /></div>
      <div className="section-shell invitation-scene-shell">
        <div className="invitation-scene-card" data-reveal>
          <div className="invitation-scene-artwork" aria-hidden="true"><Image src={wedding.images.invitationCard.src} alt="" fill sizes="(max-width: 999px) 100vw, 1400px" className="invitation-scene-cardImage" /></div>
          <div className="invitation-scene-content">
            <p className="invitation-scene-eyebrow"><span />{wedding.invitation.eyebrow}<span /></p>
            <h2 id="invitation-title">{wedding.invitation.heading.lead} <em>{wedding.invitation.heading.accent}</em></h2>
            <p className="invitation-scene-message">{wedding.invitation.line}</p>
            <div className="invitation-scene-actions">
              <ActionButton action="rsvp" className="button invitation-scene-rsvp">RSVP Now <ArrowUpRight size={17} aria-hidden="true" /></ActionButton>
              <ActionButton action="blessings" className="invitation-scene-blessings"><Heart size={16} aria-hidden="true" />Send Your Blessings</ActionButton>
            </div>
            <div className="invitation-scene-flourish" aria-hidden="true"><span /><Lotus /><span /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
