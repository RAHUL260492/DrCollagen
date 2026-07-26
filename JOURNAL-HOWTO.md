# The Dr Collagen Journal — how it works

Blog articles live **in the theme**, not in Shopify's blog system. They deploy through the
normal GitHub push. There is one manual step per article in Shopify admin (creating an empty
Page so the URL exists) — everything else is a file in this repo.

---

## What shipped

| URL | File | Product | Author |
|---|---|---|---|
| `/pages/journal` | `snippets/journal-index.liquid` | — | — |
| `/pages/collagen-for-skin` | `snippets/journal-collagen-for-skin.liquid` | Collabloom | Dr Raashi Mehta |
| `/pages/glutathione-for-skin` | `snippets/journal-glutathione-for-skin.liquid` | Collabloom | Dr Raashi Mehta |
| `/pages/collagen-for-joint-pain` | `snippets/journal-collagen-for-joint-pain.liquid` | Skelecoll | Dr Nachiket Pansey |
| `/pages/supplements-for-knee-pain` | `snippets/journal-supplements-for-knee-pain.liquid` | Skelecoll | Dr Nachiket Pansey |

Shared: `snippets/journal-styles.liquid` (all CSS, uses existing `theme.css` tokens — nothing
global was modified).

Also changed:
- `templates/page.liquid` — routes the five handles above
- `layout/theme.liquid` — per-article `<title>` and `<meta description>`
- `sections/footer.liquid` — Journal link corrected from `/blogs/journal` to `/pages/journal`

---

## ⚠️ Required step in Shopify admin (once per article)

Nothing renders until the Page object exists.

1. **Online Store → Pages → Add page**
2. **Title:** anything (the theme supplies the real H1 and title tag)
3. **Content:** leave completely empty
4. **Edit the URL handle** so it exactly matches the file — e.g. `collagen-for-skin`
5. **Template suffix:** leave as `page` (default). Do not create a custom template.
6. Save.

Do this for all five handles above, then visit `/pages/journal`.

If a page shows the generic editorial layout instead of the article, the handle does not match
the `{% when %}` string in `templates/page.liquid`. Handles are case-sensitive and Shopify
sometimes appends `-1` if the handle was already taken.

**Also add Journal to the main menu:** Online Store → Navigation → Main menu → Add menu item →
link to the `journal` page. The footer link is already wired.

---

## Publishing one article a week

Four files to touch. Budget 10 minutes once the writing is done.

### 1. Create the article file

```bash
cp JOURNAL-ARTICLE-TEMPLATE.txt snippets/journal-<handle>.liquid
```

Replace every `«placeholder»`. The template has the full structure with inline comments
explaining why each block exists — do not delete sections, replace their content.

### 2. Route it — `templates/page.liquid`

Add one line inside the Journal block:

```liquid
{% when 'your-new-handle' %}
  {% render 'journal-your-new-handle' %}
```

### 3. Title tag + meta description — `layout/theme.liquid`

Add one block inside the `Journal SEO overrides` case:

```liquid
{%- when 'your-new-handle' -%}
  {%- assign dc_title = 'Primary Keyword: Short Promise' -%}
  {%- assign dc_desc = 'One sentence, around 105 characters, keyword near the front.' -%}
```

Keep `dc_title` under **41 characters** — the theme appends ` – Dr Collagen` (14 chars),
and the target is ~55 total.

### 4. List it — `snippets/journal-index.liquid`

Add **one line at the top** of the `jr_data` block (newest first — the top entry becomes the
large featured card). Nine fields separated by `~~`:

```
handle~~Title~~One-sentence summary~~Skin Science|Joint Health~~2026-08-02~~2 August 2026~~9 min read~~collabloom-bottle.png~~skin
```

Last field is the background tint: `skin` (rose) or `joint` (gold).

### 5. Create the Page in Shopify admin

See the section above. Then push:

```bash
# from the project root
git -C /tmp/DrCollagen pull
rsync -a --delete --exclude=.git --exclude=.DS_Store theme_v11_work/ /tmp/DrCollagen/
git -C /tmp/DrCollagen add -A && git -C /tmp/DrCollagen commit -m "journal: <handle>"
git -C /tmp/DrCollagen push
```

---

## The SEO rules these articles follow

Based on Semrush's 13-point SEO blog post framework. The template enforces all of them.

