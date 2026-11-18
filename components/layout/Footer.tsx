import { ArrowUp } from "lucide-react";
import Image from "next/image";
import { wedding } from "@/data/wedding-content";
import { Botanical, Monogram } from "@/components/wedding/Ornaments";

export function Footer() {
  return (
    <footer className="site-footer" data-reveal>
      <div className="footer-background" aria-hidden="true"><Image src={wedding.images.invitationBackground.src} alt="" fill sizes="100vw" className="footer-backgroundImage" /></div>
      <div className="footer-mark"><Botanical /><Monogram /><Botanical /></div>
      <p className="footer-names">{wedding.names}</p>
      <p className="footer-subtitle">{wedding.subtitle}<span>✦</span>{wedding.date.short}</p>
      <a href="#home" className="back-top">Back to top <ArrowUp size={14} aria-hidden="true" /></a>
      <p className="footer-love">Made with love, for a lifetime of it.</p>
    </footer>
  );
}
