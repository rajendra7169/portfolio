/**
 * content.ts — single source of truth for every word on the page.
 *
 * Ported from the old site's `src/portfolio.js` (499 lines, one export per
 * section). Two corrections were applied, and only two, per the brief §2:
 *
 *   1. `certifications` is gone. Every entry was MasterPortfolio template data
 *      (Andrew Ng, IBM, Microsoft) with `certificate_link: "#"`.
 *   2. `publications` shed two empty objects with `createdAt: "Not published
 *      yet"`. The real paper stays.
 *
 * Prose was rewritten for voice per DESIGN.md §8 — first person, past tense for
 * history, no adjective doing a fact's job, no "⚡" prefixes. Nothing was
 * shortened: the education bullets run past 300 characters and stay that way.
 */

/* ------------------------------------------------------------------ types -- */

export type IconSlug = string;

export interface SocialLink {
  name: string;
  /** Short label used in the hero, where seven links share one row. */
  handle: string;
  link: string;
  icon: IconSlug;
  brand: string;
}

export interface SoftwareSkill {
  name: string;
  icon: IconSlug;
  /** Real brand colour. DESIGN.md §2 — the one permitted palette exception. */
  brand: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  bullets: string[];
  software: SoftwareSkill[];
}

export interface CompetitiveProfile {
  site: string;
  handle: string;
  link: string;
  icon: IconSlug;
  brand: string;
}

export interface Degree {
  id: string;
  institution: string;
  qualification: string;
  duration: string;
  descriptions: string[];
  websiteLink?: string;
}

export interface Role {
  id: string;
  kind: 'work' | 'internship';
  title: string;
  company?: string;
  companyUrl?: string;
  duration: string;
  location: string;
  description?: string;
}

export interface Publication {
  id: string;
  name: string;
  createdAt: string;
  description: string;
  url?: string;
}

/* -------------------------------------------------------------- 01 · meta -- */

export const seo = {
  title: 'Rajendra Pandey — software developer, Kathmandu',
  description:
    'Rajendra Pandey, software developer in Kathmandu at Matrika Technology. BSc IT, ' +
    'Sunway International Business School. Builds Blazify, a free open-source music ' +
    'player for Android, iPhone and desktop. Kotlin, Swift, Dart, C#, TypeScript, Python, Go.',
  url: 'https://rajendrapandey.info.np/',
  locale: 'en_NP',
} as const;

export const greeting = {
  name: 'Rajendra Pandey',
  devanagari: 'राजेन्द्र पाण्डे',
  initials: 'RP',
  /**
   * DESIGN.md §8 replaces the template line — "A passionate individual who
   * always thrives to work on end to end products…" — with the pivot itself.
   */
  thesis: 'I build software people actually use.',
  supporting:
    'Software developer at Matrika Technology in Kathmandu. On my own time I build ' +
    'Blazify, a free and open-source music player for Android, iPhone and desktop ' +
    'with thousands of downloads, and the servers it runs on.',
  resumeLink:
    'https://drive.google.com/file/d/1ccK09uY0vuos3whh8vuI50918UVYH0_i/view?usp=sharing',
  portfolioRepository: 'https://github.com/rajendra7169/portfolio',
  githubProfile: 'https://github.com/rajendra7169',
  githubUsername: 'rajendra7169',
} as const;

/* ------------------------------------------------------------- 02 · social -- */

export const socialMediaLinks: SocialLink[] = [
  {
    name: 'GitHub',
    handle: 'rajendra7169',
    link: 'https://github.com/rajendra7169',
    icon: 'github',
    brand: '#181717',
  },
  {
    name: 'LinkedIn',
    handle: 'rajendrapaandey',
    link: 'https://www.linkedin.com/in/rajendrapaandey/',
    icon: 'linkedin',
    brand: '#0A66C2',
  },
  {
    name: 'YouTube',
    handle: '@vlograja71',
    link: 'https://www.youtube.com/@vlograja71',
    icon: 'youtube',
    brand: '#FF0000',
  },
  {
    name: 'Email',
    handle: 'rajendrapandey199971',
    link: 'mailto:rajendrapandey199971@gmail.com',
    icon: 'gmail',
    brand: '#D14836',
  },
  {
    name: 'X',
    handle: '@raja7169',
    link: 'https://twitter.com/raja7169',
    icon: 'x',
    brand: '#000000',
  },
  {
    name: 'Instagram',
    handle: 'raja.indra7169',
    link: 'https://www.instagram.com/raja.indra7169',
    icon: 'instagram',
    brand: '#E4405F',
  },
  {
    name: 'Facebook',
    handle: 'raja.indra.50159',
    link: 'https://www.facebook.com/raja.indra.50159',
    icon: 'facebook',
    brand: '#1877F2',
  },
];

