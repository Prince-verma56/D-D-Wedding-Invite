import { ArrowUp } from "lucide-react";
import { wedding } from "@/data/wedding-content";
import { Botanical, Monogram } from "@/components/wedding/Ornaments";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-mark"><Botanical /><Monogram /><Botanical /></div>
      <p className="footer-names">{wedding.names}</p>
      <p className="footer-subtitle">{wedding.subtitle}<span>✦</span>{wedding.date.short}</p>
      <a href="#home" className="back-top">Back to top <ArrowUp size={14} aria-hidden="true" /></a>
      <p className="footer-love">Made with love, for a lifetime of it.</p>
      <a className="footer-credit" href="https://skiper-ui.com" target="_blank" rel="noreferrer">Carousel by Skiper UI</a>
    </footer>
  );
}
