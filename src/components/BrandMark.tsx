import Link from "next/link";

/**
 * Compact SR.ai mark — short lockup so nav + search fit on a phone.
 */
export function BrandMark() {
  return (
    <Link
      href="/"
      className="group flex flex-none items-center"
      aria-label="setradar.ai home"
    >
      <span className="text-[17px] font-extrabold tracking-tight sm:text-[18px]">
        S<span className="text-brand">R</span>
        <span className="text-[13px] font-semibold text-muted2 sm:text-[14px]">
          .ai
        </span>
      </span>
    </Link>
  );
}
