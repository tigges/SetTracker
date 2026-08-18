import { redirect } from "next/navigation";

/** Legacy path — dashboard lives at /stats. */
export default function StatsV2Redirect() {
  redirect("/stats");
}
