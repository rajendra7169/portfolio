// Every word on the site lives here. Edit this file to update the portfolio.

export const profile = {
  name: "Rajendra Pandey",
  first: "RAJENDRA",
  last: "PANDEY",
  role: "Software developer",
  company: "Matrika Technology",
  city: "Kathmandu",
  coords: "27.73° N · 85.37° E",
  intro:
    "Software developer at Matrika Technology in Kathmandu, and the maker of Blazify — a free, open-source music player for Android, iPhone and desktop with thousands of downloads.",
  // Drop a photo in assets/source/ and run `npm run images`, then set this to
  // the generated base name (e.g. "portrait") to show it in the hero.
  photo: null as string | null,
};

// The bio, written as synced lyrics. Each line gets an LRC-style timestamp.
export const lyrics: { t: string; line: string }[] = [
  { t: "00:04.20", line: "I write software in Kathmandu." },
  { t: "00:09.85", line: "By day, I build IRD-certified billing and management software" },
  { t: "00:15.10", line: "for Nepali jewellers at Matrika Technology." },
  { t: "00:21.40", line: "By night, I build Blazify — a free, open-source music player" },
  { t: "00:27.05", line: "for Android, iPhone and desktop." },
  { t: "00:31.70", line: "No ads. No tracking. No account needed." },
  { t: "00:36.30", line: "Thousands of people have downloaded it." },
];

export const languages = [
  "Kotlin", "Swift", "Dart", "C#", "TypeScript", "JavaScript",
  "Python", "Go", "Java", "PHP", "C", "C++",
];

export const disciplines = [
  {
    name: "Full-stack",
    full: "Full-stack development",
    points: [
      "Native Android apps in Kotlin & Jetpack Compose, iPhone apps in Swift & SwiftUI",
      "Cross-platform mobile apps in Flutter, desktop apps for Windows and Linux",
      "Backends and APIs in .NET, Node & Express, Go and Python",
      "Dynamic, responsive web applications with React and TypeScript",
    ],
  },
  {
    name: "Infra",
    full: "Cloud infrastructure",
    points: [
      "Running real services, like Blazify's Listen Together server — Go on Docker",
      "Deploying on Cloudflare Workers, Supabase, Firebase, Render and Netlify",
      "PostgreSQL, SQLite, MongoDB and SQL Server",
      "Signed, reproducible release builds for Android, iPhone, Windows and Linux",
    ],
  },
  {
    name: "Interface",
    full: "UI/UX design",
    points: [
      "Interfaces for mobile and web applications",
      "Logos customised or built from scratch",
      "Mapping app flows so features are easy to find and use",
    ],
  },
  {
    name: "Lens",
    full: "Video & photography",
    points: [
      "Videography and photography",
      "Editing in DaVinci Resolve, Adobe Premiere Pro and CapCut",
      "Graphic design in Photoshop",
    ],
  },
];

export type Project = {
  name: string;
  kind: string;
  date: string;
  stack: string;
  blurb: string;
  links: { label: string; href: string }[];
  art?: "term" | "forest" | "airgap";
};

export const blazify = {
  name: "Blazify",
  tagline: "A free, open-source music player.",
  blurb:
    "Millions of songs, offline downloads, word-by-word synced lyrics and a 10-band equalizer. No ads, no tracking, no account needed.",
  site: "https://rajendra7169.github.io/blazify/",
  releases: [
    { platform: "Android", stack: "Kotlin · Jetpack Compose", date: "Jul 15, 2026", href: "https://github.com/rajendra7169/blazify" },
    { platform: "iPhone", stack: "Swift · SwiftUI", date: "Jul 27, 2026", href: "https://github.com/rajendra7169/blazify-ios" },
    { platform: "Desktop", stack: "Kotlin · Linux & Windows", date: "Aug 01, 2026", href: "https://github.com/rajendra7169/blazify-desktop" },
  ],
  server: { label: "Listen Together server (Go)", href: "https://github.com/rajendra7169/blazify-together-server" },
};

