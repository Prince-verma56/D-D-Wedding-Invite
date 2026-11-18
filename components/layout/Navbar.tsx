"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { navigation } from "@/data/wedding-content";
import { Monogram } from "@/components/wedding/Ornaments";
import { ActionButton } from "@/components/wedding/WeddingExperience";

export function Navbar() {
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const sections = navigation.map(({ id }) => document.getElementById(id)).filter((node): node is HTMLElement => !!node);
    let observer: IntersectionObserver;
    let darkObserver: IntersectionObserver;
    let resizeFrame = 0;
    const observeSections = () => {
      observer?.disconnect();
      darkObserver?.disconnect();
      const headerHeight = header.current?.offsetHeight || 80;
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); });
      }, { rootMargin: "-" + (headerHeight + 12) + "px 0px -" + Math.max(0, window.innerHeight - headerHeight - 172) + "px 0px", threshold: 0 });
      sections.forEach((section) => observer.observe(section));
      const darkSections = new Set<Element>();
      darkObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) darkSections.add(entry.target);
          else darkSections.delete(entry.target);
        });
        header.current?.classList.toggle("is-over-dark", darkSections.size > 0);
      }, { rootMargin: "-" + headerHeight + "px 0px -" + Math.max(0, window.innerHeight - headerHeight - 1) + "px 0px", threshold: 0 });
      document.querySelectorAll('#home, [data-nav-theme="dark"]').forEach((section) => darkObserver.observe(section));
    };
    const onResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(observeSections);
    };
    observeSections();
    window.addEventListener("resize", onResize);
    // A short final section cannot always reach the upper observer band.
    const footerObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setActive("blessings");
    }, { threshold: .2 });
    const footer = document.querySelector(".site-footer");
    if (footer) footerObserver.observe(footer);
    const sentinel = document.querySelector(".nav-sentinel");
    const scrollObserver = new IntersectionObserver(([entry]) => {
      header.current?.classList.toggle("is-scrolled", !entry.isIntersecting);
    });
    if (sentinel) scrollObserver.observe(sentinel);
    return () => {
      observer.disconnect(); darkObserver.disconnect(); footerObserver.disconnect(); scrollObserver.disconnect();
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(resizeFrame);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
    };
    const onPointer = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1000px)");
    const onDesktop = () => { if (desktop.matches) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    desktop.addEventListener("change", onDesktop);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [open]);

  function selectSection(id: string) { setActive(id); setOpen(false); }

  return (
    <>
      <div className="nav-sentinel" aria-hidden="true" />
      <header ref={header} className="site-header is-over-dark">
        <div className="nav-shell">
          <a className="brand" href="#home" aria-label="Divya and Deepak — home" onClick={() => selectSection("home")}><Monogram /></a>
          <nav className="desktop-nav" aria-label="Main navigation">
            {navigation.map(({ id, label }) => <a key={id} href={"#" + id} aria-current={active === id ? "location" : undefined} onClick={() => selectSection(id)}>{label}<span /></a>)}
          </nav>
          <div className="nav-actions">
            <ActionButton action="rsvp" className="button nav-rsvp" onAction={() => setOpen(false)}>RSVP <ArrowUpRight size={16} aria-hidden="true" /></ActionButton>
            <button ref={toggle} className="menu-toggle icon-button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X size={23} /> : <Menu size={23} />}</button>
          </div>
        </div>
        <AnimatePresence>
          {open && <motion.nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation" initial={{ opacity: 0, y: reduced ? 0 : -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -8 }} transition={{ duration: .2 }}>
            {navigation.map(({ id, label }, index) => <a key={id} href={"#" + id} aria-current={active === id ? "location" : undefined} onClick={() => selectSection(id)}><span>0{index + 1}</span>{label}<ArrowUpRight size={16} aria-hidden="true" /></a>)}
            <p>Two hearts. One beautiful beginning.</p>
          </motion.nav>}
        </AnimatePresence>
      </header>
    </>
  );
}
