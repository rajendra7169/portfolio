//SEO Related settings
const seo = {
  title: "Rajendra's Portfolio",
  description:
    "Software developer at Matrika Technology in Kathmandu, and the maker of Blazify — a free, open-source music player for Android, iPhone and desktop with thousands of downloads.",
  og: {
    title: "Rajendra's Portfolio",
    type: "website",
    url: "http://rajendrapandey.info.np/",
  },
};

//Home Page
const greeting = {
  title: "Rajendra Pandey",
  logo_name: "RajendraPandey",
  subTitle:
    "Software developer at Matrika Technology in Kathmandu, and the maker of Blazify — a free, open-source music player for Android, iPhone and desktop with thousands of downloads.",
  resumeLink:
    "https://drive.google.com/file/d/1ccK09uY0vuos3whh8vuI50918UVYH0_i/view?usp=sharing",
  portfolio_repository: "https://github.com/rajendra7169/portfolio",
  githubProfile: "https://github.com/rajendra7169",
};

const socialMediaLinks = [
  {
    name: "Github",
    link: "https://github.com/rajendra7169",
    fontAwesomeIcon: "fa-github",
    backgroundColor: "#181717",
  },
  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/in/rajendrapaandey/",
    fontAwesomeIcon: "fa-linkedin-in",
    backgroundColor: "#0077B5",
  },
  {
    name: "YouTube",
    link: "https://www.youtube.com/@vlograja71",
    fontAwesomeIcon: "fa-youtube",
    backgroundColor: "#FF0000",
  },
  {
    name: "Gmail",
    link: "mailto:rajendrapandey199971@gmail.com",
    fontAwesomeIcon: "fa-google",
    backgroundColor: "#D14836",
  },
  {
    name: "X-Twitter",
    link: "https://twitter.com/raja7169",
    fontAwesomeIcon: "fa-x-twitter",
    backgroundColor: "#000000",
  },
  {
    name: "Facebook",
    link: "https://www.facebook.com/raja.indra.50159",
    fontAwesomeIcon: "fa-facebook-f",
    backgroundColor: "#1877F2",
  },
  {
    name: "Instagram",
    link: "https://www.instagram.com/raja.indra7169",
    fontAwesomeIcon: "fa-instagram",
    backgroundColor: "#E4405F",
  },
];

