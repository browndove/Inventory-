import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "field h-9 px-3 py-2 text-base md:text-sm aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
