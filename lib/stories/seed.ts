// Sample content for the demo store (no Supabase configured): a few writers and
// posts of every kind, so the pages have something to show on a first visit.
// All of it can be edited or deleted in the admin; none of it reaches Supabase.
import type { Doc, Post, Profile } from "./types";

const t = (text: string, marks?: { type: string; attrs?: Record<string, unknown> }[]) => ({ type: "text", text, ...(marks ? { marks } : {}) });
const p = (...parts: (string | Doc)[]): Doc => ({ type: "paragraph", content: parts.map((x) => (typeof x === "string" ? t(x) : x)) });
const h = (level: 2 | 3, text: string): Doc => ({ type: "heading", attrs: { level }, content: [t(text)] });
const fig = (src: string, align: string, width: number, caption: string): Doc => ({ type: "storyImage", attrs: { src, align, width, caption, alt: caption } });
const quote = (text: string): Doc => ({ type: "blockquote", content: [p(text)] });
const rule: Doc = { type: "horizontalRule" };
/** A poem: each line its own centred paragraph, a blank line between stanzas. */
const verse = (text: string): Doc[] =>
  text
    .trim()
    .split("\n")
    .map((l) => (l.trim() ? { type: "paragraph", attrs: { textAlign: "center" }, content: [t(l.trim())] } : { type: "paragraph", attrs: { textAlign: "center" } }));
const doc = (...content: (Doc | Doc[])[]): Doc => ({ type: "doc", content: content.flat() });

const day = (d: string) => new Date(`${d}T09:00:00+05:45`).toISOString();

export const SEED_PROFILES: Profile[] = [
  {
    id: "u-rajendra",
    username: "rajendra",
    name: "Rajendra Pandey",
    bio: "Software engineer in Kathmandu. I build apps by day and write gajal, kabita and the odd story by night.",
    avatar: "/images/resume-photo-800.webp",
    banner: "/stories/art/hills.svg",
    role: "admin",
    status: "active",
    joined: day("2024-01-01"),
  },
  {
    id: "u-aarati",
    username: "aarati",
    name: "Aarati Shrestha",
    bio: "Sample author for the demo. Edit or remove this account in the admin panel.",
    avatar: null,
    banner: "/stories/art/rain.svg",
    role: "author",
    status: "active",
    joined: day("2026-03-02"),
  },
  {
    id: "u-kiran",
    username: "kiran",
    name: "Kiran Rai",
    bio: "Sample author for the demo. Edit or remove this account in the admin panel.",
    avatar: null,
    banner: "/stories/art/flags.svg",
    role: "author",
    status: "active",
    joined: day("2026-04-11"),
  },
];

const base = { status: "published" as const, coverPosition: "50% 50%", featured: false, refs: [] as string[] };