const skills = {
  data: [
    {
      title: "Full Stack Development",
      fileName: "FullStackImg",
      skills: [
        "⚡ Writing Kotlin, Swift, Dart, C#, TypeScript, JavaScript, Python, Go, Java, PHP, C and C++",
        "⚡ Building native Android apps in Kotlin & Jetpack Compose, and iPhone apps in Swift & SwiftUI",
        "⚡ Building cross-platform mobile apps in Flutter, and desktop apps for Windows and Linux",
        "⚡ Creating backends and APIs in .NET, Node & Express, Go and Python",
        "⚡ Building dynamic, responsive web applications with React and TypeScript",
      ],
      softwareSkills: [
        {
          skillName: "Kotlin",
          fontAwesomeClassname: "simple-icons:kotlin",
          style: {
            color: "#7F52FF",
          },
        },
        {
          skillName: "Swift",
          fontAwesomeClassname: "simple-icons:swift",
          style: {
            color: "#F05138",
          },
        },
        {
          skillName: "Dart",
          fontAwesomeClassname: "simple-icons:dart",
          style: {
            color: "#0175C2",
          },
        },
        {
          skillName: "C# / .NET",
          fontAwesomeClassname: "simple-icons:dotnet",
          style: {
            color: "#512BD4",
          },
        },
        {
          skillName: "TypeScript",
          fontAwesomeClassname: "simple-icons:typescript",
          style: {
            color: "#3178C6",
          },
        },
        {
          skillName: "Python",
          fontAwesomeClassname: "simple-icons:python",
          style: {
            color: "#3776AB",
          },
        },
        {
          skillName: "Go",
          fontAwesomeClassname: "simple-icons:go",
          style: {
            color: "#00ADD8",
          },
        },
        {
          skillName: "Java",
          fontAwesomeClassname: "simple-icons:openjdk",
          style: {
            color: "#ED8B00",
          },
        },
        {
          skillName: "PHP",
          fontAwesomeClassname: "simple-icons:php",
          style: {
            color: "#777BB4",
          },
        },
        {
          skillName: "Android",
          fontAwesomeClassname: "simple-icons:android",
          style: {
            color: "#3DDC84",
          },
        },
        {
          skillName: "Jetpack Compose",
          fontAwesomeClassname: "simple-icons:jetpackcompose",
          style: {
            color: "#4285F4",
          },
        },
        {
          skillName: "HTML5",
          fontAwesomeClassname: "simple-icons:html5",
          style: {
            color: "#E34F26",
          },
        },
        {
          skillName: "CSS3",
          fontAwesomeClassname: "fa-css3",
          style: {
            color: "#1572B6",
          },
        },
        {
          skillName: "JavaScript",
          fontAwesomeClassname: "simple-icons:javascript",
          style: {
            backgroundColor: "#000000",
            color: "#F7DF1E",
          },
        },
        {
          skillName: "ReactJS",
          fontAwesomeClassname: "simple-icons:react",
          style: {
            color: "#61DAFB",
          },
        },
        {
          skillName: "NodeJS",
          fontAwesomeClassname: "devicon-plain:nodejs-wordmark",
          style: {
            color: "#339933",
          },
        },
        {
          skillName: "Flutter",
          fontAwesomeClassname: "simple-icons:flutter",
          style: {
            color: "#02569B",
          },
        },
      ],
    },
    {
      title: "Cloud Infra-Architecture",
      fileName: "CloudInfraImg",
      skills: [
        "⚡ Running real services, like Blazify's own Listen Together server written in Go on Docker",
        "⚡ Deploying on Cloudflare Workers, Supabase, Firebase, Render and Netlify",
        "⚡ Working with PostgreSQL, SQLite, MongoDB and SQL Server",
        "⚡ Shipping signed, reproducible release builds for Android, iPhone, Windows and Linux",
      ],
      softwareSkills: [
        {
          skillName: "Docker",
          fontAwesomeClassname: "simple-icons:docker",
          style: {
            color: "#2496ED",
          },
        },
        {
          skillName: "Cloudflare",
          fontAwesomeClassname: "simple-icons:cloudflare",
          style: {
            color: "#F38020",
          },
        },
        {
          skillName: "Supabase",
          fontAwesomeClassname: "simple-icons:supabase",
          style: {
            color: "#3FCF8E",
          },
        },
        {
          skillName: "SQLite",
          fontAwesomeClassname: "simple-icons:sqlite",
          style: {
            color: "#003B57",
          },
        },
        {
          skillName: "Linux",
          fontAwesomeClassname: "simple-icons:linux",
          style: {
            color: "#FCC624",
          },
        },
        {
          skillName: "Git",
          fontAwesomeClassname: "simple-icons:git",
          style: {
            color: "#F03C2E",
          },
        },
        {
          skillName: "Firebase",
          fontAwesomeClassname: "simple-icons:firebase",
          style: {
            color: "#FFCA28",
          },
        },
        {
          skillName: "PostgreSQL",
          fontAwesomeClassname: "simple-icons:postgresql",
          style: {
            color: "#336791",
          },
        },
        {
          skillName: "MongoDB",
          fontAwesomeClassname: "simple-icons:mongodb",
          style: {
            color: "#47A248",
          },
        },
      ],
    },
    {
      title: "UI/UX Design",
      fileName: "DesignImg",
      skills: [
        "⚡ Designing highly attractive user interface for mobile and web applications",
        "⚡ Customizing logo designs and building logos from scratch",
        "⚡ Creating the flow of application functionalities to optimize user experience",
      ],
      softwareSkills: [
        {
          skillName: "Adobe XD",
          fontAwesomeClassname: "simple-icons:adobexd",
          style: {
            color: "#FF2BC2",
          },
        },
        {
          skillName: "Figma",
          fontAwesomeClassname: "simple-icons:figma",
          style: {
            color: "#F24E1E",
          },
        },
        {
          skillName: "Adobe Illustrator",
          fontAwesomeClassname: "simple-icons:adobeillustrator",
          style: {
            color: "#FF7C00",
          },
        },
        {
          skillName: "Inkscape",
          fontAwesomeClassname: "simple-icons:inkscape",
          style: {
            color: "#000000",
          },
        },
      ],
    },
    {
      title: "Video/Photography",
      fileName: "video",
      skills: [
        "⚡ Skilled in videography and photography, capturing and creating stunning visuals.",
        "⚡ Proficient in advanced video editing using DaVinci Resolve, Adobe Premiere Pro, and CapCut.",
        "⚡ Experienced in graphic design with expertise in Photoshop for professional-quality content.",
      ],
      softwareSkills: [
        {
          skillName: "Photoshop",
          fontAwesomeClassname: "simple-icons:adobephotoshop",
          style: {
            color: "#0b2631",
          },
        },
        {
          skillName: "Davinci Resolve",
          fontAwesomeClassname: "simple-icons:davinciresolve",
          style: {
            color: "#FF9E0B",
          },
        },
        {
          skillName: "Adobe Lightroom",
          fontAwesomeClassname: "simple-icons:adobelightroom",
          style: {
            color: "#31A8FF",
          },
        },
        {
          skillName: "Adobe Premierepro",
          fontAwesomeClassname: "simple-icons:adobepremierepro",
          style: {
            color: "#9999FF",
          },
        },
      ],
    },
  ],
};

