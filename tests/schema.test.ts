import { describe, expect, test } from "vitest";
import config from "../src/config";
import { parsePortfolio } from "../src/lib/schema";

const withChange = (change: (c: any) => void) => {
  const copy = structuredClone(config) as any;
  change(copy);
  return copy;
};

describe("the config", () => {
  test("the example config is valid", () => {
    const portfolio = parsePortfolio(config);
    expect(portfolio.person.name).toBe("Alex Morgan");
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

  test("the template notice can be switched off", () => {
    expect(parsePortfolio(withChange((c) => (c.site.templateNotice = null))).site.templateNotice).toBeNull();
    expect(parsePortfolio(withChange((c) => delete c.site.templateNotice)).site.templateNotice).toBeUndefined();
  });
});
