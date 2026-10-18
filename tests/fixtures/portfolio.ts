// A fixed sample config for the tests, so they don't depend on src/config.ts (which you replace
// with yourself). It covers the tricky cases: an apostrophe in the name, "+" in the email, a
// current job, education and a project with both links.
import type { PortfolioInput } from "../../src/lib/schema";

const fixture: PortfolioInput = {
  site: {
    title: "Sam O'Brien · Backend engineer",
    description: "Sam O'Brien builds reliable APIs and data pipelines.",
    templateNotice: { text: "Sample data.", linkLabel: "Template", url: "https://github.com/qaweem321/dev-portfolio" },
  },
  person: {
    name: "Sam O'Brien",
    role: "Backend engineer",
    location: "Dublin",
    tagline: "APIs that stay up & stay fast.",
    about: ["I build backends.", "I like boring, reliable systems."],
    availability: { open: true, text: "Open to work" },
    avatar: { seed: "Sam O'Brien" },
    email: "sam+jobs@obrien.dev",
  },
  socials: [
    { label: "GitHub", url: "https://github.com/sam-obrien", icon: "github" },
    { label: "Mastodon", url: "https://hachyderm.io/@sam", icon: "mastodon" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/sam-obrien", icon: "linkedin" },
  ],
  skills: [
    { group: "Languages", items: ["Go", "TypeScript", "SQL"] },
    { group: "Tools", items: ["Postgres", "Kafka"] },
  ],
  projects: [
    { title: "Queue<Lite>", description: "A tiny job queue.", tags: ["Go", "Postgres"], year: 2025, featured: true,
      url: "https://queuelite.obrien.dev", repo: "https://github.com/sam-obrien/queuelite" },
    { title: "Tally", description: "Usage metering API.", tags: ["Go", "Kafka"], year: 2024 },
    { title: "Pgwatch", description: "Postgres slow-query alerts.", tags: ["Postgres"], year: 2023 },
  ],
  experience: [
    { company: "Harbor & Co", role: "Senior Backend Engineer", start: "2023-03", highlights: ["Cut p99 latency by 60%."] },
    { company: "Datapath", role: "Backend Engineer", start: "2020-06", end: "2023-02", location: "Remote" },
  ],
  education: [{ school: "Trinity College Dublin", degree: "BA Computer Science", start: "2016-09", end: "2020-05" }],
  theme: { accent: "#0f766e" },
};

export default fixture;