/* ---------------------------------------------------------- 03 · education -- */

export const degrees: Degree[] = [
  {
    id: 'sunway',
    institution: 'Sunway International Business School',
    qualification: 'BSc. in Information Technology',
    duration: '2021 – 2024',
    descriptions: [
      'I studied the core software engineering sequence — data structures, algorithms, database management systems, operating systems, computer architecture and artificial intelligence — and worked through each of them against real assignments rather than as reading.',
      'Beyond the core I took deep learning, data science, cloud computing, full-stack development and database optimisation, which is where the coursework stopped being foundations and started being the work I now do.',
      'I went further into both Java and Python than the syllabus required: multithreading, networking and GUI development on the Java side, and machine learning, data analysis and automation scripting on the Python side. That is where the habit of building something that keeps running came from.',
    ],
    websiteLink: 'https://sunway.edu.np',
  },
  {
    id: 'lawrence',
    institution: 'St. Lawrence College',
    qualification: '+2 in Business Studies',
    duration: '2015 – 2017',
    descriptions: [
      'I completed the business studies sequence — organisational behaviour, business communication and strategic management — which is the grounding in how a company actually operates that most developers never get.',
      'On the accounting side I took financial accounting, cost accounting and taxation — the grounding I now use building billing software for real businesses.',
      'I also took the optional mathematics track, business statistics and quantitative techniques, which is where the analytical habit came from: state the problem numerically before arguing about it.',
    ],
    websiteLink: 'https://www.stlawrence.edu.np',
  },
];

/* --------------------------------------------------------- 04 · experience -- */

export const experience = {
  roles: [
    {
      id: 'matrika',
      kind: 'work',
      title: 'Software Developer',
      company: 'Matrika Technology',
      companyUrl: 'https://matrikatec.com.np',
      duration: 'Present',
      location: 'New Baneshwor, Kathmandu',
      description:
        'Matrika Technology makes IRD-certified jewellery billing and management software for Nepali jewellers. I work on its products across desktop, web, API and mobile.',
    },
  ] satisfies Role[] as Role[],
};

/* ------------------------------------------------------------- 05 · skills -- */

