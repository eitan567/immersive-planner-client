import * as React from "react"
import { cn } from "../../lib/utils.ts"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function Badge({ className, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-block rounded-md text-white bg-[chocolate] px-1 text-[10px] leading-[14px] rounded",
        className
      )}
      {...props}
    />
  )
}

export { Badge }