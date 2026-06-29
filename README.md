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
- 電子報：Resend + Vercel Postgres（自架）

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
│   │   └── Analytics.tsx       # GA4
│   ├── lib/
│   │   ├── posts.ts            # 文章處理（getAllPosts, getPostBySlug）
│   │   ├── photos.ts           # 照片處理（getPhotos）
│   │   ├── markdown.ts         # Markdown 轉換
│   │   └── seo.ts              # SEO 配置
│   └── config/
│       └── navigation.ts       # 導覽設定
├── Camera_float_ntu_web/       # 獨立子網站：Camera Float（自帶 toolchain、獨立部署）
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
| `/camera-float-ntu` | Camera Float 專案（代理至子網站，見下） |

---

## 子網站：Camera Float（`Camera_float_ntu_web/`）

NTU 相機流浪計畫的照片牆，是一個**獨立**的 Next.js 網站，放在本 repo 內以便一起維護，但**刻意不**併入主站的 build、路由或 `/photos` 照片系統。

- **自帶 toolchain**（請勿為了對齊主站而升級）：Next.js 16 / React 18 / Tailwind v3 / shadcn-ui，`@/*` 對應它自己的根目錄。
- **獨立安裝與啟動**（自帶 `node_modules`，非 workspace）：

  ```bash
  cd Camera_float_ntu_web && npm install && npm run dev
  ```

- 已從主站 toolchain 排除（根目錄 `tsconfig.json` 的 `exclude` 與 `eslint.config.mjs` 的 `globalIgnores`），所以在 repo 根目錄跑 `build`／`lint` 不會碰到它。
- **部署與路由不變**：以獨立 Vercel 專案部署到 `camera-float-ntu-web.waynspace.com`（`basePath=/camera-float-ntu`），主站 `next.config.ts` 的 `rewrites()` 透明代理 `/camera-float-ntu/*`。併入 repo 後，請把該 Vercel 專案的 **Root Directory** 指到 `Camera_float_ntu_web`。
- 詳細開發說明見 `Camera_float_ntu_web/README.md` 與 `Camera_float_ntu_web/CLAUDE.md`。合併前的歷史保留於 `github.com/Waynting/Camera_float_ntu_web`。

---

## 文章分類

| 分類 | 代碼 | 說明 |
|------|------|------|
| 台大資管 | `ntu-life` | 台大資管相關、課程心得 |
| 生活隨筆 | `personal-journal` | 日常生活記錄 |
| 科學班生活 | `science-class-journal` | 科學班相關回憶 |
| 技術隨筆 | `tech-notes` | 技術相關文章 |
| 行旅隨筆 | `travel-notes` | 城市探索、旅行 |
| 攝影筆記 | `photography-notes` | 攝影作品與心得 |
| 筆記與心得 | `notes` | 閱讀、觀影心得 |

---

## Documentation

- [Writing & Publishing Guide](./docs/writing-guide.md) — 撰寫文章、圖片處理、發布、電子報
- [SEO & Configuration](./docs/seo-and-config.md) — Favicon、SEO、環境變數、部署
- [Newsletter Setup](./docs/setup-newsletter.md) — Resend + Vercel Postgres 自架電子報設定
- [Scripts Reference](./scripts/README.md) — 圖片處理與工具腳本
- [CHANGELOG](./CHANGELOG.md) — 版本與重大改動記錄

---

## 部署

主要平台：[Vercel](https://vercel.com)（推送到 GitHub 即自動部署）

可選環境變數：

| 變數 | 說明 |
|------|------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 追蹤 ID |

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
