// What a portfolio config must look like. Checked at build time, so a mistake in src/config.ts
// stops the build with a message that names the field, instead of shipping a broken page.
import { z } from "astro/zod";

const text = z.string().trim().min(1, "can't be empty");
const url = z.url({ protocol: /^https?$/, error: "must be a full http(s):// address" });
const month = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'must look like "2024-03" (year-month)');

const avatar = z.union([
  z.object({ seed: text }),
  z.object({ src: text, alt: text }),
]);

const period = z
  .object({ start: month, end: month.optional() })
  .refine((p) => !p.end || p.end >= p.start, { message: "end is before start", path: ["end"] });

export const portfolioSchema = z.object({
  site: z.object({
    title: text,
    description: text.max(200, "keep it under 200 characters (search engines cut the rest)"),
    lang: text.default("en"),
    templateNotice: z.object({ text, linkLabel: text, url }).nullish(),
  }),
  person: z.object({
    name: text,
    role: text,
    location: text.optional(),
    tagline: text,
    about: z.array(text).min(1, "add at least one paragraph"),
    availability: z.object({ open: z.boolean(), text }).optional(),
    avatar,
    email: z.email("must be an email address").optional(),
    resumeUrl: url.optional(),
  }),
  socials: z.array(z.object({ label: text, url, icon: text.optional() })).default([]),
  skills: z.array(z.object({ group: text, items: z.array(text).min(1) })).default([]),
  projects: z
    .array(
      z.object({
        title: text,
        description: text,
        tags: z.array(text).default([]),
        url: url.optional(),
        repo: url.optional(),
        year: z.number().int().min(1970).max(2100).optional(),
        featured: z.boolean().default(false),
      }),
    )
    .default([]),
  experience: z
    .array(
      z.intersection(
        period,
        z.object({ company: text, role: text, location: text.optional(), highlights: z.array(text).default([]) }),
      ),
    )
    .default([]),
  education: z.array(z.intersection(period, z.object({ school: text, degree: text }))).default([]),
  theme: z.object({ accent: text.default("#6d5dfc") }).default({ accent: "#6d5dfc" }),
});

export type PortfolioInput = z.input<typeof portfolioSchema>;
export type Portfolio = z.output<typeof portfolioSchema>;

// Parses the config, or throws one error listing every problem as "projects.2.url: must be ...".
export function parsePortfolio(input: unknown): Portfolio {
  const result = portfolioSchema.safeParse(input);
  if (result.success) return result.data;
  const problems = result.error.issues.map((issue) => `  - ${issue.path.join(".") || "config"}: ${issue.message}`);
  throw new Error(`src/config.ts has ${problems.length} problem(s):\n${problems.join("\n")}`);
}
