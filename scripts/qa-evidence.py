"""Copies the gate evidence that belongs in the repo from gate-output/ to docs/qa/
(reports as Markdown, contact sheets as JPEG, Lighthouse scores as JSON)."""
import json, os, shutil
from PIL import Image

OUT = 'docs/qa'
os.makedirs(OUT, exist_ok=True)
copies = {
    'gate-output/blind-report.md': 'blind-report-r1.md',
    'gate-output/blind2-report.md': 'blind-report-r2.md',
    'gate-output/blind3-report.md': 'blind-report-r3.md',
    'gate-output/blind4-report.md': 'blind-report-r4.md',
    'gate-output/g4/review.md': 'g4-review-r1.md',
    'gate-output/g4b/review.md': 'g4-review-r2.md',
    'gate-output/g5/review.md': 'g5-review-r1.md',
    'gate-output/g5b/review.md': 'g5-review-r2.md',
    'gate-output/g9/report.md': 'g9-redteam.md',
    'gate-output/g10/review.md': 'g10-code-review.md',
    'gate-output/screens/audit.md': 'g6-audit.md',
}
for src, dst in copies.items():
    if os.path.exists(src):
        shutil.copy(src, os.path.join(OUT, dst))
for v in ['iphone-light', 'iphone-dark', 'desktop-light', 'desktop-dark']:
    p = f'gate-output/screens/sheet-{v}.png'
    if os.path.exists(p):
        Image.open(p).convert('RGB').save(f'{OUT}/g6-sheet-{v}.jpg', quality=72, optimize=True)
scores = {}
for f in sorted(os.listdir('gate-output/lighthouse')):
    if f.endswith('.json'):
        d = json.load(open(f'gate-output/lighthouse/{f}'))
        scores[f.replace('.report.json', '').replace('.json', '')] = {k: round(v['score'] * 100) for k, v in d['categories'].items()}
json.dump(scores, open(f'{OUT}/g7-lighthouse.json', 'w'), indent=1)
print(sorted(os.listdir(OUT)))
