"use client";

import { Button } from "@/components/ui/button";
import { LayoutGrid, Grid3x3, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type LayoutType = "masonry" | "staggered" | "carousel";

interface LayoutSelectorProps {
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  className?: string;
}

const layouts: { type: LayoutType; label: string; icon: React.ReactNode }[] = [
  {
    type: "masonry",
    label: "瀑布流",
    icon: <LayoutGrid className="h-4 w-4" />,
  },
  {
    type: "staggered",
    label: "错位网格",
    icon: <Grid3x3 className="h-4 w-4" />,
  },
  {
    type: "carousel",
    label: "轮播",
    icon: <ImageIcon className="h-4 w-4" />,
  },
];

export function LayoutSelector({ currentLayout, onLayoutChange, className }: LayoutSelectorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {layouts.map((layout) => (
        <Button
          key={layout.type}
          variant={currentLayout === layout.type ? "default" : "outline"}
          size="sm"
          onClick={() => onLayoutChange(layout.type)}
          className="flex items-center gap-2"
          title={layout.label}
        >
          {layout.icon}
          <span className="hidden sm:inline">{layout.label}</span>
        </Button>
      ))}
    </div>
  );
}

