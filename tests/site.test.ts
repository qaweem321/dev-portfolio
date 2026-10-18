// Checks the HTML a visitor gets, from real `astro build` runs.
// - Your site: general checks that hold for any config (links work, ids unique, every image has
//   alt text...). With SITE_DIR set (CI and the deploy), it checks that already-built folder
//   instead of building again.
// - The sample site: tests/fixtures/portfolio.ts built as GitHub Pages would (under
//   /dev-portfolio/), checked in detail. It never changes when you edit src/config.ts.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import config from "../src/config";
import { parsePortfolio } from "../src/lib/schema";
import fixture from "./fixtures/portfolio";

const root = fileURLToPath(new URL("..", import.meta.url));
const tempDirs: string[] = [];
afterAll(() => tempDirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })));

// Vitest puts Vite's own variables (BASE_URL=/, MODE, ...) in process.env; a child build would
// inherit them and ignore the base path.
function cleanEnv() {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (/^(BASE_URL|MODE|DEV|PROD|SSR|TEST|NODE_ENV)$|^VITEST/.test(key)) delete env[key];
  }
  return env;
}

// The real CLI in its own process. The output goes inside the project (.astro/ is gitignored):
// Astro moves files into outDir, which fails across drives, so the system temp folder won't do.
function build(env: Record<string, string>) {
  mkdirSync(join(root, ".astro"), { recursive: true });
  const outDir = mkdtempSync(join(root, ".astro", "test-build-"));
  tempDirs.push(outDir);
  const astro = join(root, "node_modules", "astro", "bin", "astro.mjs");
  const run = spawnSync(process.execPath, [astro, "build", "--outDir", outDir], {
    cwd: root,
    env: { ...cleanEnv(), ASTRO_TELEMETRY_DISABLED: "1", ...env },
    encoding: "utf8",
  });
  if (run.status !== 0) throw new Error(`astro build failed:\n${run.stdout}\n${run.stderr}`);
  return outDir;
}

const readPage = (dir: string) => readFileSync(join(dir, "index.html"), "utf8");
const all = (html: string, pattern: RegExp) => [...html.matchAll(pattern)].map((m) => m[1]);
// How Astro writes text into HTML.
const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const SOCIAL_HOSTS = [
  "github.com", "gitlab.com", "linkedin.com", "x.com", "twitter.com", "instagram.com", "facebook.com",
  "youtube.com", "dribbble.com", "behance.net", "medium.com", "bsky.app", "mastodon.social",
  "codepen.io", "stackoverflow.com", "dev.to",
];
const PLACEHOLDER_HOME = new RegExp(`^https?://(www\\.)?(${SOCIAL_HOSTS.map(escapeRegExp).join("|")})/?(in/?)?$`, "i");

// Demo data left on a real site: copied examples ("your-name") always count; placeholder email
// addresses count once the site stops calling itself a demo (site.templateNotice removed).
function leftoverDemoData(html: string, isDemo: boolean) {
  const found = all(html, /href="([^"]*\byour-?(name|user-?name|handle)\b[^"]*)"/gi);
  if (!isDemo) found.push(...(html.match(/[\w.+-]+@example\.(com|org|net)\b/gi) ?? []));
  return [...new Set(found)];
}

// Holds for any config, so it runs on your site and on the sample.
function generalChecks(page: () => string, isDemo: boolean) {
  test("no demo data is left (placeholder emails once templateNotice is gone, copied examples)", () => {
    expect(leftoverDemoData(page(), isDemo)).toEqual([]);
  });

  test("every in-page link points at an element that exists", () => {
    const ids = new Set(all(page(), /\sid="([^"]+)"/g));
    for (const target of all(page(), /href="#([^"]*)"/g)) expect(ids.has(target), `#${target}`).toBe(true);
  });

  test("ids are unique", () => {
    const ids = all(page(), /\sid="([^"]+)"/g);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("no link leads to a placeholder page", () => {
    for (const link of all(page(), /href="(https?:[^"]+)"/g)) {
      expect(link, link).not.toMatch(/^https?:\/\/(www\.)?example\.(com|org|net)\b/);
      // A social site's home page instead of your profile.
      expect(link, link).not.toMatch(PLACEHOLDER_HOME);
    }
  });

  test("every link to another site opens in a new tab, safely, and says so", () => {
    for (const link of page().match(/<a\b[^>]*href="https?:[^"]*"[^>]*>[\s\S]*?<\/a>/g) ?? []) {
      expect(link, link).toMatch(/target="_blank"/);
      expect(link, link).toMatch(/rel="[^"]*noopener[^"]*"/);
      expect(link, link).toMatch(/opens in a new tab/);
    }
  });

  test("images have alt text, icon-only links have names, buttons have types", () => {
    for (const img of page().match(/<img\b[^>]*>/g) ?? []) expect(img).toMatch(/\salt="[^"]+"/);
    for (const link of page().match(/<a\b[^>]*class="icon-button"[^>]*>/g) ?? []) expect(link).toMatch(/aria-label="[^"]+"/);
    for (const button of page().match(/<button\b[^>]*>/g) ?? []) expect(button).toMatch(/type="button"/);
  });

  test("structured data is valid JSON", () => {
    const json = page().match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    expect(() => JSON.parse(json ?? "")).not.toThrow();
  });
}

