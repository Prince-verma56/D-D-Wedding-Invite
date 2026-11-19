"use client";

import { createContext, useContext, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { MotionConfig, motion } from "motion/react";
import { ArrowRight, ArrowUpRight, CalendarDays, Check, Copy, Heart, MapPin, X } from "lucide-react";
import { wedding } from "@/data/wedding-content";
import { Botanical, FlowerMark, Lotus, Monogram } from "./Ornaments";
import "./InvitationDialog.css";

type Action = "rsvp" | "blessings" | "intro" | "venue";
const DialogContext = createContext<(action: Action) => void>(() => {});
const titles: Record<Action, string> = { rsvp: "A seat at our celebration", blessings: "A little love, a lasting blessing", intro: "A beautiful beginning", venue: "We’ll meet you here" };

export function ActionButton({ action, children, className = "", onAction }: { action: Action; children: ReactNode; className?: string; onAction?: () => void }) {
  const open = useContext(DialogContext);
  const url = action === "venue" ? wedding.venue.mapUrl : action === "rsvp" ? wedding.links.rsvp : action === "blessings" ? wedding.links.blessings : null;
  if (url) return <motion.a href={url} className={className} whileTap={{ scale: .98 }} onClick={onAction}>{children}</motion.a>;
  return <motion.button type="button" className={className} whileTap={{ scale: .98 }} onClick={() => { onAction?.(); open(action); }}>{children}</motion.button>;
}

export function WeddingExperience({ children }: { children: ReactNode }) {
  const [action, setAction] = useState<Action | null>(null);
  return <MotionConfig reducedMotion="user"><DialogContext.Provider value={setAction}>{children}{action && <ExperienceDialog key={action} action={action} close={() => setAction(null)} />}</DialogContext.Provider></MotionConfig>;
}

function ExperienceDialog({ action, close }: { action: Action; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const invitation = action === "rsvp" || action === "blessings";
  useEffect(() => {
    const element = dialog.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element?.showModal();
    window.dispatchEvent(new CustomEvent("wedding:dialog", { detail: true }));
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
      window.dispatchEvent(new CustomEvent("wedding:dialog", { detail: false }));
      previouslyFocused?.focus({ preventScroll: true });
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(wedding.venue.name + ", " + wedding.venue.address);
      setCopied(true);
      setCopyError(false);
      timeout.current = setTimeout(() => setCopied(false), 2500);
    } catch { setCopyError(true); }
  }

  return (
    <dialog ref={dialog} className={`experience-dialog${invitation ? " invitation-dialog" : ""}`} aria-labelledby="dialog-title" aria-describedby="dialog-description" data-lenis-prevent onCancel={(event) => { event.preventDefault(); close(); }} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
      <motion.div className={`dialog-panel${invitation ? " invitation-dialog-panel" : ""}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }}>
        <button className="dialog-close icon-button" onClick={close} aria-label="Close dialog"><X size={21} /></button>
        {invitation ? <header className="invitation-dialog-heading">
          <Botanical className="invitation-dialog-botanical invitation-dialog-botanical-left" />
          <Botanical className="invitation-dialog-botanical invitation-dialog-botanical-right" />
          <span className="invitation-dialog-seal" aria-hidden="true"><Lotus /></span>
          <p className="eyebrow">{action === "rsvp" ? "You’re warmly invited" : "With all our love"}</p>
          <p className="invitation-dialog-names">{wedding.bride} <span>&amp;</span> {wedding.groom}</p>
          <div className="invitation-dialog-details"><span><CalendarDays size={12} aria-hidden="true" /><time dateTime={wedding.date.iso}>{wedding.date.label}</time></span><span><MapPin size={12} aria-hidden="true" />{wedding.venue.shortAddress}</span></div>
        </header> : <><Monogram className="dialog-monogram" /><p className="eyebrow">{action === "venue" ? "The venue" : "The wedding story"}</p><h2 id="dialog-title">{titles[action]}</h2><FlowerMark /></>}
        {action === "rsvp" || action === "blessings" ? <div className="invitation-dialog-content"><p className="invitation-response-eyebrow">{action === "rsvp" ? "A celebration made complete by you" : "Words we’ll keep close to our hearts"}</p><h2 id="dialog-title">{titles[action]}</h2><GuestForm action={action} /></div> : action === "venue" ? <div className="venue-dialog-content">
          <MapPin size={27} aria-hidden="true" /><h3>{wedding.venue.name}</h3>
          <p id="dialog-description">{wedding.venue.address}</p>
          <p className="form-note">The exact map pin will be shared once confirmed by the family. For now, you can copy the venue address.</p>
          <button className="button" onClick={copyAddress}>{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? "Address copied" : "Copy address"}</button>
          <p role="status" className="copy-status">{copyError ? "Please select and copy the address above." : copied ? "Ready to paste into your maps app." : ""}</p>
        </div> : <div className="intro-dialog-content">
          {wedding.links.introVideo ? <video controls playsInline preload="metadata" src={wedding.links.introVideo} aria-label="Divya and Deepak’s wedding introduction" /> : <div className="intro-keepsake"><Heart size={28} strokeWidth={1} /><span>{wedding.names}</span><time dateTime={wedding.date.iso}>{wedding.date.label}</time></div>}
          <p id="dialog-description">{wedding.hero.line}</p>
          {!wedding.links.introVideo && <p className="form-note">Our wedding film is still to come. Until then, step into the story.</p>}
          <a href="#our-story" className="button" onClick={close}>Explore Our Story <ArrowRight size={17} /></a>
        </div>}
      </motion.div>
    </dialog>
  );
}

type GuestDraft = { name: string; attendance: string; guests: string; message: string };
const emptyDraft: GuestDraft = { name: "", attendance: "yes", guests: "1", message: "" };

function readDraft(action: "rsvp" | "blessings"): GuestDraft {
  if (typeof window === "undefined") return emptyDraft;
  try {
    const saved = JSON.parse(localStorage.getItem("wedding-" + action) || "null");
    if (saved && typeof saved === "object") {
      return {
        name: typeof saved.name === "string" ? saved.name : "",
        attendance: ["yes", "no", "maybe"].includes(saved.attendance) ? saved.attendance : "yes",
        guests: ["1", "2", "3", "4", "5", "6"].includes(saved.guests) ? saved.guests : "1",
        message: typeof saved.message === "string" ? saved.message : "",
      };
    }
  } catch { /* Private browsing or unavailable storage: the form remains usable. */ }
  return emptyDraft;
}

function GuestForm({ action }: { action: "rsvp" | "blessings" }) {
  const [draft, setDraft] = useState<GuestDraft>(() => readDraft(action));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const confirmation = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (saved) confirmation.current?.focus({ preventScroll: true });
  }, [saved]);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.name.trim() || (action === "blessings" && !draft.message.trim())) { setError("Please add your name" + (action === "blessings" ? " and a blessing." : ".")); return; }
    try {
      localStorage.setItem("wedding-" + action, JSON.stringify({ ...draft, name: draft.name.trim(), message: draft.message.trim() }));
      setError(""); setSaved(true);
    } catch { setError("This browser couldn’t save your draft. Your text is still here to copy."); }
  }
  if (saved) return <div ref={confirmation} tabIndex={-1} className="form-success" role="status"><span className="success-icon"><Check size={25} /></span><h3>{action === "rsvp" ? "Your response is saved" : "Your words are saved"}</h3><p id="dialog-description">Saved on this device. Nothing has been sent to the family yet.</p><p className="form-note">Once the family’s contact is connected, you’ll be able to share {action === "rsvp" ? "your RSVP" : "your blessings"} directly.</p><button className="button button-outline" onClick={() => setSaved(false)}>Edit my {action === "rsvp" ? "response" : "blessing"} <ArrowRight size={16} /></button></div>;
  return (
    <form className="guest-form" onSubmit={submit}>
      <p id="dialog-description">{action === "rsvp" ? "We’d love to celebrate with you." : "A few heartfelt words for a beautiful forever."}</p>
      <label htmlFor="guest-name">Your name<input id="guest-name" autoComplete="name" required maxLength={80} placeholder="Your full name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
      {action === "rsvp" ? <>
        <div className="guest-form-row"><label htmlFor="guest-attendance">Will you be joining us?<select id="guest-attendance" value={draft.attendance} onChange={(event) => setDraft({ ...draft, attendance: event.target.value })}><option value="yes">Joyfully attending</option><option value="maybe">Still making plans</option><option value="no">Celebrating from afar</option></select></label>
        {draft.attendance !== "no" && <label htmlFor="guest-count">Guests, including you<select id="guest-count" value={draft.guests} onChange={(event) => setDraft({ ...draft, guests: event.target.value })}>{[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>)}</select></label>}</div>
      </> : <label htmlFor="guest-blessing">Your blessing<textarea id="guest-blessing" rows={4} required maxLength={1000} placeholder="Wishing you a lifetime of…" value={draft.message} onChange={(event) => setDraft({ ...draft, message: event.target.value })} /></label>}
      <p className="form-note invitation-draft-note">Your {action === "rsvp" ? "response" : "blessing"} is saved on this device. Nothing is sent to the family yet.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button" type="submit">Save my {action === "rsvp" ? "response" : "blessing"} <ArrowUpRight size={17} /></button>
    </form>
  );
}
