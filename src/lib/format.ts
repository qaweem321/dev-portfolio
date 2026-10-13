// Dates as people read them ("Mar 2023"), the same on every server and browser: no locale or
// time zone involved.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2023-03" -> "Mar 2023"
export function formatMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

// "2023-03", undefined -> "Mar 2023 – Present"
export function formatPeriod(start: string, end?: string) {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : "Present"}`;
}

// Tags ordered by how many projects use them, then alphabetically: the filter buttons.
export function tagsByUse(projects: readonly { tags: readonly string[] }[]) {
  const counts = new Map<string, number>();
  for (const project of projects) for (const tag of project.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([tag]) => tag);
}
