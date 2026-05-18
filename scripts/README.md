# Scripts

本目錄包含圖片處理與電子報相關腳本。完整寫作與發布流程請參考 [docs/writing-guide.md](../docs/writing-guide.md)。

---

## images:process

```bash
npm run images:process
```

自動處理本地圖片：掃描文章中的相對路徑圖片，轉換為 WebP，上傳到 R2，更新文章路徑，刪除本地檔案。支援快取避免重複上傳。

需要環境變數：`CF_ACCOUNT_ID`、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY`

---

## images:verify

```bash
npm run images:verify
```

驗證文章中的圖片 URL 是否對應到 R2 上的實際檔案，列出缺失的圖片。

---

## images:delete-spaces

```bash
npm run images:delete-spaces
```

刪除 R2 上檔名包含空格的檔案。

---

## images:update

```bash
npm run images:update
```

批量更新文章中的相對圖片路徑為 R2 CDN URL。僅更新路徑，不上傳圖片。

---

## images:publish（舊版）

```bash
npm run images:publish
```

從 `source/_posts/` 上傳圖片到 R2，適用於舊的 Hexo 目錄結構。需要 rclone。一般情況請使用 `images:process`。

---

## test:r2

```bash
npm run test:r2
```

測試 R2 連線、rclone 配置、環境變數與上傳功能。

---

## db:migrate

```bash
npm run db:migrate
```

依序執行 `migrations/*.sql`（單一 transaction）。建立 `subscribers` 與 `sent_articles` 兩張表。每個 migration 都用 `IF NOT EXISTS`，可重複跑。

需要環境變數：`POSTGRES_URL`（執行 `vercel env pull .env.local` 取得）

---

## subscribers

```bash
npm run subscribers              # 預設：已確認訂閱者
npm run subscribers -- --all     # 全部（含待確認 / 退訂）
npm run subscribers -- --pending # 只看尚未確認
npm run subscribers -- --csv     # 輸出 CSV
```

從 Vercel Postgres 列出電子報訂閱者，並顯示 已確認 / 待確認 / 退訂 / 總計 統計。`--all` 與 `--pending` 互斥，若同時指定 `--all` 優先。

需要環境變數：`POSTGRES_URL`

---

## portfolio:upload

```bash
npm run portfolio:upload
```

上傳 `public/portfolio/` 內的照片到 R2 的 `personal-photos/` 路徑，供 `/photos` 頁面使用。會讀取 EXIF metadata。

需要環境變數：`CF_ACCOUNT_ID`、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY`、`R2_BUCKET`

---

## portfolio:migrate

```bash
npm run portfolio:migrate
```

一次性把舊的照片 metadata 結構搬到新格式（按 albums 分組）。

---

## 新增腳本時的慣例

1. 檔案放在 `scripts/`，副檔名 `.mjs`，shebang `#!/usr/bin/env node`。
2. dotenv 載入順序：`.env.local` → `.env`（見 `scripts/migrate.mjs`）。
3. `package.json` 加入對應 `scripts` 入口。
4. **這份 README 加上一個區塊**：用法、說明、需要的環境變數。
