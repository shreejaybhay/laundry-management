"use client";

import { cn } from "@/lib/utils";

export function WashingMachineLoader({ className }) {
  return (
    <div className={cn("flex items-center justify-center w-full h-full", className)}>
      <div className="loader" />
    </div>
  );
}