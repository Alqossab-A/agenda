import type { BrainDumpItem } from "../../types";

import { FC, useState } from "react";
import { useApp } from "../../context/AppContext";

interface BrainDumpItemProps {
  item: BrainDumpItem;
}

export const BrainDumpItemCard: FC<BrainDumpItemProps> = ({ item }) => {
  const { deleteBrainItem } = useApp();
  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#1f2937",
        border: "1px solid #374151",
        borderRadius: 6,
        padding: "10px 12px",
        marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <span
          style={{ flex: 1, fontSize: 13, color: "#e5e7eb", lineHeight: 1.5 }}
        >
          {item.text}
        </span>
        {hovered && (
          <button
            onClick={() => deleteBrainItem(item.id)}
            style={{
              fontSize: 14,
              color: "#6b7280",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "2px 6px",
              borderRadius: 4,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
