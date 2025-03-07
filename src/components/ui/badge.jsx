import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary/15 text-primary border-primary/20",
        secondary:
          "bg-secondary/15 text-secondary border-secondary/20",
        destructive:
          "bg-destructive/15 text-destructive border-destructive/20",
        success:
          "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/20",
        warning:
          "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/20",
        danger:
          "bg-[#f43f5e]/15 text-[#f43f5e] border-[#f43f5e]/20",
        outline: 
          "border-border bg-background/50 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
