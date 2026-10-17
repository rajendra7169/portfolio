// What the site tells search engines about itself, in schema.org terms: who
// Rajendra is (so a search for the name finds this site, his photo and his
// profiles as one person), and what Blazify is. Rendered by components/JsonLd.tsx.
import { profile, socials } from "./content";

export const SITE = "https://rajendrapandey.info.np";
export const PERSON_ID = `${SITE}/#person`;
export const BLAZIFY_SITE = "https://rajendra7169.github.io/blazify/";

export const PHOTO = `${SITE}/images/rajendra-pandey-1600.webp`;

const person = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: profile.name,
  url: `${SITE}/`,
  image: PHOTO,
  jobTitle: "Software Engineer",
  description: profile.intro,
  worksFor: { "@type": "Organization", name: "Matrika Technology", url: "https://matrikatec.com.np" },
  address: { "@type": "PostalAddress", addressLocality: "Kathmandu", addressCountry: "NP" },
  knowsAbout: ["Android", "Kotlin", "Jetpack Compose", "iOS", "SwiftUI", "Flutter", "Go", ".NET", "Music players"],
  // The same person on every profile: one name, one photo, links both ways.
  sameAs: socials.filter((s) => s.href.startsWith("https://")).map((s) => s.href),
};

/** Home: the person, the site, and the page as his profile. */
export const homeGraph = {
  "@context": "https://schema.org",
  "@graph": [
    person,
    { "@type": "WebSite", "@id": `${SITE}/#website`, url: `${SITE}/`, name: profile.name, publisher: { "@id": PERSON_ID } },
    { "@type": "ProfilePage", "@id": `${SITE}/#profile`, url: `${SITE}/`, name: `${profile.name} — Software Developer in Kathmandu`, mainEntity: { "@id": PERSON_ID } },
  ],
};

/** Blazify's project page: the app, made by the person above. */
export function blazifyApp(screens: string[], icon: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Blazify",
    url: BLAZIFY_SITE,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Android, iOS, Windows, Linux",
    description:
      "A free, open-source music player for Android, iPhone, Windows and Linux that streams from YouTube Music, plays the music already on your device, and follows the words as they are sung. No ads, no tracking, no account needed.",
    image: `${SITE}${icon}`,
    screenshot: screens.map((s) => `${SITE}${s}`),
    downloadUrl: `${SITE}/dl/android`,
    license: "https://www.gnu.org/licenses/gpl-3.0.html",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Person", "@id": PERSON_ID, name: profile.name, url: `${SITE}/` },
  };
}
