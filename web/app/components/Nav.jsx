"use client";

import { useRouter } from "next/navigation";

// Nav: Navigation bar with "Back" and "Home" buttons for user navigation.
// "Back" navigates to the previous page in browser history.
// "Home" navigates to the root ("/") of the application.
export default function Nav() {
  const router = useRouter();
  return (
    <nav
      style={{
        padding: 16,
        borderBottom: "2px solid #eee",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* "Back" button: Navigates to the previous page using router.back() */}
      <button
        onClick={() => router.back()}
        style={{
          marginRight: 16,
          fontSize: "1.1rem",
          padding: "8px 18px",
          borderRadius: 6,
          border: "1px solid #ccc",
          background: "#f8f8f8",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>
      {/* "Home" button: Navigates to the root ("/") using router.push("/") */}
      <button
        onClick={() => router.push("/")}
        style={{
          marginRight: 16,
          fontSize: "1.1rem",
          padding: "8px 18px",
          borderRadius: 6,
          border: "1px solid #ccc",
          background: "#f8f8f8",
          cursor: "pointer",
        }}
      >
        Home
      </button>
    </nav>
  );
}
