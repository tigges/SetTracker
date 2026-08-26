/**
 * Capture queue sizes, kept in their own module so client components can read
 * them. nextCaptures.ts imports node:fs, so importing the constants from there
 * would drag Node built-ins into the browser bundle of a static export.
 */

/** Rows the /stats workbench shows at once. */
export const CAPTURE_QUEUE_LIMIT = 40;

/**
 * Rows built beyond CAPTURE_QUEUE_LIMIT so the UI can keep showing a full 40
 * after an operator parks some. Committed parks in data/capture-defer.json are
 * filtered before the cap and so backfill on their own, but a local "Later"
 * park happens in the browser, long after the page was exported.
 */
export const CAPTURE_QUEUE_RESERVE = 20;
