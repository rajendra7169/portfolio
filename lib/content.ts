// Every word on the site lives here, except the project pages (lib/projects.ts).
// Edit these two files to update the portfolio.

export const profile = {
  name: "Rajendra Pandey",
  intro:
    "Software developer at Matrika Technology in Kathmandu, and the maker of Blazify — a free, open-source music player for Android, iPhone and desktop with thousands of downloads.",
  repo: "https://github.com/rajendra7169/portfolio",
};

// Home hero. Every line here is drawn from the facts above and on the original site.
export const hero = {
  first: "Rajendra",
  last: "Pandey",
  // "I build …" cycles through these.
  builds: [
    "native Android apps",
    "iPhone apps in SwiftUI",
    "cross-platform Flutter apps",
    "desktop apps for Windows & Linux",
    "backends in Go, .NET & Node",
    "open-source music players",
  ],
  stats: [
    { value: 12, suffix: "", label: "languages" },
    { value: 8, suffix: "", label: "projects shipped" },
    { value: 3, suffix: "", label: "Blazify platforms" },
  ],
  // Logos riding the two orbit rings around the photo.
  orbitInner: [
    { name: "Kotlin", icon: "logos:kotlin-icon" },
    { name: "Swift", icon: "logos:swift" },
    { name: "React", icon: "logos:react" },
    { name: "Go", icon: "simple-icons:go", color: "#00add8" },
  ] as Tech[],
  orbitOuter: [
    { name: "Flutter", icon: "simple-icons:flutter", color: "#02569b" },
    { name: "TypeScript", icon: "logos:typescript-icon" },
    { name: "Docker", icon: "logos:docker-icon" },
    { name: "Python", icon: "logos:python" },
    { name: "Android", icon: "logos:android-icon" },
    { name: ".NET", icon: "logos:dotnet" },
  ] as Tech[],
};

export const nav: { label: string; href: string; external?: boolean }[] = [
  { label: "Home", href: "/" },
  { label: "Education", href: "/education" },
  { label: "Experience", href: "/experience" },
  { label: "Projects", href: "/projects" },
  { label: "Stories", href: "/stories" },
  { label: "Contact Me", href: "/contact" },
];

/** Icon ids are "set:name" from Iconify (logos = full colour, simple-icons = mono + `color`). */
export type Tech = { name: string; icon: string; color?: string };

export const socials: (Tech & { href: string })[] = [
  { name: "GitHub", icon: "simple-icons:github", color: "#181717", href: "https://github.com/rajendra7169" },
  { name: "LinkedIn", icon: "simple-icons:linkedin", color: "#0e76a8", href: "https://www.linkedin.com/in/rajendrapaandey/" },
  { name: "YouTube", icon: "simple-icons:youtube", color: "#ff0000", href: "https://www.youtube.com/@vlograja71" },
  { name: "Email", icon: "simple-icons:google", color: "#dd4b39", href: "mailto:rajendrapandey199971@gmail.com" },
  { name: "X", icon: "simple-icons:x", color: "#000000", href: "https://twitter.com/raja7169" },
  { name: "Facebook", icon: "simple-icons:facebook", color: "#1877f2", href: "https://www.facebook.com/raja.indra.50159" },
  { name: "Instagram", icon: "simple-icons:instagram", color: "#e4405f", href: "https://www.instagram.com/raja.indra7169" },
];

