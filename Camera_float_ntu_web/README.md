# 相機流浪計畫 Gallery

一個簡約的照片畫廊網站，展示「相機流浪計畫 台大Ver.」的照片，支援 EXIF 資訊顯示和資料夾分頁瀏覽。

## 技術棧

- **框架**: Next.js 14+ (App Router)
- **UI 庫**: Shadcn UI
- **存儲**: Cloudflare R2
- **EXIF 讀取**: exifr
- **樣式**: Tailwind CSS
- **語言**: TypeScript

## 功能特色

- 📸 One-Page 照片畫廊展示（網格聚焦風格）
- 📁 自動掃描 Cloudflare R2 中的資料夾
- 🎨 多種照片布局：瀑布流、錯位網格、輪播
- 📊 EXIF 資訊顯示（拍攝日期、相機型號、鏡頭、ISO、光圈、快門速度）
- 📱 響應式設計（移動端側邊欄變為下拉菜單）
- 👥 訪客統計顯示（左下角）
- 🎯 動態資料夾選擇（側邊欄/下拉菜單）
- 💾 布局偏好保存到本地存儲

## 專案結構

```
camera-float-ntu-web/
├── app/
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # Landing page
│   ├── folder/
│   │   └── [folderName]/
│   │       └── page.tsx        # 資料夾照片列表頁
│   └── api/
│       ├── folders/route.ts    # API: 獲取所有資料夾列表
│       ├── photos/route.ts     # API: 獲取指定資料夾的照片列表
│       └── exif/route.ts       # API: 獲取照片 EXIF 資訊
├── components/
│   ├── ui/                     # Shadcn UI 組件
│   ├── gallery/                # 畫廊相關組件
│   └── landing/                # Landing page 組件
├── lib/
│   ├── r2.ts                   # Cloudflare R2 客戶端配置
│   ├── exif.ts                 # EXIF 讀取工具函數
│   └── utils.ts                # 工具函數
└── types/
    └── index.ts                # TypeScript 類型定義
```

## 環境變數設置

在專案根目錄創建 `.env.local` 文件，並設置以下環境變數：

```env
R2_ACCOUNT_ID=your_account_id
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your_bucket_name.your_account_id.r2.cloudflarestorage.com
```

**可選配置**（如果需要列出文件功能）：
```env
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
```

**部署配置**（如果部署在子路徑）：
```env
# 如果部署在子路徑（如 https://www.waynspace.com/camera-float-ntu），需要設置：
NEXT_PUBLIC_BASE_PATH=/camera-float-ntu
NEXT_PUBLIC_BASE_URL=https://www.waynspace.com

# 如果 R2 bucket 中有路徑前綴（如 camera-float-ntu/），需要設置：
R2_BUCKET_PREFIX=camera-float-ntu/
```

**訪客計數器配置**（可選）：
```env
# 設置初始訪客數（默認為 0）
VISITOR_COUNT_INITIAL=100
```

詳細的訪客計數器設置說明請參考 [VISITOR_COUNTER_SETUP.md](./docs/VISITOR_COUNTER_SETUP.md)

**重要提示 - 本地開發**：
- 本地開發時**不要設置** `NEXT_PUBLIC_BASE_PATH` 環境變數
- 本地開發時訪問 `http://localhost:3000/` 即可
- `NEXT_PUBLIC_BASE_PATH` 只在部署到子路徑時才需要設置
- 如果設置了 `NEXT_PUBLIC_BASE_PATH`，需要訪問 `http://localhost:3000/camera-float-ntu/` 才能看到頁面

### 獲取 Cloudflare R2 配置

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 前往 **R2** > 選擇你的 Bucket
3. 複製 Account ID 和 Bucket Name
4. 如果 Bucket 是公開的，設置公開 URL（格式：`https://your_bucket_name.your_account_id.r2.cloudflarestorage.com`）
5. 如果需要列出文件功能，前往 **R2** > **Manage R2 API Tokens** 創建 API Token
6. 將照片上傳到 `camera-float-ntu/[folderName]/` 路徑下

## 安裝與運行

### 安裝依賴

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 開發模式

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

