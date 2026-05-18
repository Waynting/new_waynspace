# Waynspace Newsletter — Buttondown Email Templates

兩封信都使用 Buttondown 的 Markdown 編輯器。變數（如 `{{ confirmation_url }}`、`{{ unsubscribe_url }}`）由 Buttondown 自動填入，直接保留即可。

---

## 1. Confirmation Email（確認信）

> Buttondown 後台：**Settings → Subscribing → Confirmation**

### Subject

```
請確認訂閱 Waynspace
```

### Body

```markdown
Hi，

感謝你訂閱 **Waynspace**。

再點一下下面的連結，就完成訂閱了：

[確認訂閱 →]({{ confirmation_url }})

如果這封信不是你本人觸發的，可以直接忽略，我不會再寄信過去。

— 威廷
[waynspace.com](https://waynspace.com)
```

---

## 2. Welcome Email（歡迎信）

> Buttondown 後台：**Settings → Subscribing → Welcome**

### Subject

```
歡迎來到 Waynspace
```

### Body

```markdown
Hi，

我是威廷，目前在台大唸資管。**Waynspace** 是我寫字、放照片、整理想法的地方。

訂閱之後，你會不定期收到我新寫的文章，主題大致圍繞著：

- **台大資管** — 課程、修課心得、學生生活
- **技術隨筆** — 開發、工具、產品觀察
- **筆記與心得** — 書、電影、想記下來的東西
- **行旅隨筆** — 走過的城市與路上的觀察
- **攝影筆記** — 照片與當下

不會每週寄、也不會塞行銷內容。有寫完、值得寄的，才會出現在你的信箱。

如果想先逛逛：

- 最新文章：[waynspace.com/blog](https://waynspace.com/blog)
- 關於我：[waynspace.com/about](https://waynspace.com/about)
- 照片：[waynspace.com/photos](https://waynspace.com/photos)

歡迎回信跟我聊聊你是怎麼找到這裡的，或最近在想什麼。

— 威廷

---

<small>不想再收到信？隨時可以 [取消訂閱]({{ unsubscribe_url }})。</small>
```

---

## 小提醒

- Buttondown 預設啟用 **double opt-in**（確認信流程）。如果你想關掉確認信、讓使用者填完表單直接訂閱，請到 Settings → Subscribing 把 confirmation 關掉——但建議保留，這樣 list 品質比較好。
- Welcome email 只會在「確認訂閱之後」寄出一次。
- 兩封信都支援 Markdown，連結、粗體、清單都會正常渲染。
- 之後若要客製樣式，可以到 Settings → Design 調整 email template 的字體與顏色，建議跟網站一致（Noto Sans TC、灰階）。
