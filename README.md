# Waynspace

基於 Next.js 16 和 Cloudflare R2 打造的個人部落格。

線上網站：[waynspace.com](https://waynspace.com)

---

## Tech Stack

- Next.js 16（App Router）、React 19、TypeScript
- Tailwind CSS v4、CSS variables
- 內容：Markdown（`.md`）搭配 YAML frontmatter
- 圖片：Cloudflare R2 CDN（`img.waynspace.com`）
- 分析：Google Analytics 4
- 電子報：Buttondown

---

## 專案結構

```
├── content/                    # 文章（content/YYYY/MM/slug.md）
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 根佈局
│   │   ├── page.tsx            # 首頁
│   │   ├── about/              # 關於頁面
│   │   ├── blog/               # 文章列表與詳細頁
│   │   │   ├── page.tsx        # 文章列表
│   │   │   ├── [...slug]/      # 動態文章路由
│   │   │   └── category/       # 分類篩選
│   │   ├── photos/             # 照片頁面
│   │   ├── api/                # API routes
│   │   ├── sitemap.ts          # 動態 sitemap
│   │   └── robots.ts           # 動態 robots.txt
│   ├── components/
│   │   ├── Header.tsx          # 導覽列
│   │   ├── Navigation.tsx      # 導覽連結
│   │   ├── Footer.tsx          # 頁尾
│   │   ├── BlogClient.tsx      # 文章列表（分類篩選 + 年份分組）
│   │   ├── PhotoGallery.tsx    # 照片牆（masonry + lightbox）
│   │   ├── EmailSubscribe.tsx  # 電子報訂閱
│   │   └── Analytics.tsx       # GA4
│   ├── lib/
│   │   ├── posts.ts            # 文章處理（getAllPosts, getPostBySlug）
│   │   ├── photos.ts           # 照片處理（getPhotos）
│   │   ├── markdown.ts         # Markdown 轉換
│   │   └── seo.ts              # SEO 配置
│   └── config/
│       └── navigation.ts       # 導覽設定
├── scripts/                    # 圖片處理與工具腳本
├── docs/                       # 文件
├── public/                     # 靜態資源
└── package.json
```

---

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 生產環境建置
```

---

## Routes

| 路由 | 說明 |
|------|------|
| `/` | 首頁：簡介、最新文章、電子報訂閱 |
| `/about` | 關於：經歷、專案、教育、技能 |
| `/blog` | 文章列表：分類篩選 + 年份分組 |
| `/blog/[...slug]` | 文章內容頁 |
| `/photos` | 照片牆 |
| `/camera-float-ntu` | Camera Float 專案 |

---

## 文章分類

| 分類 | 代碼 | 說明 |
|------|------|------|
| 台大資管生活 | `ntu-life` | 台大資管相關、課程心得 |
| 生活日誌 | `personal-journal` | 日常生活記錄 |
| 科學班生活 | `science-class-journal` | 科學班相關回憶 |
| 技術隨筆 | `tech-notes` | 技術相關文章 |
| 行旅隨筆 | `travel-notes` | 城市探索、旅行 |
| 攝影筆記 | `photography-notes` | 攝影作品與心得 |
| 筆記與心得 | `notes` | 閱讀、觀影心得 |

---

## Documentation

- [Writing & Publishing Guide](./docs/writing-guide.md) — 撰寫文章、圖片處理、發布、電子報
- [SEO & Configuration](./docs/seo-and-config.md) — Favicon、SEO、環境變數、部署
- [Scripts Reference](./scripts/README.md) — 圖片處理與工具腳本

---

## 部署

主要平台：[Vercel](https://vercel.com)（推送到 GitHub 即自動部署）

可選環境變數：

| 變數 | 說明 |
|------|------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 追蹤 ID |
| `BUTTONDOWN_API_KEY` | 電子報 API Key |

R2 圖片為公開 URL，顯示不需額外設定。圖片處理相關環境變數見 [SEO & Config](./docs/seo-and-config.md#環境變數)。

---

## Author

Wei-Ting Liu（劉威廷）

- Website: [waynspace.com](https://waynspace.com)
- GitHub: [@Waynting](https://github.com/Waynting)
- LinkedIn: [Wei-Ting Liu](https://www.linkedin.com/in/waiting5928/)
- Email: wayntingliu@gmail.com

---

## License

MIT
