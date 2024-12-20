//SEO Related settings
const seo = {
  title: "Rajendra's Portfolio",
  description:
    "A passionate individual who always thrives to work on end to end products which develop sustainable and scalable social and technical systems to create impact.",
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
    "A passionate individual who always thrives to work on end to end products which develop sustainable and scalable social and technical systems to create impact.",
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
        "⚡ Experienced web developer with knowledge of Python, Java, HTML, CSS, JavaScript, C, C++, and Dart.",
        "⚡ Skilled in developing dynamic and responsive web applications using modern technologies.",
        "⚡ Developing mobile applications using Flutter, React Native and solo android apps using Kotlin",
        "⚡ Creating application backend in Node, Express & Flask",
      ],
      softwareSkills: [
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
        "⚡ Experience working on multiple cloud platforms",
        "⚡ Hosting and maintaining websites on virtual machine instances along with integration of databases",
        "⚡ Deploying deep learning models on cloud to use on mobile devices",
        "⚡ Setting up streaming jobs from DB to Server or vice-versa on GCP and AWS",
      ],
      softwareSkills: [
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
  subtitle: "Work and Internship",
  description:
    "I have professional experience as an Account Handler (2021-2022) and Marketing Personnel (2017-2018). As an Account Handler, my key responsibilities included preparing financial statements, ensuring tax compliance, analyzing financial trends, and predicting future revenues and costs.",
  header_image_path: "experience.svg",
  sections: [
    {
      title: "Work",
      work: true,
      experiences: [
        {
          title: "Account Handler",
          company: "Nawakantipur Saving and Credit Co-operative Society Ltd.",
          company_url: "https://nawakantipur.com.np/",
          logo_path: "nawakantipur.webp",
          duration: "2021 - 2022",
          location: "Kathmandu, Nepal",
          description:
            "Responsibilities involved collecting data on sales revenues, liabilities, and other financial metrics; preparing financial statements like balance sheets and income statements on a monthly, quarterly, and annual basis; ensuring compliance with tax regulations through accurate and timely payments; and analyzing financial trends to forecast future costs and revenues.",
          color: "#000000",
        },
      ],
    },
    {
      title: "Internships",
      experiences: [
        {
          title: "Game Developer",
          company: "Yarsa Games",
          company_url: "https://www.yarsagames.com/",
          logo_path: "yarsa.webp",
          duration: "May 2024 - Aug 2024",
          location: "Kathmandu, Nepal",
          description:
            "I contributed to creating engaging game experiences by coding mechanics, designing levels, debugging, and optimizing performance. Collaborating with a creative team, I gained hands-on experience in the game development lifecycle.",
          color: "#000000",
        },
      ],
    },
  ],
};

// Projects Page
const projectsHeader = {
  title: "Projects",
  description:
    "My projects makes use of vast variety of latest technology tools. My best experience is to create MERN Stack projects and deploy them using cloud infrastructures such as vercel, aws and netlify.",
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
