import { readFile, writeFile, mkdir, copyFile, cp, access, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { marked } from 'marked';
import sanitize from 'sanitize-html';
import { projects, collections, read, demo } from '../catalog.mjs';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const project = path.join(root, 'ai2026');
const dist = path.join(project, 'dist');
const files = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).trim().split('\n');
const docs = files.filter(p => p.endsWith('.md') && !p.endsWith('CLAUDE.md') && (
  p.startsWith('fiction/') || p.startsWith('education/health/drafts/') ||
  ['education/health/curriculum.md', 'education/typescript/curriculum.md'].includes(p) ||
  p.startsWith('movie/contest/') || ['movie/final-plan.md', 'movie/README.md'].includes(p) ||
  /^3DCG\/mls-mpm-snow\/(PROMPT|RESULTS)\.md$/.test(p) ||
  /^infographics\/bakumatsu-timeline\/(PROMPT|RESULTS)\.md$/.test(p) ||
  /^nonfiction\/ai-future\/(articles|astrea\/articles)\//.test(p)
));
const htmlFiles = files.filter(p => /^(3DCG|anime-effects|fluid-demos|infographics)\/.*\.html$/.test(p) || p === 'education/health/drafts/food-01-oil-chart.html');
const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const sourceUrl = p => `https://github.com/kzmszk/evals/blob/${revision}/${p.split('/').map(encodeURIComponent).join('/')}`;
const titles = new Map();
const bodies = new Map();
for (const p of docs) {
  const content = await readFile(path.join(root, p), 'utf8');
  bodies.set(p, content);
  titles.set(p, (content.match(/^#\s+(.+)$/m)?.[1] || path.basename(p, '.md')).replace(/[*`]/g, ''));
}
async function emit(p, text) { const dest = path.join(dist, p); await mkdir(path.dirname(dest), { recursive: true }); await writeFile(dest, text); }
const nav = `<header class="site-header"><a class="wordmark" href="/" aria-label="AI2026 ホーム">AI<span>2026</span><i></i></a><nav aria-label="メイン"><a href="/#works">作品</a><a href="/#approach">取り組み方</a><a class="source-link" href="https://github.com/kzmszk/evals">GitHub ↗</a></nav></header>`;
function layout(title, body, description = 'AIとの制作と検証の記録。動くデモ、読み物、モデル比較を集めたポートフォリオ。') {
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#f8fafb"><title>${esc(title)}${title === 'AI2026' ? '' : ' — AI2026'}</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"></head><body><a class="skip" href="#main">本文へ移動</a>${nav}${body}<footer class="footer"><a class="wordmark" href="/">AI<span>2026</span></a><p>AIとの制作と検証の記録</p><a href="#top">ページの先頭へ ↑</a></footer></body></html>`;
}
const card = (p, index) => `<article class="work ${p.featured ? 'featured' : ''}"><a class="shot" href="${esc(p.url)}" aria-label="${esc(p.title)}：${esc(p.label)}"><img src="/thumbnails/${p.id}.jpg" alt="${esc(p.title)}の実画面" width="1200" height="750" ${index > 1 ? 'loading="lazy"' : 'fetchpriority="high"'}><span class="open-arrow" aria-hidden="true">↗</span></a><div class="work-meta"><span>${esc(p.category)}</span><span>${String(index + 1).padStart(2, '0')}</span></div><h3><a href="${esc(p.url)}">${esc(p.title)}</a></h3><p class="description">${esc(p.description)}</p><div class="points"><span>評価のポイント</span><p>${esc(p.points)}</p></div><div class="work-bottom"><div class="tags">${p.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div><a class="primary-link" href="${esc(p.url)}">${esc(p.label)} <span aria-hidden="true">↗</span></a></div>${p.links.length ? `<div class="related">${p.links.map(([label, url]) => `<a href="${esc(url)}">${esc(label)} ↗</a>`).join('')}</div>` : ''}</article>`;
// Only this project's generated public output is replaced; source files are never removed.
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await copyFile(path.join(project, 'style.css'), path.join(dist, 'style.css'));
await emit('favicon.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#111d28"/><text x="10" y="43" font-family="Arial,sans-serif" font-weight="700" font-size="34" fill="white">AI</text><circle cx="51" cy="16" r="5" fill="#d4ef42"/></svg>');
await emit('index.html', layout('AI2026', `<main id="main"><section class="intro" id="top"><div class="eyebrow"><span class="live-dot"></span> SELECTED WORKS / 2026</div><div class="intro-line"><h1>AIの現在地を知る<br><span>Opusはどのぐらいやれる？</span></h1><div class="intro-note"><p>問いを立て、形にし、比べて磨く。<br>コード、ビジュアル、文章を横断する<br>AIとの制作と検証のポートフォリオ。</p><a href="#works">作品を見る <span aria-hidden="true">↓</span></a></div></div><div class="intro-foot"><span>RESEARCH · DESIGN · BUILD · EVALUATE</span><span>${String(projects.length).padStart(2, '0')} projects / ${docs.length} documents</span></div></section><section class="works-section" id="works" aria-labelledby="works-title"><div class="section-title"><h2 id="works-title">作品と実験<span>Selected works</span></h2><p>動かす。読む。比較する。</p></div><div class="works-grid">${projects.map(card).join('')}</div></section><section class="approach" id="approach"><div><div class="eyebrow">HOW I WORK</div><h2>成果物だけでなく、<br>判断の過程も残す。</h2></div><div class="approach-copy"><p>このリポジトリでは、AIに与えた課題、実装や原稿、比較評価の記録を蓄積しています。複数モデルに共通の課題を与え、表現の質、使いやすさ、正確性、時間経過への安定性など、作品に合った観点で確かめます。</p><p>各作品の「評価のポイント」は、見るときの着眼点です。順位や採点があるものは個別の評価記録に掲載しています。AIによる評価には評価者自身の傾向が入りうるため、人間の判断や未検証の項目も分けて記録しています。</p><a class="primary-link" href="https://github.com/kzmszk/evals">課題・コード・制作記録を GitHub で見る ↗</a></div></section></main>`));

for (const c of collections) {
  const groups = c.groups.map(([title, prefix]) => {
    const members = docs.filter(p => path.posix.dirname(p) + '/' === prefix);
    return members.length ? `<section class="document-group"><h2>${esc(title)} <span>${members.length}</span></h2><div class="document-list">${members.map(p => `<a href="${read(p)}"><div><span class="file-label">${esc(path.basename(p))}</span><h3>${esc(titles.get(p))}</h3></div><span aria-hidden="true">↗</span></a>`).join('')}</div></section>` : '';
  }).join('');
  await emit(`collections/${c.id}.html`, layout(c.title, `<main class="collection" id="main"><a class="back" href="/#${c.id}">← 作品一覧</a><div class="eyebrow" id="top">READING COLLECTION</div><h1>${esc(c.title)}</h1><p class="collection-intro">${esc(c.description)}</p>${groups}</main>`, c.description));
}

function localTarget(href, file) {
  if (/^(https?:|mailto:|tel:|#)/i.test(href)) return href;
  if (/^[a-z][a-z\d+.-]*:/i.test(href)) return '#';
  const [location, fragment] = href.split('#');
  const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), decodeURI(location)));
  const suffix = fragment ? '#' + fragment : '';
  if (docs.includes(target)) return read(target) + suffix;
  if (htmlFiles.includes(target)) return demo(target) + suffix;
  const c = collections.find(c => c.groups.some(([, prefix]) => target.replace(/\/$/, '') === prefix.replace(/\/$/, '')));
  if (c) return `/collections/${c.id}.html`;
  if (files.includes(target)) return sourceUrl(target) + suffix;
  if (files.some(file => file.startsWith(target.replace(/\/$/, '') + '/'))) return sourceUrl(target).replace('/blob/', '/tree/') + suffix;
  return null;
}
for (const p of docs) {
  const toc = [];
  const slugs = new Map();
  const renderer = new marked.Renderer();
  renderer.heading = function ({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    const plain = text.replace(/<[^>]*>/g, '');
    const base = plain.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');
    const n = slugs.get(base) || 0; slugs.set(base, n + 1);
    const id = base + (n ? `-${n}` : '');
    if (depth === 2) toc.push([id, plain]);
    return `<h${depth} id="${esc(id)}">${text}</h${depth}>`;
  };
  const rendered = marked.parse(bodies.get(p), { renderer, gfm: true });
  const content = sanitize(rendered, {
    allowedTags: [...sanitize.defaults.allowedTags, 'img', 'details', 'summary'],
    allowedAttributes: { ...sanitize.defaults.allowedAttributes, '*': ['id'], a: ['href', 'title', 'rel'], img: ['src', 'alt'], code: ['class'] },
    transformTags: {
      a: (name, attrs) => {
        const href = localTarget(attrs.href || '', p);
        return href ? { tagName: name, attribs: { ...attrs, href } } : { tagName: 'span', attribs: {} };
      },
      img: (name, attrs) => /^https:\/\//.test(attrs.src || '') ? { tagName: name, attribs: attrs } : { tagName: 'p', attribs: {}, text: `［原資料の画像：${attrs.alt || '画像'}。この公開版には未収録］` }
    }
  });
  const collection = collections.find(c => c.groups.some(([, prefix]) => p.startsWith(prefix)));
  const backUrl = collection ? `/collections/${collection.id}.html` : '/#works';
  const minutes = Math.max(1, Math.ceil(bodies.get(p).length / 600));
  await emit(read(p).slice(1), layout(titles.get(p), `<main class="reader" id="main"><div class="reader-bar" id="top"><a class="back" href="${backUrl}">← ${collection ? esc(collection.title) : '作品一覧'}</a><span>約${minutes}分 / 制作原稿</span></div><div class="reader-layout"><aside class="toc"><p class="eyebrow">CONTENTS</p><nav aria-label="目次">${toc.map(([id, title]) => `<a href="#${esc(id)}">${esc(title)}</a>`).join('')}</nav><a class="original" href="${sourceUrl(p)}">原稿を GitHub で見る ↗</a></aside><article class="prose">${content}<div class="reading-end"><a href="${backUrl}">← 一覧に戻る</a><a href="#top">先頭へ ↑</a></div></article></div></main>`, titles.get(p)));
}
for (const p of htmlFiles) { const dest = path.join(dist, demo(p)); await mkdir(path.dirname(dest), { recursive: true }); await copyFile(path.join(root, p), dest); }
try { await access(path.join(project, 'thumbnails')); await cp(path.join(project, 'thumbnails'), path.join(dist, 'thumbnails'), { recursive: true }); } catch (e) { if (e.code !== 'ENOENT') throw e; }
const astrea = path.join(root, 'nonfiction/ai-future/astrea');
execFileSync('npm', ['run', 'build', '--', '--base=/astrea/', `--outDir=${path.join(dist, 'astrea')}`], { cwd: astrea, stdio: 'inherit' });
for (const route of ['llm', 'physical', 'simulator', 'policy', 'evidence', 'method']) {
  await mkdir(path.join(dist, 'astrea', route), { recursive: true });
  await copyFile(path.join(dist, 'astrea/index.html'), path.join(dist, 'astrea', route, 'index.html'));
}
await emit('404.html', layout('ページが見つかりません', '<main class="collection" id="main"><h1>ページが見つかりません。</h1><p>作品一覧から、もう一度お探しください。</p><a class="primary-link" href="/">AI2026 に戻る →</a></main>'));
await emit('_headers', '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n/thumbnails/*\n  Cache-Control: public, max-age=86400\n');
await emit('manifest.json', JSON.stringify({ projects: projects.length, documents: docs.map(p => read(p)), demos: htmlFiles.map(demo) }, null, 2));
// Stable return links from the reading collections to their project cards.
const home = await readFile(path.join(dist, 'index.html'), 'utf8');
let cardIndex = 0;
await emit('index.html', home.replace(/<article class="work /g, match => `<article id="${projects[cardIndex++].id}" class="work `));
console.log(`AI2026: ${projects.length} projects, ${docs.length} documents, ${htmlFiles.length} HTML demos + ASTREA`);
