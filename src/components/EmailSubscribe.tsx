'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trackNewsletterSubscribe } from '@/lib/analytics';

type Status = 'idle' | 'loading' | 'already' | 'error';

export function EmailSubscribe({ location = 'home' }: { location?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setMessage(data?.error || '訂閱失敗，請稍後再試');
        return;
      }

      if (data.alreadySubscribed) {
        setStatus('already');
        setMessage('這個 Email 已經訂閱過了，謝謝！');
        setEmail('');
        return;
      }

      trackNewsletterSubscribe(location);
      router.push('/subscribe/check-email');
    } catch {
      setStatus('error');
      setMessage('網路連線失敗，請稍後再試');
    }
  }

  const isDisabled = status === 'loading' || status === 'already';

  return (
    <div>
      <p className="text-sm leading-[1.85] text-muted-foreground mb-4 max-w-[560px]">
        偶爾寄信，分享新文章、近況與一些還沒寫成文章的想法。
      </p>
      <form onSubmit={onSubmit} className="flex items-stretch gap-0 max-w-[420px]">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={isDisabled}
          aria-label="Email address"
          className="flex-1 min-w-0 border-b border-border bg-transparent px-1 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isDisabled}
          className="ml-4 border-b border-foreground/40 px-1 py-2 text-sm text-foreground hover:border-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? '送出中…' : status === 'already' ? '已訂閱' : '訂閱 →'}
        </button>
      </form>
      {message && (
        <p
          role="status"
          className={`mt-3 text-xs ${
            status === 'error' ? 'text-foreground/80' : 'text-muted-foreground'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
