/** Place a right-aligned popover so it stays inside the viewport. */
export function placeRightAlignedPopover(opts: {
  trigger: { bottom: number; right: number };
  menuWidth: number;
  viewportWidth: number;
  viewportHeight: number;
  gap?: number;
  pad?: number;
}): { top: number; left: number; width: number; maxHeight: number } {
  const gap = opts.gap ?? 8;
  const pad = opts.pad ?? 16;
  const width = Math.min(
    opts.menuWidth,
    Math.max(0, opts.viewportWidth - pad * 2),
  );
  const preferredLeft = opts.trigger.right - width;
  const maxLeft = Math.max(pad, opts.viewportWidth - width - pad);
  const left = Math.min(Math.max(pad, preferredLeft), maxLeft);
  const top = opts.trigger.bottom + gap;
  const maxHeight = Math.max(120, opts.viewportHeight - top - pad);
  return { top, left, width, maxHeight };
}
