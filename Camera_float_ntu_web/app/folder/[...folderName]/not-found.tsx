import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <h2 className="text-2xl font-semibold">找不到資料夾</h2>
      <p className="text-muted-foreground">此資料夾不存在或無法訪問</p>
      <Link href="/">
        <Button>返回首頁</Button>
      </Link>
    </div>
  );
}

