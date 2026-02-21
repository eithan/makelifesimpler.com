# Content Curation Guide — makelifesimpler.com

This document explains how to source, write, categorize, and score articles for the site. It's designed to be followed by any AI agent or human curator.

---

## What the Site Is

A curated hub of tools, products, and discoveries that genuinely simplify people's lives. Dark theme, clean design, weekly drops of 8-10 picks. No fluff, no filler — only things that actually work.

## Article Structure

Each article is a JSON file in `articles/`. Here's the full schema:

```json
{
  "id": "kebab-case-unique-id",
  "title": "Product Name — Short Punchy Subtitle",
  "emoji": "🔧",
  "summary": "One sentence (max 2) explaining what it does and why it matters. Under 200 chars.",
  "content": "<p>HTML paragraphs. 3 paragraphs recommended. See writing guide below.</p>",
  "tags": ["Tag1", "Tag2"],
  "hub": "hub-id",
  "section": "tech|products",
  "featured": false,
  "simplicityScore": {
    "score": 7.4,
    "timeSaved": 7,
    "easeOfSetup": 8
  },
  "frictionNote": "One honest sentence about what sucks or what the catch is.",
  "guides": []
}
```

### Field Details

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique kebab-case identifier. Used in URLs and filenames. |
| `title` | Yes | Format: `Product Name — Subtitle`. Subtitle should convey the value proposition. |
| `emoji` | Yes | Single emoji representing the product. |
| `summary` | Yes | 1-2 sentences, under 200 characters. This appears on cards. |
| `content` | Yes | HTML string. 3 paragraphs. See writing guide. |
| `tags` | Yes | 2-3 tags. Use existing tags when possible (see below). |
| `hub` | Yes | Must match a hub ID from `site.json`. |
| `section` | Yes | `"tech"` for software/digital, `"products"` for physical items. |
| `featured` | No | Set `true` for Pick of the Week. Only one article should be featured. |
| `simplicityScore` | Yes | See scoring guide below. |
| `frictionNote` | Yes | Honest downside. Every product has one. |
| `guides` | No | Array of guides (video/article/summary). Can be empty `[]`. |

---

## Categories (Hubs)

Assign every article to exactly one hub:

| Hub ID | Title | What Goes Here |
|--------|-------|----------------|
| `ai-tools` | AI Tools | AI-powered software, chatbots, AI assistants, AI dev tools |
| `smart-home` | Smart Home | Home automation, smart speakers, thermostats, lighting |
| `digital-productivity` | Digital Productivity | Note-taking, calendars, task managers, workflow tools |
| `financial-automation` | Financial Automation | Banking apps, budgeting tools, investment automation, money transfer |
| `wellness-tech` | Wellness & Health Tech | Sleep trackers, fitness wearables, health monitors |
| `kitchen-tech` | Kitchen Tech | Smart appliances, cooking gadgets, meal prep tools |
| `networking` | Networking & Security | VPNs, mesh WiFi, password managers, network security |
| `travel-packing` | Travel & Packing | Luggage, travel gadgets, packing tools, travel apps |
| `cleaning-tech` | Cleaning Tech | Robot vacuums, smart mops, cleaning gadgets |

If a product doesn't fit any hub, it probably doesn't fit the site. Don't force it.

---

## Simplicity Score

Every article gets a simplicity score based on two dimensions:

### Time Saved (1-10)
How much time, effort, or mental load does this product eliminate?

| Score | Meaning | Example |
|-------|---------|---------|
| 9-10 | Eliminates hours of work per week | AI coding assistant, robot vacuum |
| 7-8 | Saves significant time regularly | Smart thermostat, password manager |
| 5-6 | Moderate time savings | USB charging station, carry-on bag |
| 3-4 | Minor convenience | Cable organizer |
| 1-2 | Barely saves time | Novelty item |

### Ease of Setup (1-10)
How easy is it to go from purchase/download to daily use? **Higher = easier.**

| Score | Meaning | Example |
|-------|---------|---------|
| 9-10 | No setup / instant use | A bag, a browser extension, plug-and-play |
| 7-8 | Quick setup (<30 min), minimal config | App install + sign up, simple pairing |
| 5-6 | Moderate setup, some learning curve | Smart home hub, self-hosted software |
| 3-4 | Significant setup, technical knowledge needed | Home server, complex integrations |
| 1-2 | Expert-level installation | Custom firmware, professional install required |

### Overall Score Formula

```
score = (timeSaved × 0.6) + (easeOfSetup × 0.4)
```

Round to one decimal place. Time saved is weighted more because the site's value proposition is about simplifying life — a product that saves tons of time is valuable even if setup is moderate.

