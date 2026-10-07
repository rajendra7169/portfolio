import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Sans, Martian_Mono } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";

// Display: Archivo's width axis (62–125) drives the kinetic type.
const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });
const mono = Martian_Mono({ subsets: ["latin"], variable: "--font-martian", display: "swap" });

export const metadata: Metadata = {
  title: "Rajendra Pandey — Software developer, Kathmandu",
  description:
    "Software developer at Matrika Technology in Kathmandu and the maker of Blazify, a free, open-source music player for Android, iPhone and desktop.",
  metadataBase: new URL("https://rajendrapandey.info.np"),
  openGraph: {
    title: "Rajendra Pandey",
    description: "Software developer in Kathmandu. Maker of Blazify.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#060607", colorScheme: "dark" };

// Runs before paint so motion-enabled visitors never see the un-animated hero flash.
const motionFlag = `if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion-ok')`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionFlag }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
