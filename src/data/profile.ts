import type { Shot } from "@/components/Mockups";

// Single source of truth for the site and the resume. Edit this file to update both.
// Screenshots live in public/projects (desktop ~1600px wide, phone 780px wide).
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
        "A SaaS that turns PDF statements from Ethiopian banks into clean CSV and Excel, starting with CBE and Awash. Scanned PDFs and phone photos are read by a built-in Tesseract OCR engine. Files are processed in memory and never stored. Free and paid plans, with local payments through telebirr.",
      stack: ["Next.js", "Fastify", "Tesseract.js", "pdf-lib", "PostgreSQL", "Playwright", "Railway"],
      accent: "#22d3ee",
      shots: { desktop: [{ src: "/projects/yeneledger-home.jpg", w: 1600, h: 1000, alt: "YeneLedger landing page" }, { src: "/projects/yeneledger-convert.jpg", w: 1600, h: 1000, alt: "YeneLedger upload screen" }], phone: [{ src: "/projects/yeneledger-phone.jpg", w: 780, h: 1688, alt: "YeneLedger on a phone" }] },
    },
    {
      name: "BDMS",
      tagline: "Distributor management for EV Bajaj dealers",
      description:
        "A financial system of record for electric three-wheeler distributors. It tracks every vehicle by chassis number and every battery by serial, plus installment payments, agent commissions, branch stock and warranty liability, in English and Amharic. Business rules are edited in an admin dashboard, not code. Nightly jobs use dead-letter queues and replay, and everything is traced with OpenTelemetry.",
      stack: ["NestJS", "Prisma", "PostgreSQL", "Redis", "Next.js", "next-intl", "Leaflet", "OpenTelemetry", "Docker"],
      accent: "#a78bfa",
      shots: { desktop: [{ src: "/projects/bdms-home.jpg", w: 1280, h: 720, alt: "BDMS home screen" }, { src: "/projects/bdms-dashboard.jpg", w: 1600, h: 609, alt: "BDMS stock and collections dashboard" }], phone: [{ src: "/projects/bdms-phone.jpg", w: 780, h: 1587, alt: "BDMS on a phone" }] },
    },
    {
      name: "ET-CHAT",
      tagline: "Chat app with voice & video calling",
      description:
        "A native iOS messenger with one-to-one and conference calling. I built the Swift calling UI package. The backend is split into services for signaling, conference calls, notifications, contact sync and storage.",
      stack: ["Swift", "SwiftUI", "WebRTC", "Swift Package Manager", "Microservices", "WebSockets"],
      accent: "#34d399",
      shots: { desktop: [] as Shot[], phone: [{ src: "/projects/etchat-splash.jpg", w: 780, h: 1696, alt: "ET-CHAT splash screen" }, { src: "/projects/etchat-welcome.jpg", w: 780, h: 1696, alt: "ET-CHAT welcome screen" }, { src: "/projects/etchat-signup.jpg", w: 780, h: 1696, alt: "ET-CHAT phone number sign-up" }, { src: "/projects/etchat-chats.jpg", w: 780, h: 1696, alt: "ET-CHAT chat list" }, { src: "/projects/etchat-conversation.jpg", w: 780, h: 1696, alt: "ET-CHAT conversation" }, { src: "/projects/etchat-calls.jpg", w: 780, h: 1696, alt: "ET-CHAT calls tab" }, { src: "/projects/etchat-discover.jpg", w: 780, h: 1696, alt: "ET-CHAT status and channels" }, { src: "/projects/etchat-settings.jpg", w: 780, h: 1696, alt: "ET-CHAT settings" }], cover: [1, 3, 5] },
    },
    {
      name: "YeneSpot (FavPlaces)",
      tagline: "Find the places your friends rate, on a map",
      description:
        "A map-first app for discovering cafés, restaurants and hidden gems your friends recommend nearby, with proximity notifications and an admin dashboard for moderation.",
      stack: ["React", "Vite", "Mapbox GL", "Express", "Tailwind CSS"],
      accent: "#fb923c",
      shots: { desktop: [] as Shot[], phone: [{ src: "/projects/yenespot-landing.jpg", w: 780, h: 1688, alt: "YeneSpot welcome screen" }, { src: "/projects/yenespot-feed.jpg", w: 780, h: 1688, alt: "YeneSpot feed of friend-rated places" }, { src: "/projects/yenespot-radar.jpg", w: 780, h: 1688, alt: "YeneSpot food radar setup" }] },
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