// "What I Do?" modules. `app` titles the module window; `tagline` sums up the points below it.
export const skills: { title: string; short: string; app: string; tagline: string; techs: Tech[]; points: string[] }[] = [
  {
    title: "Full Stack Development",
    short: "Full Stack",
    app: "editor — Player.kt",
    tagline: "Native Android and iPhone apps, Flutter, desktop, backends and the web — end to end.",
    techs: [
      { name: "Kotlin", icon: "logos:kotlin-icon" },
      { name: "Swift", icon: "logos:swift" },
      { name: "Dart", icon: "logos:dart" },
      { name: ".NET", icon: "logos:dotnet" },
      { name: "TypeScript", icon: "logos:typescript-icon" },
      { name: "Python", icon: "logos:python" },
      { name: "Go", icon: "simple-icons:go", color: "#00add8" },
      { name: "Jetpack Compose", icon: "simple-icons:jetpackcompose", color: "#4285f4" },
      { name: "PHP", icon: "logos:php" },
      { name: "Android", icon: "logos:android-icon" },
      { name: "C#", icon: "simple-icons:csharp", color: "#68217a" },
      { name: "HTML5", icon: "logos:html-5" },
      { name: "CSS3", icon: "logos:css-3" },
      { name: "JavaScript", icon: "logos:javascript" },
      { name: "React", icon: "logos:react" },
      { name: "Node.js", icon: "logos:nodejs-icon" },
      { name: "Flutter", icon: "simple-icons:flutter", color: "#02569b" },
    ],
    points: [
      "Writing Kotlin, Swift, Dart, C#, TypeScript, JavaScript, Python, Go, Java, PHP, C and C++",
      "Building native Android apps in Kotlin & Jetpack Compose, and iPhone apps in Swift & SwiftUI",
      "Building cross-platform mobile apps in Flutter, and desktop apps for Windows and Linux",
      "Creating backends and APIs in .NET, Node & Express, Go and Python",
      "Building dynamic, responsive web applications with React and TypeScript",
    ],
  },
  {
    title: "Cloud Infra-Architecture",
    short: "Cloud",
    app: "terminal — rajendra@ktm",
    tagline: "Real services in production, deployed to the edge and shipped as signed builds.",
    techs: [
      { name: "Docker", icon: "logos:docker-icon" },
      { name: "Cloudflare", icon: "logos:cloudflare-icon" },
      { name: "Supabase", icon: "logos:supabase-icon" },
      { name: "Firebase", icon: "logos:firebase-icon" },
      { name: "Render", icon: "simple-icons:render", color: "#000000" },
      { name: "Netlify", icon: "logos:netlify-icon" },
      { name: "Linux", icon: "logos:linux-tux" },
      { name: "PostgreSQL", icon: "logos:postgresql" },
      { name: "MongoDB", icon: "logos:mongodb-icon" },
      { name: "SQLite", icon: "simple-icons:sqlite", color: "#003b57" },
    ],
    points: [
      "Running real services, like Blazify's own Listen Together server written in Go on Docker",
      "Deploying on Cloudflare Workers, Supabase, Firebase, Render and Netlify",
      "Working with PostgreSQL, SQLite, MongoDB and SQL Server",
      "Shipping signed, reproducible release builds for Android, iPhone, Windows and Linux",
    ],
  },
  {
    title: "UI/UX Design",
    short: "UI/UX",
    app: "blazify-ui — design canvas",
    tagline: "Interfaces, logos and app flows, designed from a blank canvas.",
    techs: [
      { name: "Adobe XD", icon: "logos:adobe-xd" },
      { name: "Figma", icon: "logos:figma" },
      { name: "Adobe Illustrator", icon: "logos:adobe-illustrator" },
      { name: "Inkscape", icon: "simple-icons:inkscape", color: "#000000" },
    ],
    points: [
      "Designing highly attractive user interfaces for mobile and web applications",
      "Customizing logo designs and building logos from scratch",
      "Creating the flow of application functionalities to optimize user experience",
    ],
  },
  {
    title: "Video/Photography",
    short: "Video",
    app: "timeline — DaVinci Resolve",
    tagline: "Shooting, editing and grading visuals that tell the story.",
    techs: [
      { name: "Photoshop", icon: "logos:adobe-photoshop" },
      { name: "DaVinci Resolve", icon: "simple-icons:davinciresolve", color: "#233a51" },
      { name: "Lightroom", icon: "logos:adobe-lightroom" },
      { name: "Premiere Pro", icon: "logos:adobe-premiere" },
    ],
    points: [
      "Skilled in videography and photography, capturing and creating stunning visuals",
      "Proficient in advanced video editing using DaVinci Resolve, Adobe Premiere Pro, and CapCut",
      "Experienced in graphic design with expertise in Photoshop for professional-quality content",
    ],
  },
];

