import { Metadata } from 'next';
import { Container } from '@/components/Container';
import { MastheadStrip } from '@/components/MastheadStrip';
import { SectionDivider } from '@/components/SectionDivider';
import { formatDateLabel } from '@/lib/format';

export const metadata: Metadata = {
  title: '關於我 - 劉威廷',
  description: '台大資管大二，雙主修創新領域學士學位學程。目前在 ABConvert 實習，專注 A/B testing 產品開發。',
};

export default function AboutPage() {
  const dateLabel = formatDateLabel();

  return (
    <>
      <Container className="pt-20 pb-12">
        <MastheadStrip
          primary="SECTION 01 / EDITOR"
          secondary="關於"
          right={`UPDATED ${dateLabel}`}
        />

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between pt-10 gap-4 sm:gap-6">
          <h1 className="font-serif-tc font-bold leading-[0.9] tracking-[-0.05em] text-foreground text-[64px] sm:text-[80px] md:text-[112px] lg:text-[128px]">
            About.
          </h1>
          <div className="flex flex-col items-start sm:items-end gap-1.5 sm:pb-4">
            <span className="font-serif-tc italic text-sm text-foreground/60">— editor&apos;s note</span>
            <span className="font-serif-tc font-bold text-2xl md:text-[28px] tracking-[-0.02em] text-foreground tabular-nums">
              Wei-Ting Liu
            </span>
          </div>
        </div>
      </Container>

      <Container className="mt-12 sm:mt-16">
        <div className="flex items-baseline gap-3.5 mb-6 flex-wrap">
          <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-foreground">¶ EDITOR&apos;S NOTE</span>
          <span className="font-serif-tc italic text-sm text-foreground/60">— 簡介</span>
        </div>
        <div className="max-w-[640px]">
          <p className="font-serif-tc text-[17px] sm:text-[19px] leading-[1.7] text-foreground mb-4">
            台大資訊管理學系大二，雙主修創新領域學士學位學程。目前於{' '}
            <span className="border-b-2 border-foreground font-medium">ABConvert</span>{' '}
            擔任軟體工程實習生，負責以 Next.js + TypeScript 開發 Shopify A/B testing 產品。
          </p>
          <p className="font-serif-tc text-[17px] sm:text-[19px] leading-[1.7] text-foreground/65">
            致力於銜接商業洞察與技術實作，從原型驗證到產品交付。
          </p>
        </div>
      </Container>

      <Container className="mt-20 sm:mt-24 pb-24">
        <SectionDivider
          title="Contact."
          tagline="— say hi"
          right={
            <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-foreground/65 whitespace-nowrap">
              02 LINKS
            </span>
          }
        />

        <div className="flex flex-col max-w-[760px]">
          <a
            href="https://waynting.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="row-link items-start gap-4 sm:gap-7 py-5 border-b border-border"
          >
            <div className="flex flex-col shrink-0 w-10 sm:w-16 pt-1">
              <span className="font-mono text-[11px] tracking-[0.06em] text-foreground/65">№ 01</span>
            </div>
            <div className="flex flex-col flex-1 min-w-0 gap-1.5">
              <h3 className="row-title font-serif-tc font-bold text-[18px] sm:text-[22px] leading-[1.25] tracking-[-0.02em] text-foreground">
                Full English CV
                <span className="row-arrow font-sans text-foreground/60">↗</span>
              </h3>
              <p className="font-sans text-[13px] text-foreground/60 leading-relaxed truncate">
                waynting.github.io
              </p>
            </div>
            <div className="flex flex-col items-end shrink-0 pt-1.5 gap-1">
              <span className="font-mono text-[10px] tracking-[0.12em] text-foreground">EXTERNAL</span>
            </div>
          </a>
          <a
            href="mailto:wayntingliu@gmail.com"
            className="row-link items-start gap-4 sm:gap-7 py-5"
          >
            <div className="flex flex-col shrink-0 w-10 sm:w-16 pt-1">
              <span className="font-mono text-[11px] tracking-[0.06em] text-foreground/65">№ 02</span>
            </div>
            <div className="flex flex-col flex-1 min-w-0 gap-1.5">
              <h3 className="row-title font-serif-tc font-bold text-[18px] sm:text-[22px] leading-[1.25] tracking-[-0.02em] text-foreground break-words">
                wayntingliu@gmail.com
                <span className="row-arrow font-sans text-foreground/60">→</span>
              </h3>
            </div>
            <div className="flex flex-col items-end shrink-0 pt-1.5 gap-1">
              <span className="font-mono text-[10px] tracking-[0.12em] text-foreground">EMAIL</span>
            </div>
          </a>
        </div>
      </Container>
    </>
  );
}
