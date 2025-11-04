# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A modern personal blog built with Next.js 16 App Router, TypeScript, and Cloudflare R2 for image hosting. The blog uses MDX for content with frontmatter metadata and follows a date-based directory structure.

**Live Site**: https://waynspace.com

## Development Commands

```bash
# Development
npm run dev              # Start dev server at http://localhost:3000

# Building
npm run build            # Production build
npm run start            # Run production server

# Linting
npm run lint             # Run ESLint

# Image Management (requires rclone)
npm run images:publish   # Upload images to Cloudflare R2
npm run images:update    # Update image paths in content
npm run images:verify    # Verify R2 images exist
npm run test:r2          # Test R2 configuration
```

## Architecture & Key Concepts

### Content System

**Directory Structure**: Posts are organized as `content/YYYY/MM/slug.mdx`

- The file system structure directly maps to the URL structure
- Year and month are extracted from the file path, not frontmatter
- Supports Chinese/Unicode characters in slugs (auto URL-encoded/decoded)

**Image URL Convention**:
```
https://img.waynspace.com/{year}/{month}/{slug}/{filename}
```

**Important**: The R2 bucket name is `blog-post`, but this is NOT part of the URL path. The custom domain `img.waynspace.com` maps directly to the bucket root.

### Core Data Flow

1. **Content Reading** ([src/lib/posts.ts](src/lib/posts.ts))
   - `getAllPosts()` - Scans `content/` directory recursively for `.mdx` files
   - Uses `globby` for file discovery
   - Parses frontmatter with `gray-matter`
   - Auto-extracts first image as cover if `coverImage` not set in frontmatter

2. **Markdown Processing** ([src/lib/markdown.ts](src/lib/markdown.ts))
   - Pre-processes complex image syntax: `[![](imageUrl)](linkUrl)` → `<img>` tags
   - This is required because URLs contain special characters that break standard Markdown parsers
   - Pipeline: `remark` → `remark-gfm` → `remark-rehype` → `rehype-stringify`
   - Uses `allowDangerousHtml: true` to preserve pre-processed `<img>` tags

3. **Route Generation** ([src/app/posts/[...slug]/page.tsx](src/app/posts/[...slug]/page.tsx))
   - Catch-all route handles dynamic post URLs
   - `generateStaticParams()` pre-renders all posts at build time (SSG)
   - `params` is a Promise in Next.js 16+ - must `await params` before use
   - URL decoding: Each slug segment is decoded with `decodeURIComponent()`

### Image URL Processing

Images are transformed at multiple points:

1. **PostCard Component** ([src/components/PostCard.tsx](src/components/PostCard.tsx:51-62))
   - Constructs CDN URLs from slug structure
   - Handles both absolute URLs (`http://`) and relative paths
   - Uses `unoptimized` flag for external CDN images

2. **Post Detail Page** ([src/app/posts/[...slug]/page.tsx](src/app/posts/[...slug]/page.tsx:39-62))
   - Replaces `images/` relative paths with full CDN URLs
   - Migrates old WordPress URLs to new R2 structure
   - Applies transformations to rendered HTML content

### SEO Configuration

- **next.config.ts**: Configures remote image domains (`img.waynspace.com`, `waynspace.com`)
- **Dynamic metadata**: Each post page generates Open Graph and Twitter Card metadata
- **Sitemap**: Auto-generated at build time from all posts
- **Robots.txt**: Conditionally blocks preview environments from indexing

### TypeScript Types

See [src/types/blog.ts](src/types/blog.ts) for core interfaces:
- `Post` - Full post object with content, metadata, and computed fields (excerpt, readTime)
- `Author` - Author information
- `SEOMeta` - SEO metadata fields
- `Category` / `Tag` - Taxonomy objects

## Image Management Workflow

### R2 Configuration

Required environment variables (`.env`):
```env
CF_ACCOUNT_ID=your_account_id
R2_BUCKET=blog-post
R2_BASE_URL=https://img.waynspace.com
R2_PREFIX=blog-post
RCLONE_REMOTE=r2
```

### Uploading Images

1. Configure `rclone` with Cloudflare R2 endpoint
2. Upload to path matching content structure:
   ```bash
   rclone copy ~/Downloads/images/ r2:blog-post/2025/01/my-post/ --progress
   ```
3. Reference in MDX:
   ```markdown
   ![Alt text](https://img.waynspace.com/2025/01/my-post/image.webp)
   ```

