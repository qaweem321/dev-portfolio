// A file in public/ (or a generated one) under the site's base path: "/" locally,
// "/repo-name/" on GitHub Pages. Full URLs (any scheme, or "//host/...") pass through untouched.
export function asset(path: string) {
  if (/^([a-z][a-z\d+.-]*:|\/\/)/i.test(path)) return path;
  return `${import.meta.env.BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
