import { cn } from "@/lib/utils";

interface CooperLogoProps {
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
  compact?: boolean;
}

export function CooperLogo({
  className,
  iconClassName,
  labelClassName,
  compact = false,
}: CooperLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        className={cn("h-11 w-11 drop-shadow-[0_8px_18px_rgba(79,145,70,0.22)]", iconClassName)}
      >
        <defs>
          <linearGradient id="cooper-shell" x1="8" y1="10" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#93dc65" />
            <stop offset="1" stopColor="#4b8f3c" />
          </linearGradient>
          <linearGradient id="cooper-pea-left" x1="18" y1="22" x2="32" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#dff8a4" />
            <stop offset="1" stopColor="#8ecf53" />
          </linearGradient>
          <linearGradient id="cooper-pea-right" x1="30" y1="18" x2="48" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#eefab8" />
            <stop offset="1" stopColor="#9fd462" />
          </linearGradient>
        </defs>
        <path
          d="M13 38c0-11.5 9.5-21 21.2-21 8.1 0 15.1 4.7 18.5 11.4 2.3 4.4 1 9.8-3.1 12.8-7.6 5.4-16.8 8.3-28.1 8.8-4.8.2-8.5-3.7-8.5-8Z"
          fill="url(#cooper-shell)"
        />
        <path
          d="M18 26.6c3.5-8.9 10.3-14.1 20.5-15.6 1-.2 1.9.7 1.7 1.7-1.8 8.6-6.6 14.1-14.2 16.7-4 1.4-8.3.9-8-2.8Z"
          fill="#59a049"
        />
        <circle cx="24.5" cy="36.5" r="9.5" fill="url(#cooper-pea-left)" />
        <circle cx="39.5" cy="32.5" r="10.5" fill="url(#cooper-pea-right)" />
        <circle cx="21.5" cy="34" r="1.6" fill="#23411d" />
        <circle cx="28.2" cy="34" r="1.6" fill="#23411d" />
        <path d="M20.8 38.1c1.8 2 5.1 2.1 7.1.1" stroke="#23411d" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M47.5 29.2c1.8 0 3.1-1.2 3.1-3" stroke="#23411d" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M45.1 33.3c2.6 0 4.7 1.8 5.1 4.3" stroke="#23411d" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="26.9" cy="32.6" r="0.9" fill="#fffdf3" />
        <circle cx="42.5" cy="28.8" r="1" fill="#fffdf3" />
        <path d="M10.5 43c1.8 2.9 5.2 4.8 9 4.9" stroke="#f28d4f" strokeWidth="4" strokeLinecap="round" />
      </svg>
      {!compact && (
        <div className={cn("leading-none", labelClassName)}>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-[var(--accent-strong)]">
            Agent Market
          </p>
          <p className="text-2xl font-black tracking-[-0.06em] text-[var(--foreground)]">Cooper</p>
        </div>
      )}
    </div>
  );
}
