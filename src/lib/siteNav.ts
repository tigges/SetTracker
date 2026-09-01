/** Primary header active state. Sets lives at `/sets`; `/` is the landing. */

export function navPath(href: string): string {
  const noHash = href.split("#")[0] ?? href;
  return noHash.split("?")[0] ?? noHash;
}

export function isPrimaryNavActive(pathname: string, href: string): boolean {
  const path = navPath(href);
  if (path === "/sets") {
    return pathname === "/sets" || pathname.startsWith("/sets/");
  }
  if (path === "/events" || path.startsWith("/events/")) {
    return (
      pathname === "/events" ||
      pathname.startsWith("/events/") ||
      pathname === "/venues" ||
      pathname.startsWith("/venues/")
    );
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}
