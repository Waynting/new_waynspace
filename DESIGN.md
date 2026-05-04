# Waynspace — Design System

This is the source of truth for visual design on waynspace.com. When you're styling anything new (page, component, marketing piece), start here.

The site is in **Traditional Chinese (zh-TW)**. Voice is personal, written-by-a-human, not corporate.

---

## 1 — Current baseline: Editorial Minimal

What's live today and what's reproduced in the `Personal Website` Paper file.

### Color tokens (HSL → hex, light mode)

| Role | Token | HSL | Hex |
|---|---|---|---|
| Background | `--background` | `0 0% 100%` | `#FFFFFF` |
| Foreground | `--foreground` | `0 0% 15%` | `#262626` |
| Muted ground | `--muted` / `--secondary` | `0 0% 96%` | `#F5F5F5` |
| Muted text | `--muted-foreground` | `0 0% 40%` | `#666666` |
| Border | `--border` / `--input` | `0 0% 90%` | `#E5E5E5` |
| Border (subtle) | `border-border/50` | — | `~#F2F2F2` |
| Muted text 60% | `text-muted-foreground/60` | — | `~#999999` |

Dark mode mirrors light, swapping only the background/foreground pair (`#0F0F0F` ↔ `#FAFAFA`). No accent colors today.

### Type

- **Family**: Noto Sans TC (weights 300 / 400 / 500 / 700)
- **Body**: 14px / line-height 28px / weight 400
- **Article body**: 16px / line-height 30px / weight 400
- **h1**: `text-4xl md:text-5xl` (36 → 48px), weight 700, `tracking-tight` (`-0.025em`)
- **Section labels**: 12px / weight 600 / `letter-spacing: 0.18em` / uppercase / muted-fg
- **Page-header eyebrow**: 12px / weight 500 / `letter-spacing: 0.2em` / uppercase / muted-fg
- **Numbered sections**: `00` `01` `02` in 20px-wide tabular-nums slot before the section label

### Layout

- Container: `max-w-3xl mx-auto px-6 sm:px-8 lg:px-12` → 768px content width
- Page padding: `py-16 md:py-24` (64–96px vertical)
- Section spacing: `space-y-16` (or `space-y-20` on About/Projects)
- Article rows: `MM/DD · title · category` — `py-4 -mx-3 px-3 hover:bg-muted/30`
- Section header: bottom-bordered `border-b border-border pb-3`

### What's deliberately *not* here

- No accent colors, no gradients
- No card wrappers around content (info lives on the surface)
- No emoji icons in nav
- No rounded button borders beyond `--radius: 0.5rem`
- No hero sections with full-bleed marketing imagery

### Verdict

The baseline reads as **competent and quiet**. It's the right starting point but not the destination — the brief now is to add a single voice-defining moment without breaking the calm rhythm.

---

## 2 — The brief for the refresh

> "可以 outstanding 一點，現在有點樸素無趣"

What we're optimizing for:

- **One bold move, not five.** Whatever changes, it should be one decisive visual idea you can describe in a sentence.
- **Photography stays first-class.** Accents must not fight photos in the gallery.
- **Chinese typography is an opportunity.** A serif display in zh-TW is rare and immediately distinctive.
- **Restraint over decoration.** The site is a publication, not a portfolio template.

