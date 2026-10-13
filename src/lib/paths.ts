// A file in public/ (or a generated one) under the site's base path: "/" locally,
// "/repo-name/" on GitHub Pages. Full URLs pass through untouched.
export function asset(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${import.meta.env.BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
