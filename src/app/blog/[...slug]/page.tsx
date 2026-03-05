import { Metadata } from 'next'
import { getPostBySlug, getAllPosts } from '@/lib/posts'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/markdown'
import { cn } from '@/lib/utils'
import ArticleContent from '@/components/ArticleContent'
import { generatePostMetadata } from './metadata'
import { generateStructuredData } from '@/lib/seo'
import { siteConfig } from '@/config/seo'

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({
    // slug 現在是完整路徑格式 YYYY/MM/articleSlug，需要分割成數組供 Next.js 路由使用
    slug: post.slug.split('/'),
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
  const { slug: slugArray } = await params
  const slug = Array.isArray(slugArray)
    ? slugArray.map(part => decodeURIComponent(part)).join('/')
    : decodeURIComponent(slugArray)
  
  return generatePostMetadata(slug)
}

// 獲取分類顏色配置
function getCategoryColor(categoryName: string): string {
  const colorMap: Record<string, string> = {
    // 淺色模式使用純黑色文字確保最高對比度，深色模式保持淺色文字
    '台大資管生活': 'bg-blue-100 text-black dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    '科學班生活': 'bg-purple-100 text-black dark:bg-purple-900/30 dark:text-purple-300 border-purple-300 dark:border-purple-700',
    '攝影筆記': 'bg-green-100 text-black dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700',
    '城市漫步': 'bg-yellow-100 text-black dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
    '生活日誌': 'bg-pink-100 text-black dark:bg-pink-900/30 dark:text-pink-300 border-pink-300 dark:border-pink-700',
    '讀書筆記與心得': 'bg-indigo-100 text-black dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
    '技術筆記': 'bg-red-100 text-black dark:bg-red-900/30 dark:text-red-300 border-red-300 dark:border-red-700',
  };
  return colorMap[categoryName] || 'bg-gray-100 text-black dark:bg-gray-900/30 dark:text-gray-300 border-gray-300 dark:border-gray-700';
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string[] }> // Next.js 16+，params 是 Promise
}) {
  // 解包 params Promise
  const { slug: slugArray } = await params
  // slug 現在是完整路徑格式 YYYY/MM/articleSlug，需要組合路徑
  const slug = Array.isArray(slugArray)
    ? slugArray.map(part => decodeURIComponent(part)).join('/')
    : decodeURIComponent(slugArray)
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // 从 post.slug 提取年份和月份用于构建图片路径
  // post.slug 現在是完整路徑格式 YYYY/MM/articleSlug
  const slugParts = post.slug.split('/')
  const year = slugParts[0] || ''
  const month = slugParts[1] || ''
  const yearMonth = year && month ? `${year}/${month}` : ''
  const articleSlug = slugParts.length >= 3 ? slugParts.slice(2).join('/') : post.slug

  // 處理圖片路徑（因為 content 已經是 HTML）
  let processedContent = post.content || ''

  // 替換相對路徑的圖片連結
  processedContent = processedContent.replace(
    /src=["']images\/([^"']+)["']/g,
    (_match, imgPath) => {
      const imageUrl = yearMonth
        ? `https://img.waynspace.com/${yearMonth}/${articleSlug}/${imgPath}`
        : `https://img.waynspace.com/${post.slug}/${imgPath}`
      return `src="${imageUrl}"`
    }
  )

  // 替換舊 WordPress 連結
  processedContent = processedContent.replace(
    /https:\/\/waynspace\.com\/wp-content\/uploads\/[^"'\s)]+/g,
    (match) => {
      const filename = match.split('/').pop()?.split('?')[0] || ''
      return yearMonth
        ? `https://img.waynspace.com/${yearMonth}/${articleSlug}/${filename}`
        : `https://img.waynspace.com/${post.slug}/${filename}`
    }
  )

  // 構建封面圖片 URL（用於其他用途，如 metadata）
  // 注意：封面圖片會保留在文章內容中顯示，不會被移除
  const coverImageUrl = post.featuredImage?.startsWith('http')
    ? post.featuredImage
    : post.featuredImage && yearMonth
    ? `https://img.waynspace.com/${yearMonth}/${articleSlug}/${post.featuredImage}`
    : post.featuredImage
    ? `https://img.waynspace.com/${post.slug}/${post.featuredImage}`
    : null

  // 生成文章的结构化数据
  const articleStructuredData = generateStructuredData('article', {
    title: post.title,
    description: post.excerpt || post.seo.metaDescription,
    author: post.author.name,
    publishedTime: post.date,
    modifiedTime: post.modifiedDate || post.date,
    url: `${siteConfig.url}/blog/${post.slug}`,
    images: coverImageUrl ? [coverImageUrl] : [],
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />

      <main className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-12 md:py-20">
        {/* Navigation */}
        <nav className="mb-12">
          <Link
            href="/blog"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
          >
            ← All Articles
          </Link>
        </nav>

        {/* Article Header */}
        <header className="mb-16 space-y-6">
          {/* Category */}
          <div className="flex items-center gap-3">
            <span className={cn(
              "px-3 py-1 text-xs font-medium rounded-md border",
              getCategoryColor(post.category)
            )}>
              {post.category}
            </span>
            {post.tags.length > 0 && (
              <div className="flex gap-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
            <span>{post.author.name}</span>
            <span className="text-border">·</span>
            <time dateTime={(() => {
              if (!post.date) return '';
              try {
                const date = new Date(post.date);
                return isNaN(date.getTime()) ? post.date : date.toISOString();
              } catch {
                return post.date;
              }
            })()}>{formatDate(post.date)}</time>
            <span className="text-border">·</span>
            <span>{post.readTime}</span>
          </div>
        </header>

        {/* Article Content */}
        <ArticleContent
          html={processedContent}
          className="article-content prose prose-base md:prose-lg max-w-none dark:prose-invert
            prose-headings:font-semibold prose-headings:tracking-tight
            prose-h1:text-3xl prose-h1:mt-16 prose-h1:mb-8 prose-h1:leading-tight
            prose-h2:text-2xl prose-h2:mt-14 prose-h2:mb-6 prose-h2:leading-snug
            prose-h3:text-xl prose-h3:mt-12 prose-h3:mb-5 prose-h3:leading-snug
            prose-h4:text-lg prose-h4:mt-10 prose-h4:mb-4
            prose-p:leading-[1.85] prose-p:mb-6 prose-p:text-[15px] md:prose-p:text-base
            prose-a:underline prose-a:decoration-muted-foreground/40 prose-a:underline-offset-4
            hover:prose-a:decoration-foreground prose-a:transition-colors prose-a:font-normal
            prose-strong:font-semibold
            prose-em:italic
            prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono
            prose-code:before:content-[''] prose-code:after:content-['']
            prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg
            prose-pre:p-5 prose-pre:my-8 prose-pre:overflow-x-auto prose-pre:text-[14px] prose-pre:leading-relaxed
            prose-blockquote:border-l-4 prose-blockquote:border-muted-foreground/30 prose-blockquote:pl-6 prose-blockquote:pr-4
            prose-blockquote:not-italic prose-blockquote:text-muted-foreground prose-blockquote:mt-2 prose-blockquote:mb-6 prose-blockquote:py-4
            prose-img:rounded-lg prose-img:my-10 prose-img:shadow-sm prose-img:w-full
            prose-ul:my-6 prose-ul:list-disc prose-ul:pl-7
            prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-7
            prose-li:leading-[1.75] prose-li:my-0
            [&_li>p]:my-1 [&_li>p]:mb-1
            [&_blockquote_p]:!my-0 [&_blockquote_p]:!mb-0
            prose-table:my-10 prose-table:border-collapse prose-table:w-full prose-table:text-sm
            prose-th:border prose-th:border-border prose-th:bg-muted/50 prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-medium
            prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-3
            prose-hr:my-14 prose-hr:border-border prose-hr:border-t-2
            [&>p+p]:mt-6 [&_br+br]:block [&_br+br]:content-[''] [&_br+br]:mt-6"
        />

        {/* Footer Navigation */}
        <footer className="mt-16 pt-8 border-t border-border">
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
          >
            ← Back to all articles
          </Link>
        </footer>
      </main>
    </>
  )
}
