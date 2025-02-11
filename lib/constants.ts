export const defaultCategories = [
  {
    name: "Events",
    description:
      "Emails related to events such as invitations, reminders, and event updates.",
  },
  {
    name: "Achievements",
    description:
      "Emails that highlight awards, recognitions, and accomplishments.",
  },
  {
    name: "Important",
    description:
      "Emails with urgent or critical information requiring immediate attention. Emails which are coming from Dean , Hod , Program Chair of the Course.",
  },
  {
    name: "General",
    description:
      "Miscellaneous emails that do not fit into the other categories.",
  },
];

export const features = [
  {
    title: "Smart Categorization",
    subtitle:
      "Automatically sorts your emails into Events, Achievements, Important, and General for a streamlined inbox.",
    src: "/category.mov",
    type: "video"
  },
  {
    title: "Intelligent Parsing",
    subtitle:
      "Extracts key details from your emails, such as dates, subjects, and attachments, to help you manage tasks and schedule events.",
      src: "/parse.png",
      type: "image"
  },
  {
    title: "Seamless Integration",
    subtitle:
      "Effortlessly integrate your inbox with your calendar and productivity tools, ensuring you never miss a critical update.",
      src: "/final.mov",
      type: "video"
  },
];

export const cards = [
  {
    title: "Effortless Email Management",
    subtitle:
      "Let our AI automatically sort and prioritize your emails so you can focus on what matters most.",
  },
  {
    title: "Integrated Calendar Events",
    subtitle:
      "Convert event emails into calendar events with a single click, keeping your schedule organized and up-to-date.",
  },
  {
    title: "Actionable Insights",
    subtitle:
      "Gain valuable insights and analytics on your email communications to optimize your daily workflow.",
  },
];

export const navs = [
  { title: "Home", link: "/", auth: false },
  { title: "Dashboard", link: "/dashboard", auth: true },
  { title: "Inbox", link: "/inbox", auth: true },
  { title: "Events", link: "/events", auth: true },
  { title: "Pricing", link: "/pricing", auth: false },
];

export const tiers = [
  {
    name: 'Starter',
    price: 9,
    features: [
      'Basic email classification',
      'Local AI model support',
      '1000 classifications/month',
      'Essential spam filtering'
    ],
    aiModel: 'qwen-2.5',
  },
  {
    name: 'Pro',
    price: 29,
    features: [
      'Advanced email categorization',
      'Enhanced spam & phishing detection',
      '5000 classifications/month',
      'Custom label training',
      'Faster processing speed'
    ],
    aiModel: 'gemma',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 99,
    features: [
      'Custom AI model fine-tuning',
      'Unlimited email classifications',
      'Dedicated on-premise deployment',
      'API access for integration',
      '24/7 priority support'
    ],
    aiModel: 'deepseekv3',
  },
]
