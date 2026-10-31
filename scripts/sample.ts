import { GENERATORS } from '../src/content/registry'
import type { Difficulty, Lang } from '../src/content/types'
const filter = process.argv[2] ?? ''
const lang = (process.argv[3] ?? 'de') as Lang
const seeds = Number(process.argv[4] ?? 1)
for (const g of GENERATORS.filter((g) => g.id.includes(filter))) {
  for (const d of [1, 2, 3] as Difficulty[]) {
    for (let s = 0; s < seeds; s++) {
      const it = g.generate(1000 + s * 7919 + d, d, lang)
      console.log(`\n=== ${g.id} d${d} [${it.type}] ${it.prompt}${it.hint ? '  (' + it.hint + ')' : ''}`)
      if (it.type === 'mcq') it.options.forEach((o, i) => console.log(`  ${i === it.correct ? '*' : ' '} ${String.fromCharCode(65 + i)}) ${o.text}`))
      it.explanation.steps.forEach((x) => console.log('   · ' + x))
      if (it.explanation.shortcut) console.log('   ⚡ ' + it.explanation.shortcut)
      it.explanation.distractors?.forEach((x) => console.log('   ✗ ' + x))
    }
  }
}
