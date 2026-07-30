import { redirect } from "next/navigation";

/** Labels directory lives at the bottom of Events. */
export default function LabelsIndexRedirect() {
  redirect("/events#labels");
}
