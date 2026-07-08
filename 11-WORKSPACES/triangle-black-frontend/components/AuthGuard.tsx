"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("tb_token");
    if (!token) {
      router.push("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", color: "#64748b" }}>Loading...</div>
  );
  return <>{children}</>;
}