Pairings to **avoid** (per Paper MCP's house rules and the photography constraint):

- Warm off-white × red / orange / terracotta — current cliché
- Tinted ground × any high-chroma accent — chroma dies on tinted grounds
- Dark navy × electric purple/lime/teal — SaaS 2019–2024 era
- Heavy gradients, drop shadows, blur effects

---

## 3 — Three candidate directions

Pick one. Each is a *complete* visual direction — palette, type, voice — not a menu of à-la-carte choices.

---

### Direction A — **Editorial Cobalt**

**Mood**: editorial / saturated. Reference scene: a newsstand copy of a Penguin paperback, a New York Magazine masthead, the spine of a Phaidon monograph.

**Why this and not the obvious "bookish":** bookish (plaster × ink) was the first instinct for a writer's blog. Editorial is the second — it keeps pure white (so photos sing) and uses one cobalt moment per page as the punctuation.

**Palette**

| Role | Hex | Notes |
|---|---|---|
| Background | `#FFFFFF` | Pure white, no tint |
| Foreground | `#111111` | Push fg darker than current `#262626` for stronger contrast |
| Muted text | `#5B5B5B` | Slightly darker than today's `#666` for legibility |
| Border | `#E8E8E8` | Slightly warmer hairline |
| **Accent — Cobalt** | `#1A47BD` | Links (underline only), one moment per page, active nav |
| Cobalt soft (hover bg) | `#EDF1FB` | A whisper, used on Newsletter card or active row |

**Type**

- **Display** (h1, eyebrow numbers like `01`, `02`): **Noto Serif TC** weight 700 — replaces sans for h1 only
- **Body**: Noto Sans TC stays for everything else
- **Numbered section labels**: keep tracked sans 12px / 0.18em — the contrast against serif h1 is the whole point

**One bold move**: every page has exactly one cobalt moment — the active nav underline, an inline link, or the "現在" badge. Nothing else is colored.

**Trade-off**: introduces a serif font (one more network request, ~80KB woff2 subset) and breaks the "no exceptions" purity of the current grayscale system. Worth it for the editorial signal.

---

### Direction B — **Bookish Plaster**

**Mood**: bookish / candlelit. Reference scene: an old paperback printed on uncoated stock, the inside cover of a notebook, plaster wall + black ink.

**Palette**

| Role | Hex | Notes |
|---|---|---|
| Background | `#F5F1EA` | Warm plaster — the page changes feel |
| Foreground | `#1A1A1A` | Deep ink |
| Muted text | `#6B6258` | Warm gray pulled from the plaster scene |
| Border | `#E2DCD0` | Tinted hairline |
| **Accent — Oxblood** | `#7A1F2F` | Inline links only, very rare |

**Type**

- **Display**: Noto Serif TC weight 700
- **Body**: Noto Sans TC
- **Article body**: bumped to 17px for that "reading a book" pace, line-height 1.85

**One bold move**: the ground itself. Tinted bg + serif h1 makes the site feel like a printed object, not a web page.

**Trade-off**: tinted grounds dull photography — you'd want a separate `bg-white` background for `/photos` only. Slight extra accessibility care needed for contrast on the warm ground.

---

### Direction C — **Highlighter Pop**

**Mood**: highlighter / signage. Reference scene: a yellow Sharpie underline through a dense paragraph, a hand-stamped library card, a Risograph zine.

**Palette**

| Role | Hex | Notes |
|---|---|---|
| Background | `#FFFFFF` | Pure white |
| Foreground | `#000000` | Pure black, push contrast all the way |
| Muted text | `#666666` | Same as baseline |
| Border | `#000000` (1px) | Hairlines go full black |
| **Accent — Highlighter** | `#F4FF3D` | Marker-yellow, used as a *background* swipe behind active nav, current-page label, hover state on title text |

**One bold move**: the highlighter swipe — `box-shadow: inset 0 -0.45em 0 #F4FF3D` behind the active nav link, current category tab, and the active row on hover. Looks hand-marked.

**Type**

- **Display**: Noto Sans TC weight 900 (heavier than current 700) for h1 — bigger, blacker, closer-tracked
- **Body**: Noto Sans TC stays at 400

**Trade-off**: maximum "outstanding" but also the most polarizing — yellow can look childish if even one element overdoes it. Strict rule: no more than ONE highlighter swipe visible at a time on any given screen.

---

## 4 — How to pick

| If you want… | Pick |
|---|---|
| The most polished, "real publication" feel | **A. Editorial Cobalt** |
| Personal, warm, "this is a journal, not a startup" | **B. Bookish Plaster** |
| Maximum "outstanding," confident, hand-marked | **C. Highlighter Pop** |

**Default recommendation: A (Editorial Cobalt).** It satisfies "outstanding" via Chinese serif display (genuinely rare), keeps pure white for photography, and uses cobalt as a single tasteful punctuation. Lowest risk of looking dated in two years.

---

## 5 — Decision

**Committed direction: A* — Editorial Brutalist B&W + Layout Refresh + Animated Editorial + One Generative Moment** (decided 2026-05-04, accent dropped 2026-05-04).

Pure white × pure black, **no third color anywhere**. Mood: brutalist editorial — the type and the layout do all the work. **Noto Serif TC** for h1 only (everything else stays Noto Sans TC). Foreground pushed to `#111111`. The "one moment per page" rule still holds, but the moment is now a **typographic / structural device** — heavy weight, inversion, or scale — not a colored pixel.

### 5.a — Dual-width container system (replaces the old `max-w-3xl` everywhere)

The site no longer lives in a single 768px column. Two named widths:

| Token | Value | Used for |
|---|---|---|
| `--w-display` | **1100px** | Masthead, year dividers, contents-page grid, /Now strip, photo gallery, page headers |
| `--w-reading` | **640px** | Body prose, About paragraph, single-column article-row lists, comments |

Both centered on the page. The visual rhythm of every page becomes `wide → narrow → wide → narrow` — that alternation is the publication signal.

CSS:
```css
:root {
  --w-display: 1100px;
  --w-reading: 640px;
}
.container-display { max-width: var(--w-display); margin-inline: auto; padding-inline: 24px; }
.container-reading { max-width: var(--w-reading); margin-inline: 0; } /* left-aligned inside display, NOT centered */
```

Reading-width blocks sit *inside* a display-width container and are left-aligned (not centered) — so body text aligns with the left edge of the masthead above it, not floating in the page.

### 5.b — Layout grammar per page

| Page | Masthead | Content |
|---|---|---|
| `/` Home | **Asymmetric** (display) — name 65%-left + masthead block 35%-right (issue/date/social/generative slot) | Bio (reading), /Now (display), Latest Articles (reading rows in display column), Newsletter (display, dark) |
| `/blog` Articles | Centered display — title + count | This Issue (display, 2/3 + 1/3 split), Filter (display), 2-column TOC per year (display) |
| `/blog/[slug]` Article Detail | Reading | Body (reading), prev/next (display) |
| `/about` About | Display, name + role | Sections at reading width left-aligned in display column |
| `/projects` Projects | Display | Each project: title row (display) + description (reading) + features list (display, 2-col) |
| `/photos` Photos | Display, narrow header | Featured (display), Albums (display, scroll), All Photos (full-bleed beyond display) |

### 5.c — Motion (Animated Editorial)

**Tools:**
- `lenis` (5KB) for global inertial smooth scroll
- `framer-motion` (~25KB tree-shaken) for scroll-anchored reveals, page transitions, hover micro-interactions
- Plain CSS for hover underline animations and color transitions

**Motion principles:**
1. **Invisible until noticed.** Motion serves reading. The reader should never wait for an animation to finish to see content.
2. **Inertia, not bounce.** Lenis default damping. No springy easings on scroll.
3. **One reveal per viewport.** When something fades in on scroll, only one element does it at a time — never a whole list "popcorn" reveals.
4. **Hover earns its keep.** Article rows: title cobalt-color shift + `→` arrow slides in 4px. Nav links: underline expands left-to-right. That's it.
5. **Page transitions:** 200ms fade out + 200ms fade in (no slide, no swoosh).
6. **Respect `prefers-reduced-motion`.** Disable Lenis, kill all reveals, keep hover transitions only.

**No-go list:** parallax beyond 5% offset, hero text typewriter effect, floating shapes following cursor, stagger reveals on every list, scroll-jacking, page loaders, "swipe to enter".

### 5.d — The Generative Moment (one per site, lives on `/`)

A **single generative element** in the homepage masthead's right column. The point: signal "this person makes things, not just writes about them" without dominating the page.

**Concept:** ASCII / dither rendering of a recent photo from `/photos`.

- Pulls one photo (rotates daily or per-visit) from the R2 portfolio feed
- Client-side renders it as text characters with density mapped to luminance — `' . , : ; ! i o O 0 # @` from light to dark
- Renders inside a fixed 280×360px slot in the masthead right column
- Cursor proximity perturbs character density within ~80px of the cursor (subtle, not chaotic)
- Caption underneath: filename + EXIF (`R005842.jpg · 35mm · f/2.8`)
- Click → opens that photo in `/photos` lightbox

**Tech:** plain Canvas 2D + `requestAnimationFrame` (no p5.js, no Three.js — keep bundle under 8KB). Lazy-load via `dynamic({ ssr: false })`. SSR fallback: render the photo as a small `<img>` with the same caption.

**Why this and not 3D:** the user is a writer-first photographer. ASCII rendering is the ONE moment that ties writing × photography × code into one visual idea. A WebGL 3D scene would say "look at the 3D thing"; ASCII says "look at the photo, but I rendered it myself."

**Design constraints:**
- Monospace family for the ASCII grid (JetBrains Mono or IBM Plex Mono — pick one in implementation)
- Color: foreground `#111`, no cobalt inside the ASCII (the cobalt moment is elsewhere on the page)
- Character size: 8–10px, line-height 1.0 (tight)
- The slot has a 1px hairline border on top and bottom only
- Below the ASCII: 11px caption in tracked sans

### 5.e — Implementation checklist

**Tokens & fonts**
- [ ] No `--accent` token. Pure B&W system. The dark Newsletter card uses `#111` bg + `#fff` fg. The "moment" is structural (inversion / weight / scale).
- [ ] Add `--w-display: 1100px`, `--w-reading: 640px` to `globals.css :root`
- [ ] Push `--foreground` from `0 0% 15%` → `0 0% 7%` (`#111111`)
- [ ] Add `Noto_Serif_TC` import to `layout.tsx`, expose `--font-noto-serif-tc`
- [ ] Add `JetBrains_Mono` (or `IBM_Plex_Mono`) import for ASCII grid + caption
- [ ] Register accent + serif + mono families in Tailwind `@theme`

**Layout system**
- [ ] Add `<Container variant="display" | "reading">` component — replace every `max-w-3xl mx-auto` site-wide
- [ ] Verify reading-width blocks are LEFT-aligned inside display containers, not centered
- [ ] Add `Header.tsx` and `Footer.tsx` to display container

**Components / pages**
- [ ] Refactor `src/app/page.tsx` to asymmetric masthead grammar
- [ ] Build `<GenerativePhoto />` client component (Canvas 2D, ASCII render of latest portfolio photo, cursor reactive)
- [ ] Build `<NowStrip />` component
- [ ] Refactor `BlogClient.tsx`: This Issue + Editor's Pick + 2-column TOC per year
- [ ] Refactor `/about`, `/projects`, `/photos`, `/blog/[slug]` to dual-width grammar

**Motion**
- [ ] Install `lenis` and `framer-motion`
- [ ] Wire Lenis in root layout (respects `prefers-reduced-motion`)
- [ ] Add scroll-anchored fade-in to year headings + section headers
- [ ] Add hover micro-interaction to article rows (title cobalt shift + arrow slide-in 4px)
- [ ] Add 200ms cross-fade page transition

**Cleanup**
- [ ] Update `MEMORY.md` Design System block to mirror v2
- [ ] Re-screenshot baseline artboards in Paper as `— Editorial Cobalt v2`
- [ ] Lighthouse on home: LCP ≤ 2.5s, CLS ≤ 0.1, JS bundle increase ≤ 80KB

---

## 6 — Layout patterns (unchanged across directions)

These are the structural primitives. The visual direction changes paint, not bones.

**Page header**

```
ABCDE FGHI         ← 12px tracked-0.2em uppercase muted eyebrow
Articles  42       ← h1 + tabular-nums count
```

**Numbered section**

```
00  簡介           ← 20px tabular slot + 12px tracked-0.18em uppercase label
─────────────      ← border-b border-border pb-4
[content]
```

**Article row**

```
05/02  宅男打籃球                          生活隨筆
       久違的星期六下午籃球場時光，記錄…
```

— `MM/DD` (36px slot) · title (1-line clamp) + excerpt (1-line clamp) · category (112px right-aligned).

**Header**: 56px tall, sticky, bottom border. Logo (favicon 20px + "Waynspace" 14px medium) left, nav (text links gap-5, active = accent underline) right.

**Footer**: 1px top border, py-6, copyright left + 5 text-only social links right.

---

## 7 — Things to never do

- Add a hero section with full-bleed marketing imagery
- Wrap content in Card with `rounded-lg shadow-sm`
- Use emoji as nav icons or list bullets
- Use more than one accent color
- Use accent on body text (only on links, active states, and one designated "moment" per page)
- Mix the accent across both light and dark modes without rebalancing — dark mode usually wants a brighter version of the same hue
