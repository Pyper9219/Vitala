"use client";
import * as React from "react";
import NextLink from "next/link";
import { cn } from "@/lib/utils";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> { href: string; }

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(({ className, href, ...props }, ref) => (
  <NextLink ref={ref} href={href} className={cn("text-emerald-600 underline-offset-4 hover:underline transition-colors", className)} {...props} />
));
Link.displayName = "Link";
export { Link };
