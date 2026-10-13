// Builds the real site (as GitHub Pages would, under /dev-portfolio/) and checks the HTML a
// visitor gets: every section and project is there, links and anchors work, nothing leaks
// "undefined" into the page.
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import config from "../src/config";
import { parsePortfolio } from "../src/lib/schema";

const portfolio = parsePortfolio(config);
const root = fileURLToPath(new URL("..", import.meta.url));
// Inside the project (.astro/ is gitignored): Astro moves files into outDir, which fails across
// drives, so the system temp folder won't do on every machine.
mkdirSync(join(root, ".astro"), { recursive: true });
const outDir = mkdtempSync(join(root, ".astro", "test-build-"));
let html = "";

// Vitest puts Vite's own variables (BASE_URL=/, MODE, ...) in process.env; a child build would
// inherit them and ignore the base path.
function cleanEnv() {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (/^(BASE_URL|MODE|DEV|PROD|SSR|TEST|NODE_ENV)$|^VITEST/.test(key)) delete env[key];
  }
  return env;
}

const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");

beforeAll(() => {
  // The real CLI in its own process, with the variables the Pages workflow sets.
  const astro = join(root, "node_modules", "astro", "bin", "astro.mjs");
  const run = spawnSync(process.execPath, [astro, "build", "--outDir", outDir], {
    cwd: root,
    env: { ...cleanEnv(), BASE_PATH: "/dev-portfolio/", SITE: "https://example.github.io", ASTRO_TELEMETRY_DISABLED: "1" },
    encoding: "utf8",
  });
  if (run.status !== 0) throw new Error(`astro build failed:
${run.stdout}
${run.stderr}`);
  html = readFileSync(join(outDir, "index.html"), "utf8");
}, 120_000);

afterAll(() => rmSync(outDir, { recursive: true, force: true }));

const all = (pattern: RegExp) => [...html.matchAll(pattern)].map((m) => m[1]);

describe("the built page", () => {
  test("shows the person, every project and every job", () => {
    expect(html).toMatch(/<h1 id="hero-title"/);
    expect(html).toContain(portfolio.person.name);
    for (const project of portfolio.projects) expect(html, project.title).toContain(escapeHtml(project.title));
    for (const job of portfolio.experience) expect(html, job.company).toContain(escapeHtml(job.company));
  });

  test("never prints undefined, null or [object Object]", () => {
    const visible = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ");
    expect(visible).not.toMatch(/\bundefined\b|\bnull\b|\[object Object\]|\bNaN\b/);
  });

  test("every in-page link points at an element that exists", () => {
    const ids = new Set(all(/\sid="([^"]+)"/g));
    const targets = all(/href="#([^"]*)"/g);
    expect(targets.length).toBeGreaterThan(4);
    for (const target of targets) expect(ids.has(target), `#${target}`).toBe(true);
  });

  test("no link leads to a placeholder page", () => {
    const links = all(/href="(https?:[^"]+)"/g);
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link, link).not.toMatch(/^https?:\/\/(www\.)?example\.(com|org|net)\b/);
      expect(link, link).not.toMatch(/^https:\/\/github\.com\/?$/);
    }
  });

  test("Get in touch goes to the contact section (an email link alone does nothing without a mail app)", () => {
    expect(html).toMatch(/<a class="button primary" href="#contact"[^>]*>Get in touch<\/a>/);
  });

  test("the Email button offers the email app, webmail and copying, with a plain link without JavaScript", () => {
    const email = portfolio.person.email ?? "";
    expect(html).toMatch(new RegExp(`<a class="button primary no-js-only" href="mailto:${email}"`));
    expect(html).toMatch(/<button class="button primary trigger needs-js" type="button" aria-expanded="false" aria-controls="email-options"/);
    expect(html).toMatch(/<div class="options card" id="email-options" hidden/);
    for (const label of ["Email app", "Gmail", "Outlook", "Yahoo Mail", "Copy address"]) expect(html, label).toContain(label);
    // Webmail opens in a new tab without handing this page to it.
    for (const link of html.match(/<a class="option" href="https:[^>]*>/g) ?? []) {
      expect(link).toMatch(/target="_blank"/);
      expect(link).toMatch(/rel="noopener noreferrer"/);
    }
  });

  test("ids are unique", () => {
    const ids = all(/\sid="([^"]+)"/g);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("files are served under the GitHub Pages base path", () => {
    expect(html).toContain('href="/dev-portfolio/favicon.svg"');
    expect(html).toContain('src="/dev-portfolio/avatar.svg"');
    expect(readFileSync(join(outDir, "avatar.svg"), "utf8")).toMatch(/^<svg/);
    expect(html).toContain('<link rel="canonical" href="https://example.github.io/dev-portfolio/"');
  });

  test("structured data describes the person", () => {
    const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    const data = JSON.parse(json ?? "{}");
    expect(data).toMatchObject({ "@type": "Person", name: portfolio.person.name, jobTitle: portfolio.person.role });
    expect(data.sameAs).toEqual(portfolio.socials.map((s) => s.url));
  });

  test("images have alt text, icon-only links have names, buttons have types", () => {
    for (const img of html.match(/<img\b[^>]*>/g) ?? []) expect(img).toMatch(/\salt="[^"]+"/);
    for (const link of html.match(/<a\b[^>]*class="icon-button"[^>]*>/g) ?? []) expect(link).toMatch(/aria-label="[^"]+"/);
    for (const button of html.match(/<button\b[^>]*>/g) ?? []) expect(button).toMatch(/type="button"/);
  });

  test("dates are written out, never as 03/2023", () => {
    expect(html).toContain("Mar 2023");
    expect(html).toContain("Present");
    expect(html).not.toMatch(/\b\d{1,2}\/\d{4}\b/);
  });
});
