import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "quiet";
  size?: "default" | "icon";
};

export function Button({ className, variant = "primary", size = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "outline" && "border border-border bg-transparent text-foreground hover:bg-secondary",
        variant === "quiet" && "bg-transparent text-muted-foreground hover:text-foreground",
        size === "default" && "h-10 rounded-md px-4 text-sm",
        size === "icon" && "size-10 rounded-full",
        className,
      )}
      {...props}
    />
  );
}