export const SEED_POSTS: Post[] = [
  {
    ...base,
    id: "p-blazify",
    slug: "four-apps-one-music-player",
    type: "blog",
    title: "Four apps, one music player",
    subtitle: "What I learned shipping Blazify natively on Android, iPhone, Linux and Windows.",
    cover: "/projects/blazify/desk-home.webp",
    coverLayout: "full",
    lang: "en",
    tags: ["blazify", "engineering"],
    authorId: "u-rajendra",
    featured: true,
    refs: ["p-teashop"],
    publishedAt: day("2026-08-04"),
    createdAt: day("2026-08-01"),
    updatedAt: day("2026-08-04"),
    content: doc(
      p("Blazify started as a music player I wanted for myself: no ads, no tracking, no account, and fast on a cheap phone. It became four apps."),
      h(2, "Native, four times"),
      p("The Android app is Kotlin and Jetpack Compose. The iPhone app is written from scratch in SwiftUI, not a port. Linux and Windows share a Compose Desktop app. Writing the same player four times sounds wasteful until you use them: each one feels like it belongs on its system."),
      fig("/projects/blazify/phone-player.webp", "right", 38, "The Android player, repainted by the song's artwork."),
      p("What they share is not code but decisions: how a queue behaves, what happens when the signal drops, how lyrics line up with the music. I keep those decisions written down and hold every app to them."),
      quote("A feature is done when it works the same way on the bus, on the desk and on the other person's phone."),
      h(2, "Listening together"),
      p("The part people ask about most is Listen Together: one person hosts, friends join with a code, and every play, pause and skip lands on all of them at once. The server is small, written in Go and running on Docker. It carries which song and which second, never the audio."),
      fig("/projects/blazify/desk-looks.webp", "wide", 100, "The desktop app, with its player designs."),
      p("If you want the longer version, ", t("the project page", [{ type: "link", attrs: { href: "/projects/blazify" } }]), " walks through all of it."),
    ),
  },
  {
    ...base,
    id: "p-gajal",
    slug: "sahar-ajhai-jalirahyo",
    type: "gajal",
    title: "सहर अझै जलिरह्यो",
    subtitle: "",
    cover: null,
    coverLayout: "none",
    lang: "ne",
    tags: ["gajal"],
    authorId: "u-rajendra",
    refs: ["p-pahad"],
    publishedAt: day("2026-09-12"),
    createdAt: day("2026-09-10"),
    updatedAt: day("2026-09-12"),
    content: doc(
      verse(`
सडकका बत्ती निभे पनि आँखा जलिरह्यो,
तिमी गयौ, यो सहर भने तिमीतिरै ढलिरह्यो।

चिया सेलाए टेबलमा, कुरा अधुरै रहे,
झ्यालबाहिर पानी परेको आवाज चलिरह्यो।

मैले लेखेका चिठी कहिल्यै पठाइनँ,
तर कलम हरेक रात तिम्रै नाम बलिरह्यो।

भुल्छु भन्थेँ, भुल्ने बाटो पनि खोजेँ,
मन भने उही गल्लीमा फेरि फेरि मिलिरह्यो।
`),
    ),
  },
  {
    ...base,
    id: "p-pahad",
    slug: "pahad",
    type: "kabita",
    title: "पहाड",
    subtitle: "",
    cover: "/stories/art/hills.svg",
    coverLayout: "side",
    lang: "ne",
    tags: ["kabita"],
    authorId: "u-rajendra",
    publishedAt: day("2026-07-20"),
    createdAt: day("2026-07-19"),
    updatedAt: day("2026-07-20"),
    content: doc(
      verse(`
पहाडले कहिल्यै हतार गर्दैन।
बादल आउँछ, जान्छ,
घाम आउँछ, बस्छ, अनि ढल्छ,
पहाड भने उही ठाउँमा
आफ्नै मौनता ओढेर बसिरहन्छ।

म पनि एक दिन
त्यस्तै हुन चाहन्छु,
हतारको सहरमा
अडिएर बस्न जानेको मान्छे।
`),
    ),
  },
  {
    ...base,
    id: "p-bus",
    slug: "the-last-bus-to-mulpani",
    type: "story",
    title: "The last bus to Mulpani",
    subtitle: "A short story about rain, a conductor, and the stop that wasn't on the route.",
    cover: "/stories/art/rain.svg",
    coverLayout: "side",
    lang: "en",
    tags: ["fiction", "kathmandu"],
    authorId: "u-rajendra",
    refs: ["p-gajal"],
    publishedAt: day("2026-06-28"),
    createdAt: day("2026-06-25"),
    updatedAt: day("2026-06-28"),
    content: doc(
      p("It had been raining since four, the kind of rain that does not fall so much as hang in the air and wait for you. The last bus to Mulpani came round the corner at nine, its windows fogged, its conductor leaning out of the door as if he could pull the night along with one arm."),
      p("“Mulpani, Mulpani,” he called, though there was only one of us at the stop."),
      fig("/stories/art/hills.svg", "full", 100, "The valley, after the rain."),
      p("Inside, the seats were damp and the radio was playing an old song, the one everybody's father knows the first line of and nobody knows the second. The conductor hummed the second line anyway. He got it wrong, and nobody minded."),
      p("Somewhere past Gaushala the bus slowed down at a place that was not a stop. A woman stood there under a blue umbrella, holding a cake box against the rain as if it were the last dry thing in the city. The driver opened the door without being asked."),
      quote("“Birthday?” the conductor asked. “My son's,” she said. “He's twelve. He thinks I forgot.”"),
      p("The bus went the long way after that. Nobody said so, but the driver turned left where he should have gone straight, and stopped outside a green gate with a single bulb above it. The woman got off. The conductor did not take her fare."),
      rule,
      p("I have taken that bus a hundred times since. It has never stopped there again. But every time it rains, I look for the blue umbrella, and every time, for a second, I think I see it."),
    ),
  },
  {
    ...base,
    id: "p-teashop",
    slug: "notes-from-a-kathmandu-tea-shop",
    type: "blog",
    title: "Notes from a Kathmandu tea shop",
    subtitle: "Sample post: the city, one cup at a time.",
    cover: "/stories/art/flags.svg",
    coverLayout: "full",
    lang: "en",
    tags: ["kathmandu", "sample"],
    authorId: "u-kiran",
    refs: ["p-bus", "p-blazify"],
    publishedAt: day("2026-09-01"),
    createdAt: day("2026-08-30"),
    updatedAt: day("2026-09-01"),
    content: doc(
      p("This is a sample post from a demo author, here so you can see how posts by other writers look. Edit it or delete it from the admin panel."),
      p("Every tea shop in the city has the same three regulars: the one who reads the whole newspaper, the one who reads only the headlines aloud, and the one who disagrees with both. Sit long enough and you will hear the whole country argued over in a single afternoon."),
      fig("/stories/art/rain.svg", "left", 40, "Monsoon evenings bring everyone indoors."),
      p("The tea is always too sweet and never quite hot enough, and that is exactly how it should be. Nobody comes for the tea."),
      p("Rajendra's story ", t("The last bus to Mulpani", [{ type: "link", attrs: { href: "/stories/the-last-bus-to-mulpani" } }]), " starts in a place like this, and so do most of the city's better ones."),
    ),
  },
  {
    ...base,
    id: "p-jhyal",
    slug: "jhyal",
    type: "kabita",
    title: "झ्याल",
    subtitle: "",
    cover: null,
    coverLayout: "none",
    lang: "ne",
    tags: ["kabita", "sample"],
    authorId: "u-aarati",
    refs: ["p-pahad"],
    publishedAt: day("2026-08-18"),
    createdAt: day("2026-08-17"),
    updatedAt: day("2026-08-18"),
    content: doc(
      verse(`
मेरो कोठाको एउटै झ्याल छ,
त्यसैबाट आउँछ बिहान,
त्यसैबाट जान्छ साँझ।

कहिलेकाहीँ लाग्छ,
संसार यत्ति हो,
एउटा झ्यालभरिको आकाश,
र त्यसलाई हेरिरहने म।
`),
    ),
  },
];