### Automatic Cover Image Extraction

If frontmatter omits `coverImage`/`cover`/`featuredImage`, the system:
1. Scans content with regex: `/!\[.*?\]\((https?:\/\/[^)]+)\)/`
2. Extracts first image URL
3. Uses as `featuredImage` and SEO `ogImage`

## Content Creation

### Frontmatter Schema

```yaml
---
title: "Post Title"                    # Required
date: 2025-01-15                       # Required (ISO 8601)
modifiedDate: 2025-01-20               # Optional
tags:                                  # Optional array
  - tag1
  - tag2
categories:                            # Optional array (first is primary)
  - Category Name
slug: "my-post"                        # Optional (defaults to filename)
coverImage: "https://img.waynspace.com/2025/01/my-post/cover.webp"  # Optional
author:                                # Optional
  name: "Wayne Liu"
  email: "wayntingliu@gmail.com"
  avatar: "/avatar.jpg"
seo:                                   # Optional
  metaDescription: "SEO description"
  keywords:
    - keyword1
---
```

### Category Color Mapping

Categories have predefined colors in [PostCard.tsx](src/components/PostCard.tsx:38-49):
- 台大資管生活 → Blue
- 科學班生活 → Purple
- 攝影筆記 → Green
- 城市漫步 → Yellow
- 生活日誌 → Pink
- 讀書筆記與心得 → Indigo
- 技術筆記 → Red
- Default → Gray

## UI Component System

Custom components in `src/components/ui/`:
- **Section/SectionContent/SectionHeader** - Page layout containers
- **Card/CardHeader/CardContent/CardFooter** - Content cards
- **Badge** - Category and tag labels
- **Button** - CTA buttons with variants

Uses Tailwind CSS v4 with custom design tokens for theming.

## Critical Implementation Details

### URL Encoding for Chinese Content

The app supports Chinese characters in URLs. Browser behavior:
```
User sees:  /posts/2024/02/國際科展之旅-202301280202
Actual URL: /posts/2024/02/%E5%9C%8B%E9%9A%9B%E7%A7%91%E5%B1%95%E4%B9%8B%E6%97%85-202301280202
```

Implementation in [[...slug]/page.tsx](src/app/posts/[...slug]/page.tsx:24-27):
```typescript
const slug = Array.isArray(slugArray)
  ? slugArray.map(part => decodeURIComponent(part)).join('/')
  : decodeURIComponent(slugArray)
```

### Markdown Image Syntax Workaround

Standard markdown parsers fail on URLs with spaces/special characters. Pre-process before parsing:

```typescript
// In markdown.ts:10-13
let processedMarkdown = markdown.replace(
  /\[!\[\]\((https?:\/\/[^)]+)\)\]\([^)]+\)/g,
  '<img src="$1" alt="" />'
);
```

### Read Time Calculation

Bilingual support ([markdown.ts](src/lib/markdown.ts:52-69)):
- Counts Chinese characters: `[\u4e00-\u9fa5]`
- Counts English words by splitting on whitespace
- Assumes 250 characters/words per minute average

## Common Tasks

### Adding a New Post

1. Create file: `content/2025/01/new-post.mdx`
2. Add frontmatter (see schema above)
3. Write content in Markdown/MDX
4. Upload images to R2: `rclone copy images/ r2:blog-post/2025/01/new-post/`
5. Reference images: `![](https://img.waynspace.com/2025/01/new-post/image.jpg)`
6. Dev server auto-detects new files (no restart needed)

### Modifying Image Processing

Image URL construction logic exists in two places:
1. **PostCard** ([PostCard.tsx](src/components/PostCard.tsx:51-62)) - For card thumbnails
2. **Post Detail** ([[...slug]/page.tsx](src/app/posts/[...slug]/page.tsx:39-71)) - For content images

Both must be updated together to maintain consistency.

### Debugging 404s

If a post shows 404:
1. Verify file path: `content/YYYY/MM/slug.mdx`
2. Check frontmatter `slug` matches filename (without `.mdx`)
3. Inspect `getAllPosts()` output in dev server logs
4. Clear Next.js cache: `rm -rf .next && npm run dev`

## Deployment

Optimized for Vercel:
- Next.js auto-detected
- Only env var needed: `NEXT_PUBLIC_GA_ID` (optional)
- R2 images are public URLs (no auth required)
- Automatic static generation for all posts

Build output is fully static (SSG) except for dynamic routes which use `generateStaticParams`.
