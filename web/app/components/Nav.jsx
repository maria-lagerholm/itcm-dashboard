"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

// Nav: Simple navigation bar with a back button and a Home link.
// If debugging, check that router.back() correctly navigates to the previous page.
// Also verify that the Home link routes to the root ("/") as expected.
export default function Nav() {
  const router = useRouter();
  return (
    <nav style={{ padding: 12, borderBottom: "1px solid #eee" }}>
      {/* Back button: Navigates to previous page in history.
          If debugging, ensure router.back() works as expected in your navigation context. */}
      <button onClick={() => router.back()} style={{ marginRight: 12 }}>
        ← Back
      </button>
      {/* Home link: Navigates to the main page ("/").
          If debugging, ensure this link renders and routes correctly. */}
      <Link href="/" style={{ marginRight: 12 }}>Home</Link>
    </nav>
  );
}
