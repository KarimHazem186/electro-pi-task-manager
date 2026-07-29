"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL, USE_MOCKS } from "@/lib/api/client";

export function DebugInfo() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        right: 10,
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "10px 15px",
        borderRadius: "8px",
        fontSize: "12px",
        zIndex: 9999,
        fontFamily: "monospace",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "5px" }}>🔧 Debug Info</div>
      <div>API URL: {API_BASE_URL}</div>
      <div>Using Mocks: {USE_MOCKS ? "✅ YES" : "❌ NO"}</div>
      <div>
        Backend Status:{" "}
        <span id="backend-status" style={{ color: "#fbbf24" }}>
          Checking...
        </span>
      </div>
    </div>
  );
}

// Check backend status
if (typeof window !== "undefined") {
  fetch("http://localhost:5000/health")
    .then((r) => r.json())
    .then(() => {
      const el = document.getElementById("backend-status");
      if (el) {
        el.textContent = "✅ Online";
        el.style.color = "#10b981";
      }
    })
    .catch(() => {
      const el = document.getElementById("backend-status");
      if (el) {
        el.textContent = "❌ Offline";
        el.style.color = "#ef4444";
      }
    });
}
