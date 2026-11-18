# Divya & Deepak — The Wedding Story

A single-page wedding experience built in the existing Next.js App Router project. The hero and story use the supplied floral backgrounds, cream typography, and gold controls. The remaining sections keep their warm blush paper, wine typography, and real couple photography.

## Run locally

- Install dependencies: `npm ci`
- Development: `npm run dev` → http://localhost:3000
- Lint: `npm run lint`
- Type check: `npx tsc --noEmit`
- Production build: `npm run build`
- Serve the production build: `npm start`

The existing Next.js, React, Tailwind, TypeScript, and Turbopack configuration is preserved. GSAP, Motion, Lenis, Lucide React, and Swiper provide animation and interaction. Native HTML dialogs provide modal focus containment and Escape behavior; no backend is needed.

## Content and photographs

Edit **data/wedding-content.ts** for names, copy, event schedule, venue, destinations, and image settings. The hero now uses `public/Images/BgImages/HeroBG.png`; three distinct portraits and six gallery images use the supplied couple photos. All originals under `public/Images/Vivek Sis` are preserved. The venue remains an explicitly labelled illustration because a verified venue photograph has not been supplied.

For each approved photograph:

1. Set its image entry's `src` to a path under `public`, beginning with `/`.
2. Update `alt` with a useful photograph description.
3. Adjust `objectPosition` and `mobileObjectPosition` to preserve both faces.

`PhotoPlaceholder` automatically switches to Next.js Image when a source is supplied. Frame proportions stay fixed, with explicit responsive image sizes and hero preloading. The artwork and originals are separate.

## Destinations and preview interactions

- `links.rsvp`: approved RSVP / WhatsApp / email destination.
- `links.blessings`: approved blessing destination.
- `links.introVideo`: approved video asset.
- `venue.mapUrl`: family-verified map pin.

Until those are connected, the relevant controls open accessible preview dialogs. RSVP and blessings drafts are saved only in this browser's local storage, with clear disclosure before and after saving. **Nothing is sent to the family.** The venue dialog provides the confirmed postal address and a copy button. The intro dialog presents a keepsake and a link to the story.

Set `NEXT_PUBLIC_SITE_URL` to the actual HTTPS origin when hosting. Local development defaults to http://localhost:3000. The generated Open Graph image uses centralized wedding content.

## Components

- `app/page.tsx`: server-rendered page composition.
- `app/layout.tsx`: optimized Cormorant Garamond / DM Sans fonts and metadata.
- `app/globals.css`: design tokens, editorial layouts, artwork, responsive transformations, and reduced-motion styles.
- `components/layout/`: sticky navigation, active section state, mobile navigation, and footer.
- `components/sections/`: hero, story, celebration, gallery, venue, and invitation.
- `components/wedding/`: replaceable artwork frames, botanical ornaments, swipe / keyboard carousel, and preview dialogs.
- `components/animations/AnimationProvider.tsx`: GSAP entrance / ScrollTrigger choreography and desktop Lenis synchronization, with cleanup.
- `components/ui/Button.tsx`: shared anchor button.
- `data/wedding-content.ts`: typed, editable content.

Sections remain in normal document flow with their own spacing and clipped backgrounds. The story uses `OurStoryBG.png` and a centered Skiper UI 49 coverflow in `components/ui/skiper-ui/skiper49.tsx`. It cycles the three portraits sequentially in a continuous loop with automatic playback, swipe, arrows, dots, and a pause control. Small image collections are repeated internally so Swiper always has enough slides at the loop seam. Automatic playback stops offscreen, in background tabs, and for reduced-motion preferences. The carousel is inside a Suspense boundary with real-photo fallback content for prerendering. Skiper UI attribution is retained in the source and site footer.

The celebration uses the supplied `The celebrationBG.png` with dark wine cards, gold borders, curved decorative image panels, and cream typography. Event dates and times remain readable below the images, and the unconfirmed ceremony keeps its pending schedule text. Cards form three columns on desktop and stack below 1000px. Generated decorative asset paths and final prompts are recorded in `docs/celebration-artwork.md`. Gallery photographs stay inside their viewport, with controls below the images.

Section backgrounds use namespaced, size-contained CSS gradients in `Ornaments.css`; they contain no SVG nodes that could expand into a large block. Remaining ornamental SVGs have explicit intrinsic dimensions. The venue illustration caption occupies its own row, clear of the drawing. Mobile celebration cards use a compact icon-and-heading layout with a separate date/time row.

The hero is rebuilt in `HeroSection.tsx` and `HeroSection.css`. The supplied background stays full-bleed on desktop. On smaller screens, both faces sit above the copy with a dark feathered transition. `useHeroMotion.ts` starts animations only after the hero mounts, resolves a brief blur, and passes one feathered blur band from left to right. The image animation waits for image readiness while text enters immediately. There is no looping blur or loading gate.

Component styles use namespaced global CSS because the project's existing custom Tailwind/Turbopack loader did not preserve CSS Module class exports. This keeps the existing Next.js configuration intact and avoids undefined class names. The masthead uses cream/gold over the hero and story, then wine/ivory over the light sections. Its height and anchor offset share one responsive CSS value.

The mobile layout stacks the hero and venue, stacks the celebration cards, and keeps the gallery swipeable. Smooth-wheel scrolling and parallax run only on desktop with a fine pointer. Parallax moves oversized background layers and the hero image interior; section frames remain stationary. Reduced motion uses native scrolling and disables GSAP reveals. A single CSS scroll-padding value accounts for the fixed header. Desktop anchors prevent competing native hash scrolling before scrolling with Lenis; mobile anchors use normal browser navigation.

## Content still needed

- A verified venue photograph, if desired.
- Exact Shubh Vivah date and time.
- Confirmation of the unclear third invitation entry on 25 November; it is withheld from the page.
- Approved RSVP and blessing recipients.
- Verified venue map pin and optional intro video.
- Public hosting origin for sharing metadata.

The confirmed schedule currently shows Preetibhoj on 24 November 2026 at 2 PM and Baraat Aagman that evening at 8 PM.

## Verification status

Lint and production build (including TypeScript) passed. All ten configured photographs returned HTTP 200 through Next.js image optimization.

Chrome was reachable through Computer Use during the photography refinement. Browser layout measurements at 360, 390, 430, 768, 1024, 1440, and 1920 pixels confirmed no horizontal page overflow, no overlapping section boxes, and correctly positioned image parents. Desktop and mobile layouts were visually inspected. The mobile menu and gallery next-button, arrow-key, and drag interactions were exercised successfully.

The subsequent screenshot review covered the hero, story transition, celebration, gallery, venue, invitation, and footer. After removing background SVGs and refining spacing, measurements at the same seven widths found no overflowing headings or copy, oversized ornamental SVGs, or decorative blocks in normal flow.

Reduced-motion emulation was checked at mobile and desktop widths: smoothing was disabled, story content remained fully visible, and the hero photo interior had no animated transform. The browser motion override was then restored.


