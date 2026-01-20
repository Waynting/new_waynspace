'use client'

import { useEffect, useState } from 'react'

interface StatsData {
  uniqueVisitors: number | null
  pageViews: number | null
}

/**
 * 格式化數字（添加千分位逗號）
 */
function formatNumber(num: number | null): string {
  if (num === null) return '-'
  return num.toLocaleString('en-US')
}

export default function WebsiteStats() {
  const [visitors, setVisitors] = useState<number | null>(null)
  const [pageViews, setPageViews] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }
        const data = await response.json()
        console.log('[WebsiteStats] 獲取到的數據:', data)
        setVisitors(data.uniqueVisitors)
        setPageViews(data.pageViews)
      } catch (err) {
        console.error('[WebsiteStats] 獲取統計數據錯誤:', err)
        setVisitors(null)
        setPageViews(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // 如果還在載入中，顯示載入狀態
  if (loading) {
    return (
      <>
        <span className="hidden sm:inline">•</span>
        <span className="text-muted-foreground">載入中...</span>
      </>
    )
  }

  // 如果沒有任何數據，不顯示
  if (visitors === null && pageViews === null) {
    return null
  }

  return (
    <>
      {visitors !== null && (
        <>
          <span className="hidden sm:inline">•</span>
          <span>{formatNumber(visitors)} 訪客</span>
        </>
      )}
      {pageViews !== null && (
        <>
          <span className="hidden sm:inline">•</span>
          <span>{formatNumber(pageViews)} 瀏覽</span>
        </>
      )}
    </>
  )
}
