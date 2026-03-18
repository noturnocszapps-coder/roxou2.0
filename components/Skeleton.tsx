'use client';

import { cn } from "@/lib/utils";

export default function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-shimmer rounded-md bg-white/5", className)} />
  );
}
