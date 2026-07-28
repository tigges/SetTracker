import { redirect } from "next/navigation";

/** Labels directory lives at the bottom of Venues. */
export default function LabelsIndexRedirect() {
  redirect("/venues#labels");
}
