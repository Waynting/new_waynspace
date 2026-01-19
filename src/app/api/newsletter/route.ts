import { NextResponse } from 'next/server'
import buttondown from 'buttondown'
import { getPostBySlug } from '@/lib/posts'
import { siteConfig } from '@/config/seo'
import {
  isArticleSent,
  recordSentArticle,
  getSentArticleInfo,
} from '@/lib/newsletter-tracker'

// 设置 API Key
if (process.env.BUTTONDOWN_API_KEY) {
  buttondown.setApiKey(process.env.BUTTONDOWN_API_KEY)
}

/**
 * 發送電子報給所有訂閱者
 */
export async function POST(request: Request) {
  try {
    // 檢查是否有設定 API Key
    if (!process.env.BUTTONDOWN_API_KEY) {
      console.error('BUTTONDOWN_API_KEY 未設定')
      return NextResponse.json(
        { error: '服務暫時無法使用，請稍後再試' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { slug, subject, body: emailBody, force } = body

    let finalSubject = subject
    let finalBody = emailBody

    // 如果有提供 slug，檢查是否已發送（除非使用 force）
    if (slug && !force) {
      const alreadySent = await isArticleSent(slug)
      if (alreadySent) {
        const sentInfo = await getSentArticleInfo(slug)
        return NextResponse.json(
          {
            error: '此文章已經發送過',
            sentAt: sentInfo?.sentAt,
            subject: sentInfo?.subject,
            emailId: sentInfo?.emailId,
            hint: '如需重新發送，請在請求中加入 "force": true',
          },
          { status: 400 }
        )
      }
    }

    // 如果有提供 slug，獲取文章內容
    if (slug) {
      try {
        const post = await getPostBySlug(slug)
        if (!post) {
          return NextResponse.json(
            { error: '找不到指定的文章' },
            { status: 404 }
          )
        }

        // 構建郵件內容
        const postUrl = `${siteConfig.url}/blog/${post.slug}`
        finalSubject = subject || `新文章：${post.title}`
        finalBody = emailBody || `
# ${post.title}

${post.excerpt || ''}

[閱讀全文 →](${postUrl})

---

${post.content.substring(0, 500)}${post.content.length > 500 ? '...' : ''}
        `.trim()
      } catch (error) {
        console.error('獲取文章內容錯誤:', error)
        return NextResponse.json(
          { error: '獲取文章內容失敗' },
          { status: 500 }
        )
      }
    }

    // 驗證必要欄位
    if (!finalSubject || !finalBody) {
      return NextResponse.json(
        { error: '標題和內容是必填欄位' },
        { status: 400 }
      )
    }

    // 發送郵件給所有訂閱者
    try {
      const result = (await buttondown.emails.create({
        subject: finalSubject,
        body: finalBody,
        subscriber_email_addresses: [], // 空陣列表示發送給所有訂閱者
      })) as unknown as { id?: string }

      const emailId = result?.id

      // 記錄已發送的文章
      if (slug) {
        await recordSentArticle(slug, finalSubject, emailId)
      }

      return NextResponse.json(
        {
          message: '電子報已成功發送',
          emailId: emailId || null,
          slug: slug || null,
        },
        { status: 200 }
      )
    } catch (error: any) {
      console.error('Buttondown API 錯誤:', error)
      return NextResponse.json(
        { error: '發送電子報失敗，請稍後再試' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('發送電子報 API 錯誤:', error)
    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    )
  }
}
