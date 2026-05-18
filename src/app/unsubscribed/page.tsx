import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/Container';

export const metadata: Metadata = {
  title: '已取消訂閱',
  description: '你已經取消訂閱 Waynspace 電子報。',
  robots: { index: false, follow: false },
};

export default async function UnsubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const isError = Boolean(error);

  return (
    <Container className="pt-24 pb-32">
      <div className="tracking-[0.2em] uppercase text-xs font-medium text-muted-foreground mb-4">
        Newsletter
      </div>
      <h1 className="text-[40px] sm:text-[48px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground mb-8">
        {isError ? '連結無效' : '已取消訂閱'}
      </h1>

      {isError ? (
        <p className="text-sm leading-[1.85] text-muted-foreground mb-10 max-w-[560px]">
          這個取消訂閱連結看起來不對或已過期。如果你不想再收到信，請直接回信告訴我，或把信箱寄到{' '}
          <a
            href="mailto:wayntingliu@gmail.com"
            className="text-foreground border-b border-foreground/40 hover:border-foreground transition-colors"
          >
            wayntingliu@gmail.com
          </a>
          。
        </p>
      ) : (
        <>
          <p className="text-sm leading-[1.85] text-muted-foreground mb-3 max-w-[560px]">
            你已經取消訂閱了，不會再收到我的信。
          </p>
          <p className="text-sm leading-[1.85] text-muted-foreground mb-10 max-w-[560px]">
            如果是手滑取消，回到首頁重新填一次 email 就好。
          </p>
        </>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-border">
        <Link
          href="/"
          className="text-sm text-foreground border-b border-foreground/40 hover:border-foreground transition-colors"
        >
          回到首頁
        </Link>
        <Link
          href="/blog"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          最新文章
        </Link>
      </div>
    </Container>
  );
}
