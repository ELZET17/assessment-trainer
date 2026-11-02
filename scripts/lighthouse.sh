#!/bin/bash
# Gate 7 – Lighthouse (mobile + desktop) against a running production preview.
# Usage: scripts/lighthouse.sh [url]
URL="${1:-http://127.0.0.1:4174/}"
mkdir -p gate-output/lighthouse
for p in mobile desktop; do
  F=""; [ "$p" = desktop ] && F="--preset=desktop"
  npx lighthouse "$URL" $F --only-categories=performance,accessibility,best-practices,seo \
    --output=json --output=html --output-path="gate-output/lighthouse/$p" \
    --chrome-flags="--headless=new" --quiet >/dev/null 2>&1
  python3 - "$p" <<'PY'
import json, sys
p = sys.argv[1]
d = json.load(open(f'gate-output/lighthouse/{p}.report.json'))
print(p, {k: round(v['score'] * 100) for k, v in d['categories'].items()})
for a in d['audits'].values():
    if a.get('score') is not None and a['score'] < 0.9 and a.get('scoreDisplayMode') in ('binary', 'numeric', 'metricSavings'):
        print('  -', a['id'], a['score'], a.get('displayValue', ''))
PY
done
