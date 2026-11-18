import Image from "next/image";
import type { CSSProperties } from "react";
import { wedding, type WeddingImage } from "@/data/wedding-content";
import { Botanical, Lotus, Monogram, Rings } from "./Ornaments";

type Props = { image: WeddingImage; className?: string; sizes?: string; preload?: boolean; parallax?: boolean };

/** The frame owns its proportions; replacing artwork never changes the layout. */
export function PhotoPlaceholder({ image, className = "", sizes = "(max-width: 767px) 85vw, 35vw", preload = false, parallax = false }: Props) {
  const style = {
    "--photo-ratio": image.aspectRatio,
    "--photo-position": image.objectPosition,
    "--photo-position-mobile": image.mobileObjectPosition || image.objectPosition,
  } as CSSProperties;
  return (
    <div className={"photo-frame tone-" + image.tone + " artwork-" + image.artwork + (parallax ? " parallax-photo " : " ") + className} style={style}>
      <div className="photo-surface" data-photo-parallax={parallax || undefined}>
      {image.src ? <Image src={image.src} alt={image.alt} fill sizes={sizes} preload={preload} className="wedding-photo" /> : (
        <div className="placeholder-art" role="img" aria-label={image.alt}>
          <div className="art-light" /><div className="art-arch art-arch-outer" /><div className="art-arch art-arch-inner" />
          {image.artwork === "venue" ? (
            <svg className="venue-drawing" width="720" height="460" viewBox="0 0 720 460" fill="none" aria-hidden="true" focusable="false">
              <path d="M0 390h720M40 374V154h640v220M27 155h666M36 136h648M66 136v-24h588v24M98 372V245c0-103 124-103 124 0v127M298 372V245c0-103 124-103 124 0v127M498 372V245c0-103 124-103 124 0v127" stroke="currentColor" strokeWidth="2" />
              <path d="M78 374V234c0-126 164-126 164 0v140M278 374V234c0-126 164-126 164 0v140M478 374V234c0-126 164-126 164 0v140M66 374h188M266 374h188M466 374h188M103 98h514M151 77h418" stroke="currentColor" strokeWidth=".7" />
              <path d="M100 290v82h120V245c0-101-120-101-120 0v45Zm200 0v82h120V245c0-101-120-101-120 0v45Zm200 0v82h120V245c0-101-120-101-120 0v45Z" fill="currentColor" opacity=".055" />
              <path d="M360 112V52m-12 2 12-20 12 20M43 411h634M100 434h520" stroke="currentColor" strokeWidth="1" />
              {[160, 360, 560].map((x) => <g key={x} stroke="currentColor" strokeWidth="1"><path d={"M" + x + " 179v40m-11 0h22l5 30h-32Z"} /><circle cx={x} cy="233" r="4" fill="currentColor" /></g>)}
            </svg>
          ) : image.artwork === "botanical" ? <Botanical className="art-botanical-feature" flowers /> : image.artwork === "petals" ? (
            <div className="art-petals" aria-hidden="true">{[0, 1, 2, 3, 4, 5].map((n) => <i key={n} style={{ "--petal": n } as CSSProperties} />)}<span /></div>
          ) : image.artwork === "arches" ? <div className="art-twin-arches" aria-hidden="true"><i /><i /><Lotus /></div> : (
            <div className="art-center">{image.artwork === "rings" ? <><Rings className="art-rings" /><span className="art-script">Together, always.</span></> : <><span className="art-eyebrow">A beautiful beginning</span><Monogram className="art-monogram" /><span className="art-date">{wedding.date.short.replaceAll(".", " · ")}</span></>}</div>
          )}
          <Botanical className="art-branch art-branch-left" /><Botanical className="art-branch art-branch-right" flowers />
          <div className="art-floor" />
        </div>
      )}
      </div>
    </div>
  );
}