export const skills: { data: SkillCategory[] } = {
  data: [
    {
      id: 'fullstack',
      title: 'Languages & Apps',
      bullets: [
        'I write Kotlin, Swift, Dart, C#, TypeScript, JavaScript, Python, Go, Java, PHP, C and C++.',
        'I build native Android apps in Kotlin and Jetpack Compose, and iPhone apps in Swift and SwiftUI.',
        'I build cross-platform mobile apps in Flutter, and desktop apps for Windows and Linux.',
        'I write backends and APIs in .NET, Node and Express, Go and Python.',
        'I build responsive web applications in React and TypeScript.',
      ],
      software: [
        { name: 'Kotlin', icon: 'kotlin', brand: '#7F52FF' },
        { name: 'Swift', icon: 'swift', brand: '#F05138' },
        { name: 'Dart', icon: 'dart', brand: '#0175C2' },
        { name: 'C# / .NET', icon: 'dotnet', brand: '#512BD4' },
        { name: 'TypeScript', icon: 'typescript', brand: '#3178C6' },
        { name: 'JavaScript', icon: 'javascript', brand: '#F7DF1E' },
        { name: 'Python', icon: 'python', brand: '#3776AB' },
        { name: 'Go', icon: 'go', brand: '#00ADD8' },
        { name: 'Java', icon: 'openjdk', brand: '#000000' },
        { name: 'PHP', icon: 'php', brand: '#777BB4' },
        { name: 'Android', icon: 'android', brand: '#3DDC84' },
        { name: 'Jetpack Compose', icon: 'jetpackcompose', brand: '#4285F4' },
        { name: 'Flutter', icon: 'flutter', brand: '#02569B' },
        { name: 'React', icon: 'react', brand: '#61DAFB' },
        { name: 'Node.js', icon: 'nodedotjs', brand: '#5FA04E' },
        { name: 'HTML5', icon: 'html5', brand: '#E34F26' },
        { name: 'CSS3', icon: 'css', brand: '#1572B6' },
      ],
    },
    {
      id: 'cloud',
      title: 'Cloud, Data & Delivery',
      bullets: [
        'I run real services: Blazify\'s own Listen Together server, written in Go and deployed in Docker.',
        'I deploy on Cloudflare Workers, Supabase, Firebase, Render and Netlify.',
        'I work with PostgreSQL, SQLite, MongoDB and SQL Server.',
        'I ship release builds for Android, iPhone, Windows and Linux, signed and reproducible.',
      ],
      software: [
        { name: 'Docker', icon: 'docker', brand: '#2496ED' },
        { name: 'Cloudflare', icon: 'cloudflare', brand: '#F38020' },
        { name: 'Supabase', icon: 'supabase', brand: '#3FCF8E' },
        { name: 'Firebase', icon: 'firebase', brand: '#DD2C00' },
        { name: 'PostgreSQL', icon: 'postgresql', brand: '#4169E1' },
        { name: 'SQLite', icon: 'sqlite', brand: '#003B57' },
        { name: 'MongoDB', icon: 'mongodb', brand: '#47A248' },
        { name: 'Linux', icon: 'linux', brand: '#FCC624' },
        { name: 'Git', icon: 'git', brand: '#F03C2E' },
      ],
    },
    {
      id: 'design',
      title: 'UI / UX Design',
      bullets: [
        'I design the interface for mobile and web applications.',
        'I draw logos from scratch and adapt existing marks.',
        'I map the flow through an application before any of it gets drawn.',
      ],
      software: [
        { name: 'Adobe XD', icon: 'adobexd', brand: '#FF61F6' },
        { name: 'Figma', icon: 'figma', brand: '#F24E1E' },
        { name: 'Illustrator', icon: 'adobeillustrator', brand: '#FF9A00' },
        { name: 'Inkscape', icon: 'inkscape', brand: '#000000' },
      ],
    },
    {
      id: 'video',
      title: 'Video / Photography',
      bullets: [
        'I shoot video and stills, and I compose the frame before I fix it.',
        'I edit in DaVinci Resolve, Adobe Premiere Pro and CapCut.',
        'I do graphic design and retouching in Photoshop.',
      ],
      software: [
        { name: 'Photoshop', icon: 'adobephotoshop', brand: '#31A8FF' },
        { name: 'DaVinci Resolve', icon: 'davinciresolve', brand: '#233A51' },
        { name: 'Lightroom', icon: 'adobelightroom', brand: '#31A8FF' },
        { name: 'Premiere Pro', icon: 'adobepremierepro', brand: '#9999FF' },
      ],
    },
  ],
};

/* -------------------------------------------------------- 06 · competitive -- */

export const competitiveSites: CompetitiveProfile[] = [
  {
    site: 'LeetCode',
    handle: 'rajendrapandey',
    link: 'https://leetcode.com/u/rajendrapandey/',
    icon: 'leetcode',
    brand: '#FFA116',
  },
  {
    site: 'HackerRank',
    handle: 'rajendrapandey',
    link: 'https://www.hackerrank.com/rajendrapandey',
    icon: 'hackerrank',
    brand: '#00EA64',
  },
  {
    site: 'Kaggle',
    handle: 'rajaindra',
    link: 'https://www.kaggle.com/rajaindra',
    icon: 'kaggle',
    brand: '#20BEFF',
  },
  {
    site: 'CodeChef',
    handle: 'rajendrapandey',
    link: 'https://www.codechef.com/users/rajendrapandey',
    icon: 'codechef',
    brand: '#5B4638',
  },
  {
    site: 'Codeforces',
    handle: 'rajendrapandey7169',
    link: 'https://codeforces.com/profile/rajendrapandey7169',
    icon: 'codeforces',
    brand: '#1F8ACB',
  },
];

/* ------------------------------------------------------ 07 · documentation -- */

