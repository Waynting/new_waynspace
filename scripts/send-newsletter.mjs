#!/usr/bin/env node

/**
 * 發送電子報腳本
 * 
 * 使用方法：
 * 1. 發送指定文章的通知：
 *    node scripts/send-newsletter.mjs --slug "2026/01/旅行的意義-大二寒假環西半部"
 * 
 * 2. 發送自訂內容：
 *    node scripts/send-newsletter.mjs --subject "標題" --body "內容"
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { parse } from 'gray-matter'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// 讀取環境變數
import dotenv from 'dotenv'
dotenv.config({ path: join(rootDir, '.env.local') })

const BUTTONDOWN_API_KEY = process.env.BUTTONDOWN_API_KEY

if (!BUTTONDOWN_API_KEY) {
  console.error('錯誤：BUTTONDOWN_API_KEY 未設定')
  console.error('請在 .env.local 檔案中設定 BUTTONDOWN_API_KEY')
  process.exit(1)
}

// 解析命令行參數
const args = process.argv.slice(2)
const getArg = (name) => {
  const index = args.indexOf(`--${name}`)
  return index !== -1 && args[index + 1] ? args[index + 1] : null
}

const slug = getArg('slug')
const subject = getArg('subject')
const body = getArg('body')
const force = args.includes('--force')

if (!slug && (!subject || !body)) {
  console.error('使用方法：')
  console.error('  發送指定文章：node scripts/send-newsletter.mjs --slug "文章slug"')
  console.error('  發送自訂內容：node scripts/send-newsletter.mjs --subject "標題" --body "內容"')
  console.error('  強制重新發送：node scripts/send-newsletter.mjs --slug "文章slug" --force')
  process.exit(1)
}

// 追踪文件路径
const trackerFile = join(rootDir, '.newsletter-sent.json')

// 读取已发送文章记录
function getSentArticles() {
  if (!existsSync(trackerFile)) {
    return []
  }
  try {
    const data = readFileSync(trackerFile, 'utf-8')
    const parsed = JSON.parse(data)
    return parsed.articles || []
  } catch (error) {
    return []
  }
}

// 检查文章是否已发送
function isArticleSent(slug) {
  if (!slug) return false
  const articles = getSentArticles()
  return articles.some((article) => article.slug === slug)
}

// 记录已发送的文章
function recordSentArticle(slug, subject, emailId) {
  if (!slug) return
  
  const articles = getSentArticles()
  const existingIndex = articles.findIndex((article) => article.slug === slug)
  
  const newArticle = {
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

  const data = { articles }
  writeFileSync(trackerFile, JSON.stringify(data, null, 2), 'utf-8')
}

async function sendNewsletter() {
  try {
    // 檢查是否已發送（除非使用 --force）
    if (slug && !force && isArticleSent(slug)) {
      const sentInfo = getSentArticles().find((a) => a.slug === slug)
      console.warn(`⚠️  警告：文章 "${slug}" 已經發送過`)
      console.warn(`   發送時間：${sentInfo?.sentAt || '未知'}`)
      console.warn(`   如需重新發送，請使用 --force 參數`)
      process.exit(1)
    }

    let finalSubject = subject
    let finalBody = body

    // 如果有 slug，讀取文章內容
    if (slug) {
      const contentPath = join(rootDir, 'content', `${slug}.md`)
      
      try {
        const fileContent = readFileSync(contentPath, 'utf-8')
        const { data: frontMatter, content } = parse(fileContent)
        
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://waynspace.com'
        const postUrl = `${siteUrl}/blog/${slug}`
        
        finalSubject = subject || `新文章：${frontMatter.title || '新文章發布'}`
        finalBody = body || `
# ${frontMatter.title || '新文章'}

${frontMatter.summary || frontMatter.excerpt || ''}

[閱讀全文 →](${postUrl})

---

${content.substring(0, 500)}${content.length > 500 ? '...' : ''}
        `.trim()
      } catch (error) {
        console.error(`錯誤：無法讀取文章 ${slug}`)
        console.error(error.message)
        process.exit(1)
      }
    }

    // 發送郵件
    const response = await fetch('https://api.buttondown.email/v1/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${BUTTONDOWN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: finalSubject,
        body: finalBody,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('發送失敗：', response.status, errorData)
      process.exit(1)
    }

    const result = await response.json()
    console.log('✓ 電子報已成功發送！')
    console.log('郵件 ID:', result.id)
    
    // 記錄已發送的文章
    if (slug) {
      recordSentArticle(slug, finalSubject, result.id)
      console.log(`✓ 已記錄到追蹤檔案：${trackerFile}`)
    }
  } catch (error) {
    console.error('錯誤：', error.message)
    process.exit(1)
  }
}

sendNewsletter()
