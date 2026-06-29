"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Folder, ChevronDown } from "lucide-react";
import { getApiPath } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface FolderSelectorProps {
  selectedFolder: string | null;
  onFolderChange: (folder: string | null) => void;
  className?: string;
}

export function FolderSelector({ selectedFolder, onFolderChange, className }: FolderSelectorProps) {
  const [folders, setFolders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch(getApiPath("/api/folders"));
        if (response.ok) {
          const data = await response.json();
          setFolders(data.folders || []);
        } else {
          console.error("API error:", await response.json());
        }
      } catch (error) {
        console.error("Error fetching folders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFolders();
  }, []);

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <div className={cn("text-center py-4 text-muted-foreground text-sm", className)}>
        目前沒有可用的資料夾
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Mobile: Dropdown */}
      <div className="md:hidden">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            {selectedFolder || "選擇資料夾"}
          </span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </Button>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            <button
              onClick={() => {
                onFolderChange(null);
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left px-4 py-2 hover:bg-accent transition-colors",
                !selectedFolder && "bg-accent"
              )}
            >
              全部照片
            </button>
            {folders.map((folder) => (
              <button
                key={folder}
                onClick={() => {
                  onFolderChange(folder);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-2 hover:bg-accent transition-colors flex items-center gap-2",
                  selectedFolder === folder && "bg-accent"
                )}
              >
                <Folder className="h-4 w-4" />
                {folder}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: Sidebar */}
      <div className="hidden md:block space-y-2">
        <h3 className="text-sm font-semibold mb-3 px-2">資料夾</h3>
        <button
          onClick={() => onFolderChange(null)}
          className={cn(
            "w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm",
            !selectedFolder && "bg-accent font-medium"
          )}
        >
          全部照片
        </button>
        {folders.map((folder) => (
          <button
            key={folder}
            onClick={() => onFolderChange(folder)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm flex items-center gap-2",
              selectedFolder === folder && "bg-accent font-medium"
            )}
          >
            <Folder className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{folder}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

