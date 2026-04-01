import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50",
          {
            "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[0_14px_30px_rgba(242,141,79,0.28)] hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] active:translate-y-0":
              variant === "primary",
            "border border-[var(--border-strong)] bg-white/90 text-[var(--foreground)] shadow-[0_8px_18px_rgba(54,72,42,0.08)] hover:-translate-y-0.5 hover:bg-[var(--card)] active:translate-y-0":
              variant === "secondary",
            "text-[var(--muted)] hover:bg-white/70 hover:text-[var(--foreground)]": variant === "ghost",
            "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100": variant === "danger",
            "px-3.5 py-2 text-xs": size === "sm",
            "px-4.5 py-2.5 text-sm": size === "md",
            "px-6 py-3.5 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
