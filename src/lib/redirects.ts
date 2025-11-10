import { getAllPosts } from './posts'

/**
 * 生成舊 URL 到新 URL 的重定向映射
 * 用於將不含日期路徑的舊 URL 重定向到新的 /blog/YYYY/MM/slug 格式
 */
export async function generateRedirectMap(): Promise<Map<string, string>> {
  const posts = await getAllPosts()
  const redirectMap = new Map<string, string>()

  posts.forEach(post => {
    // slug 格式: "2024/11/大學第十二周回顧-2024111820241124"
    const slugParts = post.slug.split('/')

    if (slugParts.length === 3) {
      const [year, month, articleSlug] = slugParts

      // 建立多種可能的舊路徑到新路徑的映射
      // 1. /文章名 -> /blog/YYYY/MM/文章名
      redirectMap.set(`/${articleSlug}`, `/blog/${post.slug}`)

      // 2. /blog/文章名 -> /blog/YYYY/MM/文章名
      redirectMap.set(`/blog/${articleSlug}`, `/blog/${post.slug}`)

      // 3. /posts/文章名 -> /blog/YYYY/MM/文章名 (舊的 posts 路徑)
      redirectMap.set(`/posts/${articleSlug}`, `/blog/${post.slug}`)

      // 4. /posts/YYYY/MM/文章名 -> /blog/YYYY/MM/文章名 (posts 轉 blog)
      redirectMap.set(`/posts/${post.slug}`, `/blog/${post.slug}`)
    }
  })

  return redirectMap
}

/**
 * 檢查給定路徑是否需要重定向
 * @param pathname 請求的路徑
 * @returns 重定向目標路徑,如果不需要重定向則返回 null
 */
export async function checkRedirect(pathname: string): Promise<string | null> {
  const redirectMap = await generateRedirectMap()

  // URL decode pathname to handle Chinese characters
  const decodedPath = decodeURIComponent(pathname)

  return redirectMap.get(decodedPath) || null
}
