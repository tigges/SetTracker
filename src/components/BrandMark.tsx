import Link from "next/link";
import { mediaUrl } from "@/lib/mediaUrl";

/** Transparent SRai lockup (yellow SR, white ai). */
export const BRAND_LOGO_SRC = "/artists/SR_LOGO_TRNSP_PNG.png";

/**
 * Wordmark crop — the asset is a square with the letters in a ~2.7:1 band.
 */
export function BrandLogo({
  className = "h-8 w-[5.5rem] sm:h-9 sm:w-[6.2rem]",
}: {
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- local static PNG; export-safe
    <img
      src={mediaUrl(BRAND_LOGO_SRC)}
      alt="setradar.ai"
      className={`object-cover object-center ${className}`}
    />
  );
}

/** Compact header lockup so nav + search fit on a phone. */
export function BrandMark() {
  return (
    <Link
      href="/"
      className="group flex flex-none items-center"
      aria-label="setradar.ai home"
    >
      <BrandLogo />
    </Link>
  );
}