export const projects: Project[] = [
  {
    name: "NexTerm",
    kind: "Windows terminal",
    date: "May 04, 2026",
    stack: "JavaScript",
    blurb:
      "A modern, feature-rich terminal for Windows, free and built from scratch. SSH, SFTP, port forwarding, jump-hosts, recording, snippets, workspaces and more.",
    links: [{ label: "Source", href: "https://github.com/rajendra7169/NexTerm" }],
    art: "term",
  },
  {
    name: "Tally",
    kind: "Multi-tenant SaaS",
    date: "May 29, 2026",
    stack: "JavaScript",
    blurb:
      "A gamified attendance manager for small teams, with a living forest that grows as people show up.",
    links: [
      { label: "Live", href: "https://tally.rajendrapandey.info.np" },
      { label: "Source", href: "https://github.com/rajendra7169/attendance-system" },
    ],
    art: "forest",
  },
  {
    name: "R-AI",
    kind: "Local AI",
    date: "Jun 03, 2026",
    stack: "HTML",
    blurb: "An air-gapped, zero-dependency local AI environment.",
    links: [{ label: "Source", href: "https://github.com/rajendra7169/R-AI" }],
    art: "airgap",
  },
  {
    name: "Fitevo",
    kind: "AI fitness tracker",
    date: "Jun 17, 2026",
    stack: "Flutter · Firebase · Groq",
    blurb:
      "Local-first fitness, nutrition and workout tracking. Log food in one sentence, get AI-built routines, no shaming.",
    links: [{ label: "Source", href: "https://github.com/rajendra7169/fitevo" }],
  },
  {
    name: "Laundry Recommendation",
    kind: "Final year project",
    date: "Sep 20, 2024",
    stack: "MERN stack",
    blurb:
      "A laundry management and recommendation web app built for the final year project at Sunway College Kathmandu, with a published paper.",
    links: [
      { label: "Live", href: "https://laundry-frontend-pearl.vercel.app" },
      { label: "Source", href: "https://github.com/rajendra7169/laundry_recommendation_app" },
    ],
  },
];

// Ordered oldest → newest: this is a real sequence.
export const path = [
  {
    when: "2015 — 2017",
    title: "+2 in Business Studies",
    where: "St. Lawrence College",
    note: "Organisational behaviour, accounting, taxation, business statistics and quantitative techniques.",
  },
  {
    when: "2021 — 2024",
    title: "BSc. in Information Technology",
    where: "Sunway International Business School",
    note: "Data structures, algorithms, DBMS, operating systems, AI; then deep learning, data science, cloud computing and full-stack development.",
  },
  {
    when: "Dec 2024",
    title: "Paper published",
    where: "Laundry Recommendation System",
    note: "Documentation for the final year project, built with HTML, CSS, JS, Node.js and MongoDB.",
  },
  {
    when: "Now",
    title: "Software developer",
    where: "Matrika Technology, Kathmandu",
    note: "IRD-certified jewellery billing and management software for Nepali jewellers.",
  },
  {
    when: "2026",
    title: "Blazify ships everywhere",
    where: "Android · iPhone · Desktop",
    note: "One open-source player, three native apps and its own Listen Together server.",
  },
];

export const certifications = [
  { name: "Machine Learning", by: "Andrew Ng" },
  { name: "Deep Learning", by: "Andrew Ng" },
  { name: "ML on GCP", by: "GCP Training" },
  { name: "Data Science", by: "Alex Aklson" },
  { name: "Big Data", by: "Kim Akers" },
  { name: "Advanced Data Science", by: "Romeo Kienzler" },
];

export const contact = {
  email: "rajendrapandey199971@gmail.com",
  phone: "+977 9813566214",
  address: "Mulpani, Kathmandu, Bagmati, Nepal 44600",
  maps: "https://maps.app.goo.gl/HCbA8cW1giG1dKtJ6",
  resume: "https://drive.google.com/file/d/1ccK09uY0vuos3whh8vuI50918UVYH0_i/view?usp=sharing",
  blog: "https://blog.rajendrapandey.info.np/",
  pitch: "I reply within 24 hours. Ask me about ML, AI, React, Android, cloud or open-source work.",
  socials: [
    { label: "GitHub", href: "https://github.com/rajendra7169" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/rajendrapaandey/" },
    { label: "YouTube", href: "https://www.youtube.com/@vlograja71" },
    { label: "X / Twitter", href: "https://twitter.com/raja7169" },
    { label: "Instagram", href: "https://www.instagram.com/raja.indra7169" },
    { label: "Facebook", href: "https://www.facebook.com/raja.indra.50159" },
  ],
};

// The page is a tracklist. Each section is a track; the transport bar shows
// scroll progress as elapsed time over this total.
export const tracks = [
  { id: "top", label: "Intro" },
  { id: "lyrics", label: "Lyrics" },
  { id: "craft", label: "Craft" },
  { id: "work", label: "Work" },
  { id: "path", label: "Path" },
  { id: "contact", label: "Contact" },
];
export const totalSeconds = 6 * 60 + 48;
