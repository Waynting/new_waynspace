# 照片畫廊部署指南

本文檔說明如何將 Photo_web 照片畫廊部署到主站的 `/photos` 路徑下。

## 📋 前置條件

- ✅ 主站已部署在 Vercel (`https://waynspace.com`)
- ✅ 照片已上傳到 Cloudflare R2 (`blog-post` bucket)
- ✅ 擁有 Vercel 帳號和 GitHub 倉庫訪問權限
- ✅ 已配置 Cloudflare R2 憑證

## 🎯 部署架構

```
主站 (Vercel)                照片畫廊 (Vercel)
waynspace.com        →      photos.waynspace.com (或獨立專案)
    ↓                              ↓
    └─ /photos  ──重寫──→    basePath: '/photos'
```

## 🚀 部署方式選擇

### 方式 A: 子域名部署（推薦）

照片畫廊部署到 `photos.waynspace.com`，主站通過 DNS/代理指向。

**優點**：
- 獨立部署，互不影響
- 構建速度快
- 易於維護和更新

**缺點**：
- 需要配置額外的子域名
- SEO 可能分散

### 方式 B: 路徑重寫部署

照片畫廊獨立部署，主站通過 Vercel Rewrites 將 `/photos` 代理到照片畫廊。

**優點**：
- 統一域名 `waynspace.com/photos`
- 更好的 SEO
- 用戶體驗連貫

**缺點**：
- 需要在兩個 Vercel 專案間配置重寫
- 輕微的額外網絡延遲

---

## 📝 方式 A：子域名部署（推薦）

### 步驟 1：準備照片畫廊專案

```bash
# 進入照片畫廊目錄
cd Photo_web

# 安裝依賴
pnpm install

# 構建照片索引（需要 R2 憑證）
pnpm run build:manifest

# 本地測試
pnpm dev
# 訪問 http://localhost:1924/photos
```

### 步驟 2：部署到 Vercel

#### 2.1 通過 CLI 部署

```bash
cd Photo_web

# 登入 Vercel
vercel login

# 初始化專案（首次部署）
vercel

# 按照提示操作：
# - Set up and deploy? Yes
# - Which scope? 選擇你的帳號/團隊
# - Link to existing project? No
# - Project name? waynspace-photos（或其他名稱）
# - In which directory is your code located? ./
# - Override settings? Yes
#   - Build Command: cd apps/ssr && pnpm run build:next
#   - Output Directory: apps/ssr/.next
#   - Install Command: pnpm install

# 生產部署
vercel --prod
```

#### 2.2 通過 Vercel Dashboard 部署

