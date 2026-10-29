import * as React from "react";
import { cn } from "@/lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
  className?: string;
}
function Alert({ variant = "default", className, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border p-4",
        variant === "destructive"
          ? "border-destructive/50 bg-destructive text-destructive-foreground"
          : "border-primary/50 bg-primary text-primary-foreground",
        className,
      )}
      {...props}
    />
  );
}
Alert.displayName = "Alert";

interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
}
function AlertTitle({ className, ...props }: AlertTitleProps) {
  return (
    <h3 className={cn("mb-1 font-semibold leading-none tracking-tight", className)} {...props} />
  );
}
AlertTitle.displayName = "AlertTitle";

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}
function AlertDescription({ className, ...props }: AlertDescriptionProps) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