| # | Tip | How it is implemented |
|---|---|---|
| 1 | Target keyword | Declared in the file header comment; sits at the front of the H1, title tag and URL |
| 2 | Match search intent | Informational format: direct answer, evidence, then a product mention — not a sales page |
| 3 | Quality structure | Standfirst → "The short answer" box → TOC → H2/H3 with the conclusion first → short paragraphs |
| 4 | Freshness | Visible **Published** and **Updated** dates in the byline, plus `datePublished`/`dateModified` |
| 5 | Keyword usage | Primary keyword in H1, first paragraph, one H2 and the FAQ; variations elsewhere — no stuffing |
| 6 | Visuals | Bottle-on-plate hero, 4:5 infographic slides, inline SVG charts. All local, all `width`/`height` set, all lazy below the fold |
| 7 | Title tag | `dc_title` in `theme.liquid`, ~55 chars incl. brand, keyword first, unique per page |
| 8 | Meta description | `dc_desc`, ~105 chars, keyword plus a reason to click |
| 9 | Author bio | Byline links to a full `.jr-author` card with credentials; mirrored in `author` schema |
| 10 | Expert insight | A `.jr-quote` pull-quote from the named founder — a clinical observation, never a product claim |
| 11 | Statistics | `.jr-stats` tiles and a `Sources` list, every figure linked to PubMed |
| 12 | Internal links | Product card, 3 "Keep reading" cards, contextual in-body links, breadcrumb |
| 13 | Short URL | `/pages/<primary-keyword>` — no dates, no category folders |

Plus, beyond the 13: `Article` + `BreadcrumbList` + `FAQPage` JSON-LD on every article, and
`Blog` + `BreadcrumbList` on the index.

---

## Editorial rules

These are the reason the articles read as credible rather than as content marketing. They are
worth keeping.

- **State doses in milligrams, always.** Never "a blend of".
- **Name the study, journal and year.** Link a PubMed *search* URL, not a guessed PMID — search
  URLs never 404 and never point at the wrong paper.
- **Publish the inconvenient evidence.** The joint article says the GAIT trial found glucosamine
  no better than placebo, and that Skelecoll's 300mg glucosamine is a supporting co-factor
  rather than a therapeutic dose. The knee article says Cissus quadrangularis has thin modern
  evidence. This is what makes the rest believable.
- **Never claim what no trial showed.** No cartilage regrowth. No skin whitening.
- **Every article carries the medical disclaimer** (`.jr-disclaimer`) and a "see a doctor if"
  section where relevant.
- **Glutathione is never marketed as skin-whitening** — tone and pigmentation only.

---

## Next article ideas

Keyword-led, alternating between the two products so both clusters grow evenly.

| Suggested handle | Primary keyword | Product | Author |
|---|---|---|---|
| `best-time-to-take-collagen` | best time to take collagen | Both | Either |
| `marine-vs-bovine-collagen` | marine vs bovine collagen | Collabloom | Raashi |
| `collagen-for-hair-growth` | collagen for hair growth | Collabloom | Raashi |
| `hyaluronic-acid-benefits` | hyaluronic acid benefits for skin | Collabloom | Raashi |
| `collagen-side-effects` | collagen side effects | Both | Either |
| `how-to-increase-bone-density` | how to increase bone density | Skelecoll | Nachiket |
| `vitamin-d-deficiency-india` | vitamin d deficiency symptoms | Skelecoll | Nachiket |
| `collagen-after-40` | collagen after 40 | Both | Either |
| `exercises-for-knee-pain` | exercises for knee pain at home | Skelecoll | Nachiket |

---

## Reference: design classes

All in `snippets/journal-styles.liquid`, all namespaced `.jr-`.

| Class | Use |
|---|---|
| `.jr-hero jr-hero--skin` / `--joint` | Bottle on a tinted gradient plate |
| `.jr-answer` | Direct-answer box below the hero |
| `.jr-toc` | Jump-link contents |
| `.jr-stats` / `.jr-stat` | Cited statistic tiles |
| `.jr-quote` | Founder pull-quote with avatar |
| `.jr-table-scroll` + `.jr-table` | Comparison table, scrolls on mobile |
| `.jr-figure` | Inline SVG chart container |
| `.jr-figure jr-figure--slide` | 4:5 infographic, never cropped |
| `.jr-product` | Product cross-link card |
| `.jr-faq` | `<details>` accordion |
| `.jr-sources` | Numbered source list |
| `.jr-author` | E-E-A-T bio card |
| `.jr-disclaimer` | Medical disclaimer |
| `.jr-related` | 3-card "Keep reading" grid |

**Do not put product photography in a 16:9 hero.** The `-slide-N.webp` assets are 4:5
infographics and crop badly. That is why heroes use the bottle PNG on a designed plate.
