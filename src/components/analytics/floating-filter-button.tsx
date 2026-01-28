"use client";

import React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingFilterButtonProps {
  onClick: () => void;
  className?: string;
  activeFiltersCount?: number;
}

export function FloatingFilterButton({
  onClick,
  className,
  activeFiltersCount = 0,
}: FloatingFilterButtonProps) {
  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-40",
        className
      )}
    >
      <Button
        onClick={onClick}
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
        aria-label="Open filters"
      >
        <div className="relative">
          <Filter className="h-6 w-6" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
              {activeFiltersCount}
            </span>
          )}
        </div>
      </Button>
    </div>
  );
}

