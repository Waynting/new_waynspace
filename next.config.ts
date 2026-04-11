import type { NextConfig } from "next";
import { getAllPosts, getAllCategories } from './src/lib/posts';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.waynspace.com',
      },
      {
        protocol: 'https',
        hostname: 'waynspace.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400,
  },

  // Camera Float NTU — 代理到獨立子站，本地開發與 production 皆可用
  async rewrites() {
    return [
      {
        source: '/camera-float-ntu',
        destination: 'https://camera-float-ntu-web.waynspace.com/camera-float-ntu',
      },
      {
        source: '/camera-float-ntu/:path*',
        destination: 'https://camera-float-ntu-web.waynspace.com/camera-float-ntu/:path*',
      },
    ];
  },

  // 動態生成重定向規則
  async redirects() {
    const posts = await getAllPosts();
    const redirects: Array<{ source: string; destination: string; permanent: boolean }> = [];

    posts.forEach(post => {
      const slugParts = post.slug.split('/');

      if (slugParts.length === 3) {
        const articleSlug = slugParts[2];

        // 1. 根路徑: /文章名 -> /blog/YYYY/MM/文章名
        redirects.push({
          source: `/${articleSlug}`,
          destination: `/blog/${post.slug}`,
          permanent: true,
        });

        // 2. /posts/文章名 -> /blog/YYYY/MM/文章名
        redirects.push({
          source: `/posts/${articleSlug}`,
          destination: `/blog/${post.slug}`,
          permanent: true,
        });

        // 3. /posts/YYYY/MM/文章名 -> /blog/YYYY/MM/文章名
        redirects.push({
          source: `/posts/${post.slug}`,
          destination: `/blog/${post.slug}`,
          permanent: true,
        });
      }
    });

    // 通用 /posts -> /blog
    redirects.push({
      source: '/posts',
      destination: '/blog',
      permanent: true,
    });

    // /posts/YYYY 或 /blog/YYYY -> /blog
    redirects.push({
      source: '/posts/:year(\\d{4})',
      destination: '/blog',
      permanent: true,
    });
    redirects.push({
      source: '/blog/:year(\\d{4})',
      destination: '/blog',
      permanent: true,
    });

    // 分類頁面重定向
    const categories = await getAllCategories();
    categories.forEach(category => {
      const categoryNameSlug = category.name.toLowerCase().replace(/\s+/g, '-');
      if (category.slug !== categoryNameSlug && category.slug !== 'uncategorized') {
        redirects.push({
          source: `/blog/category/${encodeURIComponent(category.name)}`,
          destination: `/blog/category/${category.slug}`,
          permanent: true,
        });
      }

      // /posts/category/:slug -> /blog/category/:slug
      redirects.push({
        source: `/posts/category/${category.slug}`,
        destination: `/blog/category/${category.slug}`,
        permanent: true,
      });

      // /category/:slug -> /blog/category/:slug (無 /blog 前綴)
      redirects.push({
        source: `/category/${category.slug}`,
        destination: `/blog/category/${category.slug}`,
        permanent: true,
      });
    });

    // 舊分類 slug -> 新合併後的分類 slug
    redirects.push(
      { source: '/blog/category/city-walk', destination: '/blog/category/travel-notes', permanent: true },
      { source: '/blog/category/reading-notes', destination: '/blog/category/notes', permanent: true },
      { source: '/blog/category/film-review', destination: '/blog/category/notes', permanent: true },
      { source: '/blog/category/uncategorized', destination: '/blog', permanent: true },
      { source: '/blog/category/Uncategorized', destination: '/blog', permanent: true },
      { source: '/blog/categories', destination: '/blog', permanent: true },
    );

    // 已移除頁面 -> 最近的對應頁面
    redirects.push(
      { source: '/contact', destination: '/about', permanent: true },
      { source: '/contact/', destination: '/about', permanent: true },
      { source: '/search', destination: '/blog', permanent: true },
      { source: '/photo', destination: '/photos', permanent: true },
      { source: '/flow-code', destination: '/projects', permanent: true },
      { source: '/flow-code/', destination: '/projects', permanent: true },
      { source: '/code-project', destination: '/projects', permanent: true },
      { source: '/capture-light', destination: '/projects', permanent: true },
    );

    // Camera drift 舊名稱 -> camera float 新名稱
    redirects.push(
      { source: '/camera-drift-ntu', destination: '/camera-float-ntu', permanent: true },
      { source: '/camera-drift-ntu/:path*', destination: '/camera-float-ntu/:path*', permanent: true },
      { source: '/camera-drift-project/:path*', destination: '/camera-float-ntu', permanent: true },
    );

    // WordPress 殘留路徑
    redirects.push(
      { source: '/feed', destination: '/feed.xml', permanent: true },
      { source: '/feed/', destination: '/feed.xml', permanent: true },
      { source: '/author/:path*', destination: '/about', permanent: true },
    );

    return redirects;
  },
};

export default nextConfig;
