/** Operator 1001 workbench on the stats dashboard (legacy /capture-1001). */
export function capture1001StatsHref(query?: string): string {
  const q = query?.trim();
  return q
    ? `/stats?q=${encodeURIComponent(q)}#capture-1001`
    : "/stats#capture-1001";
}
