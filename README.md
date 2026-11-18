# Divya & Deepak — The Wedding Story

A single-page wedding experience built in the existing Next.js App Router project. Supplied floral and architectural backgrounds pair with cream typography and gold controls, while the gallery and closing backdrop keep a warm paper palette around the real couple photographs.

## Run locally

- Install dependencies: `npm ci`
- Development: `npm run dev` → http://localhost:3000
- Lint: `npm run lint`
- Type check: `npx tsc --noEmit`
- Production build: `npm run build`
- Serve the production build: `npm start`

The existing Next.js, React, Tailwind, TypeScript, and Turbopack configuration is preserved. GSAP, Motion, Lenis, Lucide React, and Swiper provide animation and interaction. Native HTML dialogs provide modal focus containment and Escape behavior; no backend is needed.

## Content and photographs

Edit **data/wedding-content.ts** for names, copy, event schedule, venue, destinations, and image settings. The hero uses `public/Images/BgImages/HeroBG.png`; three distinct portraits and six gallery images use the supplied couple photos. All originals under `public/Images/Vivek Sis` are preserved. The venue uses the supplied `public/Images/BgImages/GuestHouseBG.png` as a decorative architectural background.

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
- `components/wedding/WeddingPreloader.tsx`: original wedding word sequence and curved opening reveal.
- `data/wedding-content.ts`: typed, editable content.

Sections remain in normal document flow with their own spacing and clipped backgrounds. The story uses `OurStoryBG.png` and a centered Skiper UI 49 coverflow in `components/ui/skiper-ui/skiper49.tsx`. It cycles the three portraits sequentially in a continuous loop with automatic playback, swipe, arrows, dots, and a pause control. Small image collections are repeated internally so Swiper always has enough slides at the loop seam. Automatic playback stops offscreen, in background tabs, and for reduced-motion preferences. The carousel is inside a Suspense boundary with real-photo fallback content for prerendering. Skiper UI attribution is retained with the component source.

The celebration uses the supplied `The celebrationBG.png` with dark wine cards, gold borders, curved decorative image panels, and cream typography. Event dates and times remain readable below the images, and the unconfirmed ceremony keeps its pending schedule text. Cards form three columns on desktop and stack below 1000px. Generated decorative asset paths and final prompts are recorded in `docs/celebration-artwork.md`. The gallery uses the supplied GallerySectionBG.png behind components/CircularGallery.jsx. Six real wedding photographs use optimized image URLs in a gently curved, continuously looping WebGL gallery. Drag, horizontal wheel, keyboard navigation, and tap-to-expand are supported, with a pause control below. Normal vertical scrolling remains available, and the component respects reduced motion and pauses rendering offscreen. The gallery has a centered heading and a size-contained stage on phones and desktop.

Section backgrounds use namespaced, size-contained CSS; they contain no SVG nodes that could expand into a large block. Remaining ornamental SVGs have explicit intrinsic dimensions. Mobile celebration cards use a compact icon-and-heading layout with a separate date/time row.

The venue is composed in `VenueSection.tsx` and `VenueSection.css`: architecture remains on the left and cream/gold details sit on the dark right side. Below 1000px, the building sits above centered details with a feathered transition into the section color. Image positions are editable through the venue image entry. `useVenueMotion.ts` scopes a one-time image-ready fade/zoom, staggered copy, and a small desktop-only parallax movement. Reduced motion displays the complete section immediately. The section stays in normal document flow, and the map button retains the existing address dialog until a verified map URL is supplied.

The opening preloader is an original implementation, using “Two hearts”, “One beautiful beginning”, and the couple’s names from `data/wedding-content.ts`. It uses a wine background, cream and gold typography, gentle word transitions, and a curved curtain exit. The sequence normally lasts 2.3 seconds before its 0.8-second exit; it waits only for the hero image and fonts, with a 3.5-second maximum wait. Skip intro and Escape reveal the page immediately. Reduced motion bypasses the sequence. Page interactions and scrolling unlock when the reveal begins, which also starts the hero and navigation entrance animations. All timers, listeners, and temporary scroll locks are cleaned up. Without JavaScript, a CSS fallback clears the overlay after five seconds and the page is never made inert.

The Skiper registry in `components.json` uses the current `https://skiper-ui.com/r/{name}.json` endpoint. Skiper8 is now a Pro component: the former `/registry/` URL returns 404, while `/r/skiper8.json` requires authentication. This project uses the original wedding preloader chosen for this site, not the licensed Skiper8 source. To install licensed Pro components later, follow [Skiper’s Pro CLI setup](https://skiper-ui.com/docs/quick-start): add `SKIPER_LICENSE_KEY` to the ignored `.env.local` and configure the registry with an `Authorization` header containing `Bearer ${SKIPER_LICENSE_KEY}`. Never commit a license key.

The hero is rebuilt in `HeroSection.tsx` and `HeroSection.css`. The supplied background stays full-bleed on desktop. On smaller screens, both faces sit above the copy with a dark feathered transition. `useHeroMotion.ts` starts when the opening curtain reveals the mounted hero, resolves a brief blur, and passes one feathered blur band from left to right. The image animation waits for image readiness. There is no looping blur.

Component styles use namespaced global CSS because the project's existing custom Tailwind/Turbopack loader did not preserve CSS Module class exports. This keeps the existing Next.js configuration intact and avoids undefined class names. The masthead uses cream/gold over dark photographic sections, then wine/ivory over the light sections. Its height and anchor offset share one responsive CSS value.

The mobile layout stacks the hero and venue, stacks the celebration cards, and keeps the gallery swipeable. Smooth-wheel scrolling and parallax run only on desktop with a fine pointer. Parallax moves oversized background layers and the hero image interior; section frames remain stationary. Reduced motion uses native scrolling and disables GSAP reveals. A single CSS scroll-padding value accounts for the fixed header. Desktop anchors prevent competing native hash scrolling before scrolling with Lenis; mobile anchors use normal browser navigation.

The closing invitation uses `InvitationBg.png` only as the surrounding section background and `InvitationCenteredBG.png` as the center card's artwork. Both sources live in `data/wedding-content.ts`. The card retains clear RSVP and blessing actions, with stacked controls and retained floral corners on phones. `SoftSectionDivider` supplies compact, decorative transitions before and after the invitation: a feathered wine-to-paper gradient, a thin gold line, and a blurred glow. A small one-time line reveal is disabled for reduced motion. These dividers remain in normal flow, and the footer continues the pale InvitationBg.png artwork with a feathered paper-colored join.

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

The venue refinement was checked at 360, 390, 430, 768, 1024, 1440, and 1920px. Copy stayed within the section, headings and the address did not overflow, the action retained a 46px height, and the following section did not overlap. The supplied background returned an optimized WebP successfully. The venue button opened its address dialog and closed cleanly. Reduced-motion emulation left all venue details visible and cleared both image and parallax transforms.

The invitation was checked at the same seven widths: both backgrounds loaded, card content remained contained, action targets stayed at least 46px tall, and the footer did not overlap. The decorative separators stayed within 32–64px of height. RSVP and blessing dialogs were opened and closed without submitting anything. Reduced motion cleared the separator animation and left the card visible; the browser preference override was restored.

The page-wide motion pass coordinates the preloader exit with hero and masthead entrances. Section headings reveal through masks without splitting their accessible text; supporting copy, controls, individual celebration cards, story details, gallery stage, invitation content, and footer use staggered scroll entrances. Animations run once, clear temporary styles, and revert on unmount or reduced-motion changes. Venue reveals also wait for the opening sequence. Desktop background parallax remains confined to interior layers, preserving section layout.
