// hooks/useBasket_cf.js
"use client";

import { useEffect, useState } from "react";
import { apiBase } from "@/app/lib/apiBase";

export default function useBasket_cf() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      const base = (apiBase() || "/api").replace(/\/+$/, "");
      const url = `${base}/basket_cf`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        let mapped = (data || []).map((r) => ({
          productId: String(r["Product ID"] ?? ""),
          tops: Array.from({ length: 10 }, (_, i) => {
            const v = r[`Top ${i + 1}`];
            return v == null ? "" : String(v);
          }),
        }));

        mapped.sort((a, b) => {
          const na = Number(a.productId);
          const nb = Number(b.productId);
          if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
          return a.productId.localeCompare(b.productId);
        });
        setRows(mapped);
      }
    })();
  }, []);

  return { rows };
}