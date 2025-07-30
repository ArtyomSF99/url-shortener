"use client";

import { Tooltip as ReactTooltip, ITooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

/**
 * A styled wrapper around the `react-tooltip` library component.
 * This allows for consistent tooltip styling across the application.
 * The Tooltip component itself is rendered once in the root layout.
 */
export function Tooltip(props: ITooltip) {
  return (
    <ReactTooltip
      {...props}
      className="z-50 !bg-gray-800 !text-white !rounded-md !px-2 !py-1 !text-sm shadow-lg"
      noArrow
    />
  );
}
