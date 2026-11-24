// Builds baseline-left / upgraded-right composites with pixel-diff % and writes report/README.md.
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const root = path.dirname(new URL(import.meta.url).pathname);
const shots = path.join(root, 'report', 'shots');
const outDir = path.join(root, 'report', 'side-by-side');
fs.mkdirSync(outDir, { recursive: true });

const pad = (img, w, h) => {
  const out = new PNG({ width: w, height: h, fill: true });
  out.data.fill(255);
  PNG.bitblt(img, out, 0, 0, img.width, img.height, 0, 0);
  return out;
};

const names = fs.existsSync(path.join(shots, 'baseline'))
  ? fs.readdirSync(path.join(shots, 'baseline')).filter((f) => f.endsWith('.png')).sort() : [];
const rows = [];
for (const name of names) {
  const up = path.join(shots, 'upgraded', name);
  if (!fs.existsSync(up)) { rows.push([name, 'missing upgraded', '-']); continue; }
  const a = PNG.sync.read(fs.readFileSync(path.join(shots, 'baseline', name)));
  const b = PNG.sync.read(fs.readFileSync(up));
  const w = Math.max(a.width, b.width), h = Math.max(a.height, b.height);
  const pa = pad(a, w, h), pb = pad(b, w, h);
  const diff = new PNG({ width: w, height: h });
  const n = pixelmatch(pa.data, pb.data, diff.data, w, h, { threshold: 0.1 });
  const pct = (100 * n / (w * h)).toFixed(2);
  const gap = 16;
  const combo = new PNG({ width: w * 2 + gap, height: h, fill: true });
  combo.data.fill(255);
  PNG.bitblt(pa, combo, 0, 0, w, h, 0, 0);
  PNG.bitblt(pb, combo, 0, 0, w, h, w + gap, 0);
  fs.writeFileSync(path.join(outDir, name), PNG.sync.write(combo));
  rows.push([name, `${pct}%`, `${a.width}x${a.height} / ${b.width}x${b.height}`]);
}

let tests = [];
const resultsFile = path.join(root, 'report', 'results.json');
if (fs.existsSync(resultsFile)) {
  const walk = (suite, titles = []) => {
    for (const s of suite.suites || []) walk(s, [...titles, s.title]);
    for (const spec of suite.specs || []) for (const t of spec.tests) {
      const last = t.results[t.results.length - 1];
      tests.push({ title: [...titles, spec.title].filter(Boolean).join(' › '), project: t.projectName, status: last ? last.status : 'skipped' });
    }
  };
  walk(JSON.parse(fs.readFileSync(resultsFile, 'utf8')));
}
const byTitle = new Map();
for (const t of tests) { const r = byTitle.get(t.title) || {}; r[t.project] = t.status; byTitle.set(t.title, r); }
const count = (p, s) => tests.filter((t) => t.project === p && t.status === s).length;

let md = '# Parity report\n\nBaseline (`develop`, :4000) vs upgraded (this branch, :4200). Same specs, both projects.\n\n';
md += `| Project | Passed | Failed |\n|---|---|---|\n`;
for (const p of ['baseline', 'upgraded']) md += `| ${p} | ${count(p, 'passed')} | ${count(p, 'failed') + count(p, 'timedOut')} |\n`;
md += '\n## Specs\n\n| Spec | Baseline | Upgraded |\n|---|---|---|\n';
for (const [title, r] of byTitle) md += `| ${title} | ${r.baseline || '-'} | ${r.upgraded || '-'} |\n`;
md += '\n## Screenshots (left: baseline, right: upgraded)\n\n| Page | Pixel diff | Size (baseline / upgraded) |\n|---|---|---|\n';
for (const [n, pct, size] of rows) md += `| [${n}](side-by-side/${n}) | ${pct} | ${size} |\n`;
fs.writeFileSync(path.join(root, 'report', 'README.md'), md);
console.log(md);
