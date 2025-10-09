"use client";

import { TREEMAP, TEXT, COLORS } from "@/app/theme";
import { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

export default function PdpPreviewLink({ id, children }) {
  const href = `https://www.ashild.se/produkt/gidn/${encodeURIComponent(id)}`;
  const [open, setOpen] = useState(false);
  const [img, setImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 320 });
  const ref = useRef(null);
  const t = useRef();

  useLayoutEffect(() => {
    if (!open || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const width = 320;
    const top = r.bottom + window.scrollY + 6;
    let left = r.left + window.scrollX;
    const right = window.scrollX + document.documentElement.clientWidth - 8;
    if (left + width > right) left = Math.max(8, right - width);
    setPos({ top, left, width });
  }, [open]);

  const show = () => {
    clearTimeout(t.current);
    t.current = setTimeout(async () => {
      setOpen(true);
      if (img || loading) return;
      setLoading(true);
      const res = await fetch(`/pdp-preview/${encodeURIComponent(id)}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      setImg(data?.imageUrl || null);
      setLoading(false);
    }, 120);
  };

  const hide = () => {
    clearTimeout(t.current);
    t.current = setTimeout(() => setOpen(false), 120);
  };

  const popup = open
    ? createPortal(
        <div
          style={{
            position: "absolute",
            top: pos.top,
            left: pos.left,
            width: pos.width,
            background: "#fff",
            border: `1px solid ${TREEMAP.containerBorder}`,
            borderRadius: 8,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            padding: 8,
            zIndex: 9999,
          }}
          onMouseEnter={() => { clearTimeout(t.current); setOpen(true); }}
          onMouseLeave={hide}
        >
          {loading ? (
            <div style={{ fontFamily: TEXT.family, fontSize: 12, opacity: 0.7 }}>Loading…</div>
          ) : img ? (
            <a href={href} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
              <img
                src={img}
                alt=""
                style={{ width: "100%", height: 200, objectFit: "contain", display: "block" }}
                loading="lazy"
              />
            </a>
          ) : null}
        </div>,
        document.body
      )
    : null;

  return (
    <span
      ref={ref}
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: COLORS.link || "#2563eb", textDecoration: "none" }}
      >
        {children}
      </a>
      {popup}
    </span>
  );
}