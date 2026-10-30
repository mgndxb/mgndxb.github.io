import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono, Unbounded } from "next/font/google";

import { Cursor } from "@/components/motion/cursor";
import { SoundEffects } from "@/components/sound";
import { SoundTuner } from "@/components/sound-tuner";
import { site } from "@/content/site";

import "lenis/dist/lenis.css";
import "./globals.css";

const unbounded = Unbounded({ variable: "--font-unbounded", subsets: ["latin"] });
const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const title = `${site.name}, ${site.role.toLowerCase()} in ${site.city}`;
const description =
  "I build booking, payment and back-office systems that real businesses run on. Six products live. Open to junior developer roles in Helsinki or remote.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description,
  alternates: { canonical: "/" },
  // Kept out of search results on purpose: employers get the link from the CV or an application.
  // Link previews (og.jpg) still work when the link is shared.
  robots: { index: false, follow: false, googleBot: { index: false, follow: false, noimageindex: true } },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: site.name,
    type: "website",
    locale: "en_GB",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${site.name}, ${site.role.toLowerCase()} in ${site.city}` }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#060607",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${unbounded.variable} ${geist.variable} ${geistMono.variable}`}>
      <body>
        <noscript>
          <style>{`[data-preloader]{display:none!important}`}</style>
        </noscript>
        <Cursor />
        <SoundEffects />
        <SoundTuner />
        {children}
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
