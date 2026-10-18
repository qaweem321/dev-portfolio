import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";

// The tests build the site from a fixed sample config (PORTFOLIO_CONFIG=tests/fixtures/...), so
// they keep passing after you replace the demo with yourself. Unset, src/config.ts is used.
function useConfigFile(file) {
  const real = fileURLToPath(new URL("./src/config.ts", import.meta.url)).replaceAll("\\", "/");
  const replacement = resolve(file).replaceAll("\\", "/");
  return {
    name: "portfolio-config",
    enforce: "pre",
    async resolveId(source, importer, options) {
      // Any import that could be src/config.ts ("../config", "./config.ts", "/src/config"...).
      if (!importer || !/(^|\/)config(\.[cm]?[jt]s)?$/.test(source)) return null;
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      return resolved?.id === real ? replacement : null;
    },
  };
}

// On GitHub Pages the workflow sets SITE (https://you.github.io) and BASE_PATH (/repo-name).
// Locally both are unset and the site runs at the root.
export default defineConfig({
  site: process.env.SITE || undefined,
  base: process.env.BASE_PATH || "/",
  trailingSlash: "ignore",
  vite: { plugins: process.env.PORTFOLIO_CONFIG ? [useConfigFile(process.env.PORTFOLIO_CONFIG)] : [] },
});
