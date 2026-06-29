"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiPath } from "@/lib/utils";

export function FolderList() {
  const [folders, setFolders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch(getApiPath("/api/folders"));
        if (response.ok) {
          const data = await response.json();
          setFolders(data.folders || []);
        } else {
          const errorData = await response.json();
          console.error("API error:", errorData);
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
      <section className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-0">
        <div className="border-b border-border py-3 mb-0">
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
            01 / Folders
          </span>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-b border-border/50 py-5">
            <Skeleton className="h-5 w-32" />
          </div>
        ))}
      </section>
    );
  }

  if (folders.length === 0) {
    return (
      <section className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-0">
        <div className="border-b border-border py-3 mb-0">
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
            01 / Folders
          </span>
        </div>
        <p className="py-10 text-sm text-muted-foreground">目前沒有可用的資料夾</p>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-0">
      {/* Section label */}
      <div className="border-b border-border py-3 mb-0">
        <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
          01 / Folders
        </span>
      </div>

      {/* Folder list */}
      {folders.map((folder, index) => (
        <button
          key={folder}
          onClick={() => router.push(`/folder/${folder}`)}
          className="w-full border-b border-border/50 py-5 flex items-baseline justify-between group text-left hover:opacity-60 transition-opacity"
        >
          <div className="flex items-baseline gap-6">
            <span className="text-xs text-muted-foreground tabular-nums w-5">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-base font-medium">{folder}</span>
          </div>
          <span className="text-xs text-muted-foreground group-hover:opacity-100">→</span>
        </button>
      ))}
    </section>
  );
}
