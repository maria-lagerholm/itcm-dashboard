"use client";

import React from "react";
import { TOOLTIP } from "../../../theme";

type Props = {
  active?: boolean;
  payload?: Array<{ payload?: any }>;
  mode?: "customers" | "revenue";
};

export default function CityTooltip({ active, payload, mode = "customers" }: Props) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload ?? {};

  return (
    <div style={TOOLTIP.base}>
      <div><strong>{p.city ?? ""}</strong></div>
      {mode === "revenue" ? (
        <>
          <div>Revenue: {p?.ksek ?? 0} KSEK</div>
          {p?.avg_order_value_sek != null && <div>Average order value: {p.avg_order_value_sek} SEK</div>}
          {p?.month && <div>Month: {p.month}</div>}
        </>
      ) : (
        <div>Customers: {p?.unique_customers ?? 0}</div>
      )}
    </div>
  );
}
