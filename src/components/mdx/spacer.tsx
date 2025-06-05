import React from "react";

interface SpacerProps {
  size?: "small" | "medium" | "large" | number;
  direction?: "horizontal" | "vertical";
}

export function Spacer({ size = "medium", direction = "horizontal" }: SpacerProps) {
  let className = "";
  const prefix = direction === "horizontal" ? "mx" : "my";
  
  if (typeof size === "string") {
    switch (size) {
      case "small":
        className = `${prefix}-4`;
        break;
      case "medium":
        className = `${prefix}-8`;
        break;
      case "large":
        className = `${prefix}-12`;
        break;
      default:
        className = `${prefix}-8`;
    }
  } else {
    className = `${prefix}-${size}`;
  }

  return <span className={`inline-block ${className}`}></span>;
}
