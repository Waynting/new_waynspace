import {
  markdownToHtml,
  absolutizePostImages,
  stripDuplicateTitleH1,
} from './markdown'
import { siteConfig } from '@/config/seo'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export interface MediumHtmlInput {
  /** 完整路徑格式 slug：YYYY/MM/articleSlug */
  slug: string
  title: string
  /** 文章本文（markdown） */
  markdown: string
  description?: string
}

/**
 * 產生專供 Medium「Import a story」使用的乾淨 HTML 文件：
 * - 單一 <article>，無 nav / footer / 電子報等網站外殼
 * - 程式碼區塊不做語法高亮（純 <pre><code>，由 Medium 自行上色）
 * - 圖片一律絕對網址
 * - 整份文件只有一個 <h1>（移除與標題重複的內文 h1，其餘 h1 降為 h2）
 * - <link rel="canonical"> 指回原文，文末附「Originally published at」回鏈
 */
export async function buildMediumHtml(input: MediumHtmlInput): Promise<string> {
  const { slug, title, markdown, description } = input
  const canonical = `${siteConfig.url}/blog/${slug}`

  let body = await markdownToHtml(markdown, { highlight: false })
  body = absolutizePostImages(body, slug)
  body = stripDuplicateTitleH1(body, title)
  // 內文殘留的 h1 降為 h2，確保整份文件只有一個 h1（標題）
  body = body.replace(/<h1(\s|>)/gi, '<h2$1').replace(/<\/h1>/gi, '</h2>')

  const safeTitle = escapeHtml(title)
  const descriptionMeta = description
    ? `\n<meta name="description" content="${escapeHtml(description)}">`
    : ''

  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${safeTitle}</title>${descriptionMeta}
<link rel="canonical" href="${canonical}">
</head>
<body>
<article>
<h1>${safeTitle}</h1>
${body}
<hr>
<p><em>Originally published at <a href="${canonical}">${canonical}</a></em></p>
</article>
</body>
</html>
`
}
