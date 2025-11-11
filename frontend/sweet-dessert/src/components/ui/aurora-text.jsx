"use client";
import React, { memo } from "react";

export const AuroraText = memo(({
  children,
  className = "",
  speed = 1
}) => {
  const customStyle = speed !== 1 ? {
    animationDuration: `${8 / speed}s`
  } : {};

  return (
    <span className={`aurora-text ${className}`} style={customStyle}>
      {children}
    </span>
  );
});

AuroraText.displayName = "AuroraText";
