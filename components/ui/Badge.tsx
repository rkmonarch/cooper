import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const categoryColors: Record<string, string> = {
  "ai-image": "border-lime-200 bg-lime-100/80 text-lime-900",
  research: "border-sky-200 bg-sky-100/80 text-sky-900",
  prompt: "border-orange-200 bg-orange-100/80 text-orange-900",
  dataset: "border-emerald-200 bg-emerald-100/80 text-emerald-900",
  other: "border-stone-200 bg-stone-100/80 text-stone-700",
};

const categoryLabels: Record<string, string> = {
  "ai-image": "AI Image",
  research: "Research",
  prompt: "Prompt",
  dataset: "Dataset",
  other: "Other",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  category?: string;
  variant?: "default" | "outline";
}

export function Badge({ category, variant = "outline", className, children, ...props }: BadgeProps) {
  const colorClass = category
    ? categoryColors[category] ?? categoryColors.other
    : "border-stone-200 bg-stone-100/80 text-stone-700";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.14em]",
        colorClass,
        className
      )}
      {...props}
    >
      {category ? (categoryLabels[category] ?? category) : children}
    </span>
  );
}
