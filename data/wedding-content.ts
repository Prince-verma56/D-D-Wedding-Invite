export type WeddingImage = {
  id: string;
  /** Set a local /Images/... path when the family approves a photograph. */
  src: string | null;
  alt: string;
  artwork: "monogram" | "botanical" | "rings" | "petals" | "arches" | "venue";
  tone: "peach" | "rose" | "sage" | "cream";
  objectPosition: string;
  mobileObjectPosition?: string;
  aspectRatio: string;
};

export type WeddingEvent = {
  id: string;
  name: string;
  icon: "lotus" | "procession" | "rings";
  date: string | null;
  dateTime: string | null;
  time: string | null;
  status: "confirmed" | "pending";
  moment: string;
};

function image(id: string, artwork: WeddingImage["artwork"], tone: WeddingImage["tone"], alt: string): WeddingImage {
  return { id, src: null, alt, artwork, tone, objectPosition: "50% 40%", mobileObjectPosition: "50% 40%", aspectRatio: "4 / 5" };
}

function photograph(id: string, filename: string, alt: string, objectPosition = "50% 25%"): WeddingImage {
  return {
    ...image(id, "monogram", "peach", alt),
    src: "/Images/Vivek Sis/" + filename,
    objectPosition,
    mobileObjectPosition: objectPosition,
    aspectRatio: "2 / 3",
  };
}

export const wedding = {
  names: "Divya & Deepak",
  bride: "Divya",
  groom: "Deepak",
  monogram: { first: "D", second: "D" },
  subtitle: "The Wedding Story",
  preloader: {
    words: ["Two hearts", "One beautiful beginning"],
    line: "With our families, and all our hearts.",
  },
  date: { label: "24 November 2026", short: "24.11.2026", iso: "2026-11-24" },
  hero: {
    eyebrow: "The wedding of",
    line: "A new chapter, a lifetime together.",
  },
  story: {
    title: "A Journey of Two Hearts",
    heading: { firstLine: "A Journey of", secondLine: "Two", accent: "Hearts" },
    summary: "A story of family, values, and a bond that grew stronger with time, now ready for a new beginning.",
    expanded: "Two families come together to celebrate a beautiful new beginning. With love, shared values, and the blessings of those closest to us, we look forward to all that lies ahead.",
  },
  gallery: { title: "Captured Moments", heading: { firstLine: "Captured", secondLine: "Moments" }, line: "A few glimpses from our journey together." },
  celebration: {
    eyebrow: "The celebration",
    title: "A celebration of love",
    heading: { lead: "A celebration of", accent: "love" },
    line: "A little tradition. A lot of love.",
    note: "With our families, and with all our hearts.",
  },
  venue: {
    name: "Lav Kush Guest House",
    heading: { firstLine: "Lav Kush", secondLine: "Guest House" },
    shortAddress: "Nawabganj, Farrukhabad",
    address: "Mohammadabad Road, Nawabganj, District Farrukhabad, Uttar Pradesh",
    /** Add the family-verified map pin; no inferred map links are published. */
    mapUrl: null as string | null,
  },
  invitation: {
    eyebrow: "You're invited",
    title: "Join Us in Our Celebration",
    heading: { lead: "Join Us in Our", accent: "Celebration" },
    line: "Your presence will make our special day even more meaningful.",
  },
  links: {
    /** Approved HTTPS, WhatsApp, or mailto destinations can be connected here. */
    rsvp: null as string | null,
    blessings: null as string | null,
    introVideo: null as string | null,
  },
  events: [
    { id: "preetibhoj", name: "Preetibhoj", icon: "lotus", moment: "A shared feast", date: "24 Nov, 2026", dateTime: "2026-11-24T14:00:00+05:30", time: "02:00 PM", status: "confirmed" },
    { id: "baraat", name: "Baraat Aagman", icon: "procession", moment: "A joyful arrival", date: "24 Nov, 2026", dateTime: "2026-11-24T20:00:00+05:30", time: "08:00 PM", status: "confirmed" },
    // The invitation confirms Shubh Vivah, but its date/time remains unverified.
    // The unclear third 25 Nov invitation entry is deliberately withheld.
    { id: "vivah", name: "Shubh Vivah", icon: "rings", moment: "The wedding ceremony", date: null, dateTime: null, time: null, status: "pending" },
  ] satisfies WeddingEvent[],
  images: {
    galleryBackground: { src: "/Images/BgImages/GallerySectionBG.png" },
    invitationBackground: { src: "/Images/BgImages/InvitationBg.png" },
    invitationCard: { src: "/Images/BgImages/InvitationCenteredBG.png" },
    celebrationBackground: { src: "/Images/BgImages/The celebrationBG.png" },
    celebration: {
      lotus: { src: "/Images/Celebration/lotus-bowl.png", position: "68% 42%" },
      procession: { src: "/Images/Celebration/marigold-lantern.png", position: "78% 48%" },
      rings: { src: "/Images/Celebration/bridal-brocade.png", position: "72% 42%" },
    },
    storyBackground: { src: "/Images/BgImages/OurStoryBG.png" },
    hero: {
      ...image("hero", "monogram", "peach", "Divya and Deepak smiling together against a softly lit floral wedding backdrop"),
      src: "/Images/BgImages/HeroBG.png",
      aspectRatio: "1671 / 941",
      objectPosition: "50% 20%",
      mobileObjectPosition: "72% 0%",
    },
    story: [
      photograph("story-left", "IMG-20260614-WA0003.jpg.jpeg", "Divya standing beside Deepak in a seated couple portrait", "50% 18%"),
      photograph("story-center", "IMG-20260614-WA0008.jpg.jpeg", "Divya and Deepak together beneath the flowers", "50% 18%"),
      photograph("story-right", "IMG-20260614-WA0015.jpg.jpeg", "Divya seated with Deepak standing beside her", "50% 18%"),
    ],
    gallery: [
      photograph("gallery-1", "IMG-20260614-WA0006.jpg.jpeg", "Divya and Deepak smiling together during their ring exchange", "52% 25%"),
      photograph("gallery-2", "IMG-20260614-WA0012.jpg.jpeg", "Deepak looking at Divya as they stand together", "50% 15%"),
      photograph("gallery-3", "IMG-20260614-WA0014_1.jpg.jpeg", "Divya and Deepak posing together, with Deepak seated", "50% 20%"),
      photograph("gallery-4", "IMG-20260614-WA0007.jpg.jpeg", "The couple holding hands during their ring exchange", "53% 20%"),
      photograph("gallery-5", "IMG-20260614-WA0011.jpg.jpeg", "A full-length portrait of Divya and Deepak together", "50% 20%"),
      photograph("gallery-6", "IMG-20260716-WA0006.jpg.jpeg", "A candid moment between Divya and Deepak beneath the flowers", "50% 20%"),
    ],
    venue: {
      ...image("venue", "venue", "sage", "Decorative guest house background with softly illuminated arches and floral framing"),
      src: "/Images/BgImages/GuestHouseBG.png",
      aspectRatio: "2172 / 724",
      objectPosition: "42% 50%",
      mobileObjectPosition: "18% 50%",
    },
  },
} as const;

export const navigation = [
  { id: "home", label: "Home" },
  { id: "our-story", label: "Our Story" },
  { id: "celebration", label: "Celebration" },
  { id: "gallery", label: "Gallery" },
  { id: "venue", label: "Venue" },
  { id: "blessings", label: "Blessings" },
] as const;
