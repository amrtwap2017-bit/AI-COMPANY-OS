export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
export default function WarehousesRedirect() {
  redirect("/inventory/warehouses");
}