// handle = the username in each profile URL.
export const codingProfiles: (Tech & { href: string; handle: string })[] = [
  { name: "LeetCode", icon: "simple-icons:leetcode", color: "#f79f1b", href: "https://leetcode.com/u/rajendrapandey/", handle: "rajendrapandey" },
  { name: "HackerRank", icon: "simple-icons:hackerrank", color: "#2ec866", href: "https://www.hackerrank.com/rajendrapandey", handle: "rajendrapandey" },
  { name: "Kaggle", icon: "simple-icons:kaggle", color: "#20beff", href: "https://www.kaggle.com/rajaindra", handle: "rajaindra" },
  { name: "CodeChef", icon: "simple-icons:codechef", color: "#5b4638", href: "https://www.codechef.com/users/rajendrapandey", handle: "rajendrapandey" },
  { name: "Codeforces", icon: "simple-icons:codeforces", color: "#1f8acb", href: "http://codeforces.com/profile/rajendrapandey7169", handle: "rajendrapandey7169" },
];

export const degrees = [
  {
    school: "Sunway International Business School",
    logo: "/logos/sunway.png",
    degree: "BSc. in Information Technology",
    duration: "2021 - 2024",
    url: "https://sunway.edu.np/",
    points: [
      "I have gained knowledge in essential software engineering subjects, including Data Structures (DS), Algorithms, Database Management Systems (DBMS), Operating Systems (OS), Computer Architecture (CA), and Artificial Intelligence (AI).",
      "Beyond this, I have pursued advanced courses in Deep Learning, Data Science, Cloud Computing, Full Stack Development, and Database Optimization, strengthening my expertise in both foundational and cutting-edge technologies.",
      "Additionally, I have explored advanced topics in both Java and Python, such as multithreading, networking, and GUI development in Java, as well as machine learning, data analysis, and automation scripting in Python. These skills have allowed me to develop efficient, scalable, and robust software solutions.",
    ],
  },
  {
    school: "St. Lawrence College",
    logo: "/logos/lawrence.png",
    degree: "+2 in Business Studies",
    duration: "2015 - 2017",
    url: "https://www.stlawrence.edu.np/",
    points: [
      "I have completed a variety of courses related to Business Studies, including Organizational Behavior, Business Communication, and Strategic Management, which have helped me develop a strong foundation in understanding business operations and management strategies.",
      "In the field of Accounting, I have undertaken courses such as Financial Accounting, Cost Accounting, and Taxation. These have enabled me to analyze financial data and develop budgeting and auditing skills effectively.",
      "Additionally, I have pursued Optional Mathematics courses such as Business Statistics and Quantitative Techniques, which have honed my problem-solving and analytical abilities, aiding in effective decision-making and strategic planning.",
    ],
  },
];

// Education page: the stops on "the path", oldest first. `year` drives the year counter.
export const journey = [
  { year: 2015, degree: degrees[1], stamp: ["Completed", "2017"] },
  { year: 2021, degree: degrees[0], stamp: ["Graduated", "2024"] },
] as const;
export const paperStop = {
  year: 2024,
  title: "Paper published",
  subtitle: "Laundry Recommendation System",
  duration: "Dec 20, 2024",
  logo: "/logos/sunway.png",
  points: [
    "A MERN stack laundry management and recommendation web app, built as my final year project at Sunway College Kathmandu.",
    "Its documentation — Laundry Recommendation System Web Application using HTML, CSS, JS, NodeJS and MongoDB — was published on December 20, 2024.",
  ],
  links: [
    { label: "Live app", href: "https://laundry-frontend-pearl.vercel.app" },
    { label: "Source", href: "https://github.com/rajendra7169/laundry_recommendation_app" },
  ],
  stamp: ["Published", "Dec 2024"],
};

export const experience = {
  intro:
    "I work as a software engineer at Matrika Technology in Kathmandu, which makes IRD-certified jewellery billing and management software for Nepali jewellers. Outside work I build and maintain Blazify, a free and open-source music player for Android, iPhone and desktop.",
};

