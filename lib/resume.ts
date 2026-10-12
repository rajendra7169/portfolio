// The résumé: one source for the /resume page and the PDF printed from it
// (`npm run resume`). Facts come from lib/content.ts, lib/projects.ts and the
// work history Rajendra gave; projects are his personal ones only.
import { contact, profile, span, work } from "./content";

const role = (branch: string) => {
  const p = work.find((w) => w.branch === branch)!;
  return { role: p.title, when: span(p), points: p.points };
};

export const resume = {
  name: profile.name,
  title: "Software Engineer, mobile and full stack",
  photo: "/images/resume-photo-800.webp",
  // The PDF the page offers for download. Swap in a public Drive link here if
  // the file should be served from Drive instead of this site.
  pdf: "/Rajendra-Pandey-Resume.pdf",
  updated: "October 2026",

  contact: [
    { kind: "email", label: contact.email, href: `mailto:${contact.email}` },
    { kind: "phone", label: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` },
    { kind: "place", label: "Mulpani, Kathmandu, Nepal", href: contact.maps },
    { kind: "web", label: "rajendrapandey.info.np", href: "https://rajendrapandey.info.np" },
    { kind: "linkedin", label: "linkedin.com/in/rajendrapaandey", href: "https://www.linkedin.com/in/rajendrapaandey/" },
    { kind: "github", label: "github.com/rajendra7169", href: "https://github.com/rajendra7169" },
  ],

  summary:
    "Software engineer at Matrika Technology in Kathmandu, building the Android and iOS apps, React web apps and C#/.NET back ends of an IRD-certified jewellery billing and management platform for Nepali jewellers. Creator and maintainer of Blazify, a free, open-source music player shipped natively on Android, iPhone, Windows and Linux. At home across the whole stack, from mobile interfaces to Linux servers, Supabase, Cloudflare and Firebase.",

  // From the work history in lib/content.ts, grouped by employer so a promotion
  // reads as one line of work.
  experience: [
    { org: "Matrika Technology Pvt. Ltd.", where: "Kathmandu", roles: [role("matrika/software-engineer"), role("matrika/intern")] },
    { org: "Blazify, open source", where: "Remote", roles: [role("blazify")] },
    { org: "Yarsa Games", where: "Nepal", roles: [role("yarsa/game-dev-intern")] },
  ],

  projects: [
    {
      name: "NexTerm",
      kind: "AI-powered terminal and code editor for Windows",
      stack: "Electron, React, Node.js, SQLite, Monaco",
      text: "PowerShell, CMD, Git Bash and WSL in tabs and split panes, SSH profiles with an SFTP browser, an AI panel that can read the terminal, local ghost-text autocomplete and a coder mode with git and language servers. 19 themes; no accounts or telemetry.",
    },
    {
      name: "Jarvis",
      kind: "Always-on voice assistant for Linux",
      stack: "Python, ONNX Runtime, Electron, Three.js",
      text: "Wakes to “hey Jarvis” and replies in about 200 ms with most of the speech stack on the laptop. 137 skills, from apps, volume, Wi-Fi and Bluetooth to reading the screen, email, WhatsApp and code, behind a confidence gate that asks before risky actions. 722 tests.",
    },
    {
      name: "Fitevo",
      kind: "Local-first AI fitness and nutrition tracker",
      stack: "Flutter, Dart, Firebase, Gemini",
      text: "Log a meal by typing, speaking or taking a photo and AI works out the calories and macros. Builds workout routines, logs every set, spots personal records and has a coach to ask. 57k lines of Dart.",
    },
    {
      name: "Tally",
      kind: "Gamified attendance for small teams and schools",
      stack: "React, Vite, Three.js, Firebase, Capacitor",
      text: "Check-in and check-out with an optional GPS check and admin approvals; every present day grows a tree in the team's living forest, which follows the real time of day and season.",
    },
  ],

  skills: [
    { group: "Languages", items: ["Kotlin", "Swift", "Dart", "C#", "TypeScript", "JavaScript", "Python", "Go", "Java", "PHP", "C", "C++"] },
    { group: "Mobile", items: ["Android", "Jetpack Compose", "iOS", "SwiftUI", "Flutter"] },
    { group: "Web & back end", items: ["React", "Node.js", "Express", "ASP.NET Core", "Entity Framework", "Electron", "REST", "WebSockets"] },
    { group: "Cloud & data", items: ["Firebase", "Supabase", "Cloudflare", "Docker", "Linux servers", "SQL Server", "PostgreSQL", "SQLite", "MongoDB"] },
    { group: "Design & media", items: ["Figma", "Photoshop", "Canva", "DaVinci Resolve", "Blender (basics)", "Unity"] },
  ],
  systems: ["Linux", "macOS", "Windows"],
  languages: ["Nepali", "English", "Hindi"],

  education: [
    {
      degree: "BSc in Information Technology",
      school: "Sunway International Business School, Kathmandu",
      when: "2021 – 2024",
      note: "Final-year project: a laundry recommendation web app on the MERN stack.",
    },
    { degree: "+2 in Business Studies", school: "St. Lawrence College, Kathmandu", when: "2015 – 2017" },
  ],
};

