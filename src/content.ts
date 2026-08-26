/**
 * content.ts — single source of truth for every word on the page.
 *
 * Ported from the old site's `src/portfolio.js` (499 lines, one export per
 * section). Two corrections were applied, and only two, per CLAUDE.md §2:
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
  title: 'Rajendra Pandey — accounting to game development',
  description:
    'Rajendra Pandey, Kathmandu. BSc IT from Sunway International Business School. ' +
    'Two years preparing balance sheets at a savings co-operative, then game ' +
    'development at Yarsa Games. Full-stack, mobile and real-time graphics work.',
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
  thesis: 'I balanced books for two years, then went and built games.',
  supporting:
    'Balance sheets and tax filings at a Kathmandu savings co-operative until ' +
    '2022. Game mechanics, level design and frame budgets at Yarsa Games in ' +
    '2024. The two halves use more of the same muscle than anyone expects.',
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
      'On the accounting side I took financial accounting, cost accounting and taxation. Those three courses are the direct reason I could walk into a savings co-operative in 2021 and prepare statements from day one.',
      'I also took the optional mathematics track, business statistics and quantitative techniques, which is where the analytical habit came from: state the problem numerically before arguing about it.',
    ],
    websiteLink: 'https://www.stlawrence.edu.np',
  },
];

/* --------------------------------------------------------- 04 · experience -- */

export const experience = {
  /** Chronological, oldest first — the section reads as a pivot, not a résumé. */
  roles: [
    {
      id: 'marketing',
      kind: 'work',
      title: 'Marketing Personnel',
      duration: '2017 – 2018',
      location: 'Kathmandu, Nepal',
    },
    {
      id: 'nawakantipur',
      kind: 'work',
      title: 'Account Handler',
      company: 'Nawakantipur Saving and Credit Co-operative Society Ltd.',
      companyUrl: 'https://nawakantipur.com.np/',
      duration: '2021 – 2022',
      location: 'Kathmandu, Nepal',
      description:
        'I collected data on sales revenue, liabilities and the other financial metrics the co-operative ran on, and prepared the balance sheets and income statements monthly, quarterly and annually. I kept the organisation compliant with tax regulation through accurate and timely payment, and analysed financial trends to forecast costs and revenue for the periods ahead.',
    },
    {
      id: 'yarsa',
      kind: 'internship',
      title: 'Game Developer',
      company: 'Yarsa Games',
      companyUrl: 'https://www.yarsagames.com/',
      duration: 'May 2024 – Aug 2024',
      location: 'Kathmandu, Nepal',
      description:
        'I wrote game mechanics, designed levels, debugged and optimised performance alongside the studio team. Four months inside a shipping game development lifecycle — where a frame budget is not a metaphor and a regression is visible to the player immediately.',
    },
  ] satisfies Role[] as Role[],
};

/* ------------------------------------------------------------- 05 · skills -- */

export const skills: { data: SkillCategory[] } = {
  data: [
    {
      id: 'fullstack',
      title: 'Full Stack Development',
      bullets: [
        'I write Python, Java, JavaScript, C, C++, Dart, HTML and CSS.',
        'I build dynamic, responsive web applications with current tooling.',
        'I build mobile applications in Flutter and React Native, and solo Android apps in Kotlin.',
        'I write application backends in Node, Express and Flask.',
      ],
      software: [
        { name: 'HTML5', icon: 'html5', brand: '#E34F26' },
        { name: 'CSS3', icon: 'css', brand: '#1572B6' },
        { name: 'JavaScript', icon: 'javascript', brand: '#F7DF1E' },
        { name: 'React', icon: 'react', brand: '#61DAFB' },
        { name: 'Node.js', icon: 'nodedotjs', brand: '#5FA04E' },
        { name: 'Flutter', icon: 'flutter', brand: '#02569B' },
      ],
    },
    {
      id: 'cloud',
      title: 'Cloud Infra-Architecture',
      bullets: [
        'I have worked across multiple cloud platforms.',
        'I host and maintain sites on virtual machine instances, with databases wired in behind them.',
        'I have deployed deep learning models to the cloud for mobile devices to call.',
        'I set up streaming jobs between database and server, in both directions, on GCP and AWS.',
      ],
      software: [
        { name: 'Firebase', icon: 'firebase', brand: '#DD2C00' },
        { name: 'PostgreSQL', icon: 'postgresql', brand: '#4169E1' },
        { name: 'MongoDB', icon: 'mongodb', brand: '#47A248' },
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
  { id: 'pivot', entry: '03', qualifier: '2017–2024', title: 'Pivot' },
  { id: 'systems', entry: '04', qualifier: '17 TOOLS', title: 'Systems' },
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
    subtitle: 'Android music streaming player, Kotlin and Jetpack Compose.',
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
    repo: 'sajilo-sawari',
    title: 'Sajilo Sawari',
    subtitle: 'Vehicle rental marketplace for Nepal, verified against real documents.',
  },
  {
    repo: 'laundry_recommendation_app',
    title: 'Laundry Recommendation System',
    subtitle: 'The MERN final-year project the December 2024 paper documents.',
  },
];
