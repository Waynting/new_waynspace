import { Metadata } from 'next';
import { Container } from '@/components/Container';

export const metadata: Metadata = {
  title: '關於我 - 劉威廷',
  description: '台大資管大二，雙主修創新領域學士學位學程。目前在 ABConvert 實習，專注 A/B testing 產品開發。',
};

export default function AboutPage() {
  return (
    <>
      <Container className="pt-16 pb-10">
        <div className="tracking-[0.2em] uppercase text-xs font-medium text-muted-foreground mb-4">
          劉威廷
        </div>
        <h1 className="text-[40px] sm:text-[48px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground">
          關於我
        </h1>
      </Container>

      <Container className="pb-10">
        <div className="flex items-baseline gap-3 mb-6 pb-3 border-b border-border">
          <span className="text-xs font-light text-muted-foreground/70 tabular-nums">00</span>
          <span className="tracking-[0.18em] uppercase text-xs font-semibold text-muted-foreground">簡介</span>
        </div>
        <div className="max-w-[560px]">
          <p className="text-sm leading-[1.85] text-muted-foreground">
            台大資訊管理學系大二，雙主修創新領域學士學位學程。目前於{' '}
            <a
              href="https://www.abconvert.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground border-b border-foreground/40 hover:border-foreground transition-colors"
            >
              ABConvert
            </a>{' '}
            擔任軟體工程實習生，負責以 Next.js + TypeScript 開發 Shopify A/B testing 產品。致力於銜接商業洞察與技術實作，從原型驗證到產品交付。
          </p>
        </div>

        <div className="flex items-center mt-6 gap-5 flex-wrap text-xs text-muted-foreground">
          <a
            href="https://waynting.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            完整英文履歷 ↗
          </a>
          <span className="text-border" aria-hidden>·</span>
          <a
            href="mailto:wayntingliu@gmail.com"
            className="hover:text-foreground transition-colors"
          >
            wayntingliu@gmail.com
          </a>
        </div>
      </Container>

      <div className="pb-24" />
    </>
  );
}
