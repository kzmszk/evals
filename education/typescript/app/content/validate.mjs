// コンテンツ整合性チェッカ: node validate.mjs
// 各章ファイルについて id/ファイル名一致・quiz 難易度内訳・review と節タイトルの一致を検証する
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(dir).filter(f => f.endsWith('.js'));
let failed = false;

for (const file of files.sort()) {
  const src = readFileSync(join(dir, file), 'utf8');
  const registered = [];
  const sandbox = { window: { COURSE: { register: ch => registered.push(ch) } } };
  try {
    new Function('window', src)(sandbox.window);
  } catch (e) {
    console.log(`✗ ${file}: 実行エラー ${e.message}`);
    failed = true;
    continue;
  }
  if (registered.length !== 1) {
    console.log(`✗ ${file}: register 呼び出しが ${registered.length} 回`);
    failed = true;
    continue;
  }
  const ch = registered[0];
  const errs = [];
  if (ch.id !== file.replace('.js', '')) errs.push(`id '${ch.id}' がファイル名と不一致`);
  if (!['basic', 'advanced', 'bridge'].includes(ch.part)) errs.push(`part '${ch.part}' が不正`);
  if (!ch.title || !ch.minutes || !ch.sections?.length) errs.push('title/minutes/sections が欠落');
  const secTitles = new Set((ch.sections || []).map(s => s.title));

  if (ch.part !== 'bridge') {
    if (!ch.exercise?.instructions || !ch.exercise?.starter) errs.push('exercise が不完全');
    const quiz = ch.quiz || [];
    const byD = { 1: 0, 2: 0, 3: 0 };
    for (const q of quiz) {
      byD[q.d] = (byD[q.d] || 0) + 1;
      if (!['choice', 'code'].includes(q.type)) errs.push(`quiz type '${q.type}' が不正`);
      if (q.type === 'choice' && (q.answer == null || !q.options?.[q.answer])) errs.push(`choice 問題の answer が不正: ${String(q.prompt).slice(0, 30)}`);
      if (q.type === 'code' && !q.check) errs.push(`code 問題に check がない: ${String(q.prompt).slice(0, 30)}`);
      if (q.review && !secTitles.has(q.review)) errs.push(`review '${q.review}' が節タイトルに存在しない`);
    }
    if (quiz.length < 9) errs.push(`quiz が ${quiz.length} 問(9問未満)`);
    if (byD[1] < 3 || byD[2] < 3 || byD[3] < 3) errs.push(`難易度内訳不足 d1:${byD[1]} d2:${byD[2]} d3:${byD[3]}`);
    console.log(`${errs.length ? '✗' : '✓'} ${file}: ${ch.sections.length}節 quiz${quiz.length}問(d1:${byD[1]}/d2:${byD[2]}/d3:${byD[3]})`);
  } else {
    console.log(`${errs.length ? '✗' : '✓'} ${file}: ${ch.sections.length}節(橋渡し・テストなし)`);
  }
  for (const e of errs) { console.log(`   - ${e}`); failed = true; }
}
console.log(failed ? '\nNG: 上記を修正してください' : '\nAll OK');
process.exit(failed ? 1 : 0);
