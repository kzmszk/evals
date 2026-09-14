import { readFile, stat, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects } from '../catalog.mjs';
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
let checks = 0;
const failures = [];
async function exists(url) {
  const target = path.join(dist, decodeURIComponent(url.split(/[?#]/)[0]));
  try { const info = await stat(target); if (info.isDirectory()) await stat(path.join(target, 'index.html')); }
  catch { failures.push(`Missing ${url}`); }
  checks++;
}
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) { if (!['works', 'astrea', 'thumbnails'].includes(entry.name)) await walk(full); }
    else if (entry.name.endsWith('.html')) {
      const html = await readFile(full, 'utf8');
      for (const [, url] of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)) await exists(url);
      if (/<script\b/i.test(html) || /(?:href|src)="javascript:/i.test(html)) failures.push(`Unsafe generated reading page: ${full}`);
    }
  }
}
await walk(dist);
for (const p of projects) {
  await exists(`/thumbnails/${p.id}.jpg`);
  if (!p.url.startsWith('https:')) await exists(p.url);
}
const manifest = JSON.parse(await readFile(path.join(dist, 'manifest.json'), 'utf8'));
for (const url of [...manifest.documents, ...manifest.demos]) await exists(url);
for (const route of ['llm','physical','simulator','policy','evidence','method']) await exists(`/astrea/${route}/`);
const astrea = await readFile(path.join(dist, 'astrea/index.html'), 'utf8');
if (!astrea.includes('/astrea/assets/')) failures.push('ASTREA asset base is incorrect');
if (failures.length) { console.error([...new Set(failures)].join('\n')); process.exitCode = 1; }
else console.log(`${checks} local link/asset checks passed; ${manifest.documents.length} reading pages and ${manifest.demos.length} HTML demos ready.`);
