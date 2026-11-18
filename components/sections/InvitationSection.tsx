import { ArrowUpRight, Heart } from "lucide-react";
import { wedding } from "@/data/wedding-content";
import { ActionButton } from "@/components/wedding/WeddingExperience";
import { Botanical } from "@/components/wedding/Ornaments";

export function InvitationSection() {
  return (
    <section id="blessings" className="invitation-section section-anchor" aria-labelledby="invitation-title">
      <div className="invitation-panel" data-reveal>
        <Botanical className="invitation-branch invitation-branch-left" />
        <Botanical className="invitation-branch invitation-branch-right" />
        <div className="invitation-content">
          <p className="eyebrow">{wedding.invitation.eyebrow}</p>
          <h2 id="invitation-title">{wedding.invitation.title}</h2>
          <p>{wedding.invitation.line}</p>
          <div className="invitation-actions">
            <ActionButton action="rsvp" className="button button-cream">RSVP Now <ArrowUpRight size={17} aria-hidden="true" /></ActionButton>
            <ActionButton action="blessings" className="blessings-button"><Heart size={15} aria-hidden="true" />Send Your Blessings</ActionButton>
          </div>
        </div>
      </div>
    </section>
  );
}
