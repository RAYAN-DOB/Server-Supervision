import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors duration-200",
  {
    variants: {
      variant: {
        ok: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
        warning: "bg-amber-500/10 text-amber-300 border-amber-500/30",
        critical: "bg-red-500/10 text-red-300 border-red-500/30",
        maintenance: "bg-blue-500/10 text-blue-300 border-blue-500/30",
        info: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
        default: "bg-slate-800 text-slate-300 border-slate-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean;
}

function Badge({ className, variant, pulse, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), pulse && "animate-pulse-slow", className)} {...props}>
      {variant && variant !== "default" && (
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            variant === "ok" && "bg-green-500",
            variant === "warning" && "bg-yellow-500",
            variant === "critical" && "bg-red-500",
            variant === "maintenance" && "bg-blue-500",
            variant === "info" && "bg-cyan-500"
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
