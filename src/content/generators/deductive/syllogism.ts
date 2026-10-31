/** Syllogisms: "Assume the statements are true – which conclusion must be true?" */
import { core, tr, type GeneratorDef } from '../../generator'
import { firstAccepted } from '../../pipeline'
import type { Lang, McqItem } from '../../types'
import { follows, type Cat, type Quant } from '../../validators/deductive'

const NOUNS: [string, string][] = [
  ['analysts', 'Analysten'],
  ['runners', 'Läufer'],
  ['musicians', 'Musiker'],
  ['pilots', 'Piloten'],
  ['chess players', 'Schachspieler'],
  ['painters', 'Maler'],
  ['cyclists', 'Radfahrer'],
  ['gardeners', 'Gärtner'],
  ['swimmers', 'Schwimmer'],
  ['writers', 'Autoren'],
  ['chefs', 'Köche'],
  ['collectors', 'Sammler'],
]

interface Pattern {
  premises: Cat[]
  conclusion: Cat
  /** German reasoning with placeholders {0}…{3} for the nouns. */
  why: string
}

const c = (q: Quant, a: number, b: number): Cat => ({ q, a, b })

const TWO: Pattern[] = [
  { premises: [c('all', 0, 1), c('all', 1, 2)], conclusion: c('all', 0, 2), why: 'Alle {0} sind {1}, und alle {1} sind {2} – also sind alle {0} auch {2}.' },
  { premises: [c('all', 0, 1), c('no', 1, 2)], conclusion: c('no', 0, 2), why: 'Alle {0} sind {1}, und keine {1} sind {2} – also können keine {0} {2} sein.' },
  { premises: [c('some', 0, 1), c('all', 1, 2)], conclusion: c('some', 0, 2), why: 'Es gibt {0}, die {1} sind. Weil alle {1} auch {2} sind, sind genau diese {0} auch {2}.' },
  { premises: [c('some', 0, 1), c('no', 1, 2)], conclusion: c('someNot', 0, 2), why: 'Es gibt {0}, die {1} sind. Keine {1} sind {2} – also sind diese {0} keine {2}.' },
  { premises: [c('all', 2, 1), c('no', 0, 1)], conclusion: c('no', 0, 2), why: 'Alle {2} sind {1}, aber keine {0} sind {1}. Wären manche {0} auch {2}, müssten sie {1} sein – Widerspruch.' },
  { premises: [c('all', 2, 1), c('someNot', 0, 1)], conclusion: c('someNot', 0, 2), why: 'Manche {0} sind keine {1}. Da alle {2} aber {1} sind, können diese {0} keine {2} sein.' },
  { premises: [c('some', 1, 0), c('all', 1, 2)], conclusion: c('some', 0, 2), why: 'Manche {1} sind {0}. Diese sind (wie alle {1}) auch {2} – also gibt es {0}, die {2} sind.' },
  { premises: [c('someNot', 1, 2), c('all', 1, 0)], conclusion: c('someNot', 0, 2), why: 'Manche {1} sind keine {2}. Diese sind (wie alle {1}) {0} – also gibt es {0}, die keine {2} sind.' },
]

const THREE: Pattern[] = [
  { premises: [c('all', 0, 1), c('all', 1, 2), c('all', 2, 3)], conclusion: c('all', 0, 3), why: 'Kette: {0} ⊂ {1} ⊂ {2} ⊂ {3} – also sind alle {0} {3}.' },
  { premises: [c('all', 0, 1), c('all', 1, 2), c('no', 2, 3)], conclusion: c('no', 0, 3), why: 'Alle {0} sind {2} (über {1}). Keine {2} sind {3} – also sind auch keine {0} {3}.' },
  { premises: [c('some', 0, 1), c('all', 1, 2), c('all', 2, 3)], conclusion: c('some', 0, 3), why: 'Die {0}, die {1} sind, sind auch {2} und damit {3}.' },
  { premises: [c('some', 0, 1), c('all', 1, 2), c('no', 2, 3)], conclusion: c('someNot', 0, 3), why: 'Die {0}, die {1} sind, sind auch {2} – und keine {2} sind {3}. Also sind diese {0} keine {3}.' },
  { premises: [c('all', 0, 1), c('no', 1, 2), c('all', 3, 2)], conclusion: c('no', 0, 3), why: 'Alle {3} sind {2}, keine {1} sind {2}, alle {0} sind {1}. Wären manche {0} auch {3}, müssten sie zugleich {1} und {2} sein – unmöglich.' },
  { premises: [c('some', 0, 1), c('all', 1, 2), c('all', 3, 0)], conclusion: c('some', 0, 2), why: 'Die {0}, die {1} sind, sind auch {2}. (Die Aussage über {3} ist für diese Folgerung irrelevant – eine typische Ablenkung.)' },
]

