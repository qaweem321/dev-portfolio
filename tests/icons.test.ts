import { expect, test } from "vitest";
import fixture from "./fixtures/portfolio";
import { avatarSvg } from "../src/lib/avatar";
import { hasBrandIcon, iconPath, LINK_ICON } from "../src/lib/icons";

test("known brands get their icon, unknown ones the link icon", () => {
  expect(iconPath("github")).not.toBe(LINK_ICON);
  expect(iconPath("GitHub")).toBe(iconPath("github"));
  expect(iconPath("no-such-brand")).toBe(LINK_ICON);
  expect(iconPath(undefined)).toBe(LINK_ICON);
});

test("every icon the sample config asks for either exists or falls back on purpose", () => {
  const missing = fixture.socials?.filter((s) => s.icon && !hasBrandIcon(s.icon)).map((s) => s.icon);
  // Simple Icons dropped LinkedIn at LinkedIn's request; it shows the link icon.
  expect(missing).toEqual(["linkedin"]);
});

test("the avatar is the same SVG for the same seed, and different for another", () => {
  const a = avatarSvg("Alex Morgan");
  expect(a.startsWith("<svg")).toBe(true);
  expect(avatarSvg("Alex Morgan")).toBe(a);
  expect(avatarSvg("Sam Lee")).not.toBe(a);
  expect(a).not.toMatch(/<script/i);
});
