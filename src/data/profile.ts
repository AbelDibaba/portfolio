// Single source of truth for the site and the resume. Edit this file to update both.
// Lines marked TODO are placeholders: fill them in or leave them empty ("") to hide them.

export const profile = {
  name: "Abel Assefa",
  role: "iOS & Full-Stack Engineer",
  location: "Addis Ababa, Ethiopia", // TODO: confirm city
  email: "", // TODO: public email, e.g. "you@example.com" (hidden while empty)
  links: {
    github: "https://github.com/AbelDibaba",
    linkedin: "", // TODO: LinkedIn URL (hidden while empty)
  },
  headline:
    "I build native iOS apps and the full-stack systems behind them, from real-time calling to OCR-powered SaaS.",
  about: [
    "I'm an iOS developer at the Ethiopian Artificial Intelligence Institute. I work across the stack: Swift and SwiftUI on the device, TypeScript services and Postgres behind it.",
    "Outside work I ship products for Ethiopian businesses: tools that turn bank-statement PDFs into spreadsheets, run EV distributor operations, and help people find places their friends love.",
  ],
  experience: [
    {
      title: "iOS Developer",
      company: "Ethiopian Artificial Intelligence Institute",
      period: "Present", // TODO: add start year, e.g. "2025 – Present"
      points: [
        "Build and maintain native iOS apps in Swift, SwiftUI and UIKit.",
        "Built a voice and video calling UI package (iOS 15+) for a chat app with a microservices backend.",
        "Created an interactive Swift training course and playground to onboard new iOS staff, covering calling, debugging, TestFlight and App Store publishing.",
      ],
    },
  ],
  projects: [
    {
      name: "YeneLedger",
      tagline: "Bank-statement PDF → CSV/Excel for Ethiopian businesses",
      description:
        "A SaaS that turns PDF statements from CBE, Awash, Dashen and other Ethiopian banks into clean CSV and Excel. Scanned PDFs and phone photos are read by a built-in Tesseract OCR engine. Files are processed in memory and never stored. Free and paid plans, with local payments through telebirr.",
      stack: ["Next.js", "Fastify", "Tesseract.js", "pdf-lib", "PostgreSQL", "Playwright", "Railway"],
      accent: "#22d3ee",
    },
    {
      name: "BDMS",
      tagline: "Distributor management for EV Bajaj dealers",
      description:
        "A financial system of record for electric three-wheeler distributors. It tracks every vehicle by chassis number and every battery by serial, plus installment payments, agent commissions, branch stock and warranty liability, in English and Amharic. Business rules are edited in an admin dashboard, not code. Nightly jobs use dead-letter queues and replay, and everything is traced with OpenTelemetry.",
      stack: ["NestJS", "Prisma", "PostgreSQL", "Redis", "Next.js", "next-intl", "Leaflet", "OpenTelemetry", "Docker"],
      accent: "#a78bfa",
    },
    {
      name: "ET-CHAT",
      tagline: "Chat app with voice & video calling",
      description:
        "A native iOS messenger with one-to-one and conference calling. I built the Swift calling UI package. The backend is split into services for signaling, conference calls, notifications, contact sync and storage.",
      stack: ["Swift", "SwiftUI", "WebRTC", "Swift Package Manager", "Microservices", "WebSockets"],
      accent: "#34d399",
    },
    {
      name: "YeneSpot (FavPlaces)",
      tagline: "Find the places your friends rate, on a map",
      description:
        "A map-first app for discovering cafés, restaurants and hidden gems your friends recommend nearby, with proximity notifications and an admin dashboard for moderation.",
      stack: ["React", "Vite", "Mapbox GL", "Express", "Tailwind CSS"],
      accent: "#fb923c",
    },
  ],
  skills: [
    { group: "iOS", items: ["Swift", "SwiftUI", "UIKit", "WebRTC calling", "Swift Package Manager", "TestFlight & App Store"] },
    { group: "Frontend", items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Mapbox / Leaflet"] },
    { group: "Backend", items: ["NestJS", "Fastify", "Express", "Prisma", "PostgreSQL", "Redis", "Zod"] },
    { group: "Tooling", items: ["Docker", "Playwright", "Vitest", "OpenTelemetry", "Git & CI"] },
  ],
  education: [
    // TODO: e.g. { degree: "BSc in Computer Science", school: "Addis Ababa University", period: "2019 – 2023" }
  ] as { degree: string; school: string; period: string }[],
};

export type Project = (typeof profile.projects)[number];
