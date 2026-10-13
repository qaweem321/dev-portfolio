// Brand icons from Simple Icons (CC0), looked up by slug at build time, so only the icons you use
// end up in the page. Brands Simple Icons doesn't carry (LinkedIn, for one) get a generic link icon.
import * as simpleIcons from "simple-icons";

type SimpleIcon = { slug: string; path: string; title: string };

const bySlug = new Map<string, SimpleIcon>();
for (const value of Object.values(simpleIcons) as unknown[]) {
  const icon = value as Partial<SimpleIcon>;
  if (icon && typeof icon.slug === "string" && typeof icon.path === "string") bySlug.set(icon.slug, icon as SimpleIcon);
}

// A chain link, drawn on the same 24x24 grid.
export const LINK_ICON =
  "M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a1 1 0 1 1 1.4 1.4L12 13.4a1 1 0 0 1-1.4 0ZM8.5 19.5a4.5 4.5 0 0 1-3.2-7.7l2-2a1 1 0 0 1 1.4 1.4l-2 2a2.5 2.5 0 0 0 3.5 3.5l2-2a1 1 0 1 1 1.4 1.4l-2 2a4.5 4.5 0 0 1-3.1 1.4Zm8-5.8a1 1 0 0 1-.7-1.7l2-2a2.5 2.5 0 0 0-3.5-3.5l-2 2a1 1 0 1 1-1.4-1.4l2-2a4.5 4.5 0 0 1 6.3 6.3l-2 2a1 1 0 0 1-.7.3Z";

export function iconPath(slug?: string) {
  return (slug && bySlug.get(slug.toLowerCase())?.path) || LINK_ICON;
}

export function hasBrandIcon(slug: string) {
  return bySlug.has(slug.toLowerCase());
}
