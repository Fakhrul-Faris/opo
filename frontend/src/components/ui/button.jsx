import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "../../lib/utils";

const buttonVariants = {
  default: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-glass transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
  outline: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[rgba(255,255,255,0.14)] bg-transparent px-4 py-2 text-sm font-medium text-foreground shadow-none transition-colors hover:bg-[rgba(255,255,255,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
};

export function Button({ asChild = false, variant = "default", className, ...props }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants[variant] ?? buttonVariants.default, className)} {...props} />;
}

