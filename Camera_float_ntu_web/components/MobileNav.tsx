"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">開啟選單</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>選單</DialogTitle>
          </DialogHeader>
          <nav className="flex flex-col gap-4 mt-4">
            <Link
              href="https://www.waynspace.com/"
              onClick={() => setOpen(false)}
              className="text-base font-medium hover:text-primary transition-colors py-2 border-b"
            >
              回到主網站首頁
            </Link>
            <Link
              href="/about"
              onClick={() => setOpen(false)}
              className="text-base font-medium hover:text-primary transition-colors py-2 border-b"
            >
              關於計劃
            </Link>
          </nav>
        </DialogContent>
      </Dialog>
    </>
  );
}

