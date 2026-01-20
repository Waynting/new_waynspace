'use client'

import { useEffect, useState } from 'react'

interface StatsData {
  uniqueVisitors: number | null
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }
        const data = await response.json()
        setVisitors(data.uniqueVisitors)
      } catch (err) {
        console.error('Error fetching stats:', err)
        setVisitors(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // 如果載入中或沒有訪客數據，不顯示
  if (loading || visitors === null) {
    return null
  }

  return (
    <>
      <span className="hidden sm:inline">•</span>
      <span>{formatNumber(visitors)} 訪客</span>
    </>
  )
}
