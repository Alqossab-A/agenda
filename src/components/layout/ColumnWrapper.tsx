import { FC, ReactNode } from "react";

interface ColumnWrapperProps {
  title: string;
  badge?: number;
  children: ReactNode;
}

export const ColumnWrapper: FC<ColumnWrapperProps> = ({
  title,
  badge,
  children,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      flex: 1,
      minWidth: 0,
      height: "100%",
      borderRight: "1px solid #1f2937",
    }}
  >
    <div
      style={{
        flexShrink: 0,
        padding: "10px 16px",
        borderBottom: "1px solid #1f2937",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 700,
          color: "#6b7280",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </h2>
      {badge !== undefined && badge > 0 && (
        <span
          style={{
            fontSize: 10,
            background: "#374151",
            color: "#9ca3af",
            borderRadius: 10,
            padding: "1px 6px",
          }}
        >
          {badge}
        </span>
      )}
    </div>
    <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
      {children}
    </div>
  </div>
);
