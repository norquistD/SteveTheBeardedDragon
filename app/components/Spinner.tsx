"use client";

import "./Spinner.css";

interface SpinnerProps {
  size?: "small" | "medium" | "large";
  color?: string;
}

export default function Spinner({ size = "medium", color }: SpinnerProps) {
  const sizeClass = `spinner-${size}`;
  const style = color ? { borderTopColor: color } : undefined;

  return (
    <div className={`spinner ${sizeClass}`} style={style} aria-label="Loading">
      <div className="spinner-inner"></div>
    </div>
  );
}

