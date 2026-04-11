import { Metadata } from 'next';
import { ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: '關於我 - 劉威廷',
  description: '台大資管大二，雙主修創新領域學士學位學程。目前在 ABConvert 實習，專注 A/B testing 產品開發。',
};

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24 space-y-20">

      {/* Page Header */}
      <header>
        <p className="text-xs text-muted-foreground font-medium tracking-[0.2em] uppercase mb-4">
          劉威廷
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          關於我
        </h1>
      </header>

      {/* 00 — 簡介 */}
      <section>
        <div className="flex items-baseline gap-3 mb-8 border-b border-border pb-4">
          <span className="text-muted-foreground text-xs font-light tabular-nums w-5 shrink-0">00</span>
          <h2 className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground">
            簡介
          </h2>
        </div>
        <p className="text-sm leading-7 text-muted-foreground max-w-2xl">
          台大資訊管理學系大二，雙主修創新領域學士學位學程。目前於{' '}
          <span className="text-foreground font-medium">ABConvert</span>{' '}
          擔任軟體工程實習生，負責以 Next.js + TypeScript 開發 Shopify A/B testing 產品。致力於銜接商業洞察與技術實作，從原型驗證到產品交付。
        </p>
        <div className="mt-4">
          <a
            href="https://waynting.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            完整履歷 ↗
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </section>

    </main>
  );
}