describe("your site", () => {
  let html = "";
  beforeAll(() => {
    const dir = process.env.SITE_DIR ? resolve(root, process.env.SITE_DIR) : build({});
    if (!existsSync(join(dir, "index.html"))) throw new Error(`No index.html in ${dir}: run npm run build first.`);
    html = readPage(dir);
  }, 120_000);

  generalChecks(() => html, Boolean(parsePortfolio(config).site.templateNotice));
});

describe("the sample site", () => {
  const portfolio = parsePortfolio(fixture, "tests/fixtures/portfolio.ts");
  let outDir = "";
  let html = "";
  beforeAll(() => {
    outDir = build({
      PORTFOLIO_CONFIG: "tests/fixtures/portfolio.ts",
      BASE_PATH: "/dev-portfolio/",
      SITE: "https://example.github.io",
    });
    html = readPage(outDir);
  }, 120_000);

  test("was built from the sample config, not src/config.ts", () => {
    expect(html, "PORTFOLIO_CONFIG was ignored: check the plugin in astro.config.mjs").toContain(escapeHtml(portfolio.person.name));
  });

  generalChecks(() => html, true);

  test("the demo-data check finds placeholder emails and copied examples", () => {
    const page = '<input value="alex@example.com"><a href="https://www.linkedin.com/in/your-name">';
    expect(leftoverDemoData(page, false)).toEqual(["https://www.linkedin.com/in/your-name", "alex@example.com"]);
    expect(leftoverDemoData(page, true)).toEqual(["https://www.linkedin.com/in/your-name"]);
    expect(leftoverDemoData('<a href="https://github.com/sam">', false)).toEqual([]);
  });

  test("shows the person, every project, job and school", () => {
    expect(html).toMatch(/<h1 id="hero-title"/);
    expect(html).toContain(escapeHtml(portfolio.person.name));
    for (const project of portfolio.projects) expect(html, project.title).toContain(escapeHtml(project.title));
    for (const job of portfolio.experience) expect(html, job.company).toContain(escapeHtml(job.company));
    for (const item of portfolio.education) expect(html, item.school).toContain(escapeHtml(item.school));
  });

  test("never prints undefined, null or [object Object]", () => {
    const visible = html.replace(/<(script|style)[\s\S]*?<\/\1>/g, "").replace(/<[^>]+>/g, " ");
    expect(visible).not.toMatch(/\bundefined\b|\bnull\b|\[object Object\]|\bNaN\b/);
  });

  test("the menu links to every section", () => {
    expect(all(html, /<a href="#([a-z]+)"[^>]*>/g)).toEqual(expect.arrayContaining(["about", "projects", "experience", "contact"]));
  });

  test("Get in touch goes to the contact section", () => {
    expect(html).toMatch(/<a class="button primary" href="#contact"[^>]*>Get in touch<\/a>/);
  });

  test("the email address is shown with a Copy button, and no email link", () => {
    const email = escapeRegExp(portfolio.person.email ?? "");
    expect(html).toMatch(new RegExp(`<input class="address"[^>]*readonly[^>]*value="${email}"`));
    expect(html).toMatch(/<button class="button primary copy needs-js" type="button" data-copy[^>]*>\s*Copy\s*<\/button>/);
    expect(html).not.toMatch(/href="mailto:/);
  });

  test("project filters are hidden until JavaScript shows them", () => {
    expect(html).toMatch(/<div class="filters[^"]*"[^>]*\shidden[\s>]/);
    const css = readFileSync(join(outDir, html.match(/href="\/dev-portfolio\/(_astro\/[^"]+\.css)"/)?.[1] ?? ""), "utf8");
    expect(/\.filters(\[data-astro-cid-\w+\])?\[hidden\]\{display:none/.test(css), ".filters[hidden] rule").toBe(true);
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

  test("dates are written out, never as 03/2023", () => {
    expect(html).toMatch(/<time datetime="2023-03">Mar 2023<\/time> – Present/);
    expect(html).toMatch(/<time datetime="2016-09">Sep 2016<\/time> – <time datetime="2020-05">May 2020<\/time>/);
    expect(html).not.toMatch(/\b\d{1,2}\/\d{4}\b/);
  });
});
