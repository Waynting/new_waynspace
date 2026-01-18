# 寫作指南

快速指南：如何撰寫和發布文章

## 📝 快速開始

### 1. 創建文章

在 `content/YYYY/MM/` 下創建 `.md` 文件：

```bash
content/2026/01/我的新文章.md
```

### 2. Frontmatter 格式

每篇文章開頭必須包含：

```markdown
---
title: 文章標題
date: 2026-01-15T00:00:00.000Z
tags:
  - 標籤1
  - 標籤2
categories:
  - 分類名稱
slug: article-slug
coverImage: 'https://img.waynspace.com/2026/01/文章-slug/image.webp'
author:
  name: Wei-Ting Liu
  email: wayntingliu@gmail.com
seo:
  metaDescription: 文章摘要（用於 SEO）
  keywords:
    - 關鍵字1
    - 關鍵字2
summary: >-
  文章摘要（用於卡片顯示）
---
```

**必填欄位：**
- `title` - 文章標題
- `date` - 發布日期（ISO 格式）
- `categories` - 分類（第一個為主分類）
- `summary` - 文章摘要（用於卡片顯示）

### 3. 圖片處理

**推薦方式：**

1. 將圖片放在文章同目錄下
2. 使用相對路徑：`![說明](./image.jpg)`
3. 執行：`npm run images:process`

腳本會自動：
- ✅ 轉換為 WebP 格式
- ✅ 上傳到 R2 CDN
- ✅ 更新文章中的路徑
- ✅ 刪除本地圖片

## 📂 文章分類

### 常用分類

| 分類名稱 | 英文代碼 | 說明 |
|---------|---------|------|
| 台大資管生活 | `ntu-life` | 台大資管相關生活、課程心得 |
| 生活日誌 | `personal-journal` | 日常生活記錄、週記 |
| 科學班生活 | `science-class-journal` | 科學班相關回憶 |
| 技術筆記 | `tech-notes` | 技術相關文章 |
| 城市漫步 | `city-walk` | 城市探索、攝影 |
| 攝影筆記 | `photography-notes` | 攝影作品與心得 |
| 讀書筆記與心得 | `reading-notes` | 閱讀心得 |

### 常用標籤

- `daily-notes` - 日常記錄
- `uni-life` - 大學生活
- `course-review` - 課程心得

## 🖼️ 圖片上傳

### 自動處理（推薦）

```bash
# 1. 將圖片放在文章同目錄
content/2026/01/文章-slug/
├── 文章-slug.md
├── image1.jpg
└── image2.png

# 2. 在文章中使用相對路徑
![圖片](./image1.jpg)

# 3. 執行處理腳本
npm run images:process
```

### 圖片 URL 格式

處理後的圖片 URL：
```
https://img.waynspace.com/YYYY/MM/article-slug/image.webp
```

## 📋 發布流程

1. **撰寫文章** → `content/YYYY/MM/文章.md`
2. **處理圖片** → `npm run images:process`
3. **本地測試** → `npm run dev`
4. **提交 Git** → `git add . && git commit && git push`

## ❓ 常見問題

**Q: 圖片顯示不出來？**
- 確認已執行 `npm run images:process`
- 檢查圖片 URL 是否正確

**Q: 文章沒有顯示？**
- 確認 frontmatter 格式正確
- 確認檔案路徑：`content/YYYY/MM/文章.md`
- 重新啟動開發伺服器

**Q: 如何修改已發布的文章？**
- 直接編輯 `content/` 下的 `.md` 檔案
- 提交更改後自動重新部署

---

**詳細說明：**
- 圖片上傳詳情 → `圖片上傳指南.md`
- 完整寫作規範 → `如何撰寫文章.md`
