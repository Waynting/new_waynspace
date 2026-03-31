---
title: One Month at ABConvert
date: 2026-03-31T00:00:00.000Z
tags:
  - reflection
  - daily-notes
categories:
  - ntu-life
  - personal-journal
slug: one-month-at-abconvert
coverImage: 'https://img.waynspace.com/2026/03/One-Month-at-ABConvert-3343ee96893380a58752c593ba615235/IMG_20260226_153915.webp'
author:
  name: Wei-Ting Liu
  email: wayntingliu@gmail.com
seo:
  metaDescription: 在 ABConvert 實習一個月的紀錄——從 AI 原生工作流、Openclaw agent 到工程師思維的轉變。
  keywords:
    - ABConvert
    - internship
    - 台大資管
    - AI-native workflow
    - Openclaw
    - Claude Code
summary: >-
  A record of one month as a Software Engineer Intern at ABConvert — 17 PRs shipped, the evolution of an AI-native workflow with Openclaw, and the realization that project management and communication matter as much as code.
---

Medium Version: [Click me](https://medium.com/@wliu5928/one-month-at-abconvert-96e398cd0c63)

I spent a good chunk of an mid-night staring at a bug that made no sense. The API calls were failing, the error messages were cryptic, and nothing in my codebase had changed. It turned out the main repo had quietly updated its endpoint policy to require an auth key — a change I was never notified about. I only found out after asking around.

That moment stuck with me. Not because it was dramatic, but because it captured something true about working in a fast-moving startup: the hardest problems are rarely purely technical. They're about information, communication, and knowing what questions to ask before you're already stuck.

This is a record of one month as a Software Engineer Intern at ABConvert — what I shipped, how the team works with AI, and what I'm taking away.

![IMG_20260226_153915.jpg](https://img.waynspace.com/2026/03/One-Month-at-ABConvert-3343ee96893380a58752c593ba615235/IMG_20260226_153915.webp)

---

## Who I Am

Information Management × TBD sophomore at NTU (Taiwan). This is actually my second stint at ABConvert — I interned here for nearly two months last summer, but at the time my programming skills were limited and I wasn't familiar with the core stack, particularly TypeScript and web-related technologies.

After taking ["Web Programming"](https://www.notion.so/2590e6ef61828035b34dc965adc04382?pvs=21) taught by Professor Ric from the EE department, and combining that with Claude Code and the newly emerged Openclaw (more on this below), the gap between last summer and now is hard to overstate.

---

## Before vs. After

Last summer, I built a basic price test simulator. The functionality was limited, the UI felt clunky, and QA was mostly guesswork — I didn't have a systematic way to think about what could break. Web technologies in general were unfamiliar territory, which meant a lot of time was spent just figuring out how things worked before actually building anything.

This time around, working on the existing internal dashboard felt fundamentally different. Tasks that would have taken me weeks before now took days — not just because I was faster, but because I understood the stack well enough to write proper tests alongside the code, catch edge cases early, and produce something I'd actually stand behind. The improvement wasn't incremental. It felt like a different mode of working.

---

## Concrete Outcomes

Over the course of March, I contributed 17 PRs (5 merged) across five weeks, spanning UI redesign, developer tooling, test infrastructure, and internal product tooling.

![截圖 2026-03-31 下午3.56.47.jpg](https://img.waynspace.com/2026/03/One-Month-at-ABConvert-3343ee96893380a58752c593ba615235/截圖_2026-03-31_下午3.56.47.webp)

**Week 1–2 — Foundation**
Redesigned a core admin page from the ground up, introducing 5 new reusable components and unifying the visual system across the entire section. Standardized 7 API endpoints to a consistent response format, reducing error-handling inconsistency across the codebase. Fixed a pagination bug affecting data display and improved database connection stability. Also authored a documentation suite of 10 reference guides and 2 interactive HTML walkthroughs covering setup, architecture, and UX — giving the team a single source of truth for onboarding and review.

**Week 2–3 — Polish & Stability**
Resolved a critical crash triggered by a specific user flow, improving reliability for a key part of the admin experience. Delivered a round of UI refinements across 4 areas based on real user cases, and updated the CI review workflow.

**Week 4 — Test Infrastructure**
Built a full E2E testing system from scratch across 10 tickets — covering environment setup, core user flow coverage, automated screenshot capture, visual diff comparison, failure logging, and auto-generated Markdown reports. The result: 17 tests, 17 passing, 0 failed, total run time 12.1s. This brought the project from zero test coverage to a structured, maintainable baseline.

**Week 5 — Product Tooling (in progress)**
Currently building 3 internal tools for the product team: a visual diff viewer for tracking changes across versions, an aggregation-based usage analytics panel, and a read-only debug panel integrating two data sources for faster issue diagnosis.

![截圖 2026-03-31 下午3.44.35.PNG](https://img.waynspace.com/2026/03/One-Month-at-ABConvert-3343ee96893380a58752c593ba615235/截圖_2026-03-31_下午3.44.35.webp)

---

## AI-Native Mindset

### Tech Evolution

Our AI workflow didn't start where it is now. It evolved in stages:

**Claude Code → combined skills and some agents → Openclaw imported for every team member.**

Each step reduced friction. By the end, the agent wasn't just a personal tool — it became shared infrastructure for the whole team.

![截圖 2026-03-31 下午3.15.06.jpg](https://img.waynspace.com/2026/03/One-Month-at-ABConvert-3343ee96893380a58752c593ba615235/截圖_2026-03-31_下午3.15.06.webp)

### What is Openclaw?

Openclaw is an AI agent that lives inside your existing workflow. You interact with it directly in Slack — either by DMing it or tagging it in a channel — and it handles tasks end-to-end: opening tickets in Linear, creating branches, committing code, and raising PRs in GitHub. It runs on a dedicated machine 24/7, always on and always available to the entire team.

### Why an Agent Instead of Claude Code on Desktop?

Claude Code is powerful, but it's a personal tool — it runs on your own machine, in your own session, and only you see the results. Openclaw is different: it runs on a shared server and is accessible to everyone on the team through Slack. Instead of each person running their own local AI session, the whole team calls the same agent, in the same place, with full visibility.

This shift matters because it turns AI from an individual productivity tool into a team-level workflow. A teammate can tag Openclaw, and anyone in the channel can follow along, review the output, or jump in — without needing to set anything up on their own machine.

### Prerequisites

To get Openclaw running:

- Install Openclaw and keep it running 24/7 on a dedicated machine.
- Configure the necessary API keys: a model key (its brain), a Linear access token (for project and ticket management), a GitHub access token (for branching, committing, and PRs), and any other integrations your team uses.
- Download the skills your team needs from [clawhub.ai](https://clawhub.ai/).

### Linear as the Source of Truth, Slack for Urgency

The key design principle behind this workflow is that **Linear is the single source of truth**. Every task, context, and requirement lives inside a ticket. When you hand something off to Openclaw, the ticket *is* the input — its description, acceptance criteria, and notes become the ingredients the agent works from. The clearer and more complete the ticket, the better the output.

Slack plays a different role: it's for urgency and quick coordination — tagging Openclaw for a fast task, looping in teammates, or flagging something that can't wait for a ticket cycle. But the actual work and its context always live in Linear.


### The Real Skill: Writing Good Tickets

In practice, the most important skill isn't prompting the agent in the moment — it's writing good tickets upfront. A well-written ticket is essentially a spec that both your human teammates and Openclaw can act on without needing to ask follow-up questions.

This realization changed how I work. I used to think of ticket-writing as overhead — something you do after the real thinking is done. Now I see it as the thinking itself. The clearer the picture you give the agent, the less back-and-forth you need, and the faster things actually ship. In a way, communication became more important than coding.

![截圖 2026-03-31 下午3.14.05.jpg](https://img.waynspace.com/2026/03/One-Month-at-ABConvert-3343ee96893380a58752c593ba615235/截圖_2026-03-31_下午3.14.05.webp)

### Reflection: The Real Tradeoffs

The most unexpected upside is freedom from the desk. With everything living in Slack and Linear, I can review a ticket, give Openclaw a task, or check on a PR from my phone — on the commute, between classes, anywhere. And because everything is documented in Linear and Slack threads, the whole history is searchable. It doubles as a knowledge base that actually gets used.

That said, there's a real tradeoff. When an agent writes most of the code, your direct familiarity with the codebase quietly erodes. QA becomes more mentally demanding as a result — you're not just testing features, you're also compensating for the fact that you didn't write every line yourself and can't always predict where things might break. The instinct you'd normally build through writing code has to be rebuilt through reading and testing it instead.

I'd also caution that this workflow isn't a shortcut for everyone. If you don't have a baseline understanding of what the code is supposed to do, handing tasks to an agent doesn't produce results — it produces plausible-looking output that's hard to evaluate. The AI-native workflow amplifies people who already know enough to ask the right questions. For everyone else, it can quietly create a false sense of progress.

---

## Harvest & Growth

### Writing Clear Content

PRs, Linear tickets, dev specs — clear writing is what makes everything else work. It's what allows an agent to implement correctly, a reviewer to understand your intent, and a teammate to pick up where you left off. The quality of your output is often a direct reflection of the quality of your input. This felt like a soft skill at first. By the end of the month, it felt like the core skill.

### Reduction

This month, the CEO introduced policies around project and PR scope — including caps per team and ticket cycle limits. The goal was to cut noise: fewer open threads, more closed ones. The core principle is simple but hard to internalize: **handle what truly matters now**. Everything else goes to the backlog and waits for the right time. Working inside these constraints forced a kind of clarity that open-ended todo lists never do.

### Staying Current with the Latest Tech

There's a dedicated channel for sharing AI news and tooling. At first it felt like information overload — a new model, a new workflow, a new tool every other day. But staying plugged in turned out to matter. The teams that move fastest aren't necessarily the ones with the most experience. They're the ones who spot a better tool early and actually try it.

---

## Challenges

The hardest part of this internship wasn't technical — it was operating without a dedicated mentor. Without someone to review my work, I had to be my own gatekeeper: deciding when something was good enough to ship, whether a test covered enough cases, and whether my implementation actually matched the intent of a ticket. That's a different kind of pressure than just writing code.

Edge case testing was a constant challenge. It's easy to test the happy path; it's much harder to systematically think through what could break. I'm still developing that instinct.

And then there was the cross-repo bug I opened with. What made it frustrating wasn't the debugging — it was the realization that I'd been working with incomplete information, and I hadn't known to ask. Without a clear point of contact, there's no obvious way to stay in the loop on upstream changes. I learned to treat mysterious failures as a signal to check for changes elsewhere first, and to be more proactive about asking what's shifting across repos — even when nothing seems obviously wrong.

---

## What I'm Taking Away

One month in, the thing that surprised me most wasn't any specific tool or technique — it was realizing that I was actually working like an engineer. Agile sprints, CI/CD pipelines, ticket cycles, PR reviews — these were things I'd read about, but doing them daily made them click in a way that coursework never quite did.

The biggest takeaway: **project management and communication matter as much as code.** Knowing how to break down a problem into a well-scoped ticket, how to write a PR that reviewers can actually follow, and how to flag a blocker before it becomes a delay — these are the skills that determined whether a week went smoothly or not.

I'll be continuing the internship, shifting focus toward infrastructure work — the kind of important-but-not-urgent things that tend to go unowned in a fast-moving team. Unglamorous, but probably where the most durable learning happens.

---

# Chinese Version

*由 Claude 翻譯，語氣挺不像我點點點

某個晚上，我盯著一個看不懂的 bug 看了很久。API 一直回錯誤，訊息不知所云，但我的 code 根本沒動過。後來才發現，主程式那邊悄悄更新了 endpoint policy，要求帶 auth key——但沒有人通知我，是我自己去問才知道的。

這件事讓我印象很深，不是因為多嚴重，而是它說中了一件事：在快速移動的新創裡，最麻煩的問題往往不是技術本身，而是資訊、溝通，和「在卡住之前知道該問什麼」。

剛好前陣子看到類似的文章，於是決定在一個月的時間點記錄一下。

![IMG_20260226_153915.jpg](https://img.waynspace.com/2026/03/One-Month-at-ABConvert-3343ee96893380a58752c593ba615235/IMG_20260226_153915.webp)

---

## 關於我

台大資管系大二，雙主修 TBD。這其實是我第二次在 ABConvert 實習——去年暑假來待了快兩個月，但當時程式能力真的有限，對主要技術棧也不太熟悉，特別是 TypeScript 和一堆網頁相關的東西。

這學期修了電機系 Ric 老師開的[「網路程式服務設計」](https://www.notion.so/2590e6ef61828035b34dc965adc04382?pvs=21)，加上 Claude Code 和這陣子橫空出世的 Openclaw（下面會說），和去年暑假相比差距大到有點難形容。

---

## 前後差距

去年做了一個 price test simulator，功能很陽春、UI 不順手，QA 基本上靠感覺，沒有一套方式去想「什麼地方可能會壞掉」。那時候網頁技術對我來說還很陌生，很多時間都花在搞懂怎麼用，還沒開始真的做東西。

這次回來接手 internal dashboard 的感覺完全不同。以前要花好幾週的事，現在幾天就能做完——不只是因為變快了，而是真的理解技術棧之後，可以邊寫功能邊補測試、提早抓到邊界問題，做出來的是我真的願意交出去的東西。進步不是漸進的，更像是換了一種工作方式。

---

## 這個月做了什麼

三月份送出了 17 個 PR（5 個 merged），橫跨 UI 重設計、開發者工具、測試基礎建設和內部產品工具。

![截圖 2026-03-31 下午3.56.47.jpg](https://img.waynspace.com/2026/03/One-Month-at-ABConvert-3343ee96893380a58752c593ba615235/截圖_2026-03-31_下午3.56.47.webp)

**Week 1–2 — 基礎建設**
從零重設計一個核心管理頁面，新增 5 個可複用元件，把整個區塊的視覺系統統一起來。把 7 個 API endpoint 改成一致的 response 格式，減少 codebase 裡錯誤處理不一致的問題。修了一個影響資料顯示的 pagination bug，順手改善了資料庫連線的穩定性。另外寫了一套開發文件——10 份 Markdown 參考文件加上 2 份互動式 HTML 導覽，涵蓋 setup、架構、UX 等等，讓團隊 onboarding 和 review 有個共同的基準。

**Week 2–3 — 精修與穩定**
修了一個特定操作流程會觸發的 critical crash，提升了管理介面關鍵體驗的穩定性。根據實際使用情境調整了 4 個面向的 UI，也更新了 CI review workflow。

**Week 4 — 測試基礎建設**
從零建立完整的 E2E 測試體系，橫跨 10 張 tickets——涵蓋環境設定、核心流程覆蓋、自動截圖、視覺 diff 比對、失敗紀錄與自動產出 Markdown 報告。最終結果是 17 個測試全數通過，執行時間 12.1 秒，讓這個專案從零測試覆蓋率變成有結構、可維護的測試基線。

**Week 5 — 產品工具（進行中）**
正在為產品團隊建立 3 個內部工具：跨版本的視覺 diff 檢視器、基於 aggregation 的功能使用統計面板，以及整合兩個資料來源的唯讀 debug 面板。

![截圖 2026-03-31 下午3.44.35.PNG](https://img.waynspace.com/2026/03/One-Month-at-ABConvert-3343ee96893380a58752c593ba615235/截圖_2026-03-31_下午3.44.35.webp)

---

## AI 原生思維

### 技術演進

我們的 AI 工作流不是一開始就長這樣，是一步一步跑出來的：

**Claude Code → 結合 skills 與部分 agent → 全員導入 Openclaw**

每一步都在降低摩擦。到最後，agent 不再只是個人工具，而是整個團隊共用的基礎建設。

### Openclaw 是什麼

Openclaw 是一個活在你現有工作流裡的 AI agent。你直接在 Slack 裡跟它互動——DM 或 tag 都可以——它會端對端處理任務：在 Linear 開票、在 GitHub 建 branch、commit code、送 PR。它跑在一台專用機器上 24/7 不間斷，整個團隊隨時都能呼叫。

### 為什麼用 Agent 而不是桌面版 Claude Code

Claude Code 很強，但它是個人工具——跑在你自己的機器上、你自己的 session 裡，只有你看得到。Openclaw 不一樣：它跑在共用伺服器上，整個團隊都能透過 Slack 呼叫同一個 agent，在同一個地方，全程可見。

這個差異的意義在於：AI 從「個人生產力工具」變成「團隊層級的工作流」。任何人 tag Openclaw，頻道裡的人都能跟著看輸出、review，或直接加入——不需要在自己的機器上做任何設定。

### 如何開始

要讓 Openclaw 跑起來需要幾個前置條件：

- 安裝 Openclaw，讓它在一台專用機器上 24/7 運行。
- 設定必要的 API key：model key（它的大腦）、Linear access token（專案與 ticket 管理）、GitHub access token（建 branch、commit、PR），以及其他你們需要的整合。
- 從 [clawhub.ai](https://clawhub.ai/) 下載你們需要的 skills。

### Linear 是唯一真相來源，Slack 處理緊急事項

這套工作流的核心是：**Linear 是唯一的真相來源**。所有任務、背景脈絡和需求都活在 ticket 裡。把任務交給 Openclaw 的時候，ticket 本身就是輸入——它的描述、驗收條件和備註，就是 agent 運作的材料。ticket 寫得越清楚，產出就越好。

Slack 的角色不同，處理的是緊急事項和快速協調——tag Openclaw 做一個快速任務、拉隊友進來，或標記一件等不了 ticket cycle 的事。但實際的工作和脈絡，永遠住在 Linear 裡。

### 真正的核心技能：寫好 Ticket

實務上，最重要的技能不是當下怎麼 prompt agent，而是事前把 ticket 寫好。一張寫得好的 ticket，本質上就是一份 spec，你的隊友和 Openclaw 都可以直接照著做，不需要來回確認。

這個認知改變了我對寫 ticket 這件事的看法。以前覺得它是開銷——是思考完之後才做的事。現在覺得那就是思考本身。給 agent 的圖越清楚，來回就越少，東西就越快出來。某種程度上，溝通能力比寫程式更重要。

![截圖 2026-03-31 下午3.14.05.jpg](https://img.waynspace.com/2026/03/One-Month-at-ABConvert-3343ee96893380a58752c593ba615235/截圖_2026-03-31_下午3.14.05.webp)

### 真實的取捨

最意外的好處是從桌子前解放出來。所有東西都在 Slack 和 Linear 裡，我可以用手機 review ticket、交代任務、確認 PR 狀態——在通勤、在課間、在任何地方。而且因為一切都有紀錄，整個歷史可以搜尋，它同時也是一個真正會被用到的知識庫。

但有個真實的取捨：當 agent 寫了大多數的 code，你對 codebase 的直接熟悉度會悄悄下降。QA 因此變得更耗心力——你不只是在測功能，也在彌補「不是每一行都自己寫」這件事帶來的不確定感。本來應該透過寫 code 建立的直覺，必須改用讀 code 和測試來重建。

另外想說的是，這套工作流對所有人來說都不是捷徑。如果你對 code 應該做什麼沒有基本的認識，把任務交給 agent 不會產出結果——它會產出看起來合理、但你很難評估對不對的輸出。AI 原生工作流放大的是那些已經知道該問什麼問題的人。對其他人來說，它可能會悄悄製造一種虛假的進度感。

---

## 這個月學到什麼

### 把內容寫清楚

PR、Linear ticket、dev spec——清楚的文字是讓所有事情運作的基礎。它讓 agent 能正確實作、讓 reviewer 理解你的意圖、讓隊友能接著你的進度繼續。你的產出品質，很多時候直接反映你的輸入品質。一開始覺得這是軟實力，月底覺得這是核心技能。

### 做減法

這個月 CEO 針對專案和 PR 範圍訂了政策——包括每個 team 的 ticket 數量上限和 cycle 週期限制，目標是切掉噪音：更少的 open threads，更多 closed 的東西。核心原則很簡單，但很難真的內化：**只處理現在真正重要的事**，其他的丟進 backlog 等時機到了再說。在這些限制下工作，逼出了一種開放式 todo list 永遠給不了的清晰感。

### 追蹤最新技術

團隊有一個專門分享 AI 新聞和工具的頻道。一開始感覺是資訊轟炸，每隔幾天就有新模型、新工作流、新工具。但保持關注這件事是有用的——跑最快的團隊，不一定是經驗最豐富的，而是最早看到更好的工具、然後真的去試的那個。

---

## 挑戰

這次實習最難的部分不是技術，而是沒有專屬 mentor 的情況下獨立運作。沒有人固定 review 我的工作，我必須自己當守門員：決定什麼時候東西夠好可以 merge、測試有沒有覆蓋到足夠的 case、實作有沒有真的符合 ticket 的意圖。那是一種和「只是寫 code」完全不同的壓力。

邊界情境的測試一直是個挑戰。測 happy path 很容易，系統性地想「什麼地方可能壞掉」就難多了，這個直覺我還在練。

然後就是開頭說的那個 cross-repo bug。讓我挫折的不是 debug 本身，而是意識到我一直在資訊不完整的情況下工作，卻不知道應該去問。沒有明確的聯絡窗口，沒有顯而易見的方式讓你掌握上游的變動。後來學到的是：遇到奇怪的錯誤，先把它當成「別的地方有什麼改動了」的訊號，然後主動去問——即使表面上看起來什麼都沒問題。

---

## 帶走什麼

一個月後，最讓我意外的不是哪個工具或技術，而是發現自己真的在像一個工程師一樣工作。Agile sprint、CI/CD pipeline、ticket cycle、PR review——這些東西以前都只是名詞，每天做才讓它們真的變得具體，是課堂上給不了的感受。

最大的 takeaway 是：**專案管理和溝通，跟寫 code 一樣重要。** 怎麼把一個問題拆成範圍明確的 ticket、怎麼寫一個 reviewer 看得懂的 PR、怎麼在 block 變成 delay 之前提早 flag——這些才是決定一週順不順的關鍵。

接下來會繼續這個實習，轉向 infra 相關的工作——那種重要但不緊急、通常沒有人處理的事。不夠光鮮，但大概是學得最紮實的地方。
