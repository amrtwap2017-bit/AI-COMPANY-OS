import React from "react";
// Sprint-056: Fixed redirect target (was /workspace — Sprint 321 error)
// Canonical: /supply-chain/purchase-orders
import { redirect } from "next/navigation";
export default function Page(): React.JSX.Element {
  redirect("/supply-chain/purchase-orders");
}
