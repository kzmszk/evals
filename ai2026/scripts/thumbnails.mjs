import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { projects } from '../catalog.mjs';
const output = fileURLToPath(new URL('../thumbnails/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  ...(process.env.AI2026_CHROMIUM ? { executablePath: process.env.AI2026_CHROMIUM } : {}),
  args: ['--no-sandbox', '--enable-unsafe-webgpu', '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--disable-dev-shm-usage']
});
try {
  for (const project of projects.filter(p => !process.argv[2] || p.id === process.argv[2])) {
    const page = await browser.newPage({ viewport: { width: 1200, height: 750 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    try {
      const source = project.url.startsWith('https:') ? project.url : `http://127.0.0.1:4326${project.url}`;
      const response = await page.goto(source, { waitUntil: 'networkidle', timeout: 45000 });
      if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
      await page.evaluate(() => document.fonts.ready);
      if (project.id === 'effects') {
        await page.locator('#play').click();
        await page.locator('#seek').fill('2.4');
        await page.locator('#seek').dispatchEvent('input');
      }
      if (project.id === 'city') await page.locator('#overlay').click();
      // Let the real demo form a recognizable frame; these are assets, not stability-test results.
      await page.waitForTimeout(['vortex', 'smoke', 'dam', 'snow', 'golden-gate', 'city'].includes(project.id) ? 6000 : 1200);
      await page.screenshot({ path: `${output}/${project.id}.jpg`, type: 'jpeg', quality: 85, animations: 'disabled' });
      console.log(`Captured ${project.id}`);
    } finally { await page.close(); }
  }
} finally { await browser.close(); }
