import { defineConfig } from "astro/config";

// On GitHub Pages the workflow sets SITE (https://you.github.io) and BASE_PATH (/repo-name).
// Locally both are unset and the site runs at the root.
export default defineConfig({
  site: process.env.SITE || undefined,
  base: process.env.BASE_PATH || "/",
  trailingSlash: "ignore",
});
