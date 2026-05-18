# Newsletter Setup Checklist

Resend + Vercel Postgres 自架電子報。**所有程式碼已寫好**，這份是 dashboard / DNS / env 那邊要你親手完成的步驟。

依序做完即可上線。

---

## 1. 開通 Vercel Postgres

1. Vercel Dashboard → 你的專案 → **Storage** → **Create Database** → **Postgres**（現在背後是 Neon）
2. Region 選靠近你的 Vercel deploy region（建議 `iad1`/`hkg1`）
3. 建好後 Vercel 會自動把這些 env 注入到所有環境：
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`、`POSTGRES_HOST`、`POSTGRES_PASSWORD`、`POSTGRES_DATABASE`
4. 在本地拉一份：

   ```bash
   vercel env pull .env.local
   ```

5. 建立 schema（`subscribers`、`sent_articles` 兩張表）：

   現行專案的 schema 已經建好。若要在全新的 Postgres 上重建，從 git history 找 `migrations/001_init.sql`（commit `1eaa117` 之前）裡的 `CREATE TABLE` 直接執行即可。

---

## 2. 開通 Resend

1. 到 [resend.com](https://resend.com) 註冊
2. **Domains → Add Domain** → 填 `mail.waynspace.com`（用 subdomain，根網域信譽分開）
3. 它會給你 **3 筆 DNS** 要加到 Cloudflare：

   | Type | Name | Value |
   |---|---|---|
   | TXT | `mail` | `v=spf1 include:_spf.resend.com ~all` |
   | CNAME | `resend._domainkey.mail` | `resend._domainkey.resend.com` |
   | TXT | `_dmarc.mail`（建議）| `v=DMARC1; p=none; rua=mailto:wayntingliu@gmail.com` |

4. 等 Resend dashboard 顯示 **Verified**（通常 10 分鐘內，最久 24 小時）
5. **API Keys → Create API Key** → 全權限 → 複製
6. 把這個 key 設為 `RESEND_API_KEY`（Vercel + `.env.local`）

---

## 3. 設定其餘 env 變數

在 Vercel Dashboard → Settings → Environment Variables 加入：

```
RESEND_API_KEY=re_xxx                           # 第 2 步拿到
MAIL_FROM=Wayn <hi@mail.waynspace.com>
MAIL_REPLY_TO=wayntingliu@gmail.com
SITE_URL=https://waynspace.com
NEWSLETTER_SECRET=<openssl rand -hex 32>        # 手動觸發 notify 用
```

`CRON_SECRET` Vercel 會自動生成 + 注入 cron 請求的 `Authorization` header，**你不用手動加**。

本地測試時把同樣的 vars 複製到 `.env.local`（或 `vercel env pull .env.local` 拉下來）。

---

## 4. 部署 + 驗證

```bash
git push   # 觸發 Vercel deploy
```

部署完跑這些驗證：

1. **訂閱表單**：到 https://waynspace.com，填一個你自己的 email → 確認收到確認信 → 點連結 → 跳轉到 `/subscribed`
2. **DB 確認**：
   ```bash
   vercel env pull .env.local
   psql $POSTGRES_URL -c "SELECT email, confirmed_at FROM subscribers;"
   ```
3. **DRY-RUN 寄信**：手動呼叫 notify（不會真的寄）：
   ```bash
   curl -X POST "https://waynspace.com/api/notify-new-articles?dryRun=1" \
        -H "Authorization: Bearer $NEWSLETTER_SECRET"
   ```
   會回傳哪些文章會被寄、有多少收件人。
4. **真正寄一篇文章**：拿掉 `?dryRun=1`。或者直接等 cron 跑（每日 01:00 UTC，台北 09:00）。

---

## 5. 平常運作

寫完新文章 commit + push 後：

- **Vercel Cron 每天 01:00 UTC（台北 09:00）自動檢查一次**，看到 `/content/` 有沒有「沒寄過」的文章，自動寄給所有確認訂閱者。Hobby plan 限制每天最多一次，要更密就升 Pro。
- 寄過的會記在 `sent_articles`，**保證不會重複寄**
- 想立刻寄而不等 cron：手動 POST 上面那個 curl（拿掉 dryRun）

不想寄某篇文章？在 frontmatter 加 `newsletter: false`（**待實作 — 目前 cron 會寄所有沒寄過的文章**）。

---

## 6. 出問題的 debug 入口

| 症狀 | 看哪裡 |
|---|---|
| 訂閱表單壞 | Vercel Logs → `/api/subscribe` |
| 沒收到確認信 | Resend Dashboard → Emails → 看狀態（delivered / bounced / dropped）|
| Cron 沒跑 | Vercel Dashboard → Crons tab |
| 信進垃圾匣 | Resend → Domain → 確認 SPF/DKIM 都 verified；後續加 DMARC |
| 想停掉所有寄信 | 設 `NEWSLETTER_DRY_RUN=1` 到 Vercel env，所有寄信會印 log 而不真的寄 |

---

## 7. 環境變數總覽

```bash
# Postgres（Vercel 自動生成）
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
# ...etc

# Resend
RESEND_API_KEY=
MAIL_FROM="Wayn <hi@mail.waynspace.com>"
MAIL_REPLY_TO=wayntingliu@gmail.com

# Site
SITE_URL=https://waynspace.com

# Cron + admin auth
NEWSLETTER_SECRET=                # 你自己生成
CRON_SECRET=                      # Vercel 自動產生（cron 用）

# Debug（平時不設）
NEWSLETTER_DRY_RUN=1              # 設這個，notify 不會真的寄信，只印 log
```
