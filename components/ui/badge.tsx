import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          "border-transparent bg-[var(--blue)] text-white": variant === "default",
          "border-transparent bg-gray-100 text-navy": variant === "secondary",
          "border-gray-300 text-navy": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
