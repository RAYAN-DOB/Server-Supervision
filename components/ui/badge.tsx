import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300",
  {
    variants: {
      variant: {
        ok: "bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.3)]",
        warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.3)]",
        critical: "bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse",
        maintenance: "bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]",
        info: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.3)]",
        default: "bg-nebula-violet/10 text-nebula-violet border-nebula-violet/30",
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
