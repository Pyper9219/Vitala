"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "text-primary underline-offset-4 hover:underline",
        className
      )}
      {...props}
    />
  )
);
Link.displayName = "Link";

export { Link };
