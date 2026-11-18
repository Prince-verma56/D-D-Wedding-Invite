import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Geist } from "next/font/google";
import { wedding } from "@/data/wedding-content";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const sans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: wedding.names + " | The Wedding Story",
  description: wedding.hero.line + " Join us on " + wedding.date.label + " in " + wedding.venue.shortAddress + ".",
  openGraph: {
    title: wedding.names + " | The Wedding Story",
    description: wedding.hero.line,
    type: "website",
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Extensions inject attributes on these two document elements before hydration.
  // Keep the escape hatch here so descendant hydration diagnostics remain active.
  return (
    <html
      lang="en"
      className={cn(sans.variable + " " + display.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
