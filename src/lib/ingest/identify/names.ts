/** Shared name matching for catalog identify. */

export function normName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function namesClose(a: string, b: string): boolean {
  const na = normName(a);
  const nb = normName(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

export function primaryArtist(artist: string): string {
  return artist.split(/[,&]| b2b | x | ft\.? | feat\.?/i)[0]!.trim();
}

/** Prefer exact studio titles over remix/bootleg hits. */
export function titleRank(want: string, got: string): number {
  const a = normName(want);
  const b = normName(got);
  if (!a || !b) return 0;
  if (a === b) return 3;
  if (b.startsWith(`${a} feat`) || b.startsWith(`${a} ft`)) return 2;
  const extra = b.replace(a, "").trim();
  if (namesClose(want, got) && !/\b(remix|bootleg|edit|cover|vip|mix)\b/.test(extra)) {
    return 1;
  }
  return 0;
}
