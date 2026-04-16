import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  secondary: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  outline: "border border-gray-300 text-gray-800 dark:border-gray-700 dark:text-gray-100",
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
