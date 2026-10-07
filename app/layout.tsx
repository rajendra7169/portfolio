import type { Metadata, Viewport } from "next";
import { Figtree, Google_Sans_Code, Mrs_Saint_Delafield } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { PageTransition } from "@/components/PageTransition";
import Header from "@/components/Header";
import ScrollUI from "@/components/ScrollUI";
import Cursor from "@/components/Cursor";
import { Footer } from "@/components/Bits";

// Display: a signature script for the logo, standing in for the original's Agustina.
const display = Mrs_Saint_Delafield({ subsets: ["latin"], weight: "400", variable: "--font-mrs", display: "swap" });
// Body: Figtree is the closest open match to the original's Google Sans.
const body = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });
const mono = Google_Sans_Code({ subsets: ["latin"], variable: "--font-gsc", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Rajendra's Portfolio", template: "%s · Rajendra Pandey" },
  description:
    "Software developer at Matrika Technology in Kathmandu, and the maker of Blazify — a free, open-source music player for Android, iPhone and desktop.",
  metadataBase: new URL("https://rajendrapandey.info.np"),
  openGraph: { title: "Rajendra Pandey", description: "Software developer in Kathmandu. Maker of Blazify.", type: "website" },
};

export const viewport: Viewport = { themeColor: "#edf9fe" };

// Runs before paint, so motion-enabled visitors never see content flash before it animates in.
const motionFlag = `if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion-ok')`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionFlag }} />
      </head>
      <body>
        <SmoothScroll>
          <PageTransition>
            <a className="skip" href="#main">
              Skip to content
            </a>
            <Header />
            <main id="main">{children}</main>
            <Footer />
            <ScrollUI />
            <Cursor />
          </PageTransition>
        </SmoothScroll>
      </body>
    </html>
  );
}
