import React from "react";
import { Link } from "react-router-dom";

type BaseProps = {
  className?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
};

type AsButton = BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined };
type AsLink = BaseProps & { to: string; href?: undefined };
type AsAnchor = BaseProps & { href: string; to?: undefined };

export default function GlassButton(props: AsButton | AsLink | AsAnchor) {
  const base =
    "inline-flex items-center justify-center rounded-full ring-1 ring-white/20 bg-white/10 dark:bg-white/10 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:bg-white/15 transition-colors text-white";
  const size = props.size || "md";
  const pad = size === "sm" ? "px-4 py-2 text-sm" : size === "lg" ? "px-6 py-3 text-base" : "px-5 py-2.5 text-sm";
  const cls = `${base} ${pad} ${props.className || ""}`;

  if ((props as AsLink).to) {
    const { to, children, className, size: _s, ...rest } = props as AsLink;
    return (
      <Link to={to} className={cls} {...rest as any}>
        {children}
      </Link>
    );
  }
  if ((props as AsAnchor).href) {
    const { href, children, className, size: _s, ...rest } = props as AsAnchor;
    return (
      <a href={href} className={cls} {...rest as any}>
        {children}
      </a>
    );
  }
  const { children, className, size: _s, ...rest } = props as AsButton;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

