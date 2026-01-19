import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { getAllPosts } from '@/lib/posts'
import { BetaAnalyticsDataClient } from '@google-analytics/data'

// 緩存時間：1 小時（3600 秒）
const CACHE_DURATION = 3600

interface StatsData {
  articleCount: number
  uniqueVisitors: number | null
  pageViews: number | null
  lastUpdate: string | null
}

/**
 * 從 Google Analytics 獲取統計數據
 */
async function fetchAnalyticsData(): Promise<{
  uniqueVisitors: number | null
  pageViews: number | null
}> {
  const propertyId = process.env.GA4_PROPERTY_ID
  const serviceAccountEmail = process.env.GA_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GA_PRIVATE_KEY

  // 如果沒有設定 GA 憑證，返回 null
  if (!propertyId || !serviceAccountEmail || !privateKey) {
    return {
      uniqueVisitors: null,
      pageViews: null,
    }
  }

  try {
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
    })

    // 獲取獨立訪客數（過去30天）
    const [usersResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }],
    })

    // 獲取頁面瀏覽數（過去30天）
    const [pageViewsResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [{ name: 'screenPageViews' }],
    })

    const uniqueVisitors =
      usersResponse.rows?.[0]?.metricValues?.[0]?.value
        ? parseInt(usersResponse.rows[0].metricValues[0].value || '0', 10)
        : null

    const pageViews =
      pageViewsResponse.rows?.[0]?.metricValues?.[0]?.value
        ? parseInt(pageViewsResponse.rows[0].metricValues[0].value || '0', 10)
        : null

    return {
      uniqueVisitors,
      pageViews,
    }
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return {
      uniqueVisitors: null,
      pageViews: null,
    }
  }
}

/**
 * 獲取網站統計數據（帶緩存）
 */
const getCachedStats = unstable_cache(
  async (): Promise<StatsData> => {
    // 獲取文章數據
    const posts = await getAllPosts()
    const articleCount = posts.length

    // 獲取最新文章的日期
    const lastUpdate =
      posts.length > 0
        ? posts
            .map((post) => new Date(post.date).getTime())
            .sort((a, b) => b - a)[0]
        : null

    // 獲取 Google Analytics 數據
    const analyticsData = await fetchAnalyticsData()

    return {
      articleCount,
      uniqueVisitors: analyticsData.uniqueVisitors,
      pageViews: analyticsData.pageViews,
      lastUpdate: lastUpdate ? new Date(lastUpdate).toISOString() : null,
    }
  },
  ['website-stats'],
  {
    revalidate: CACHE_DURATION,
    tags: ['stats'],
  }
)

export async function GET() {
  try {
    const stats = await getCachedStats()

    const response = NextResponse.json(stats)

    // 添加緩存頭
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`
    )

    return response
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
