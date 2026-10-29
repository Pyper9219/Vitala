"use client";

import * as React from "react";
import {
  Switch as SwitchPrimitive,
  SwitchThumb as SwitchThumbPrimitive,
} from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive
    ref={ref}
    role="switch"
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className,
    )}
    {...props}
  >
    <SwitchThumbPrimitive
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-ring ring-0 transition-all",
        "data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0",
      )}
    />
  </SwitchPrimitive>
));
Switch.displayName = "Switch";

export { Switch };
