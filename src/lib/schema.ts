// What a portfolio config must look like. Checked at build time, so a mistake in src/config.ts
// stops the build with a message that names the field, instead of shipping a broken page.
// Every object is strict: a misspelled field name ("resumeURL") is an error, not silently dropped.
import { z } from "astro/zod";

const text = z.string().trim().min(1, "can't be empty");
const url = z.url({ protocol: /^https?$/, error: "must be a full http(s):// address" });
const month = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'must look like "2024-03" (year-month)');

// Hex (#6d5dfc) or a color function (rgb, hsl, oklch, ...). Anything else could break the CSS and
// leave white button text on a light page.
const color = z
  .string()
  .trim()
  .regex(
    /^(#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([\w\s.,%/+-]+\))$/i,
    'must be a color like "#6d5dfc" or "oklch(58% 0.22 280)"',
  );

const avatar = z.union([
  z.strictObject({ seed: text }),
  z.strictObject({ src: text, alt: text }),
]);

// Jobs and education: a start and optional end month ("2024-03"), the end not before the start.
const period = { start: month, end: month.optional() };
const endNotBeforeStart = (p: { start: string; end?: string }) => !p.end || p.end >= p.start;
const endError = { message: "end is before start", path: ["end"] };

export const portfolioSchema = z.strictObject({
  site: z.strictObject({
    title: text,
    description: text.max(200, "keep it under 200 characters (search engines cut the rest)"),
    lang: text.default("en"),
    // Link-preview picture (PNG or JPG, ideally 1200x630): a file in public/ or a full URL.
    image: text.optional(),
    templateNotice: z.strictObject({ text, linkLabel: text, url }).nullish(),
  }),
  person: z.strictObject({
    name: text,
    role: text,
    location: text.optional(),
    tagline: text,
    about: z.array(text).min(1, "add at least one paragraph"),
    availability: z.strictObject({ open: z.boolean(), text }).optional(),
    avatar,
    email: z.email("must be an email address").optional(),
    resumeUrl: url.optional(),
  }),
  socials: z.array(z.strictObject({ label: text, url, icon: text.optional() })).default([]),
  skills: z.array(z.strictObject({ group: text, items: z.array(text).min(1) })).default([]),
  projects: z
    .array(
      z.strictObject({
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
      z
        .strictObject({ ...period, company: text, role: text, location: text.optional(), highlights: z.array(text).default([]) })
        .refine(endNotBeforeStart, endError),
    )
    .default([]),
  education: z
    .array(z.strictObject({ ...period, school: text, degree: text }).refine(endNotBeforeStart, endError))
    .default([]),
  theme: z.strictObject({ accent: color.default("#6d5dfc") }).default({ accent: "#6d5dfc" }),
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