// His work history, newest first: the Experience page's positions (as git
// branches) and the résumé (lib/resume.ts) both read it. Dates are ISO; a
// position with no `end` is current. `points` are the résumé's bullets.
export type Position = {
  branch: string;
  status: "head" | "active" | "merged" | "done";
  title: string;
  org: string;
  website?: string;
  where: string;
  start: string;
  end?: string;
  summary: string;
  points: string[];
  stack: Tech[];
  // The current job, in the areas he covers.
  areas?: { name: string; text: string; stack: Tech[] }[];
  // What a merged branch became.
  merged?: string;
};
const T = {
  flutter: { name: "Flutter", icon: "simple-icons:flutter", color: "#02569b" },
  android: { name: "Android", icon: "logos:android-icon" },
  ios: { name: "iOS", icon: "simple-icons:apple", color: "#000000" },
  firebase: { name: "Firebase", icon: "logos:firebase-icon" },
  dotnet: { name: ".NET", icon: "logos:dotnet" },
  csharp: { name: "C#", icon: "simple-icons:csharp", color: "#68217a" },
  sqlserver: { name: "SQL Server", icon: "simple-icons:microsoftsqlserver", color: "#cc2927" },
  react: { name: "React", icon: "logos:react" },
  cloudflare: { name: "Cloudflare", icon: "logos:cloudflare-icon" },
  supabase: { name: "Supabase", icon: "logos:supabase-icon" },
  linux: { name: "Linux", icon: "logos:linux-tux" },
  kotlin: { name: "Kotlin", icon: "logos:kotlin-icon" },
  compose: { name: "Jetpack Compose", icon: "simple-icons:jetpackcompose", color: "#4285f4" },
  swift: { name: "Swift", icon: "logos:swift" },
  go: { name: "Go", icon: "simple-icons:go", color: "#00add8" },
  docker: { name: "Docker", icon: "logos:docker-icon" },
  unity: { name: "Unity", icon: "simple-icons:unity", color: "#000000" },
  cpp: { name: "C++", icon: "simple-icons:cplusplus", color: "#00599c" },
  blender: { name: "Blender", icon: "simple-icons:blender", color: "#e87d0d" },
} satisfies Record<string, Tech>;

export const work: Position[] = [
  {
    branch: "matrika/software-engineer",
    status: "head",
    title: "Software Engineer",
    org: "Matrika Technology Pvt. Ltd.",
    website: "https://matrikatec.com.np",
    where: "Kathmandu, Nepal",
    start: "2025-05-18",
    summary:
      "Matrika makes J-Jewellery, IRD-certified billing and management software for Nepali jewellers. I work on it end to end: the phone app, the server behind it, the web apps, and the machines they run on.",
    points: [
      "Develop J-Jewellery's mobile app for Android and iOS in Flutter, with Firebase for sign-in, push notifications, Crashlytics, Remote Config and App Check.",
      "Build the C# and ASP.NET Core back end: REST APIs on Entity Framework Core and SQL Server, JWT authentication, scheduled jobs and Windows services.",
      "Build React web apps, and a serverless admin panel on Cloudflare Workers and Pages that sends push notifications to the app's users.",
      "Work on a Flutter and Supabase marketplace app, and deploy and run services on Linux servers, Supabase, Cloudflare and Firebase.",
    ],
    areas: [
      { name: "Mobile", text: "The Android and iOS app in Flutter, with Firebase sign-in, push notifications, Crashlytics, Remote Config and App Check.", stack: [T.flutter, T.android, T.ios, T.firebase] },
      { name: "Back end", text: "C# and ASP.NET Core APIs on Entity Framework Core and SQL Server, with JWT sign-in, scheduled jobs and Windows services.", stack: [T.dotnet, T.csharp, T.sqlserver] },
      { name: "Web", text: "React web apps, and a serverless admin panel on Cloudflare Workers and Pages that sends push notifications to the app.", stack: [T.react, T.cloudflare] },
      { name: "Cloud and servers", text: "Services deployed and run on Linux servers, Supabase, Cloudflare and Firebase, including a Flutter and Supabase marketplace app.", stack: [T.linux, T.supabase, T.cloudflare, T.firebase] },
    ],
    stack: [T.flutter, T.firebase, T.dotnet, T.sqlserver, T.react, T.cloudflare, T.supabase, T.linux],
  },
  {
    branch: "blazify",
    status: "active",
    title: "Creator and Maintainer",
    org: "Blazify",
    website: "https://rajendra7169.github.io/blazify/",
    where: "Open source",
    start: "2026-07-15",
    summary: "A free, open-source music player, native on Android, iPhone, Windows and Linux.",
    points: ["Build and release a free music player for Android, iPhone, Linux and Windows, and run its Listen Together server in Go."],
    stack: [T.kotlin, T.compose, T.swift, T.go, T.docker],
  },
  {
    branch: "matrika/intern",
    status: "merged",
    title: "Software Engineering Intern",
    org: "Matrika Technology Pvt. Ltd.",
    website: "https://matrikatec.com.np",
    where: "Kathmandu, Nepal",
    start: "2025-02-16",
    end: "2025-05-18",
    summary: "Three months across the whole product, with the team I then joined.",
    points: ["Contributed features and fixes across the J-Jewellery mobile app, web app and .NET back end, and was taken on as a software engineer after the internship."],
    stack: [T.flutter, T.react, T.dotnet],
    merged: "Merged into matrika/software-engineer on May 18, 2025",
  },
  {
    branch: "yarsa/game-dev-intern",
    status: "done",
    title: "Game Developer Intern",
    org: "Yarsa Games",
    where: "Nepal",
    start: "2024-05-01",
    end: "2024-08-31",
    summary: "A summer of making small games.",
    points: ["Built small game projects in Unity and C++, and learned the basics of 3D modelling in Blender for game assets."],
    stack: [T.unity, T.cpp, T.blender],
  },
];

