"use client";

import * as React from "react";

type Variant = "default" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  default:
    "bg-emerald-600 text-white hover:bg-emerald-500",
  outline:
    "border border-zinc-700 text-zinc-200 hover:bg-zinc-900/60",
  ghost:
    "text-zinc-300 hover:bg-zinc-900/60",
};

const sizeClass: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  className = "",
  variant = "default",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md transition-colors disabled:opacity-50 disabled:pointer-events-none ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    />
  );
}