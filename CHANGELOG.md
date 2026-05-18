# Changelog

記錄 Waynspace 重大改動。日期格式：`YYYY-MM-DD`。

格式參考 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.1.0/)。

---

## [Unreleased]

待規劃：
- frontmatter `newsletter: false` 旗標，可選擇不寄某篇文章
- 訂閱者 admin 頁（目前只能用 `npm run subscribers` 在終端機看）

---

## 2026-05-19

### Changed
- 升級到 react-email v6：所有元件改從 `react-email` 套件 import（原本 `@react-email/components` 在 react-email v6 被標 deprecated）
- DB driver 從 `@vercel/postgres` 換成 `@neondatabase/serverless`（`@vercel/postgres` 已 deprecated；Vercel Postgres 底層本來就是 Neon，背後 DB 不變）
  - `src/lib/db.ts` 與 `scripts/list-subscribers.mjs` 全部改用 `neon()` HTTP driver
  - 同樣讀 `POSTGRES_URL`，不需要遷移資料

### Fixed
- **Vercel auto-deploy 卡住**：cron 排程 `0 * * * *`（每小時）在 Hobby plan 違規，導致 deploy 失敗、auto-deploy 不會觸發。改為 `0 1 * * *`（每天 01:00 UTC，台北 09:00）。

### Removed
- `scripts/migrate.mjs` 與 `migrations/001_init.sql`（schema 已建好；要重建可從 git history 找回）
- `db:migrate` npm 入口

### Changed
- **Newsletter**：把訂閱系統從 Buttondown 換成 Resend + Vercel Postgres 自架方案。
  - 訂閱者寫進 `subscribers` 表，不再依賴 Buttondown API
  - 確認信、新文章通知由 Resend 寄出（React Email 模板）
  - `/api/notify-new-articles` 配 Vercel Cron 每天 01:00 UTC（台北 09:00）跑，靠 `sent_articles` PK 確保不重寄
  - 新增 `/api/confirm`、`/api/unsubscribe`、`/unsubscribed` 落地頁
  - EmailSubscribe 元件加 honeypot

### Added
- `npm run subscribers` 本地腳本：列出 Postgres 訂閱者名單（支援 `--all` / `--pending` / `--csv`）
- `CHANGELOG.md`（這個檔）
- `docs/setup-newsletter.md`：newsletter 部署設定步驟

### Removed
- 所有 Buttondown 相關殘留：`scripts/migrate-buttondown.mjs`、`newsletter-emails.md`、`BUTTONDOWN_API_KEY` env
- `src/lib/newsletter-tracker.ts`（被 `sent_articles` 表取代）

---

## 2026-05-13

### Added
- 文章「What a wonderful world」：母親節長大反思

### Changed
- 重寫 About 頁，對齊英文 CV [waynting.github.io](https://waynting.github.io/) 內容
- 回到 minimal Editorial 設計（先前太重的版本退回）
- `/blog` 改用 Medium 風格 coverImage 卡片
- frontmatter `coverImage` 在文章 body 無本地圖時也會處理

### Fixed
- NB 990v6 文章 coverImage 中文路徑改用 URL-encoded

---

## 2026-05-04 — Editorial Brutalist B&W 大改版（PR #2）

### Changed
- 首頁與 `/blog` 套用 Editorial Brutalist B&W grammar
- About、Projects、Photos 改成 newspaper layout
- 首頁 ASCII portrait slot 加入 daily-rotating R2 cover photo
- ABConvert mention 連到 abconvert.io
- 移除 EDITOR tagline，改為純 Wei-Ting Liu
- `/Now` 區塊更新近況與閱讀清單

### Fixed
- ASCII slot 在亮色照片上不可見的問題
- 暗色模式下 ASCII slot、/Now、Editor's Pick 不可見
- ASCII slot 改用 cover-fit，移除 letterbox
- 首頁改用 `public/LIU_0457.jpg` 取代空白 ASCII portrait

### Removed
- 暫時下架 newsletter / email subscribe（5/19 重新上線）

---

## 2026-05-03

### Added
- 文章 header 緊湊化 + prev/next 文章導覽

---

## 2026-04-24

### Changed
- 自架 Noto Sans TC 字型，移除舊版 JS polyfill

---

## 2026-04-12

### Added
- RSS 與 Atom feed 自動偵測

### Changed
- 全站改為繁體中文（zh-TW）
- 修正 Camera Float 子網域 routing

---

## 2026-04-09

### Changed
- `/photos` 重新設計為攝影師作品集：albums、EXIF、admin 上傳介面

---

## 2026-04-08

### Fixed
- 修正 Google Search Console 上 182 個 404 — 加入完整 redirects

---

## 2026-03-28 ~ 2026-03-31

### Added
- `/projects` 頁面
- Google Analytics 4 事件追蹤
- SEO 改善（meta description、Open Graph）

### Changed
- Photo 最佳化（WebP、lazy load）
- Navigation icon 修正

---

## 2026-03-13 ~ 2026-03-15

### Changed
- 簡化分類系統（合併 `reading-notes`/`film-review` → `notes`、`city-walk`/`travel` → `travel-notes`）
- SEO 與 photo upload 修正

---

## 2026-03-02 ~ 2026-03-05

### Added
- 程式碼區塊複製按鈕、syntax highlighting

### Fixed
- 暗色模式文字顏色
- 文章間距與排版
- 文章 frontmatter 時間 / summary 校正
- Tags 精簡
