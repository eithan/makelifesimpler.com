# makelifesimpler.com

A curated hub of tools and products that make life simpler. Dark theme, Product Hunt-style design.

## Build

```bash
node build.js
```

This generates the static site in `dist/`. Serve `dist/` with any static file server or GitHub Pages.

## Adding articles

Create a JSON file in `articles/` following the format:

```json
{
  "id": "my-article",
  "title": "My Article",
  "emoji": "🎯",
  "summary": "Short description.",
  "content": "<p>Full HTML content.</p>",
  "tags": ["Tag1", "Tag2"],
  "section": "tech",
  "featured": false
}
```

Then run `node build.js` again.

## Structure

- `articles/` — Source article JSON files
- `templates/` — HTML templates (header, footer, home, article)
- `dist/` — Built output (GitHub Pages serves this)
- `site.json` — Section configuration
- `state.json` — Click counter persistence (auto-generated)
- `build.js` — Build script (pure Node.js, no dependencies)
