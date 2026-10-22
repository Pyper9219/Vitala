"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetPrimitive.DialogContentProps
>(({ className, children, side = "right", ...props }, ref) => (
  <SheetPrimitive.Portal>
    <SheetPrimitive.Overlay
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 grid w-full max-w-lg translate-y-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=closed]:ease-out data-[state=open]:duration-200 data-[state=open]:ease-in data-[state=open]:sm:slide-in-from-right-0 data-[state=closed]:sm:slide-in-to-right-0 data-[state=closed]:sm:translate-y-0 sm:rounded-none sm:border",
        side === "right"
          ? "right-0 top-0 bottom-0 h-full data-[state=open]:slide-in-from-right-0"
          : "left-0 top-0 bottom-0 h-full data-[state=open]:slide-in-from-left-0",
        className
      )}
      {...props}
    >
      {children}
    </SheetPrimitive.Content>
  </SheetPrimitive.Portal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Header>,
  SheetPrimitive.DialogHeaderProps
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Header
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
SheetHeader.displayName = SheetPrimitive.Header.displayName;

const SheetFooter = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Footer>,
  SheetPrimitive.DialogFooterProps
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Footer
    ref={ref}
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2 p-6 border-t",
      className
    )}
    {...props}
  />
));
SheetFooter.displayName = SheetPrimitive.Footer.displayName;

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  SheetPrimitive.DialogTitleProps
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  SheetPrimitive.DialogDescriptionProps
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