export const publications: Publication[] = [
  {
    id: 'laundry-recommendation-system',
    name: 'Laundry Recommendation System Web Application using HTML, CSS, JS, NodeJS and MongoDB',
    createdAt: 'December 20, 2024',
    description:
      'The written paper for my final-year project at Sunway: a MERN-stack laundry management platform that recommends services against a user profile. Covers the recommendation approach, the schema, and what the deployment actually cost to run.',
    url: 'https://drive.google.com/file/d/1MH6vrEk4cu6G--QjCdqFdDFhcRisSv-4/view?usp=sharing',
  },
];

/* -------------------------------------------------------------- 08 · contact -- */

export const contactPageData = {
  address: {
    streetAddress: 'Somtirtha Chok',
    locality: 'Mulpani',
    region: 'Bagmati',
    country: 'Nepal',
    postalCode: '44600',
    display: 'Mulpani, Somtirtha Chok, Kathmandu, Bagmati 44600, Nepal',
    mapLink: 'https://maps.app.goo.gl/HCbA8cW1giG1dKtJ6',
    coordinates: '27.72°N 85.40°E',
  },
  phone: { label: 'Phone', value: '+977 9813566214', link: 'tel:+9779813566214' },
  email: {
    label: 'Email',
    value: 'rajendrapandey199971@gmail.com',
    link: 'mailto:rajendrapandey199971@gmail.com',
  },
  note: 'Kathmandu is UTC+5:45. Email reaches me fastest; I answer within a day.',
} as const;

/* ------------------------------------------------------------------ 09 · acts -- */

/** One entry per scroll act. `label` renders as the Martian Mono entry line. */
export const acts = [
  { id: 'arrival', entry: '01', qualifier: 'KATHMANDU', title: 'Arrival' },
  { id: 'origin', entry: '02', qualifier: '2015–2024', title: 'Origin' },
  { id: 'pivot', entry: '03', qualifier: 'NOW', title: 'Work' },
  { id: 'systems', entry: '04', qualifier: '34 TOOLS', title: 'Systems' },
  { id: 'practice', entry: '05', qualifier: '5 PROFILES', title: 'Practice' },
  { id: 'evidence', entry: '06', qualifier: 'GITHUB', title: 'Evidence' },
  { id: 'documentation', entry: '07', qualifier: 'DEC 2024', title: 'Documentation' },
  { id: 'signal', entry: '08', qualifier: '44600', title: 'Signal' },
] as const;

export type ActId = (typeof acts)[number]['id'];

/* ------------------------------------------------------------- 10 · evidence -- */

export interface FeaturedProject {
  /** Must match a `name` in src/data/repos.ts, or the panel is skipped. */
  repo: string;
  /** Display name. Repo slugs are not titles. */
  title: string;
  /** One line, factual. Renders under the title in the expanded panel. */
  subtitle: string;
  /** Optional WebP screenshot in /public/shots. Absent renders the empty frame. */
  shot?: string;
}

/**
 * The accordion carries four to six projects chosen for having a real interface
 * (DESIGN.md §5.6). Everything else in the fetch lists as a plain card below it.
 * Curation is by hand and on purpose: a wall of eighteen repositories says less
 * than six that can be looked at.
 */
export const featuredProjects: FeaturedProject[] = [
  {
    repo: 'blazify',
    title: 'Blazify',
    subtitle: 'Free, open-source music player for Android. Kotlin and Jetpack Compose, thousands of downloads.',
  },
  {
    repo: 'blazify-ios',
    title: 'Blazify for iPhone',
    subtitle: 'The same player rewritten in Swift and SwiftUI, built and signed without a Mac.',
  },
  {
    repo: 'blazify-desktop',
    title: 'Blazify for desktop',
    subtitle: 'Linux and Windows edition in Kotlin and Compose Multiplatform.',
  },
  {
    repo: 'NexTerm',
    title: 'NexTerm',
    subtitle: 'A terminal for Windows, written from scratch rather than forked.',
  },
  {
    repo: 'attendance-system',
    title: 'Tally',
    subtitle: 'Multi-tenant attendance manager whose forest grows as a team shows up.',
  },
  {
    repo: 'fitevo',
    title: 'Fitevo',
    subtitle: 'Local-first fitness and nutrition tracker. One sentence logs a meal.',
  },
  {
    repo: 'R-AI',
    title: 'R-AI',
    subtitle: 'An air-gapped, zero-dependency local AI environment.',
  },
  {
    repo: 'laundry_recommendation_app',
    title: 'Laundry Recommendation System',
    subtitle: 'The MERN final-year project the December 2024 paper documents.',
  },
];
