#!/usr/bin/env node
/**
 * build.js — Static site generator for makelifesimpler.com
 * No dependencies, pure Node.js (fs + path only).
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const ARTICLES_SRC = path.join(ROOT, 'articles');
const TEMPLATES = path.join(ROOT, 'templates');

// ─── Load data ───────────────────────────────────────────────
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.json'), 'utf8'));
const articles = fs.readdirSync(ARTICLES_SRC)
  .filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(ARTICLES_SRC, f), 'utf8')));

// ─── State (click counters) ─────────────────────────────────
const statePath = path.join(ROOT, 'state.json');
let state = {};
if (fs.existsSync(statePath)) {
  state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
}
articles.forEach(a => {
  if (!(a.id in state)) {
    state[a.id] = Math.floor(Math.random() * 800) + 200; // 200-999
  }
});
fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

// ─── Load templates ─────────────────────────────────────────
const tmpl = name => fs.readFileSync(path.join(TEMPLATES, name), 'utf8');
const headerTmpl = tmpl('header.html');
const footerTmpl = tmpl('footer.html');
const homeTmpl = tmpl('home.html');
const articleTmpl = tmpl('article.html');

// ─── Compute stats ──────────────────────────────────────────
const allTags = articles.flatMap(a => a.tags);
const uniqueTags = [...new Set(allTags)];
const totalClicks = Object.values(state).reduce((s, v) => s + v, 0);
const clicksDisplay = totalClicks >= 1000 ? Math.round(totalClicks / 1000) + 'K+' : totalClicks.toString();

// ─── Determine featured article ─────────────────────────────
let featured;
if (site.featuredOverride) {
  featured = articles.find(a => a.id === site.featuredOverride);
}
if (!featured) {
  featured = articles.reduce((best, a) => (state[a.id] > state[best.id] ? a : best), articles[0]);
}

// ─── Build tabs (top 10 tags by frequency) ──────────────────
const tagCounts = {};
allTags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
const topTags = Object.entries(tagCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(e => e[0]);

const tabsHtml = [
  '<div class="tab active" data-tag=""><span class="emoji">🔥</span>Trending</div>',
  ...topTags.map(t => `<div class="tab" data-tag="${t}"><span class="emoji">📌</span>${t}</div>`)
].join('\n  ');

// ─── Build featured card ────────────────────────────────────
const featuredHtml = `
  <a href="article.html?id=${featured.id}" class="featured">
    <div class="featured-text">
      <div class="featured-badge">⭐ Pick of the Week</div>
      <h3>${featured.title}</h3>
      <p>${featured.summary}</p>
      <span class="cta-btn">See Why It's #1 →</span>
    </div>
    <div class="featured-img">${featured.emoji}</div>
  </a>`;

// ─── Build section cards ────────────────────────────────────
function buildCard(article) {
  const tag = article.tags[0] || '';
  const searchText = [article.title, article.summary, ...article.tags].join(' ').toLowerCase();
  const tagsData = article.tags.join(',');
  return `
    <a href="article.html?id=${article.id}" class="item-card" data-search="${searchText}" data-tags="${tagsData}">
      <div class="item-icon ${article.section}">${article.emoji}</div>
      <div class="item-info">
        <h4>${article.title}</h4>
        <p>${article.summary}</p>
        <div class="item-meta">
          <span class="tag">${tag}</span>
          <span class="upvote">▲ ${state[article.id]}</span>
        </div>
      </div>
    </a>`;
}

// Sort articles by clicks (descending) within each section
let sectionsHtml = '';
for (const section of site.sections) {
  const sectionArticles = articles
    .filter(a => a.section === section.id)
    .sort((a, b) => state[b.id] - state[a.id]);

  if (sectionArticles.length === 0) continue;

  sectionsHtml += `
  <div class="section-block">
    <div class="section-header">
      <h2><span class="emoji">${section.emoji}</span>${section.title}</h2>
    </div>
    <div class="items-grid">
      ${sectionArticles.map(buildCard).join('')}
    </div>
  </div>`;
}

// ─── Assemble pages ─────────────────────────────────────────
// Home page
let homeContent = homeTmpl
  .replace(/\{\{TOTAL_ARTICLES\}\}/g, articles.length.toString())
  .replace('{{TOTAL_TAGS}}', uniqueTags.length.toString())
  .replace('{{TOTAL_CLICKS}}', clicksDisplay)
  .replace('{{TABS}}', tabsHtml)
  .replace('{{FEATURED}}', featuredHtml)
  .replace('{{SECTIONS}}', sectionsHtml);

const homeHtml = headerTmpl.replace('{{TITLE}}', 'Make Life Simpler — Curated Tools & Products') + homeContent + footerTmpl;

// Article page
const articleHtml = headerTmpl.replace('{{TITLE}}', 'Make Life Simpler') + articleTmpl + footerTmpl;

// ─── Write dist ─────────────────────────────────────────────
fs.mkdirSync(path.join(DIST, 'articles'), { recursive: true });
fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });

fs.writeFileSync(path.join(DIST, 'index.html'), homeHtml);
fs.writeFileSync(path.join(DIST, 'article.html'), articleHtml);

// Copy article JSON files to dist
articles.forEach(a => {
  fs.copyFileSync(
    path.join(ARTICLES_SRC, a.id + '.json'),
    path.join(DIST, 'articles', a.id + '.json')
  );
});

// Copy CSS (already exists but rebuild from source to be safe)
const cssPath = path.join(ROOT, 'dist', 'assets', 'style.css');
// CSS is maintained as a static file; no extraction needed

console.log(`✅ Built ${articles.length} articles → dist/`);
console.log(`   Featured: ${featured.title}`);
console.log(`   Tags: ${uniqueTags.length} | Clicks: ${clicksDisplay}`);
