import { describe, expect, test } from "vitest";
import config from "../src/config";
import { parsePortfolio } from "../src/lib/schema";
import fixture from "./fixtures/portfolio";

// Changes are made to the fixed sample, never to your src/config.ts.
const withChange = (change: (c: any) => void) => {
  const copy = structuredClone(fixture) as any;
  change(copy);
  return copy;
};

describe("the config", () => {
  test("your config is valid", () => {
    expect(() => parsePortfolio(config)).not.toThrow();
  });

  test("the sample config is valid and gets its defaults", () => {
    const portfolio = parsePortfolio(fixture);
    expect(portfolio.person.name).toBe("Sam O'Brien");
    expect(portfolio.projects.every((p) => typeof p.featured === "boolean")).toBe(true);
  });

  test("only the required fields are needed", () => {
    const portfolio = parsePortfolio({
      site: { title: "Sam", description: "Sam's site" },
      person: { name: "Sam", role: "Developer", tagline: "Hi.", about: ["I code."], avatar: { seed: "Sam" } },
    });
    expect(portfolio.projects).toEqual([]);
    expect(portfolio.theme.accent).toBe("#6d5dfc");
    expect(portfolio.site.lang).toBe("en");
  });

  test("a photo instead of the illustrated avatar needs alt text", () => {
    expect(() => parsePortfolio(withChange((c) => (c.person.avatar = { src: "/me.jpg" })))).toThrow(/person\.avatar/);
    expect(parsePortfolio(withChange((c) => (c.person.avatar = { src: "/me.jpg", alt: "Me" }))).person.avatar).toEqual({
      src: "/me.jpg",
      alt: "Me",
    });
  });

  test("mistakes name the field and say what's wrong", () => {
    const broken = withChange((c) => {
      c.person.email = "not-an-email";
      c.projects[2].url = "example.com/no-protocol";
      c.experience[0].start = "March 2023";
      c.person.name = "  ";
    });
    const message = (() => {
      try {
        parsePortfolio(broken);
        return "";
      } catch (error) {
        return (error as Error).message;
      }
    })();
    expect(message).toMatch(/has 4 problem\(s\)/);
    expect(message).toMatch(/person\.email: must be an email address/);
    expect(message).toMatch(/projects\.2\.url: must be a full http\(s\):\/\/ address/);
    expect(message).toMatch(/experience\.0\.start: must look like "2024-03"/);
    expect(message).toMatch(/person\.name: can't be empty/);
  });

  test("a job can't end before it starts", () => {
    expect(() => parsePortfolio(withChange((c) => (c.experience[1].end = "2019-01")))).toThrow(/experience\.1\.end: end is before start/);
  });

  test("javascript: links are refused", () => {
    expect(() => parsePortfolio(withChange((c) => (c.socials[0].url = "javascript:alert(1)")))).toThrow(/socials\.0\.url/);
  });

  test("a misspelled field name is an error, not silently ignored", () => {
    expect(() => parsePortfolio(withChange((c) => (c.person.resumeURL = "https://example.com/cv.pdf")))).toThrow(
      /person: Unrecognized key: "resumeURL"/,
    );
    expect(() => parsePortfolio(withChange((c) => (c.projets = c.projects)))).toThrow(/config: Unrecognized key: "projets"/);
    expect(() => parsePortfolio(withChange((c) => (c.experience[0].compnay = "X")))).toThrow(/experience\.0/);
  });

  test("the accent must be a real color, nothing that could break the CSS", () => {
    for (const accent of ["#6d5dfc", "#abc", "#6d5dfc80", "rgb(109 93 252)", "oklch(58% 0.22 280)", "hsl(250, 90%, 68%)"]) {
      expect(parsePortfolio(withChange((c) => (c.theme.accent = accent))).theme.accent, accent).toBe(accent);
    }
    for (const accent of ["purpel; color: red", "#12345", "rgb(1 2 3); x: y", "url(x)", "red"]) {
      expect(() => parsePortfolio(withChange((c) => (c.theme.accent = accent))), accent).toThrow(/theme\.accent/);
    }
  });

  test("education works without any jobs", () => {
    const portfolio = parsePortfolio(withChange((c) => (c.experience = [])));
    expect(portfolio.experience).toEqual([]);
    expect(portfolio.education).toHaveLength(1);
  });

  test("the template notice can be switched off", () => {
    expect(parsePortfolio(withChange((c) => (c.site.templateNotice = null))).site.templateNotice).toBeNull();
    expect(parsePortfolio(withChange((c) => delete c.site.templateNotice)).site.templateNotice).toBeUndefined();
  });
});
