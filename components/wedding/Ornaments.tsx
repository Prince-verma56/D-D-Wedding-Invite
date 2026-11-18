import { wedding } from "@/data/wedding-content";
import "./Ornaments.css";

export function Monogram({ className = "" }: { className?: string }) {
  return <span className={"monogram " + className} aria-label={wedding.names}>{wedding.monogram.first}<span>&</span>{wedding.monogram.second}</span>;
}

export function Lotus({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="32" height="24" viewBox="0 0 64 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M32 38C15 26 24 13 32 4c8 9 17 22 0 34Z" />
      <path d="M32 38C12 38 7 24 9 14c13 2 22 9 23 24Zm0 0c20 0 25-14 23-24-13 2-22 9-23 24Z" />
      <path d="M32 39C15 45 4 34 2 26c10-1 19 1 30 13Zm0 0c17 6 28-5 30-13-10-1-19 1-30 13ZM16 44h32" />
    </svg>
  );
}

export function Rings({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="32" height="28" viewBox="0 0 64 56" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <circle cx="24" cy="34" r="17" /><circle cx="42" cy="34" r="17" />
      <path d="m21 12-5-6 5-5h10l5 5-5 6M16 6h20M21 1l5 11 5-11" />
    </svg>
  );
}

export function Botanical({ className = "", flowers = false }: { className?: string; flowers?: boolean }) {
  return (
    <svg className={"botanical " + className} width="120" height="190" viewBox="0 0 240 380" fill="none" aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeWidth="1.15" strokeLinecap="round">
        <path d="M42 372C60 301 88 263 116 203S166 97 183 13M82 284c-32-25-45-60-42-96M110 218c-5-35-2-64 9-95M139 151c27-10 49-28 66-51M61 331c27 1 56-11 76-31M161 91c-15-26-22-47-21-69" />
        <path d="M40 191c-29-4-36-24-35-39 23 2 35 15 35 39Zm4 30c24-9 30-30 22-48-16 11-23 27-22 48Zm19 40c-29-4-43-23-42-41 22 0 36 13 42 41Zm53-59c-28-9-36-31-30-49 24 7 33 24 30 49Zm6-26c26-4 39-23 35-43-22 5-34 20-35 43Zm18-33c-26-12-32-33-23-50 20 9 29 26 23 50Zm15-31c27 1 43-14 45-33-23 0-40 11-45 33Zm13-42c-24-12-26-34-17-48 20 10 25 26 17 48Zm13-26c22-3 36-20 33-38-20 3-33 17-33 38ZM84 321c8-23 25-35 45-31-6 21-23 32-45 31Zm19-68c10-22 31-30 48-22-11 21-28 28-48 22Z" fill="currentColor" fillOpacity=".1" />
      </g>
      {flowers && <g className="botanical-flowers">
        {[{ x: 51, y: 220, r: 23 }, { x: 145, y: 127, r: 26 }, { x: 189, y: 52, r: 18 }, { x: 118, y: 273, r: 19 }].map(({ x, y, r }, i) => (
          <g key={i} transform={"translate(" + x + " " + y + ")"}>
            {[0, 60, 120, 180, 240, 300].map((angle) => <ellipse key={angle} rx={r * .38} ry={r * .68} cy={-r * .5} transform={"rotate(" + angle + ")"} fill={i % 2 ? "#f7dfd1" : "#d9a39e"} stroke="#c79079" strokeWidth=".6" />)}
            <circle r={r * .2} fill="#b68243" /><circle r={r * .09} fill="#772b3c" />
          </g>
        ))}
      </g>}
    </svg>
  );
}

export function FlowerMark({ className = "" }: { className?: string }) {
  return <div className={"flower-rule " + className} aria-hidden="true"><span /><Lotus /><span /></div>;
}

/** Empty, scoped CSS backgrounds cannot introduce an SVG-sized block into flow. */
export function SectionAtmosphere({ variant = "blush" }: { variant?: "blush" | "champagne" | "sage" }) {
  return (
    <div className={"section-atmosphere atmosphere-" + variant} aria-hidden="true">
      <div className="section-atmosphere-glow" data-background-parallax />
    </div>
  );
}