function sentence(s: Cat, nouns: string[], lang: Lang): string {
  const A = nouns[s.a]
  const B = nouns[s.b]
  if (lang === 'de') {
    switch (s.q) {
      case 'all':
        return `Alle ${A} sind ${B}.`
      case 'some':
        return `Einige ${A} sind ${B}.`
      case 'no':
        return `Keine ${A} sind ${B}.`
      case 'someNot':
        return `Einige ${A} sind keine ${B}.`
    }
  }
  switch (s.q) {
    case 'all':
      return `All ${A} are ${B}.`
    case 'some':
      return `Some ${A} are ${B}.`
    case 'no':
      return `No ${A} are ${B}.`
    case 'someNot':
      return `Some ${A} are not ${B}.`
  }
}

const same = (x: Cat, y: Cat) => x.q === y.q && x.a === y.a && x.b === y.b

export const syllogism: GeneratorDef = {
  id: 'ded.syllogism',
  version: 1,
  category: 'deductive',
  title: 'Syllogismen',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const pattern = rng.pick(d === 1 ? TWO.slice(0, 4) : d === 2 ? TWO : THREE)
      const k = pattern.premises.length === 2 ? 3 : 4
      const nounIdx = rng.sample(
        NOUNS.map((_, i) => i),
        k,
      )
      const nouns = nounIdx.map((i) => NOUNS[i][lang === 'de' ? 1 : 0])
      const premises = d === 1 ? pattern.premises : rng.shuffle(pattern.premises)
      // Candidate distractors: must NOT follow under either reading of "all".
      const quants: Quant[] = ['all', 'some', 'no', 'someNot']
      const end = k - 1
      const priority: Cat[] = []
      for (const q of quants) priority.push(c(q, 0, end), c(q, end, 0))
      for (const p of premises) priority.push(c(p.q, p.b, p.a))
      const rest: Cat[] = []
      for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) if (a !== b) for (const q of quants) rest.push(c(q, a, b))
      const pool = [...priority, ...rng.shuffle(rest)]
      const distractors: Cat[] = []
      for (const cand of pool) {
        if (distractors.length >= 4) break
        if (same(cand, pattern.conclusion) || premises.some((p) => same(p, cand)) || distractors.some((x) => same(x, cand))) continue
        if (follows(k, premises, cand, false) || follows(k, premises, cand, true)) continue
        distractors.push(cand)
      }
      if (distractors.length < 4) return null
      const options = rng.shuffle([pattern.conclusion, ...distractors])
      const correct = options.findIndex((o) => same(o, pattern.conclusion))
      const fill = (s: string) => s.replace(/\{(\d)\}/g, (_, i) => nouns[Number(i)])
      const premiseText = premises.map((p) => sentence(p, nouns, lang))
      const notes = options
        .map((o, i) => ({ o, i }))
        .filter(({ i }) => i !== correct)
        .map(({ o, i }) => {
          const isConverse = premises.some((p) => p.q === 'all' && o.q === 'all' && p.a === o.b && p.b === o.a)
          const why = isConverse
            ? 'Umkehrfehler: Aus „Alle X sind Y“ folgt nicht „Alle Y sind X“.'
            : 'Kann wahr sein, muss es aber nicht: Es gibt eine Anordnung (Venn-Diagramm), in der alle Aussagen gelten, diese aber nicht.'
          return `**${String.fromCharCode(65 + i)}** (${sentence(o, nouns, lang)}): ${why}`
        })
      const item: McqItem = {
        ...core(this, seed, d, lang),
        type: 'mcq',
        exhibits: [{ kind: 'text', title: tr(lang, 'Statements', 'Aussagen'), body: premiseText.join('\n') }],
        prompt: tr(lang, 'Assume all statements are true. Which conclusion must also be true?', 'Angenommen, alle Aussagen sind wahr. Welche Schlussfolgerung muss dann ebenfalls wahr sein?'),
        query: { family: 'syllogism', sets: k, premises, options },
        options: options.map((o) => ({ text: sentence(o, nouns, lang) })),
        correct,
        explanation: {
          steps: [fill(pattern.why), `Also gilt zwingend: **${sentence(pattern.conclusion, nouns, lang)}**`],
          distractors: notes,
          shortcut: 'Skizziere drei Kreise (Venn-Diagramm) und zeichne nur, was die Aussagen erzwingen. Eine Schlussfolgerung ist nur richtig, wenn sie in JEDER erlaubten Skizze gilt. Achte auf Umkehrfehler und auf „einige“ vs. „alle“.',
        },
      }
      return item
    })
  },
}