1. **登入 Vercel Dashboard**
   - 訪問 [vercel.com](https://vercel.com)
   - 點擊 "Add New Project"

2. **導入 GitHub 倉庫**
   - 選擇你的 GitHub 倉庫
   - 點擊 "Import"

3. **配置專案設置**
   ```
   Framework Preset: Next.js
   Root Directory: Photo_web
   Build Command: cd apps/ssr && pnpm run build:next
   Output Directory: apps/ssr/.next
   Install Command: pnpm install
   ```

4. **設置環境變數**

   點擊 "Environment Variables"，添加以下變數：

   ```
   AWS_ACCESS_KEY_ID=<你的 R2 Access Key>
   AWS_SECRET_ACCESS_KEY=<你的 R2 Secret Key>
   CF_ACCOUNT_ID=<你的 Cloudflare Account ID>
   R2_BUCKET=blog-post
   R2_BASE_URL=https://img.waynspace.com
   ```

5. **部署**
   - 點擊 "Deploy"
   - 等待構建完成（約 3-5 分鐘）

### 步驟 3：配置自定義域名

#### 3.1 在 Vercel 添加域名

1. 進入照片畫廊專案的 Settings → Domains
2. 添加域名：`photos.waynspace.com`
3. Vercel 會提供 DNS 配置指示

#### 3.2 在 Cloudflare DNS 配置

1. 登入 Cloudflare Dashboard
2. 選擇 `waynspace.com` 域名
3. 進入 DNS 設置
4. 添加 CNAME 記錄：
   ```
   Type: CNAME
   Name: photos
   Target: cname.vercel-dns.com
   Proxy status: DNS only (灰色雲朵)
   TTL: Auto
   ```

5. 保存後等待 DNS 傳播（通常 1-5 分鐘）

#### 3.3 驗證部署

訪問 `https://photos.waynspace.com` 確認照片畫廊正常運行。

### 步驟 4：更新主站配置

編輯主站的 `src/config/navigation.ts`（已完成）：

```typescript
{
  name: 'Photos',
  href: 'https://photos.waynspace.com',  // 指向子域名
  icon: '📷',
  description: 'Photo Gallery'
}
```

或保持現有配置（`href: '/photos'`），然後在主站添加重定向：

在主站的 `next.config.ts` 添加：

```typescript
async redirects() {
  return [
    {
      source: '/photos/:path*',
      destination: 'https://photos.waynspace.com/:path*',
      permanent: false,
    },
  ]
}
```

---

## 📝 方式 B：路徑重寫部署

### 步驟 1-2：同方式 A

按照方式 A 的步驟 1-2 完成照片畫廊的 Vercel 部署。

### 步驟 3：配置主站路徑重寫

#### 3.1 在主站 `next.config.ts` 添加重寫規則

編輯主站的 `next.config.ts`：

```typescript
const nextConfig = {
  // ... 其他配置

  async rewrites() {
    return [
      {
        source: '/photos',
        destination: 'https://your-photo-vercel-url.vercel.app/photos',
      },
      {
        source: '/photos/:path*',
        destination: 'https://your-photo-vercel-url.vercel.app/photos/:path*',
      },
    ]
  },
}
```

**重要**：將 `your-photo-vercel-url.vercel.app` 替換為照片畫廊的實際 Vercel URL。

#### 3.2 或使用 `vercel.json` 配置

在主站根目錄創建或編輯 `vercel.json`：

```json
{
  "rewrites": [
    {
      "source": "/photos/:path*",
      "destination": "https://your-photo-vercel-url.vercel.app/photos/:path*"
    }
  ]
}
```

### 步驟 4：重新部署主站

```bash
cd /path/to/main-site
git add .
git commit -m "Add photo gallery rewrite"
git push
```

Vercel 會自動觸發部署。

### 步驟 5：驗證

訪問 `https://waynspace.com/photos` 確認照片畫廊正常運行。

---

## 🔧 環境變數配置

### Vercel Dashboard 配置

1. 進入照片畫廊專案
2. Settings → Environment Variables
3. 添加以下變數（適用於所有環境：Production、Preview、Development）：

| 變數名 | 值 | 說明 |
|--------|-----|------|
| `AWS_ACCESS_KEY_ID` | `<your-key>` | Cloudflare R2 Access Key |
| `AWS_SECRET_ACCESS_KEY` | `<your-secret>` | Cloudflare R2 Secret Key |
| `CF_ACCOUNT_ID` | `<account-id>` | Cloudflare Account ID |
| `R2_BUCKET` | `blog-post` | R2 Bucket 名稱 |
| `R2_BASE_URL` | `https://img.waynspace.com` | 圖片 CDN URL |
| `R2_PREFIX` | `blog-post` | （可選）Bucket 前綴 |
| `NODE_ENV` | `production` | Node 環境 |

### 本地開發 `.env` 文件

在 `Photo_web/.env` 創建：

```bash
# Cloudflare R2 配置
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
CF_ACCOUNT_ID=your_cloudflare_account_id
R2_BUCKET=blog-post
R2_BASE_URL=https://img.waynspace.com
R2_PREFIX=blog-post
RCLONE_REMOTE=r2

# 可選
PG_CONNECTION_STRING=
GIT_TOKEN=
```

---

## 📸 照片管理流程

### 上傳照片到 R2

#### 方法 1：使用 rclone（推薦）

```bash
# 配置 rclone（首次）
rclone config

# 上傳照片
rclone copy /path/to/photos/ r2:blog-post/personal-photos/ --progress

# 或使用環境變數中的 remote
rclone copy /path/to/photos/ ${RCLONE_REMOTE}:blog-post/personal-photos/ --progress
```

#### 方法 2：使用 Cloudflare Dashboard

1. 登入 Cloudflare Dashboard
2. R2 → 選擇 `blog-post` bucket
3. 進入 `personal-photos/` 目錄
4. 點擊 "Upload" 上傳照片

### 構建照片索引

上傳照片後，需要重新構建 manifest：

```bash
cd Photo_web

# 本地構建
pnpm run build:manifest

# 或在 Vercel 部署時自動構建（需配置）
```

### 觸發重新部署

照片索引更新後，需要重新部署：

```bash
# 方式 1：通過 Git 提交觸發
git add .
git commit -m "Update photo manifest"
git push

# 方式 2：通過 Vercel CLI
vercel --prod

# 方式 3：在 Vercel Dashboard 手動觸發
# Deployments → 點擊 "Redeploy"
```

---

## 🔍 故障排除

### 問題 1：照片無法顯示

**原因**：R2 CORS 配置問題

**解決方案**：

```bash
# 配置 R2 CORS
wrangler r2 bucket cors put blog-post --file Photo_web/r2-cors-config.json
```

確保 `r2-cors-config.json` 包含：

```json
[
  {
    "AllowedOrigins": [
      "https://waynspace.com",
      "https://photos.waynspace.com",
      "http://localhost:1924"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### 問題 2：404 Not Found on `/photos`

**原因**：basePath 配置或重寫規則問題

**解決方案**：

1. 檢查 `Photo_web/apps/ssr/next.config.mjs` 中的 `basePath: '/photos'`
2. 如使用重寫，確認主站配置正確
3. 清除緩存並重新部署：
   ```bash
   cd Photo_web/apps/ssr
   rm -rf .next
   cd ../..
   vercel --prod --force
   ```

### 問題 3：構建失敗

**常見錯誤**：依賴安裝失敗、環境變數缺失

**解決方案**：

1. 檢查 Vercel 構建日誌
2. 確認所有環境變數已設置
3. 檢查 `package.json` 和 `pnpm-lock.yaml`
4. 嘗試無緩存構建：
   ```bash
   vercel --prod --force
   ```

### 問題 4：返回主站按鈕無效

**原因**：`config.json` 中的 `author.url` 配置錯誤

**解決方案**：

確認 `Photo_web/config.json`：

```json
{
  "author": {
    "url": "https://waynspace.com"
  }
}
```

---

## 🔄 更新流程

### 更新照片內容

```bash
# 1. 上傳新照片到 R2
rclone copy /new/photos/ r2:blog-post/personal-photos/ --progress

# 2. 本地重新構建 manifest
cd Photo_web
pnpm run build:manifest

# 3. 提交並部署
git add .
git commit -m "Add new photos"
git push
```

### 更新代碼或配置

```bash
# 1. 修改代碼
# 2. 本地測試
cd Photo_web
pnpm dev

# 3. 提交並部署
git add .
git commit -m "Update photo gallery config"
git push
```

### 強制重新部署

```bash
# 不改動代碼，只觸發重新部署
vercel --prod --force

# 或在 Vercel Dashboard
# Deployments → 最新部署 → ⋮ → Redeploy
```

---

## 📊 性能優化建議

### 1. 啟用 Vercel Edge Caching

確保靜態資源和圖片被正確緩存：

```typescript
// Photo_web/apps/ssr/next.config.mjs
export default {
  // ...
  headers: async () => [
    {
      source: '/:all*(svg|jpg|jpeg|png|webp|gif)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
}
```

### 2. 使用 R2 自定義域名

配置 R2 自定義域名可以獲得更好的性能和 CDN 加速：

1. 在 Cloudflare R2 Dashboard 配置自定義域名
2. 更新 `Photo_web/builder.config.json`：
   ```json
   {
     "storage": {
       "customDomain": "https://img.waynspace.com"
     }
   }
   ```

### 3. 圖片優化

確保上傳到 R2 的圖片已優化：

```bash
# 使用 Sharp 批量壓縮
npm install -g sharp-cli
sharp -i input/ -o output/ -w 1920 -q 85 --format webp
```

---

## 📚 相關文檔

- [Photo_web/DEPLOYMENT.md](Photo_web/DEPLOYMENT.md) - 照片畫廊詳細部署文檔
- [Photo_web/README.md](Photo_web/README.md) - Afilmory 項目說明
- [CLAUDE.md](CLAUDE.md) - 主站項目說明
- [Vercel 文檔](https://vercel.com/docs)
- [Cloudflare R2 文檔](https://developers.cloudflare.com/r2/)

---

## ✅ 部署檢查清單

部署前確認：

- [ ] R2 bucket 已創建並配置正確
- [ ] 照片已上傳到 `blog-post/personal-photos/`
- [ ] R2 CORS 已配置
- [ ] 環境變數已在 Vercel 設置
- [ ] `Photo_web/config.json` 配置正確
- [ ] `basePath: '/photos'` 已設置
- [ ] 本地測試通過（`pnpm dev`）
- [ ] 主站導航連結已添加
- [ ] 返回主站按鈕已配置

部署後驗證：

- [ ] `https://waynspace.com/photos` 或 `https://photos.waynspace.com` 可正常訪問
- [ ] 照片正常載入顯示
- [ ] 主站導航 "Photos" 連結正常
- [ ] 照片畫廊 "Back to Main Site" 按鈕正常
- [ ] 手機端顯示正常
- [ ] 圖片 EXIF 信息顯示正常
- [ ] 照片篩選和排序功能正常

---

**部署完成！** 🎉

如有問題，請查閱故障排除章節或聯繫技術支持。
