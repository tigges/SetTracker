/** Primary header active state. Sets lives at `/sets`; `/` is the landing. */

export function isPrimaryNavActive(pathname: string, href: string): boolean {
  if (href === "/sets") {
    return pathname === "/sets" || pathname.startsWith("/sets/");
  }
  if (href === "/events") {
    return (
      pathname === "/events" ||
      pathname.startsWith("/events/") ||
      pathname === "/venues" ||
      pathname.startsWith("/venues/")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
