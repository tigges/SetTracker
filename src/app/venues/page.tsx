import { redirect } from "next/navigation";

/** Legacy path — directory lives at /events. */
export default function VenuesIndexRedirect() {
  redirect("/events");
}
