import React from "react";
// Sprint-056: Fixed redirect target (was /workspace — Sprint 321 error)
// Canonical: /supply-chain/warehouses
import { redirect } from "next/navigation";
export default function Page(): React.JSX.Element {
  redirect("/supply-chain/warehouses");
}
