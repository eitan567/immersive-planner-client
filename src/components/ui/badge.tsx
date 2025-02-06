import * as React from "react"
import { cn } from "../../lib/utils.ts"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function Badge({ className, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-block px-[8px] pb-[2px] rounded-md font-xs text-white bg-[darkmagenta] text-xs mx-1",
        className
      )}
      {...props}
    />
  )
}

export { Badge }