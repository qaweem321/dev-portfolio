// Your whole portfolio lives in this file. Replace the placeholder person below with yourself,
// run `npm run dev`, and watch the page update. Every field is checked when the site builds:
// a typo gives a clear message instead of a broken page.
import type { PortfolioInput } from "./lib/schema";

const config: PortfolioInput = {
  site: {
    title: "Alex Morgan · Full-stack engineer",
    description:
      "Alex Morgan builds fast, accessible web products end to end: TypeScript, React, Node.js and Postgres.",
    lang: "en",
    // Shows a slim "this is a template" bar at the top. Set it to null (or delete it) on your site.
    templateNotice: {
      text: "This is a demo with placeholder data. Make it yours in one file.",
      linkLabel: "Use this template",
      url: "https://github.com/qaweem321/dev-portfolio",
    },
  },

  person: {
    name: "Alex Morgan",
    role: "Full-stack engineer",
    location: "Lisbon, Portugal · open to remote",
    tagline:
      "I build web products that load in a blink, work for everyone, and stay easy to change long after launch.",
    about: [
      "I've spent eight years shipping software for startups and product teams: from the first database table to the dashboard customers open every morning. I like owning a feature end to end, and I care most about the parts users never see until they break: performance, accessibility and data that stays correct under load.",
      "Lately I've been leading a small platform team, mentoring two junior engineers, and turning slow, fragile release processes into ones people trust. Away from the keyboard you'll find me surfing badly and cooking well.",
    ],
    availability: { open: true, text: "Available for new roles from Nov 2026" },
    // An illustrated avatar made from any text: change the seed until you like it.
    // Prefer a photo? Put it in public/ and use: avatar: { src: "/me.jpg", alt: "Alex Morgan" }
    avatar: { seed: "Alex Morgan" },
    email: "alex.morgan@example.com",
  },

  // `icon` is a Simple Icons slug (https://simpleicons.org). Unknown icons get a generic link icon.
  socials: [
    { label: "GitHub", url: "https://github.com/", icon: "github" },
    { label: "LinkedIn", url: "https://www.linkedin.com/", icon: "linkedin" },
    { label: "Mastodon", url: "https://mastodon.social/", icon: "mastodon" },
    { label: "Blog", url: "https://example.com/blog", icon: "rss" },
  ],

  skills: [
    { group: "Languages", items: ["TypeScript", "JavaScript", "SQL", "Python", "Go"] },
    { group: "Frontend", items: ["React", "Next.js", "Astro", "CSS", "Accessibility (WCAG 2.2)"] },
    { group: "Backend", items: ["Node.js", "PostgreSQL", "Redis", "REST & GraphQL", "Stripe"] },
    { group: "Tooling", items: ["Docker", "GitHub Actions", "AWS", "Vitest", "Playwright"] },
  ],

  projects: [
    {
      title: "Tidewatch",
      description:
        "Live dashboard for 400 ocean buoys. Streams readings over WebSockets and renders 60 fps charts on a five-year-old phone.",
      tags: ["React", "WebSockets", "PostgreSQL"],
      url: "https://example.com/tidewatch",
      repo: "https://github.com/",
      year: 2026,
      featured: true,
    },
    {
      title: "Ledgerline",
      description:
        "Double-entry bookkeeping API with idempotent writes and an audit trail. Reconciles 2 million transactions a night.",
      tags: ["Node.js", "PostgreSQL", "API"],
      repo: "https://github.com/",
      year: 2025,
      featured: true,
    },
    {
      title: "Pocket Planner",
      description:
        "Offline-first trip planner. Works on a plane, syncs when you land, and never loses an edit.",
      tags: ["React", "PWA", "IndexedDB"],
      url: "https://example.com/pocket-planner",
      year: 2025,
      featured: true,
    },
    {
      title: "Atlas UI",
      description:
        "Accessible React component library: 40 components, keyboard support and screen-reader tests for every one.",
      tags: ["React", "Accessibility", "TypeScript"],
      repo: "https://github.com/",
      year: 2024,
    },
    {
      title: "Shiplog",
      description: "CLI that turns merged pull requests into a readable changelog, grouped by what users notice.",
      tags: ["Node.js", "CLI", "GitHub API"],
      repo: "https://github.com/",
      year: 2024,
    },
    {
      title: "Quietly",
      description: "Browser extension that hides feeds and badges during focus hours. 12,000 weekly users.",
      tags: ["TypeScript", "Browser extension"],
      url: "https://example.com/quietly",
      year: 2023,
    },
  ],

  // Dates are "YYYY-MM"; leave `end` out for your current role.
  experience: [
    {
      company: "Northwind Labs",
      role: "Senior Full-stack Engineer",
      start: "2023-03",
      location: "Remote",
      highlights: [
        "Lead a four-person platform team; cut deploy time from 40 minutes to 6.",
        "Rebuilt billing on Stripe with zero double charges across 30,000 subscriptions.",
        "Mentor two junior engineers, both promoted within a year.",
      ],
    },
    {
      company: "Brightwave Health",
      role: "Full-stack Engineer",
      start: "2020-06",
      end: "2023-02",
      location: "Lisbon",
      highlights: [
        "Shipped the patient booking app used by 120 clinics.",
        "Raised the app's accessibility score from 61 to 100 and kept it there with automated checks.",
      ],
    },
    {
      company: "Pixel & Pine Studio",
      role: "Frontend Developer",
      start: "2018-01",
      end: "2020-05",
      location: "Porto",
      highlights: ["Built 25+ marketing sites and storefronts for small businesses."],
    },
  ],

  education: [{ school: "University of Porto", degree: "BSc Computer Science", start: "2014-09", end: "2017-07" }],

  // Any CSS color. Used for links, buttons and highlights in both themes.
  theme: { accent: "#6d5dfc" },
};

export default config;
