'use client'

import { useEffect, useState } from 'react'

interface StatsData {
  articleCount: number
  uniqueVisitors: number | null
  pageViews: number | null
  lastUpdate: string | null
}

/**
 * 格式化時間差（例如：5 months ago）
 */
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 1) {
    return '今天'
  } else if (diffDays < 7) {
    return `${diffDays} 天前`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} 週前`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} 個月前`
  } else {
    const years = Math.floor(diffDays / 365)
    return `${years} 年前`
  }
}

/**
 * 格式化數字（添加千分位逗號）
 */
function formatNumber(num: number | null): string {
  if (num === null) return '-'
  return num.toLocaleString('en-US')
}

export default function WebsiteStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error('Error fetching stats:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-sm sm:text-base text-muted-foreground">
        <span>載入中...</span>
      </div>
    )
  }

  if (error || !stats) {
    // 如果載入失敗，至少顯示文章數量（從 props 傳入或直接計算）
    return null
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Website Info</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground mb-1">Article Count</div>
            <div className="text-foreground font-semibold">{stats.articleCount}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Unique Visitors</div>
            <div className="text-foreground font-semibold">
              {stats.uniqueVisitors !== null ? formatNumber(stats.uniqueVisitors) : '-'}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Page Views</div>
            <div className="text-foreground font-semibold">
              {stats.pageViews !== null ? formatNumber(stats.pageViews) : '-'}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Last Update</div>
            <div className="text-foreground font-semibold">
              {stats.lastUpdate ? formatTimeAgo(stats.lastUpdate) : '-'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
