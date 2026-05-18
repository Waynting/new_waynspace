import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/Container';

export const metadata: Metadata = {
  title: '請確認你的信箱',
  description: '請到信箱完成訂閱確認。',
  robots: { index: false, follow: false },
};

export default function CheckEmailPage() {
  return (
    <Container className="pt-24 pb-32">
      <div className="tracking-[0.2em] uppercase text-xs font-medium text-muted-foreground mb-4">
        Newsletter — Step 1 of 2
      </div>
      <h1 className="text-[40px] sm:text-[48px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground mb-8">
        請確認你的信箱
      </h1>

      <p className="text-sm leading-[1.85] text-muted-foreground mb-3 max-w-[560px]">
        我剛剛寄了一封確認信到你的信箱。
      </p>
      <p className="text-sm leading-[1.85] text-muted-foreground mb-10 max-w-[560px]">
        請點開那封信、按下確認連結，這樣才算完成訂閱。如果幾分鐘內沒看到，記得也看一下垃圾信匣。
      </p>

      <div className="mb-12 border border-border px-5 py-4 max-w-[560px]">
        <p className="text-xs tracking-[0.18em] uppercase text-muted-foreground/80 mb-2">
          常見問題
        </p>
        <dl className="space-y-3 text-sm leading-[1.7]">
          <div>
            <dt className="text-foreground/90 font-medium">沒收到信？</dt>
            <dd className="text-muted-foreground">
              先看垃圾信匣 / 促銷分頁。Gmail 用戶可以把 <code className="text-foreground/80 bg-muted px-1 py-0.5 text-[12px]">@buttondown.email</code> 加到聯絡人，下次就會直接進收件匣。
            </dd>
          </div>
          <div>
            <dt className="text-foreground/90 font-medium">填錯 email 了？</dt>
            <dd className="text-muted-foreground">
              <Link href="/" className="border-b border-foreground/40 hover:border-foreground text-foreground transition-colors">回首頁</Link>
              重新填一次就好，原本那筆沒確認的會自動失效。
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-border">
        <Link
          href="/blog"
          className="text-sm text-foreground border-b border-foreground/40 hover:border-foreground transition-colors"
        >
          順便看看最近的文章 →
        </Link>
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          回到首頁
        </Link>
      </div>
    </Container>
  );
}
