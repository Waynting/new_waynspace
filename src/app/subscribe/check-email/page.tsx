import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/Container';

export const metadata: Metadata = {
  title: '信件已寄出',
  description: '請到信箱完成訂閱確認。',
  robots: { index: false, follow: false },
};

export default function CheckEmailPage() {
  return (
    <Container className="pt-24 pb-32">
      <div className="tracking-[0.2em] uppercase text-xs font-medium text-muted-foreground mb-6">
        Newsletter
      </div>

      <h1 className="text-[40px] sm:text-[48px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground mb-10">
        信件已寄出
      </h1>

      <p className="text-base leading-[1.9] text-foreground/85 mb-5 max-w-[560px]">
        我剛剛寄了一封信到你的信箱。打開它、點一下裡面的確認連結，訂閱就完成了。
      </p>

      <p className="text-sm leading-[1.85] text-muted-foreground mb-16 max-w-[560px]">
        如果幾分鐘內沒看到，記得也看一下垃圾信匣。
      </p>

      <div className="mb-16 max-w-[560px]">
        <p className="tracking-[0.18em] uppercase text-xs font-medium text-muted-foreground/80 mb-5">
          兩個常見狀況
        </p>
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-foreground/90 mb-1.5">
              真的沒收到
            </p>
            <p className="text-sm leading-[1.75] text-muted-foreground">
              除了垃圾信匣，Gmail 用戶可以再看一下「促銷內容」分頁。
              把寄件人{' '}
              <span className="text-foreground/85 border-b border-border">
                hi@mail.waynspace.com
              </span>{' '}
              加進聯絡人，下次就會直接進主收件匣。
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground/90 mb-1.5">
              填錯 email 了
            </p>
            <p className="text-sm leading-[1.75] text-muted-foreground">
              直接{' '}
              <Link
                href="/"
                className="text-foreground border-b border-foreground/40 hover:border-foreground transition-colors"
              >
                回首頁
              </Link>{' '}
              重新填一次就好。原本那筆沒確認的會自然失效，不會干擾你。
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-border max-w-[560px]">
        <Link
          href="/blog"
          className="text-sm text-foreground border-b border-foreground/40 hover:border-foreground transition-colors"
        >
          順便看看最近的文章
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
