import Link from "next/link";

export function Hero() {
  return (
    <section className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-0">
      {/* Section label */}
      <div className="border-b border-border pb-3 mb-10">
        <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
          00 / Index
        </span>
      </div>

      {/* Title */}
      <h1 className="text-[40px] sm:text-[48px] font-bold leading-[1.05] tracking-[-0.025em] mb-8">
        相機漂流計劃
        <br />
        <span className="font-light text-muted-foreground">台大 Ver.</span>
      </h1>

      {/* Description */}
      <div className="space-y-4 text-sm leading-[1.85] text-muted-foreground border-b border-border pb-10">
        <p>相機漂流計劃是一個創新的相機共享計劃，旨在讓相機在校園中流傳，記錄下每個瞬間的美好。</p>
        <p>我們相信每一張照片都承載著獨特的視角和故事。透過相機的流傳，捕捉校園生活的多元面貌。</p>
        <div className="pt-4">
          <Link href="/about" className="text-xs tracking-[0.15em] uppercase hover:opacity-60 transition-opacity">
            了解更多 →
          </Link>
        </div>
      </div>
    </section>
  );
}
