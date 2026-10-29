"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}

const Separator = React.forwardRef<HTMLHRElement, SeparatorProps>(
  ({ className, orientation = "horizontal", decorative = false, ...props }, ref) => {
    return (
      <hr
        ref={ref}
        className={cn(
          "relative w-full shrink-0 border-y",
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
          className,
        )}
        aria-orientation={orientation}
        aria-hidden={decorative}
        {...props}
      />
    );
  },
);
Separator.displayName = "Separator";

export { Separator };
