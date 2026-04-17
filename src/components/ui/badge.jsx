import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "bg-blue-300 text-black",
  secondary: "bg-gray-300 text-black",
  success: "bg-green-300 text-black",
  warning: "bg-yellow-300 text-black",
  danger: "bg-red-300 text-black",
  outline: "border border-gray-400 text-black",
};

function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
