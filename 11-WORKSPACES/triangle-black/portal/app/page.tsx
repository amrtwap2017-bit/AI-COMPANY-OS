// Triangle Black - Root redirect (server-side, no flash)
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/workspace");
}