### Score Colors (automatic)
- 🟢 **Green** (7.0+): Recommended — genuinely simplifies life
- 🟡 **Yellow** (4.0-6.9): Worth it for the right person
- 🔴 **Red** (below 4.0): Hard to recommend (shouldn't appear often on this site)

---

## Writing Guide

### Title
Format: `Product Name — Value Proposition`
- Good: `Wise — International Money Without the Bank Markup`
- Bad: `Wise Review` or `Wise: A Financial App`

### Summary
One punchy sentence explaining what it does and why someone should care. Under 200 characters. This is the card text — it must stand alone.

### Content Length & Structure

Target **500-800 words** per article. The content field contains HTML with the following structure:

- **Problem-first `<h3>` headline**: Frame a relatable problem, e.g. "How to stop vacuuming forever" — not "Roborock S8 Review"
- **Paragraph 1 — The problem this solves.** Specific, relatable pain point. Make the reader feel the frustration.
- **Paragraph 2 — What it does and why it's different.** Core value proposition and how it compares to alternatives. Be specific, not generic.
- **Paragraph 3 — Standout features.** 2-3 features that actually matter for simplifying life. Skip the spec sheet.
- **Paragraph 4 — Real-world impact.** Concrete outcomes: time saved, money saved, stress reduced. Include real numbers and comparisons.
- **`<h3>⚡ Set it up in 5 minutes</h3>` section**: A short numbered `<ol>` list of 3-5 setup steps. Practical, actionable, specific.

### Tone
- Conversational but informed. Like a smart friend recommending something.
- No marketing speak. No "revolutionary" or "game-changing."
- Be specific. "Saves 20 minutes per day" beats "saves time."
- Have opinions. If something is the best in its category, say so.

### Friction Note
Every product has a catch. Be honest about it. Price, subscription requirements, setup complexity, limitations, compatibility issues. One sentence.

### Editor's Note
- `"editorsNote"` field in JSON — 1-2 sentences
- Must reference real user feedback (Reddit, forums, reviews)
- Frame honestly: acknowledge friction, but give context
- Example: "Reddit users frequently mention X, but most say Y makes up for it."

### Internal Linking
- When writing content, scan existing articles in `articles/` for cross-referencing opportunities
- Link to related articles using `<a href="article.html?id=ID">Product Name</a>` within the content HTML
- Aim for 1-2 internal links per article where natural
- Don't force links — only add them where the reference genuinely adds value

### URL Field
- Every article must have a `"url"` field pointing to the product's official website
- Used for the mobile sticky CTA button ("Try/Buy [Product] →")
- Use the most direct product page URL, not a generic homepage if possible

---

## Tags

Use existing tags when possible. Current tags in use:

`AI Tools`, `Automation`, `Productivity`, `Calendar`, `Developer Tools`, `Smart Home`, `Energy`, `Cleaning`, `Finance`, `Travel`, `Gear`, `Wellness`, `Wearable`, `Networking`, `VPN`, `Kitchen`, `Cooking`, `USB-C`, `Charging`

Create new tags sparingly. Keep them broad enough to be useful for grouping but specific enough to be meaningful. 2-3 tags per article.

---

## Sourcing Criteria

When finding new products to feature, look for:

1. **Actually simplifies something** — saves time, reduces effort, eliminates a pain point
2. **Available to buy/use now** — no vaporware, no "coming soon"
3. **Proven** — has real users and reviews, not brand new untested
4. **Broad appeal** — useful to a wide audience, not ultra-niche
5. **Not already covered** — check existing articles in `articles/` first

### Where to Source
- Product Hunt (trending, highly upvoted)
- Reddit (r/BuyItForLife, r/homeautomation, r/productivity, r/selfhosted)
- Wirecutter / The Verge / Ars Technica top picks
- Hacker News (Show HN, popular tools)
- YouTube tech reviewers (MKBHD, Linus, etc.)

### Red Flags (Skip These)
- Products with no reviews or very new (< 3 months)
- Anything requiring a PhD to set up (unless time saved is enormous)
- Products from companies with poor track records on privacy
- Subscription-only with no free tier and minimal value
- Dropshipped junk with fake reviews

---

## Weekly Drop Process

Each week, publish a drop of **8-10 articles**:

1. **Source** — Find 8-10 candidates across different hubs. Aim for variety (don't put 5 AI tools in one drop).
2. **Write** — Create article JSON files following the schema and writing guide above.
3. **Score** — Assign timeSaved and easeOfSetup, compute overall score.
4. **Categorize** — Assign hub and tags.
5. **Update site.json** — Move current `currentDrop` to `previousDrop`, create new drop entry.
6. **Build** — Run `node build.js`.
7. **Deploy** — Commit and push to `main`. GitHub Pages auto-deploys.

### Drop Rotation in site.json

```json
{
  "currentDrop": "2026-W09",
  "previousDrop": "2026-W08",
  "drops": [
    { "id": "2026-W09", "date": "2026-03-01", "title": "This Week", "articleIds": [...] },
    { "id": "2026-W08", "date": "2026-02-22", "title": "Last Week", "articleIds": [...] },
    ...
  ]
}
```

The homepage shows only `currentDrop` (as "This Week") and `previousDrop` (as "Last Week"). Older drops are visible in the archive page.

---

## File Naming

Article filenames match their `id`: `kebab-case-name.json`
- Good: `notion-calendar.json`, `roborock-s8-maxv-ultra.json`
- Bad: `Notion_Calendar.json`, `product1.json`

---

## Guides (Optional)

If a product has good setup resources, include them:

```json
"guides": [
  {
    "title": "Full Setup Guide (Video)",
    "type": "video",
    "source": "Channel Name",
    "url": "https://youtube.com/watch?v=...",
    "summary": "What the guide covers in one sentence."
  },
  {
    "title": "Official Docs",
    "type": "article",
    "source": "Source Name",
    "url": "https://...",
    "summary": "What you'll find here."
  },
  {
    "title": "Quick Start",
    "type": "summary",
    "steps": ["Step 1 description", "Step 2 description", "Step 3 description"]
  }
]
```

Skip guides if none exist or they're low quality. An empty array `[]` is fine.
