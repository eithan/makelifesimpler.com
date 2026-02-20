#!/usr/bin/env node
/**
 * build.js — Static site generator for makelifesimpler v2
 * Hub-and-spoke architecture with weekly drops.
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
  if (!(a.id in state)) state[a.id] = Math.floor(Math.random() * 800) + 200;
});
fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

// ─── Load templates ─────────────────────────────────────────
const tmpl = name => fs.readFileSync(path.join(TEMPLATES, name), 'utf8');
const headerTmpl = tmpl('header.html');
const footerTmpl = tmpl('footer.html');
const homeTmpl = tmpl('home.html');
const articleTmpl = tmpl('article.html');
const hubTmpl = tmpl('hub.html');
const archiveTmpl = tmpl('archive.html');

// ─── Helpers ─────────────────────────────────────────────────
const totalClicks = Object.values(state).reduce((s, v) => s + v, 0);
const clicksDisplay = totalClicks >= 1000 ? Math.round(totalClicks / 1000) + 'K+' : totalClicks.toString();

function scoreColor(score) {
  if (score >= 7) return 'score-green';
  if (score >= 4) return 'score-yellow';
  return 'score-red';
}

function buildCard(article, basePath, extraClass) {
  basePath = basePath || '';
  extraClass = extraClass || '';
  const searchText = [article.title, article.summary, ...article.tags].join(' ').toLowerCase();
  const tagsData = [article.hub, ...article.tags].join(',');
  const score = article.simplicityScore ? article.simplicityScore.score : null;
  const scoreBadge = score !== null
    ? `<span class="simplicity-badge ${scoreColor(score)}" title="Simplicity Score">${score}</span>`
    : '';
  const hubClass = article.hub || article.section || '';
  return `
    <a href="${basePath}article.html?id=${article.id}" class="item-card${extraClass}" data-search="${searchText}" data-tags="${tagsData}">
      <div class="item-icon ${hubClass}">${article.emoji}</div>
      <div class="item-info">
        <h4>${article.title} ${scoreBadge}</h4>
        <p>${article.summary}</p>
        <div class="item-meta">
          ${article.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          <span class="upvote">▲ ${state[article.id]}</span>
        </div>
      </div>
    </a>`;
}

// ─── Featured item ───────────────────────────────────────────
const featuredArticle = site.featuredOverride
  ? articles.find(a => a.id === site.featuredOverride)
  : articles.find(a => a.featured);

let featuredHtml = '';
if (featuredArticle) {
  featuredHtml = `
  <a href="article.html?id=${featuredArticle.id}" class="featured">
    <div class="featured-text">
      <div class="featured-badge">⭐ Pick of the Week</div>
      <h3>${featuredArticle.title}</h3>
      <p>${featuredArticle.summary}</p>
      <span class="cta-btn">See Why It's #1 →</span>
    </div>
    <div class="featured-img">${featuredArticle.emoji}</div>
  </a>`;
}

// ─── Drop sections ───────────────────────────────────────────
function buildDropSection(drop, label) {
  if (!drop) return '';
  const dropArticles = drop.articleIds
    .map(id => articles.find(a => a.id === id))
    .filter(Boolean);
  if (dropArticles.length === 0) return '';
  const cards = dropArticles.map((a, i) => buildCard(a, '', i >= 4 ? ' drop-extra' : ''));
  return `
  <div class="section-block drop-section">
    <div class="section-header">
      <h2><span class="emoji">🆕</span>${label}</h2>
      <span class="drop-date">${drop.date}</span>
    </div>
    <div class="items-grid">
      ${cards.join('')}
    </div>
    ${dropArticles.length > 4 ? '<button class="see-more-btn" onclick="this.parentElement.classList.add(\'expanded\');this.remove();">See more ↓</button>' : ''}
  </div>`;
}

const currentDrop = site.drops.find(d => d.id === site.currentDrop);
const previousDrop = site.drops.find(d => d.id === site.previousDrop);

const thisWeekHtml = buildDropSection(currentDrop, 'This Week');
const lastWeekHtml = buildDropSection(previousDrop, 'Last Week');

// ─── Hub cards for homepage grid (sorted by most recent article) ─
// Determine recency: find the latest drop index each hub appears in
function hubRecency(hubId) {
  // Check drops in order (newest first by date)
  const sortedDrops = site.drops.slice().sort((a, b) => b.date.localeCompare(a.date));
  for (let i = 0; i < sortedDrops.length; i++) {
    const drop = sortedDrops[i];
    const hasArticle = drop.articleIds.some(id => {
      const a = articles.find(art => art.id === id);
      return a && a.hub === hubId;
    });
    if (hasArticle) return i; // lower = more recent
  }
  return sortedDrops.length; // no articles in any drop = least recent
}

const sortedHubs = site.hubs.slice().sort((a, b) => hubRecency(a.id) - hubRecency(b.id));

function hubCardCount(hubId) {
  return articles.filter(a => a.hub === hubId).length;
}

const hubCardsHtml = sortedHubs.map(h => {
  const count = hubCardCount(h.id);
  return `
    <a href="hub/${h.id}.html" class="hub-card">
      <span class="hub-card-emoji">${h.emoji}</span>
      <span class="hub-card-name">${h.title}</span>
      <span class="hub-card-count">${count} pick${count !== 1 ? 's' : ''}</span>
    </a>`;
}).join('');

// ─── Assemble home page ─────────────────────────────────────
let homeContent = homeTmpl
  .replace(/\{\{TOTAL_ARTICLES\}\}/g, articles.length.toString())
  .replace('{{TOTAL_HUBS}}', site.hubs.length.toString())
  .replace('{{TOTAL_CLICKS}}', clicksDisplay)
  .replace('{{FEATURED}}', featuredHtml)
  .replace('{{THIS_WEEK}}', thisWeekHtml)
  .replace('{{HUB_CARDS}}', hubCardsHtml)
  .replace('{{LAST_WEEK}}', lastWeekHtml);

const homeHtml = headerTmpl.replace('{{TITLE}}', 'Make Life Simpler — Curated Tools & Products') + homeContent + footerTmpl;

// ─── Article page ───────────────────────────────────────────
const articleHtml = headerTmpl.replace('{{TITLE}}', 'Make Life Simpler') + articleTmpl + footerTmpl;

// ─── Hub pages ──────────────────────────────────────────────
fs.mkdirSync(path.join(DIST, 'hub'), { recursive: true });

for (const hub of site.hubs) {
  const hubArticles = articles
    .filter(a => a.hub === hub.id)
    .sort((a, b) => (b.simplicityScore?.score || 0) - (a.simplicityScore?.score || 0));

  let hubContent = hubTmpl
    .replace('{{HUB_EMOJI}}', hub.emoji)
    .replace('{{HUB_TITLE}}', hub.title)
    .replace('{{HUB_DESCRIPTION}}', hub.description)
    .replace('{{HUB_COUNT}}', hubArticles.length.toString())
    .replace('{{HUB_ARTICLES}}', hubArticles.map(a => buildCard(a, '../')).join(''));

  const hubHeader = headerTmpl
    .replace('{{TITLE}}', hub.title + ' — Make Life Simpler')
    .replace('href="favicon.svg"', 'href="../favicon.svg"')
    .replace('href="assets/style.css"', 'href="../assets/style.css"');
  const hubFooter = footerTmpl;

  hubContent = hubContent.replace('href="index.html"', 'href="../index.html"');

  fs.writeFileSync(path.join(DIST, 'hub', hub.id + '.html'), hubHeader + hubContent + hubFooter);
}

// ─── Archive page ───────────────────────────────────────────
const dropsHtml = site.drops
  .slice()
  .sort((a, b) => b.date.localeCompare(a.date))
  .map(drop => {
    const dropArticles = drop.articleIds
      .map(id => articles.find(a => a.id === id))
      .filter(Boolean);
    return `
    <div class="drop-block">
      <div class="drop-block-header">
        <h2>${drop.title}</h2>
        <span class="drop-date">${drop.date}</span>
      </div>
      <div class="items-grid">
        ${dropArticles.map(a => buildCard(a)).join('')}
      </div>
    </div>`;
  }).join('');

let archiveContent = archiveTmpl.replace('{{DROPS}}', dropsHtml);
const archiveHtml = headerTmpl.replace('{{TITLE}}', 'Drop Archive — Make Life Simpler') + archiveContent + footerTmpl;

// ─── Write dist ─────────────────────────────────────────────
fs.mkdirSync(path.join(DIST, 'articles'), { recursive: true });
fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });
fs.mkdirSync(path.join(DIST, 'hub'), { recursive: true });

fs.writeFileSync(path.join(DIST, 'index.html'), homeHtml);
fs.writeFileSync(path.join(DIST, 'article.html'), articleHtml);
fs.writeFileSync(path.join(DIST, 'archive.html'), archiveHtml);

// Copy article JSON files to dist
articles.forEach(a => {
  fs.copyFileSync(
    path.join(ARTICLES_SRC, a.id + '.json'),
    path.join(DIST, 'articles', a.id + '.json')
  );
});

// Copy style.css
fs.copyFileSync(
  path.join(ROOT, 'style.css'),
  path.join(DIST, 'assets', 'style.css')
);

console.log(`✅ Built ${articles.length} articles → dist/`);
console.log(`   Hubs: ${site.hubs.length} | Drops: ${site.drops.length}`);
console.log(`   Pages: index, article, archive, ${site.hubs.length} hub pages`);
