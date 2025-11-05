'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'

interface NewsletterProps {
  className?: string
  variant?: 'default' | 'compact'
}

export function Newsletter({ className = '', variant = 'default' }: NewsletterProps) {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    window.open('https://buttondown.com/wayntingliu', 'popupwindow')
  }

  if (variant === 'compact') {
    return (
      <div className={`border-t border-border pt-8 mt-12 ${className}`}>
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-semibold text-foreground">訂閱新文章通知</h3>
                  <p className="text-sm text-muted-foreground">第一時間收到最新內容</p>
                </div>
              </div>
              <form
                action="https://buttondown.com/api/emails/embed-subscribe/wayntingliu"
                method="post"
                target="popupwindow"
                onSubmit={handleSubmit}
                className="flex gap-2 w-full sm:w-auto"
              >
                <input
                  type="email"
                  name="email"
                  id="bd-email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 sm:w-64 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
                <Button type="submit" className="whitespace-nowrap">
                  訂閱
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card className={`bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 ${className}`}>
      <CardContent className="p-8 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-2">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">
            訂閱新文章通知
          </h3>
          <p className="text-muted-foreground">
            想第一時間收到最新文章？訂閱電子報，不錯過每一篇精彩內容
          </p>
          <form
            action="https://buttondown.com/api/emails/embed-subscribe/wayntingliu"
            method="post"
            target="popupwindow"
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 mt-6"
          >
            <input
              type="email"
              name="email"
              id="bd-email-default"
              placeholder="輸入您的電子郵件"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button type="submit" size="lg" className="sm:w-auto">
              訂閱通知
            </Button>
          </form>
          <p className="text-xs text-muted-foreground">
            <a
              href="https://buttondown.com/refer/wayntingliu"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Powered by Buttondown
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
