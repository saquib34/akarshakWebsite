import React from "react";
import { cn } from "./utils";
import { AlertCircle } from "lucide-react";

const Alert = React.forwardRef(({ className, variant = "default", children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4",
        {
          "bg-white text-slate-950 border-slate-200": variant === "default",
          "bg-red-50 text-red-900 border-red-200": variant === "destructive",
          "bg-yellow-50 text-yellow-900 border-yellow-200": variant === "warning",
          "bg-green-50 text-green-900 border-green-200": variant === "success",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <h5
      ref={ref}
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h5>
  );
});
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    >
      {children}
    </div>
  );
});
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };