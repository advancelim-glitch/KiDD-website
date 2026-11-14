#!/usr/bin/env node
// KiDD Global 정적 빌드 — blog.js의 글마다 공유·검색용 정적 페이지를 만든다.
//   node scripts/build-global.mjs
// 만드는 것
//   international/articles/<id>.html  글별 페이지 (본문 전체, og/twitter, JSON-LD, canonical)
//   international/feed.xml            Atom 피드 (RSS 리더·뉴스레터 도구용)
//   sitemap.xml                       <!-- global:start --> ~ <!-- global:end --> 구간만 갱신
// blog.js가 원본이다. 생성된 파일은 직접 고치지 말고 blog.js를 고친 뒤 다시 실행한다.
// 디자인은 international/index.html의 <style>을 그대로 가져와 조이의 화면과 맞춘다.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SITE = 'https://kidd.re.kr';
const OUT = path.join(ROOT, 'international', 'articles');

const ctx = {};
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'blog.js'), 'utf8') + ';this.__B=BLOG;', ctx);
const posts = (ctx.__B || []).filter(p => p && /^[A-Za-z0-9-]+$/.test(p.id || ''));

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const plain = s => String(s ?? '').replace(/\s+/g, ' ').trim();
const clip = (s, n) => { s = plain(s); return s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1) > n * 0.6 ? s.lastIndexOf(' ', n - 1) : n - 1) + '…'; };
// "1. Heading" 처럼 짧고 마침표로 끝나지 않는 번호 문단은 소제목으로 본다.
const isHeading = p => /^(\d+|[IVX]+)\.\s+\S/.test(p) && p.length <= 90 && !/[.!:]$/.test(p.trim());

const indexHtml = fs.readFileSync(path.join(ROOT, 'international', 'index.html'), 'utf8');
const style = (indexHtml.match(/<style>([\s\S]*?)<\/style>/) || [, ''])[1];
const extraCss = '.reader .back{display:block;margin-bottom:14px}.reader h2{font-size:1.3rem;margin:2em 0 .7em}.reader small{color:#63718a;font-size:.8rem;font-weight:750}.related{margin-top:40px}.related a{display:block;margin:6px 0}';

function page(p, i) {
  const url = `${SITE}/international/articles/${p.id}.html`;
  const body = p.body || [];
  const desc = clip(p.summary || body.find(x => !isHeading(x)) || p.title, 200);
  const ld = {
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: desc,
    datePublished: p.date, dateModified: p.updated || p.date, inLanguage: 'en', url, mainEntityOfPage: url,
    author: { '@type': 'Organization', name: plain(p.author) || 'KiDD' },
    publisher: { '@type': 'Organization', name: 'Korea Institute for Deliberative Democracy (KiDD)', url: SITE + '/', logo: { '@type': 'ImageObject', url: SITE + '/og-image.jpg' } },
    image: SITE + '/og-image.jpg', articleSection: p.type || 'Article',
  };
  const others = posts.filter(x => x.id !== p.id).slice(0, 3);
  // Make source URLs usable without interpreting article text as HTML.
  // Escape the prose first; only explicitly matched http(s) addresses become links.
  const linkedText = value => {
    const source = String(value ?? '');
    const urlPattern = /https?:\/\/[^\s<>"']+/g;
    let result = '', from = 0;
    for (const match of source.matchAll(urlPattern)) {
      const raw = match[0];
      const url = raw.replace(/[.,;:!?)}\]]+$/, '');
      result += esc(source.slice(from, match.index));
      result += '<a href="' + esc(url) + '" rel="noopener noreferrer">' + esc(url) + '</a>';
      result += esc(raw.slice(url.length));
      from = match.index + raw.length;
    }
    return result + esc(source.slice(from));
  };
  const paras = body.map(x => isHeading(x) ? `<h2>${esc(x)}</h2>` : `<p>${linkedText(x)}</p>`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<!-- 자동 생성 파일: scripts/build-global.mjs. 수정은 blog.js에서. -->
<title>${esc(p.title)} | KiDD Global</title>
<meta name="description" content="${esc(desc)}">
<meta name="author" content="${esc(plain(p.author))}">
<link rel="canonical" href="${url}">
<link rel="icon" href="../../logo.svg?v=10petals-20261104" type="image/svg+xml">
<link rel="alternate" type="application/atom+xml" title="KiDD Global" href="${SITE}/international/feed.xml">
<meta property="og:type" content="article"><meta property="og:site_name" content="KiDD Global"><meta property="og:locale" content="en_US">
<meta property="og:title" content="${esc(p.title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/og-image.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="article:published_time" content="${esc(p.date)}"><meta property="article:section" content="${esc(p.type || 'Article')}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(p.title)}"><meta name="twitter:description" content="${esc(desc)}">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<style>${style}${extraCss}</style>
</head>
<body>
<a class="skip-link" href="#main-content">Skip to main content</a>
<header><div class="shell bar"><a class="brand" href="../../"><img src="../../logo.svg?v=10petals-20261104" alt="KiDD flower emblem">KiDD <span style="font-weight:400">/ Global</span></a><nav aria-label="Main navigation"><a href="../../about-en.html">About</a><a href="../">Global Journal</a><a href="../../forum.html" hreflang="ko" title="Public deliberation forum (currently in Korean)">Public Deliberation (KR)</a><a href="../feed.xml">Feed</a><a href="../../">한국어</a></nav></div></header>
<main id="main-content" class="shell main" tabindex="-1">
<article class="reader">
<a class="back" href="../">← All articles</a>
<small>${esc(p.type || 'Article')} · <time datetime="${esc(p.date)}">${esc(p.date)}</time></small>
<h1>${esc(p.title)}</h1>
<p class="byline">${esc(p.author)}</p>
${paras}
<div class="reader-actions"><a href="../">All articles</a> · <a href="../../about-en.html">About KiDD</a> · <a href="mailto:advancelim@gmail.com?subject=${encodeURIComponent('Response: ' + p.title)}">Send a critical response</a></div>
${others.length ? `<nav class="related" aria-label="More from KiDD Global"><h2>More from KiDD Global</h2>${others.map(o => `<a href="${o.id}.html">${esc(o.title)}</a>`).join('')}</nav>` : ''}
</article>
</main>
<footer><div class="shell">© 2026 KiDD · Independent research · <a href="../../">kidd.re.kr</a> · AI-generated work can contain errors; agreement among AI systems is not independent corroboration.</div></footer>
</body></html>
`;
}

fs.mkdirSync(OUT, { recursive: true });
const keep = new Set(posts.map(p => p.id + '.html'));
// Remove only obsolete pages that this generator itself created. Never delete hand-maintained HTML.
for (const f of fs.readdirSync(OUT)) {
  if (!f.endsWith('.html') || keep.has(f)) continue;
  const file = path.join(OUT, f);
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes('<!-- 자동 생성 파일: scripts/build-global.mjs. 수정은 blog.js에서. -->')) {
    fs.unlinkSync(file);
  } else {
    console.warn('Keeping non-generated article page:', f);
  }
}
posts.forEach((p, i) => fs.writeFileSync(path.join(OUT, p.id + '.html'), page(p, i)));

const latest = posts.map(p => p.updated || p.date).sort().pop() || '2026-11-01';
const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<title>KiDD Global — Korea Institute for Deliberative Democracy</title>
<subtitle>Research essays, critical responses and documented human–AI inquiry on deliberative democracy.</subtitle>
<link href="${SITE}/international/"/><link rel="self" href="${SITE}/international/feed.xml"/>
<id>${SITE}/international/</id><updated>${latest}T00:00:00+09:00</updated>
${posts.map(p => `<entry><title>${esc(p.title)}</title><link href="${SITE}/international/articles/${p.id}.html"/><id>${SITE}/international/articles/${p.id}.html</id><updated>${p.updated || p.date}T00:00:00+09:00</updated><published>${p.date}T00:00:00+09:00</published><author><name>${esc(plain(p.author))}</name></author><category term="${esc(p.type || 'Article')}"/><summary>${esc(clip(p.summary || (p.body || []).find(x => !isHeading(x)) || '', 400))}</summary></entry>`).join('\n')}
</feed>
`;
fs.writeFileSync(path.join(ROOT, 'international', 'feed.xml'), feed);

const smPath = path.join(ROOT, 'sitemap.xml');
let sm = fs.readFileSync(smPath, 'utf8').replace(/<!-- global:start -->[\s\S]*?<!-- global:end -->\n?/, '');
const block = `<!-- global:start -->\n${posts.map(p => `<url><loc>${SITE}/international/articles/${p.id}.html</loc><lastmod>${p.updated || p.date}</lastmod></url>`).join('\n')}\n<!-- global:end -->\n`;
sm = sm.replace('</urlset>', block + '</urlset>');
fs.writeFileSync(smPath, sm);
console.log(`KiDD Global: ${posts.length} article pages, feed.xml, sitemap updated`);
