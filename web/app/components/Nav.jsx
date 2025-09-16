"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Nav() {
  const router = useRouter();
  return (
    <nav style={{ padding: 12, borderBottom: "1px solid #eee" }}>
      <button onClick={() => router.back()} style={{ marginRight: 12 }}>
        ← Back
      </button>
      <Link href="/" style={{ marginRight: 12 }}>Home</Link>
    </nav>
  );
}
