# 圖標與 SEO 配置說明

## Favicon 圖標配置

網站需要以下圖標文件，請放置在 `public/` 目錄下：

### 必需的圖標文件

1. **`/public/favicon.ico`**
   - 格式：ICO 格式
   - 尺寸：16x16, 32x32（多尺寸 ICO 文件）
   - 用途：瀏覽器分頁圖標

2. **`/public/icon-16x16.png`**（可選，但推薦）
   - 格式：PNG
   - 尺寸：16x16 像素
   - 用途：小尺寸圖標

3. **`/public/icon-32x32.png`**（可選，但推薦）
   - 格式：PNG
   - 尺寸：32x32 像素
   - 用途：標準尺寸圖標

4. **`/public/apple-icon.png`**（可選，但推薦）
   - 格式：PNG
   - 尺寸：180x180 像素（Apple 推薦）
   - 用途：iOS 主畫面圖標

### 如何生成圖標

你可以使用以下工具生成圖標：

1. **線上工具**：
   - [Favicon Generator](https://realfavicongenerator.net/)
   - [Favicon.io](https://favicon.io/)
   - 上傳你的 logo 圖片，自動生成所有尺寸

2. **從現有圖片生成**：
   ```bash
   # 使用 ImageMagick（如果已安裝）
   convert your-logo.png -resize 16x16 public/icon-16x16.png
   convert your-logo.png -resize 32x32 public/icon-32x32.png
   convert your-logo.png -resize 180x180 public/apple-icon.png
   ```

### 當前配置

系統已配置為使用以下路徑：
- Favicon: `/favicon.ico`
- 圖標: `/icon-16x16.png`, `/icon-32x32.png`
- Apple 圖標: `/apple-icon.png`

如果文件不存在，瀏覽器會使用默認圖標。

## SEO 配置檢查清單

### ✅ 已配置的功能

1. **Metadata API**
   - ✅ 使用 Next.js Metadata API
   - ✅ 動態生成文章 metadata
   - ✅ 正確的 title template

2. **Open Graph**
   - ✅ 網站級 OG 標籤
   - ✅ 文章級 OG 標籤
   - ✅ OG 圖片配置

3. **Twitter Cards**
   - ✅ Summary Large Image 卡片
   - ✅ Twitter creator 標籤

4. **Structured Data (JSON-LD)**
   - ✅ 首頁：Person schema
   - ✅ 文章頁：Article schema
   - ✅ 符合 Schema.org 標準

5. **技術 SEO**
   - ✅ Sitemap.xml（動態生成）
   - ✅ Robots.txt（支援預覽環境）
   - ✅ Canonical URLs
   - ✅ 正確的語言標籤（zh-TW）

6. **Web App Manifest**
   - ✅ manifest.json 已創建
   - ✅ PWA 基本配置

### 📋 2025 SEO 最佳實踐檢查

根據 2025 年 SEO 最佳實踐，以下項目已符合：

- ✅ 使用 Next.js 16 Metadata API（最新標準）
- ✅ 結構化數據使用有效的 Schema.org 類型
- ✅ 避免使用已棄用的結構化數據類型
- ✅ 每個頁面都有唯一的 title 和 description
- ✅ 圖片都有 alt 屬性
- ✅ 正確的 robots 配置
- ✅ 動態 sitemap 生成

### ⚠️ 注意事項

1. **Favicon 緩存**
   - 瀏覽器會強制緩存 favicon
   - 更新後需要硬刷新（Ctrl+F5 / Cmd+Shift+R）
   - 或清除瀏覽器緩存

2. **圖標文件**
   - 確保所有圖標文件都存在於 `public/` 目錄
   - 如果文件不存在，系統會回退到默認圖標

3. **Structured Data 驗證**
   - 使用 [Google Rich Results Test](https://search.google.com/test/rich-results) 驗證
   - 使用 [Schema Markup Validator](https://validator.schema.org/) 檢查

## 驗證步驟

1. **檢查 Favicon**：
   ```bash
   # 訪問網站並檢查瀏覽器分頁圖標
   # 或使用瀏覽器開發工具檢查 <head> 中的 <link rel="icon">
   ```

2. **檢查 SEO**：
   - 使用 [Google Search Console](https://search.google.com/search-console)
   - 使用 [Google Rich Results Test](https://search.google.com/test/rich-results)
   - 檢查 sitemap: `https://waynspace.com/sitemap.xml`
   - 檢查 robots: `https://waynspace.com/robots.txt`

3. **檢查 Manifest**：
   - 訪問 `https://waynspace.com/manifest.json`
   - 確認 JSON 格式正確

## 相關文件

- [如何撰寫文章](./如何撰寫文章.md)
- [README.md](../README.md)
