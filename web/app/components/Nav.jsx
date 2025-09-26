"use client";

import { useRouter } from "next/navigation";

// Navigation bar with "Back" and "Home" buttons
export default function Nav() {
  const router = useRouter();
  const btnStyle = {
    marginRight: 16,
    fontSize: "1.1rem",
    padding: "8px 18px",
    borderRadius: 6,
    border: "1px solid #ccc",
    background: "#f8f8f8",
    cursor: "pointer",
  };

  return (
    <nav
      style={{
        padding: 16,
        borderBottom: "2px solid #eee",
        display: "flex",
        alignItems: "center",
      }}
    >
      <button onClick={router.back} style={btnStyle}>
        ← Back
      </button>
      <button onClick={() => router.push("/")} style={btnStyle}>
        Home
      </button>
    </nav>
  );
}