const MONTH = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
/** "2025-05-18" → "May 2025". */
export const monthYear = (iso: string) => MONTH.format(new Date(`${iso}T00:00:00Z`));
/** "May 2025 – Present", "Feb 2025 – May 2025". */
export const span = (p: Position) => `${monthYear(p.start)} – ${p.end ? monthYear(p.end) : "Present"}`;

// Experience page: his work as a git log, oldest first. Dates are repo creation
// dates from GitHub (and the paper date from his site); "now" is the present.
export type Commit = {
  date: string; // ISO date, or "now"
  lane: "main" | "side" | "blazify";
  type: string;
  scope?: string;
  title: string;
  body: string;
  repo?: string;
  live?: string;
  tag?: string;
};
export const careerLog: Commit[] = [
  {
    date: "2024-05-01",
    lane: "main",
    type: "work",
    scope: "yarsa",
    title: "game developer intern at Yarsa Games",
    body: "Small game projects in Unity and C++, and the basics of 3D modelling in Blender, over the summer.",
  },
  {
    date: "2024-09-20",
    lane: "main",
    type: "feat",
    title: "Laundry Recommendation app (final year project)",
    body: "A MERN stack laundry management and recommendation web app, built as my final year project at Sunway College Kathmandu.",
    repo: "https://github.com/rajendra7169/laundry_recommendation_app",
    live: "https://laundry-frontend-pearl.vercel.app",
  },
  {
    date: "2024-12-20",
    lane: "main",
    type: "docs",
    title: "publish the final-year paper",
    body: "Laundry Recommendation System Web Application using HTML, CSS, JS, NodeJS and MongoDB — published December 20, 2024.",
    tag: "BSc. IT",
  },
  {
    date: "2025-02-16",
    lane: "main",
    type: "work",
    scope: "matrika",
    title: "software engineering intern at Matrika Technology",
    body: "Features and fixes across J-Jewellery's mobile app, web app and .NET back end: IRD-certified billing and management software for Nepali jewellers.",
  },
  {
    date: "2025-05-18",
    lane: "main",
    type: "merge",
    scope: "matrika",
    title: "promoted to software engineer",
    body: "Taken on as a software engineer after three months as an intern.",
    tag: "promoted",
  },
  {
    date: "2026-05-04",
    lane: "side",
    type: "feat",
    scope: "nexterm",
    title: "a terminal for Windows, from scratch",
    body: "A modern, feature-rich terminal for Windows — free and built from scratch. SSH, SFTP, port forwarding, jump-hosts, recording, snippets, workspaces, and more.",
    repo: "https://github.com/rajendra7169/NexTerm",
  },
  {
    date: "2026-05-29",
    lane: "side",
    type: "feat",
    scope: "tally",
    title: "gamified attendance with a living forest",
    body: "A modern, gamified attendance manager with a living forest visualization. Multi-tenant SaaS for small teams.",
    repo: "https://github.com/rajendra7169/attendance-system",
    live: "https://tally.rajendrapandey.info.np",
  },
  {
    date: "2026-06-03",
    lane: "side",
    type: "feat",
    scope: "r-ai",
    title: "air-gapped local AI",
    body: "Air-gapped, zero-dependency local AI environment.",
    repo: "https://github.com/rajendra7169/R-AI",
  },
  {
    date: "2026-06-17",
    lane: "side",
    type: "feat",
    scope: "fitevo",
    title: "local-first AI fitness tracker",
    body: "Local-first AI fitness, nutrition & workout tracker. One-sentence food logging, AI-built routines, no shaming. Flutter + Firebase + Groq.",
    repo: "https://github.com/rajendra7169/fitevo",
  },
  {
    date: "2026-07-15",
    lane: "blazify",
    type: "feat",
    scope: "android",
    title: "ship Blazify for Android",
    body: "A free, open-source music player for Android: millions of songs, offline downloads, word-by-word synced lyrics and a 10-band equalizer. No ads, no tracking, no account needed.",
    repo: "https://github.com/rajendra7169/blazify",
    live: "https://rajendra7169.github.io/blazify/",
    tag: "v1",
  },
  {
    date: "2026-07-15",
    lane: "blazify",
    type: "feat",
    scope: "extractor",
    title: "stream extraction library",
    body: "Stream extraction library for Blazify.",
    repo: "https://github.com/rajendra7169/BlazifyExtractor",
  },
  {
    date: "2026-07-27",
    lane: "blazify",
    type: "feat",
    scope: "ios",
    title: "Blazify for iPhone in SwiftUI",
    body: "A free, open-source music player in SwiftUI: streaming, local music, synced lyrics, equalizer. No ads, no tracking.",
    repo: "https://github.com/rajendra7169/blazify-ios",
  },
  {
    date: "2026-08-01",
    lane: "blazify",
    type: "feat",
    scope: "desktop",
    title: "Blazify for Linux and Windows",
    body: "A free, open-source music player for Linux and Windows: streaming, offline downloads, synced lyrics and a 10-band equalizer. No ads, no tracking, no account needed.",
    repo: "https://github.com/rajendra7169/blazify-desktop",
  },
  {
    date: "2026-10-04",
    lane: "blazify",
    type: "feat",
    scope: "server",
    title: "Listen Together server",
    body: "Blazify's own Listen Together server, written in Go and running on Docker.",
    repo: "https://github.com/rajendra7169/blazify-together-server",
  },
  {
    date: "now",
    lane: "main",
    type: "work",
    title: "Software Engineer at Matrika Technology",
    body: "J-Jewellery end to end: the Android and iOS app in Flutter, the C# and ASP.NET Core back end, React web apps, and services on Linux, Supabase, Cloudflare and Firebase.",
    tag: "HEAD",
  },
];

// The apps on the Projects page and their pages live in lib/projects.ts.

export const contact = {
  blurb:
    "I am available on almost every social media. You can message me, I will reply within 24 hours. I can help you with ML, AI, React, Android, Cloud and Opensource Development.",
  // The résumé page; its PDF and where that's served from are in lib/resume.ts.
  resume: "/resume",
  address: "Mulpani, Kathmandu, Bagmati, Nepal 44600",
  email: "rajendrapandey199971@gmail.com",
  phone: "+977 9813566214",
  maps: "https://maps.app.goo.gl/HCbA8cW1giG1dKtJ6",
  // City-level, for the readout beside the contact clock.
  coords: "27.71° N · 85.32° E",
  // Message composer topics: the areas named in the blurb above.
  topics: ["ML", "AI", "React", "Android", "Cloud", "Open source"],
};
