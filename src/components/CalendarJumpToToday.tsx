"use client";

import { useEffect } from "react";

/** Scroll the calendar to today's cell when Events opens (or hash is #cal-today). */
export function CalendarJumpToToday() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash !== "#cal-today") return;
    const el = document.getElementById("cal-today");
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "instant" });
  }, []);
  return null;
}