打開 [http://localhost:3000](http://localhost:3000) 查看網站。

### 生成照片清单（性能优化）

为了提升照片加载性能，可以预生成照片清单 JSON 文件：

```bash
npm run generate:photos
```

这个脚本会：
1. 扫描所有 R2 bucket 中的文件夹
2. 获取每个文件夹的照片列表
3. 为每张照片生成 URL
4. 生成 `public/photos-manifest.json` 文件

**注意**：
- 照片清单生成后，API 会优先使用 JSON 文件，大幅提升加载速度
- 如果添加了新照片，需要重新运行此脚本更新清单
- 如果 JSON 文件不存在，系统会自动回退到 R2 API（向后兼容）

### 建置生產版本

```bash
npm run build
npm run start
# 或
yarn build
yarn start
# 或
pnpm build
pnpm start
```

## 使用說明

### 照片路徑結構

照片應該按照以下結構存儲在 Cloudflare R2 中：

```
camera-float-ntu/
├── Ver -1/
│   ├── photo1.jpg
│   ├── photo2.jpg
│   └── ...
├── Ver -2/
│   ├── photo1.jpg
│   └── ...
└── ...
```

### 分頁格式

資料夾頁面的分頁使用 `Ver-1.X` 格式，其中 X 是頁碼。例如：
- 第 1 頁：`Ver-1.1`
- 第 2 頁：`Ver-1.2`
- 第 3 頁：`Ver-1.3`

### EXIF 資訊

點擊照片可以查看詳細的 EXIF 資訊，包括：
- 拍攝日期
- 相機型號
- 鏡頭型號
- ISO
- 光圈值
- 快門速度
- 焦距

## 部署

### 快速部署

詳細的部署指南請參考 [DEPLOYMENT.md](./DEPLOYMENT.md)

#### Vercel 部署（推薦）

1. 將專案推送到 GitHub
2. 在 [Vercel](https://vercel.com/) 中導入專案
3. 設置環境變數：
   - `R2_ACCOUNT_ID` - Cloudflare R2 Account ID
   - `R2_BUCKET_NAME` - R2 Bucket 名稱
   - `R2_PUBLIC_URL` - R2 公開 URL
   - `R2_ACCESS_KEY_ID` - R2 API 密鑰（可選，如果需要列出文件）
   - `R2_SECRET_ACCESS_KEY` - R2 API 密鑰（可選，如果需要列出文件）
   - `NEXT_PUBLIC_BASE_PATH` - 如果部署在子路徑，設置為 `/camera-float-ntu`（可選）
   - `NEXT_PUBLIC_BASE_URL` - 如果部署在子路徑，設置為主站 URL（可選）
   - `R2_BUCKET_PREFIX` - 如果 R2 bucket 中有路徑前綴，設置為 `camera-float-ntu/`（可選）
   - `VISITOR_COUNT_INITIAL` - 設置初始訪客數（可選，默認為 0）
4. 點擊部署

#### 子路徑部署

如果部署到主站下的子路徑（例如 `waynspace.com/camera-drift-ntu`）：

1. 設置環境變數：`NEXT_PUBLIC_BASE_PATH=/camera-drift-ntu`
2. 構建應用：`npm run build`
3. 配置反向代理（參考 `DEPLOYMENT.md`）

#### 其他平台

此專案可以部署到任何支援 Next.js 的平台，如：
- Vercel（推薦）
- Netlify
- Cloudflare Pages
- 自託管 Node.js 服務器
- Docker

### 部署檢查清單

部署前請參考 [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) 確認所有項目都已準備完成。

## 開發注意事項

1. **環境變數**: 確保所有必要的環境變數都已設置
2. **R2 權限**: 確保 R2 API Token 有讀取權限
3. **照片格式**: 支援 JPG、JPEG、PNG、GIF、WEBP、HEIC、HEIF 格式
4. **EXIF 讀取**: EXIF 資訊在點擊照片時才會載入，以提升性能

## 授權

此專案為「相機流浪計畫 台大Ver.」專案的一部分。

## 聯絡方式

如有問題或建議，請聯繫專案維護者。

