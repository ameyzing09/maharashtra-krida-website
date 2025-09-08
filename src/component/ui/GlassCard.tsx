import React from "react";

type GlassCardProps = React.PropsWithChildren<{
  className?: string;
}>;

export default function GlassCard({ className = "", children }: GlassCardProps) {
  return (
    <div
      className={[
        "rounded-2xl border",
        "bg-white/10 dark:bg-white/5",
        "border-black/10 dark:border-white/10",
        "backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

