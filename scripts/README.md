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

## newsletter:send

```bash
npm run newsletter:send -- --slug "YYYY/MM/slug"
```

發送電子報通知。詳細選項（自訂標題、內容、強制重送）請參考 [docs/writing-guide.md](../docs/writing-guide.md#發送電子報)。
