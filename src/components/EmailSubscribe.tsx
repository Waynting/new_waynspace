'use client'

import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'

export default function EmailSubscribe() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || '訂閱成功！請檢查你的信箱確認訂閱。' })
        setEmail('')
      } else {
        setMessage({ type: 'error', text: data.error || '訂閱失敗，請稍後再試' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '網路錯誤，請稍後再試' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="輸入你的 email"
          required
          disabled={loading}
          className="flex-1 px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <Button
          type="submit"
          disabled={loading}
          className="whitespace-nowrap"
        >
          {loading ? '訂閱中...' : '訂閱'}
        </Button>
      </form>
      {message && (
        <div
          className={`mt-3 text-sm ${
            message.type === 'success'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}
