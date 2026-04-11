import { Feed } from 'feed'
import { getAllPosts } from '@/lib/posts'
import { siteConfig } from '@/config/seo'

async function buildFeed(): Promise<Feed> {
  const posts = await getAllPosts()
  const latestPosts = posts.slice(0, 20)

  const feed = new Feed({
    title: siteConfig.title,
    description: siteConfig.description,
    id: siteConfig.url,
    link: siteConfig.url,
    language: 'zh-TW',
    image: `${siteConfig.url}/blog-image.jpg`,
    favicon: `${siteConfig.url}/favicon.ico`,
    copyright: `© ${new Date().getFullYear()} ${siteConfig.author.name}`,
    author: {
      name: siteConfig.author.name,
      email: siteConfig.author.email,
      link: siteConfig.url,
    },
    feedLinks: {
      rss2: `${siteConfig.url}/feed.xml`,
      atom: `${siteConfig.url}/atom.xml`,
    },
  })

  for (const post of latestPosts) {
    const postUrl = `${siteConfig.url}/blog/${post.slug}`

    feed.addItem({
      title: post.title,
      id: postUrl,
      link: postUrl,
      description: post.excerpt,
      date: new Date(post.date),
      category: post.category
        ? [{ name: post.category }]
        : undefined,
      image: post.coverImage || undefined,
      author: [
        {
          name: post.author.name,
          email: post.author.email,
          link: siteConfig.url,
        },
      ],
    })
  }

  return feed
}

export async function generateRSS(): Promise<string> {
  const feed = await buildFeed()
  return feed.rss2()
}

export async function generateAtom(): Promise<string> {
  const feed = await buildFeed()
  return feed.atom1()
}
