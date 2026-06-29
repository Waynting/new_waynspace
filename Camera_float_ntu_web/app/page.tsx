import { Hero } from "@/components/landing/Hero";
import { FolderList } from "@/components/landing/FolderList";

export default function Home() {
  return (
    <div className="space-y-0">
      <Hero />
      <FolderList />
    </div>
  );
}
