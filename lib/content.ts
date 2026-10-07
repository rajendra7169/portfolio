// Every word on the site lives here. Edit this file to update the portfolio.

export const profile = {
  name: "Rajendra Pandey",
  intro:
    "Software developer at Matrika Technology in Kathmandu, and the maker of Blazify — a free, open-source music player for Android, iPhone and desktop with thousands of downloads.",
  repo: "https://github.com/rajendra7169/portfolio",
};

export const nav = [
  { label: "Home", href: "/" },
  { label: "Education", href: "/education" },
  { label: "Experience", href: "/experience" },
  { label: "Projects", href: "/projects" },
  { label: "Stories", href: "https://blog.rajendrapandey.info.np/", external: true },
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

export const skills: { title: string; art: string; techs: Tech[]; points: string[] }[] = [
  {
    title: "Full Stack Development",
    art: "fullstack",
    techs: [
      { name: "Kotlin", icon: "logos:kotlin-icon" },
      { name: "Swift", icon: "logos:swift" },
      { name: "Dart", icon: "logos:dart" },
      { name: ".NET", icon: "logos:dotnet" },
      { name: "TypeScript", icon: "logos:typescript-icon" },
      { name: "Python", icon: "logos:python" },
      { name: "Go", icon: "logos:go" },
      { name: "Jetpack Compose", icon: "simple-icons:jetpackcompose", color: "#4285f4" },
      { name: "PHP", icon: "logos:php" },
      { name: "Android", icon: "logos:android-icon" },
      { name: "C#", icon: "simple-icons:csharp", color: "#68217a" },
      { name: "HTML5", icon: "logos:html-5" },
      { name: "CSS3", icon: "logos:css-3" },
      { name: "JavaScript", icon: "logos:javascript" },
      { name: "React", icon: "logos:react" },
      { name: "Node.js", icon: "logos:nodejs-icon" },
      { name: "Flutter", icon: "logos:flutter" },
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
    art: "cloud",
    techs: [
      { name: "Docker", icon: "logos:docker-icon" },
      { name: "Cloudflare", icon: "logos:cloudflare-icon" },
      { name: "Supabase", icon: "logos:supabase-icon" },
      { name: "Firebase", icon: "logos:firebase" },
      { name: "Render", icon: "simple-icons:render", color: "#000000" },
      { name: "Netlify", icon: "logos:netlify-icon" },
      { name: "Linux", icon: "logos:linux-tux" },
      { name: "PostgreSQL", icon: "logos:postgresql" },
      { name: "MongoDB", icon: "logos:mongodb-icon" },
      { name: "SQLite", icon: "logos:sqlite" },
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
    art: "design",
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
    art: "video",
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

export const codingProfiles: (Tech & { href: string })[] = [
  { name: "LeetCode", icon: "simple-icons:leetcode", color: "#f79f1b", href: "https://leetcode.com/u/rajendrapandey/" },
  { name: "HackerRank", icon: "simple-icons:hackerrank", color: "#2ec866", href: "https://www.hackerrank.com/rajendrapandey" },
  { name: "Kaggle", icon: "simple-icons:kaggle", color: "#20beff", href: "https://www.kaggle.com/rajaindra" },
  { name: "CodeChef", icon: "simple-icons:codechef", color: "#5b4638", href: "https://www.codechef.com/users/rajendrapandey" },
  { name: "Codeforces", icon: "simple-icons:codeforces", color: "#1f8acb", href: "http://codeforces.com/profile/rajendrapandey7169" },
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

export const certifications: { title: string; by: string; color: string; logo: string }[] = [
  { title: "Machine Learning", by: "Andrew Ng", color: "#b5706f", logo: "/logos/stanford_logo.png" },
  { title: "Deep Learning", by: "Andrew Ng", color: "#5f6364", logo: "/logos/deeplearning_ai_logo.png" },
  { title: "ML on GCP", by: "GCP Training", color: "#63c397", logo: "logos:google-icon" },
  { title: "Data Science", by: "Alex Aklson", color: "#74a7dc", logo: "/logos/ibm_logo.png" },
  { title: "Big Data", by: "Kim Akers", color: "#e2876a", logo: "logos:microsoft-icon" },
  { title: "Advanced Data Science", by: "Romeo Kienzler", color: "#74a7dc", logo: "/logos/ibm_logo.png" },
];

export const experience = {
  intro:
    "I work as a software developer at Matrika Technology in Kathmandu, which makes IRD-certified jewellery billing and management software for Nepali jewellers. Outside work I build and maintain Blazify, a free and open-source music player for Android, iPhone and desktop.",
  roles: [
    {
      title: "Software Developer",
      company: "Matrika Technology",
      where: "Kathmandu, Nepal",
      when: "Present",
      color: "#001c55",
      points: [
        "Building IRD-certified billing and management software for Nepali jewellers",
        "Working across mobile, desktop and backend code for the product",
      ],
    },
    {
      title: "Creator & Maintainer",
      company: "Blazify",
      where: "Open source",
      when: "2026",
      color: "#e8501f",
      points: [
        "Native apps for Android (Kotlin), iPhone (SwiftUI) and desktop (Linux & Windows)",
        "Runs Blazify's own Listen Together server, written in Go on Docker",
        "Free and open source: no ads, no tracking, no account needed",
      ],
    },
  ],
};

export type Project = {
  name: string;
  description: string;
  date: string;
  url: string;
  live?: string;
  techs: Tech[];
  wide?: boolean;
};

export const projectsIntro =
  "My projects range from native Android and iPhone apps to desktop software, servers and web apps. The biggest is Blazify, a free and open-source music player used by thousands of people.";

export const projects: Project[] = [
  {
    name: "Blazify (Android)",
    description: "A free, open-source music player for Android: millions of songs, offline downloads, word-by-word synced lyrics and a 10-band equalizer. No ads, no tracking, no account needed.",
    date: "Jul 15, 2026",
    url: "https://github.com/rajendra7169/blazify",
    live: "https://rajendra7169.github.io/blazify/",
    techs: [{ name: "Kotlin", icon: "logos:kotlin-icon" }, { name: "Jetpack Compose", icon: "simple-icons:jetpackcompose", color: "#4285f4" }, { name: "Android", icon: "logos:android-icon" }],
  },
  {
    name: "Blazify for iPhone",
    description: "A free, open-source music player in SwiftUI: streaming, local music, synced lyrics, equalizer. No ads, no tracking.",
    date: "Jul 27, 2026",
    url: "https://github.com/rajendra7169/blazify-ios",
    live: "https://rajendra7169.github.io/blazify/",
    techs: [{ name: "Swift", icon: "logos:swift" }, { name: "Apple", icon: "logos:apple" }],
  },
  {
    name: "Blazify for Desktop",
    description: "A free, open-source music player for Linux and Windows: streaming, offline downloads, synced lyrics and a 10-band equalizer. No ads, no tracking, no account needed.",
    date: "Aug 01, 2026",
    url: "https://github.com/rajendra7169/blazify-desktop",
    live: "https://rajendra7169.github.io/blazify/",
    techs: [{ name: "Kotlin", icon: "logos:kotlin-icon" }, { name: "Linux", icon: "logos:linux-tux" }, { name: "Windows", icon: "logos:microsoft-windows-icon" }],
  },
  {
    name: "NexTerm",
    description: "A modern, feature-rich terminal for Windows — free and built from scratch. SSH, SFTP, port forwarding, jump-hosts, recording, snippets, workspaces, and more.",
    date: "May 04, 2026",
    url: "https://github.com/rajendra7169/NexTerm",
    techs: [{ name: "JavaScript", icon: "logos:javascript" }, { name: "HTML5", icon: "logos:html-5" }, { name: "CSS3", icon: "logos:css-3" }],
  },
  {
    name: "Tally",
    description: "A modern, gamified attendance manager with a living forest visualization. Multi-tenant SaaS for small teams.",
    date: "May 29, 2026",
    url: "https://github.com/rajendra7169/attendance-system",
    live: "https://tally.rajendrapandey.info.np",
    techs: [{ name: "JavaScript", icon: "logos:javascript" }, { name: "CSS3", icon: "logos:css-3" }, { name: "HTML5", icon: "logos:html-5" }],
  },
  {
    name: "Fitevo",
    description: "Local-first AI fitness, nutrition & workout tracker. One-sentence food logging, AI-built routines, no shaming. Flutter + Firebase + Groq.",
    date: "Jun 17, 2026",
    url: "https://github.com/rajendra7169/fitevo",
    techs: [{ name: "Dart", icon: "logos:dart" }, { name: "Flutter", icon: "logos:flutter" }, { name: "Firebase", icon: "logos:firebase" }],
  },
  {
    name: "R-AI",
    description: "Air-gapped, zero-dependency local AI environment.",
    date: "Jun 03, 2026",
    url: "https://github.com/rajendra7169/R-AI",
    techs: [{ name: "HTML5", icon: "logos:html-5" }, { name: "Python", icon: "logos:python" }, { name: "JavaScript", icon: "logos:javascript" }],
    wide: true,
  },
  {
    name: "Laundry Recommendation App",
    description: "A MERN Stack Laundry Management App developed for the Final Year Project at Sunway College Kathmandu.",
    date: "Sep 20, 2024",
    url: "https://github.com/rajendra7169/laundry_recommendation_app",
    live: "https://laundry-frontend-pearl.vercel.app",
    techs: [{ name: "MongoDB", icon: "logos:mongodb-icon" }, { name: "React", icon: "logos:react" }, { name: "Node.js", icon: "logos:nodejs-icon" }],
    wide: true,
  },
];

export const publications = [
  {
    title: "Laundry Recommendation System Web Application using HTML, CSS, JS, NodeJS and MongoDB",
    note: "Paper published in Google Drive",
    date: "December 20 2024",
  },
];

export const contact = {
  blurb:
    "I am available on almost every social media. You can message me, I will reply within 24 hours. I can help you with ML, AI, React, Android, Cloud and Opensource Development.",
  resume: "https://drive.google.com/file/d/1ccK09uY0vuos3whh8vuI50918UVYH0_i/view?usp=sharing",
  address: "Mulpani, Kathmandu, Bagmati, Nepal 44600",
  email: "rajendrapandey199971@gmail.com",
  phone: "+977 9813566214",
  maps: "https://maps.app.goo.gl/HCbA8cW1giG1dKtJ6",
};
