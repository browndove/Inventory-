import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field min-h-20 px-3 py-2 text-base md:text-sm aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
