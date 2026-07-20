"use client";
// @ts-nocheck
// Triangle Black - Tooltip Component
// UI-026: Accessible hover + focus tooltip
import { ReactNode, useState } from "react";

interface TooltipProps {
  content:    ReactNode;
  children:   ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  delay?:     number;
}

const PLACEMENT: Record<string, string> = {
  top:    "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left:   "right-full top-1/2 -translate-y-1/2 mr-2",
  right:  "left-full top-1/2 -translate-y-1/2 ml-2",
};

export function Tooltip({ content, children, placement = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && content && (
        <div
          role="tooltip"
          className={"absolute z-[70] px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-lg whitespace-nowrap pointer-events-none " + PLACEMENT[placement]}
        >
          {content}
        </div>
      )}
    </div>
  );
}