// Education Page
const competitiveSites = {
  competitiveSites: [
    {
      siteName: "LeetCode",
      iconifyClassname: "simple-icons:leetcode",
      style: {
        color: "#F79F1B",
      },
      profileLink: "https://leetcode.com/u/rajendrapandey/",
    },
    {
      siteName: "HackerRank",
      iconifyClassname: "simple-icons:hackerrank",
      style: {
        color: "#2EC866",
      },
      profileLink: "https://www.hackerrank.com/rajendrapandey",
    },
    {
      siteName: "Kaggle",
      iconifyClassname: "simple-icons:kaggle",
      style: {
        color: "#20BEFF",
      },
      profileLink: "https://www.kaggle.com/rajaindra",
    },
    {
      siteName: "Codechef",
      iconifyClassname: "simple-icons:codechef",
      style: {
        color: "#5B4638",
      },
      profileLink: "https://www.codechef.com/users/rajendrapandey",
    },
    {
      siteName: "Codeforces",
      iconifyClassname: "simple-icons:codeforces",
      style: {
        color: "#1F8ACB",
      },
      profileLink: "http://codeforces.com/profile/rajendrapandey7169",
    },
  ],
};

const degrees = {
  degrees: [
    {
      title: "Sunway International Business School",
      subtitle: "BSc. in Information Technology",
      logo_path: "sunway.png",
      alt_name: "Sunway International Business School",
      duration: "2021 - 2024",
      descriptions: [
        "⚡ I have gained knowledge in essential software engineering subjects, including Data Structures (DS), Algorithms, Database Management Systems (DBMS), Operating Systems (OS), Computer Architecture (CA), and Artificial Intelligence (AI).",
        "⚡ Beyond this, I have pursued advanced courses in Deep Learning, Data Science, Cloud Computing, Full Stack Development, and Database Optimization, strengthening my expertise in both foundational and cutting-edge technologies.",
        "⚡ Additionally, I have explored advanced topics in both Java and Python, such as multithreading, networking, and GUI development in Java, as well as machine learning, data analysis, and automation scripting in Python. These skills have allowed me to develop efficient, scalable, and robust software solutions.",
      ],
      website_link: "https://sunway.edu.np",
    },
    {
      title: "St. Lawrence College",
      subtitle: "+2 in Business Studies",
      logo_path: "lawrence.png",
      alt_name: "St. Lawrence College",
      duration: "2015 - 2017",
      descriptions: [
        "⚡ I have completed a variety of courses related to Business Studies, including Organizational Behavior, Business Communication, and Strategic Management, which have helped me develop a strong foundation in understanding business operations and management strategies.",
        "⚡ In the field of Accounting, I have undertaken courses such as Financial Accounting, Cost Accounting, and Taxation. These have enabled me to analyze financial data and develop budgeting and auditing skills effectively.",
        "⚡ Additionally, I have pursued Optional Mathematics courses such as Business Statistics and Quantitative Techniques, which have honed my problem-solving and analytical abilities, aiding in effective decision-making and strategic planning.",
      ],
      website_link: "https://www.stlawrence.edu.np",
    },
  ],
};

