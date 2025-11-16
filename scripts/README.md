# Scripts 說明

本目錄包含用於管理博客內容和圖片的腳本。

## 📋 腳本列表

### `process-local-images.mjs` ⭐ 推薦

**功能**：自動處理本地圖片並上傳到 R2

- 掃描所有 Markdown 文件中的本地圖片路徑（`file://`、絕對路徑或相對路徑）
- 自動轉換為 WebP 格式並壓縮
- 上傳到 Cloudflare R2
- 自動替換文章中的路徑為 CDN URL
- 支援快取，避免重複上傳

**使用方式**：
```bash
npm run images:process
```

**環境變數**：
- `CF_ACCOUNT_ID` - Cloudflare Account ID
- `R2_ACCESS_KEY_ID` - R2 API Access Key ID
- `R2_SECRET_ACCESS_KEY` - R2 API Secret Access Key
- `R2_BUCKET` - R2 Bucket 名稱（預設：`your-bucket-name`）
- `R2_BASE_URL` - CDN 基礎 URL（預設：`https://your-cdn-domain.com`）

---

### `update-content-images.mjs`

**功能**：更新文章中的圖片路徑為 R2 URL

- 掃描 `content/` 目錄下的所有 Markdown 文件
- 將相對路徑（如 `images/photo.jpg`）替換為完整的 R2 URL
- 自動將圖片路徑轉換為 `.webp` 格式

**使用方式**：
```bash
npm run images:update
```

**環境變數**：
- `R2_BASE_URL` - CDN 基礎 URL（預設：`https://your-cdn-domain.com`）
- `R2_PREFIX` - R2 路徑前綴（預設：`blog`）

---

### `publish-images-to-r2.mjs`

**功能**：從 `source/_posts/` 上傳圖片到 R2（舊版，適用於 Hexo 結構）

- 掃描 `source/_posts/` 目錄下的文章
- 找到有同名資料夾的文章（包含圖片）
- 使用 rclone 上傳圖片到 R2
- 更新文章中的圖片路徑

**使用方式**：
```bash
npm run images:publish
```

**環境變數**：
- `CF_ACCOUNT_ID` - Cloudflare Account ID
- `R2_BUCKET` - R2 Bucket 名稱（預設：`your-bucket-name`）
- `R2_BASE_URL` - CDN 基礎 URL（預設：`https://your-cdn-domain.com`）
- `R2_PREFIX` - R2 路徑前綴（預設：`blog`）
- `RCLONE_REMOTE` - rclone 遠端名稱（預設：`r2`）

**注意**：需要先配置 rclone：
```bash
rclone config
```

---

### `verify-r2-images.mjs`

**功能**：驗證文章中的圖片路徑是否正確

- 掃描所有文章中的圖片 URL
- 檢查 R2 上是否存在對應的圖片
- 顯示缺失的圖片列表

**使用方式**：
```bash
npm run images:verify
```

**環境變數**：
- `R2_BASE_URL` - CDN 基礎 URL（預設：`https://your-cdn-domain.com`）
- `R2_PREFIX` - R2 路徑前綴（預設：`blog`）
- `R2_BUCKET` - R2 Bucket 名稱（預設：`blog-post`）
- `RCLONE_REMOTE` - rclone 遠端名稱（預設：`r2`）

---

### `test-r2-config.mjs`

**功能**：測試 R2 配置是否正確

- 檢查 rclone 是否已安裝
- 檢查 rclone 遠端配置
- 檢查能否訪問 R2 bucket
- 檢查環境變數配置
- 測試上傳功能

**使用方式**：
```bash
npm run test:r2
```

**環境變數**：
- `R2_BUCKET` - R2 Bucket 名稱（預設：`your-bucket-name`）
- `R2_BASE_URL` - CDN 基礎 URL（預設：`https://your-cdn-domain.com`）
- `R2_PREFIX` - R2 路徑前綴（預設：`blog`）
- `RCLONE_REMOTE` - rclone 遠端名稱（預設：`r2`）

---

## 📁 archived/ 目錄

`archived/` 目錄包含已棄用的腳本，僅供參考：
- `migrate-posts.mjs` - 文章遷移腳本
- `move-r2-images-to-root.mjs` - R2 圖片移動腳本
- `reorganize-r2-images.mjs` - R2 圖片重組腳本
- `sync-from-hexo.mjs` - Hexo 同步腳本

---

## 🔧 配置

所有腳本都使用環境變數進行配置。建議創建 `.env` 文件：

```env
# Cloudflare R2 配置
CF_ACCOUNT_ID=your-account-id
R2_BUCKET=your-bucket-name
R2_BASE_URL=https://your-cdn-domain.com
R2_PREFIX=blog

# R2 API 憑證（用於直接上傳）
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key

# rclone 遠端名稱（用於 rclone 上傳）
RCLONE_REMOTE=r2
```

---

## 📚 更多資訊

詳細使用說明請參考 `docs/圖片上傳指南.md`。

