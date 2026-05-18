import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/Container';

export const metadata: Metadata = {
  title: '訂閱已完成',
  description: '歡迎加入 Waynspace 電子報。',
  robots: { index: false, follow: false },
};

export default function SubscribedPage() {
  return (
    <Container className="pt-24 pb-32">
      <div className="tracking-[0.2em] uppercase text-xs font-medium text-muted-foreground mb-4">
        Newsletter — Step 2 of 2
      </div>
      <h1 className="text-[40px] sm:text-[48px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground mb-8">
        歡迎加入。
      </h1>
      <p className="text-sm leading-[1.85] text-muted-foreground mb-3 max-w-[560px]">
        你的訂閱已經完成。謝謝你願意把信箱借我一塊小角落。
      </p>
      <p className="text-sm leading-[1.85] text-muted-foreground mb-12 max-w-[560px]">
        我會偶爾寄信，分享新文章、近況，以及一些還沒寫成文章的想法。不會每週寄、也不會塞行銷內容——有寫完、值得寄的，才會出現在你的信箱。如果哪天不想再收信，每封信底部都有一鍵取消訂閱的連結。
      </p>

      <div className="mb-12">
        <p className="text-xs tracking-[0.18em] uppercase text-muted-foreground/80 mb-4">
          先逛逛
        </p>
        <ul className="space-y-3 text-sm">
          <li>
            <Link
              href="/blog"
              className="text-foreground hover:text-foreground border-b border-border hover:border-foreground transition-colors"
            >
              最新文章
            </Link>
            <span className="text-muted-foreground"> — 所有寫過的東西</span>
          </li>
          <li>
            <Link
              href="/about"
              className="text-foreground hover:text-foreground border-b border-border hover:border-foreground transition-colors"
            >
              關於我
            </Link>
            <span className="text-muted-foreground"> — 我是誰、在做什麼</span>
          </li>
          <li>
            <Link
              href="/photos"
              className="text-foreground hover:text-foreground border-b border-border hover:border-foreground transition-colors"
            >
              照片
            </Link>
            <span className="text-muted-foreground"> — 街拍與旅途</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-border">
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
