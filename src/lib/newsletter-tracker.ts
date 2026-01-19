import fs from 'fs/promises'
import path from 'path'

const TRACKER_FILE = path.join(process.cwd(), '.newsletter-sent.json')

export interface SentArticle {
  slug: string
  sentAt: string
  subject?: string
  emailId?: string
}

interface TrackerData {
  articles: SentArticle[]
}

/**
 * 讀取已發送文章記錄
 */
export async function getSentArticles(): Promise<SentArticle[]> {
  try {
    const data = await fs.readFile(TRACKER_FILE, 'utf-8')
    const parsed: TrackerData = JSON.parse(data)
    return parsed.articles || []
  } catch (error) {
    // 檔案不存在或格式錯誤，返回空陣列
    return []
  }
}

/**
 * 檢查文章是否已發送
 */
export async function isArticleSent(slug: string): Promise<boolean> {
  const articles = await getSentArticles()
  return articles.some((article) => article.slug === slug)
}

/**
 * 記錄已發送的文章
 */
export async function recordSentArticle(
  slug: string,
  subject?: string,
  emailId?: string
): Promise<void> {
  const articles = await getSentArticles()
  
  // 檢查是否已存在，如果存在則更新
  const existingIndex = articles.findIndex((article) => article.slug === slug)
  const newArticle: SentArticle = {
    slug,
    sentAt: new Date().toISOString(),
    subject,
    emailId,
  }

  if (existingIndex >= 0) {
    articles[existingIndex] = newArticle
  } else {
    articles.push(newArticle)
  }

  const data: TrackerData = { articles }
  await fs.writeFile(TRACKER_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

/**
 * 獲取已發送文章的詳細資訊
 */
export async function getSentArticleInfo(
  slug: string
): Promise<SentArticle | null> {
  const articles = await getSentArticles()
  return articles.find((article) => article.slug === slug) || null
}