const certifications = {
  certifications: [
    {
      title: "Machine Learning",
      subtitle: "- Andrew Ng",
      logo_path: "stanford_logo.png",
      certificate_link: "#",
      alt_name: "Stanford University",
      color_code: "#8C151599",
    },
    {
      title: "Deep Learning",
      subtitle: "- Andrew Ng",
      logo_path: "deeplearning_ai_logo.png",
      certificate_link: "#",
      alt_name: "deeplearning.ai",
      color_code: "#00000099",
    },
    {
      title: "ML on GCP",
      subtitle: "- GCP Training",
      logo_path: "google_logo.png",
      certificate_link: "#",
      alt_name: "Google",
      color_code: "#0C9D5899",
    },
    {
      title: "Data Science",
      subtitle: "- Alex Aklson",
      logo_path: "ibm_logo.png",
      certificate_link: "#",
      alt_name: "IBM",
      color_code: "#1F70C199",
    },
    {
      title: "Big Data",
      subtitle: "- Kim Akers",
      logo_path: "microsoft_logo.png",
      certificate_link: "#",
      alt_name: "Microsoft",
      color_code: "#D83B0199",
    },
    {
      title: "Advanced Data Science",
      subtitle: "- Romeo Kienzler",
      logo_path: "ibm_logo.png",
      certificate_link: "#",
      alt_name: "IBM",
      color_code: "#1F70C199",
    },
  ],
};

// Experience Page
const experience = {
  title: "Experience",
  subtitle: "Work",
  description:
    "I work as a software developer at Matrika Technology in Kathmandu, which makes IRD-certified jewellery billing and management software for Nepali jewellers. Outside work I build and maintain Blazify, a free and open-source music player for Android, iPhone and desktop.",
  header_image_path: "experience.svg",
  sections: [
    {
      title: "Work",
      work: true,
      experiences: [
        {
          title: "Software Developer",
          company: "Matrika Technology",
          company_url: "https://matrikatec.com.np",
          logo_path: "matrika.png",
          duration: "Present",
          location: "New Baneshwor, Kathmandu, Nepal",
          description:
            "Matrika Technology makes IRD-certified jewellery billing and management software for Nepali jewellers. I work on its products across desktop, web, API and mobile.",
          color: "#A3301E",
        },
      ],
    },
  ],
};

// Projects Page
const projectsHeader = {
  title: "Projects",
  description:
    "My projects range from native Android and iPhone apps to desktop software, servers and web apps. The biggest is Blazify, a free and open-source music player used by thousands of people.",
  avatar_image_path: "projects_image.svg",
};

const publicationsHeader = {
  title: "Documentations",
  description: "Some of my documentations created while doing a project.",
  avatar_image_path: "projects_image.svg",
};

const publications = {
  data: [
    {
      id: "laundry-recommendation-system",
      name:
        "Laundry Recommendation System Web Application using HTML, CSS, JS, NodeJS and MongoDB",
      createdAt: "December 20 2024",
      description: "Paper published in Google Drive",
      url:
        "https://drive.google.com/file/d/1MH6vrEk4cu6G--QjCdqFdDFhcRisSv-4/view?usp=sharing",
    },
    {
      id: "",
      name: "",
      createdAt: "Not published yet",
      description: "",
      url: "",
    },
    {
      id: "",
      name: "",
      createdAt: "Not published yet",
      description: "",
      url: "",
    },
  ],
};

// Contact Page
const contactPageData = {
  contactSection: {
    title: "Contact Me",
    profile_image_path: "rajendra.png",
    description:
      "I am available on almost every social media. You can message me, I will reply within 24 hours. I can help you with ML, AI, React, Android, Cloud and Opensource Development.",
  },
  addressSection: {
    title: "Address",
    subtitle: "Mulpani, Kathmandu, Bagmati, Nepal 44600",
    locality: "Mulpani",
    country: "Nepal",
    region: "Bagmati",
    postalCode: "44600",
    streetAddress: "Somtirtha Chok",
    avatar_image_path: "address_image.svg",
    location_map_link: "https://maps.app.goo.gl/HCbA8cW1giG1dKtJ6",
  },
  phoneSection: {
    title: "Phone",
    subtitle: "+977 9813566214",
  },
  emailSection: {
    title: "Email",
    subtitle: "rajendrapandey199971@gmail.com",
  },
};

export {
  seo,
  greeting,
  socialMediaLinks,
  skills,
  competitiveSites,
  degrees,
  certifications,
  experience,
  projectsHeader,
  publicationsHeader,
  publications,
  contactPageData,
};
