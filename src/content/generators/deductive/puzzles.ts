/** Ordering, scheduling and seating puzzles (+ True/False/Cannot say on them). */
import { core, tr, type GeneratorDef } from '../../generator'
import { firstAccepted } from '../../pipeline'
import type { Rng } from '../../rng'
import type { Difficulty, Lang, McqItem } from '../../types'
import type { Clue, Fact } from '../../validators/deductive'
import { arrangements, clueTrue, factTrue } from './arrange'

const NAMES = ['Anna', 'Ben', 'Clara', 'David', 'Eva', 'Felix']
const DAYS_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAYS_DE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
const ORD_EN = ['1st', '2nd', '3rd', '4th', '5th', '6th']

type Ctx = 'race' | 'schedule' | 'seating'

interface Texts {
  intro: (n: number) => string
  clue: (c: Clue) => string
  pos: (k: number) => string
  whoAt: (k: number) => string
  whereIs: (a: number) => string
  fact: (f: Fact) => string
}

function texts(ctx: Ctx, lang: Lang, n: number): Texts {
  const N = (i: number) => NAMES[i]
  const de = lang === 'de'
  const people = (k: number) => (de ? (k === 1 ? 'genau eine Person' : `genau ${k} Personen`) : k === 1 ? 'exactly one person' : `exactly ${k} people`)
  if (ctx === 'race') {
    const pos = (k: number) => (de ? `Platz ${k + 1}` : ORD_EN[k])
    return {
      intro: (n) => (de ? `${n} Personen – ${names(n, lang)} – laufen ein Rennen. Es gibt keine Gleichstände.` : `${n} people – ${names(n, lang)} – run a race. There are no ties.`),
      pos,
      clue: (c) => {
        switch (c.t) {
          case 'before':
            return de ? `${N(c.a)} kam vor ${N(c.b)} ins Ziel.` : `${N(c.a)} finished ahead of ${N(c.b)}.`
          case 'justBefore':
            return de ? `${N(c.a)} kam direkt vor ${N(c.b)} ins Ziel.` : `${N(c.a)} finished directly ahead of ${N(c.b)}.`
          case 'pos':
            return de ? `${N(c.a)} belegte ${pos(c.k)}.` : `${N(c.a)} finished ${pos(c.k)}.`
          case 'notPos':
            return de ? `${N(c.a)} belegte nicht ${pos(c.k)}.` : `${N(c.a)} did not finish ${pos(c.k)}.`
          case 'adjacent':
            return de ? `${N(c.a)} und ${N(c.b)} belegten aufeinanderfolgende Plätze.` : `${N(c.a)} and ${N(c.b)} finished in consecutive places.`
          case 'notAdjacent':
            return de ? `${N(c.a)} und ${N(c.b)} belegten keine aufeinanderfolgenden Plätze.` : `${N(c.a)} and ${N(c.b)} did not finish in consecutive places.`
          case 'gap':
            return de ? `Zwischen ${N(c.a)} und ${N(c.b)} ${c.n === 1 ? 'kam' : 'kamen'} ${people(c.n)} ins Ziel.` : `${cap(people(c.n))} finished between ${N(c.a)} and ${N(c.b)}.`
          case 'notEnd':
            return de ? `${N(c.a)} belegte weder den ersten noch den letzten Platz.` : `${N(c.a)} finished neither first nor last.`
        }
      },
      whoAt: (k) => (de ? `Wer belegte ${pos(k)}?` : `Who finished ${pos(k)}?`),
      whereIs: (a) => (de ? `Welchen Platz belegte ${N(a)}?` : `In which place did ${N(a)} finish?`),
      fact: (f) => {
        switch (f.t) {
          case 'at':
            return de ? `${N(f.a)} belegte ${pos(f.k)}.` : `${N(f.a)} finished ${pos(f.k)}.`
          case 'before':
            return de ? `${N(f.a)} kam vor ${N(f.b)} ins Ziel.` : `${N(f.a)} finished ahead of ${N(f.b)}.`
          case 'adjacent':
            return de ? `${N(f.a)} und ${N(f.b)} belegten aufeinanderfolgende Plätze.` : `${N(f.a)} and ${N(f.b)} finished in consecutive places.`
          case 'justBefore':
            return de ? `${N(f.a)} kam direkt vor ${N(f.b)} ins Ziel.` : `${N(f.a)} finished directly ahead of ${N(f.b)}.`
        }
      },
    }
  }
  if (ctx === 'schedule') {
    const day = (k: number) => (de ? DAYS_DE[k] : DAYS_EN[k])
    const last = day(n - 1)
    const days = (k: number) => (de ? (k === 1 ? 'genau ein Tag' : `genau ${k} Tage`) : k === 1 ? 'exactly one day' : `exactly ${k} days`)
    return {
      intro: (n) =>
        de
          ? `${n} Kolleginnen und Kollegen – ${names(n, lang)} – halten je eine Präsentation, an ${n} verschiedenen Tagen von Montag bis ${last}.`
          : `${n} colleagues – ${names(n, lang)} – each give one presentation, on ${n} different days from Monday to ${last}.`,
      pos: day,
      clue: (c) => {
        switch (c.t) {
          case 'before':
            return de ? `${N(c.a)} präsentiert früher in der Woche als ${N(c.b)}.` : `${N(c.a)} presents earlier in the week than ${N(c.b)}.`
          case 'justBefore':
            return de ? `${N(c.a)} präsentiert am Tag vor ${N(c.b)}.` : `${N(c.a)} presents the day before ${N(c.b)}.`
          case 'pos':
            return de ? `${N(c.a)} präsentiert am ${day(c.k)}.` : `${N(c.a)} presents on ${day(c.k)}.`
          case 'notPos':
            return de ? `${N(c.a)} präsentiert nicht am ${day(c.k)}.` : `${N(c.a)} does not present on ${day(c.k)}.`
          case 'adjacent':
            return de ? `${N(c.a)} und ${N(c.b)} präsentieren an aufeinanderfolgenden Tagen.` : `${N(c.a)} and ${N(c.b)} present on consecutive days.`
          case 'notAdjacent':
            return de ? `${N(c.a)} und ${N(c.b)} präsentieren nicht an aufeinanderfolgenden Tagen.` : `${N(c.a)} and ${N(c.b)} do not present on consecutive days.`
          case 'gap':
            return de ? `Zwischen den Präsentationen von ${N(c.a)} und ${N(c.b)} liegt ${days(c.n)}.` : `There ${c.n === 1 ? 'is' : 'are'} ${days(c.n)} between the presentations of ${N(c.a)} and ${N(c.b)}.`
          case 'notEnd':
            return de ? `${N(c.a)} präsentiert weder am Montag noch am ${last}.` : `${N(c.a)} presents neither on Monday nor on ${last}.`
        }
      },
      whoAt: (k) => (de ? `Wer präsentiert am ${day(k)}?` : `Who presents on ${day(k)}?`),
      whereIs: (a) => (de ? `An welchem Tag präsentiert ${N(a)}?` : `On which day does ${N(a)} present?`),
      fact: (f) => {
        switch (f.t) {
          case 'at':
            return de ? `${N(f.a)} präsentiert am ${day(f.k)}.` : `${N(f.a)} presents on ${day(f.k)}.`
          case 'before':
            return de ? `${N(f.a)} präsentiert früher als ${N(f.b)}.` : `${N(f.a)} presents earlier than ${N(f.b)}.`
          case 'adjacent':
            return de ? `${N(f.a)} und ${N(f.b)} präsentieren an aufeinanderfolgenden Tagen.` : `${N(f.a)} and ${N(f.b)} present on consecutive days.`
          case 'justBefore':
            return de ? `${N(f.a)} präsentiert am Tag vor ${N(f.b)}.` : `${N(f.a)} presents the day before ${N(f.b)}.`
        }
      },
    }
  }
  const seat = (k: number) => (de ? `Platz ${k + 1}` : `seat ${k + 1}`)
  return {
    intro: (n) =>
      de
        ? `${n} Personen – ${names(n, lang)} – sitzen an einem runden Tisch auf den Plätzen 1 bis ${n}, im Uhrzeigersinn nummeriert. Platz ${n} grenzt an Platz 1. „X sitzt im Uhrzeigersinn unmittelbar nach Y“ heißt: X sitzt auf dem Platz mit der nächsthöheren Nummer (nach Platz ${n} kommt Platz 1).`
        : `${n} people – ${names(n, lang)} – sit at a round table in seats numbered 1 to ${n} clockwise. Seat ${n} is next to seat 1. “X sits immediately clockwise from Y” means X sits in the seat with the next higher number (after seat ${n} comes seat 1).`,
    pos: (k) => (de ? `Platz ${k + 1}` : `Seat ${k + 1}`),
    clue: (c) => {
      switch (c.t) {
        case 'justBefore':
          return de ? `${N(c.b)} sitzt im Uhrzeigersinn unmittelbar nach ${N(c.a)}.` : `${N(c.b)} sits immediately clockwise from ${N(c.a)}.`
        case 'pos':
          return de ? `${N(c.a)} sitzt auf ${seat(c.k)}.` : `${N(c.a)} sits in ${seat(c.k)}.`
        case 'notPos':
          return de ? `${N(c.a)} sitzt nicht auf ${seat(c.k)}.` : `${N(c.a)} does not sit in ${seat(c.k)}.`
        case 'adjacent':
          return de ? `${N(c.a)} sitzt neben ${N(c.b)}.` : `${N(c.a)} sits next to ${N(c.b)}.`
        case 'notAdjacent':
          return de ? `${N(c.a)} sitzt nicht neben ${N(c.b)}.` : `${N(c.a)} does not sit next to ${N(c.b)}.`
        case 'gap':
          return de ? `${N(c.a)} sitzt ${N(c.b)} direkt gegenüber.` : `${N(c.a)} sits directly opposite ${N(c.b)}.`
        default:
          throw new Error(`clue ${c.t} not used for seating`)
      }
    },
    whoAt: (k) => (de ? `Wer sitzt auf ${seat(k)}?` : `Who sits in ${seat(k)}?`),
    whereIs: (a) => (de ? `Auf welchem Platz sitzt ${N(a)}?` : `In which seat does ${N(a)} sit?`),
    fact: (f) => {
      switch (f.t) {
        case 'at':
          return de ? `${N(f.a)} sitzt auf ${seat(f.k)}.` : `${N(f.a)} sits in ${seat(f.k)}.`
        case 'adjacent':
          return de ? `${N(f.a)} sitzt neben ${N(f.b)}.` : `${N(f.a)} sits next to ${N(f.b)}.`
        case 'justBefore':
          return de ? `${N(f.b)} sitzt im Uhrzeigersinn unmittelbar nach ${N(f.a)}.` : `${N(f.b)} sits immediately clockwise from ${N(f.a)}.`
        default:
          throw new Error('fact not used for seating')
      }
    },
  }
}

function names(n: number, lang: Lang): string {
  const list = NAMES.slice(0, n)
  return `${list.slice(0, -1).join(', ')} ${lang === 'de' ? 'und' : 'and'} ${list[n - 1]}`
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Random clue that is true for the hidden arrangement. */
function randomClue(rng: Rng, pos: number[], d: Difficulty, circular: boolean): Clue {
  const n = pos.length
  const types: Clue['t'][] = circular
    ? d === 3
      ? ['justBefore', 'adjacent', 'notAdjacent', 'gap', 'notPos', 'pos']
      : ['justBefore', 'adjacent', 'pos', 'notPos', 'gap']
    : d === 1
      ? ['pos', 'justBefore', 'before', 'before']
      : d === 2
        ? ['before', 'justBefore', 'pos', 'notPos', 'adjacent', 'gap', 'notEnd']
        : ['before', 'before', 'justBefore', 'notPos', 'adjacent', 'notAdjacent', 'gap', 'notEnd']
  const t = rng.pick(types)
  const at = (k: number) => pos.indexOf(k)
  const a = rng.int(0, n - 1)
  switch (t) {
    case 'before': {
      const b = rng.int(0, n - 1)
      return pos[a] < pos[b] ? { t, a, b } : { t, a: b, b: a }
    }
    case 'justBefore': {
      const next = circular ? (pos[a] + 1) % n : pos[a] + 1
      if (next >= n) return { t: 'before', a: at(pos[a] - 1), b: a }
      return { t, a, b: at(next) }
    }
    case 'pos':
      return { t, a, k: pos[a] }
    case 'notPos': {
      let k = rng.int(0, n - 1)
      if (k === pos[a]) k = (k + 1) % n
      return { t, a, k }
    }
    case 'adjacent': {
      const k = circular ? (pos[a] + 1) % n : pos[a] + 1 < n ? pos[a] + 1 : pos[a] - 1
      return { t, a, b: at(k) }
    }
    case 'notAdjacent': {
      for (let tries = 0; tries < 10; tries++) {
        const b = rng.int(0, n - 1)
        const dd = Math.abs(pos[a] - pos[b])
        const dist = circular ? Math.min(dd, n - dd) : dd
        if (b !== a && dist > 1) return { t, a, b }
      }
      return { t: 'pos', a, k: pos[a] }
    }
    case 'gap': {
      if (circular) {
        if (n % 2 === 1) return { t: 'adjacent', a, b: at((pos[a] + 1) % n) }
        return { t, a, b: at((pos[a] + n / 2) % n), n: n / 2 - 1 }
      }
      const g = rng.int(1, 2)
      const k = pos[a] + g + 1 < n ? pos[a] + g + 1 : pos[a] - g - 1
      if (k < 0) return { t: 'before', a, b: at(n - 1 === pos[a] ? 0 : n - 1) }
      return { t, a, b: at(k), n: g }
    }
    case 'notEnd':
      return pos[a] !== 0 && pos[a] !== n - 1 ? { t, a } : { t: 'pos', a, k: pos[a] }
  }
}

const sameClue = (x: Clue, y: Clue) => JSON.stringify(x) === JSON.stringify(y)

/** True if one clue alone already settles the fact (too easy for a puzzle question). */
function trivial(f: Fact, clues: Clue[], n: number, circular: boolean): boolean {
  return clues.some((c) => {
    const sols = arrangements(n, [c], circular)
    const vals = new Set(sols.map((s) => factTrue(f, s, circular)))
    return vals.size === 1
  })
}

interface Puzzle {
  n: number
  circular: boolean
  ctx: Ctx
  pos: number[]
  clues: Clue[]
  sols: number[][]
}

/** Adds random true clues until `done(sols)`; then drops redundant clues. */
function buildPuzzle(rng: Rng, d: Difficulty, ctx: Ctx, done: (sols: number[][]) => boolean, maxClues = 9): Puzzle | null {
  const minClues = d === 1 ? 2 : d === 2 ? 3 : 4
  const n = d === 1 ? 4 : d === 2 ? 5 : 6
  const circular = ctx === 'seating'
  const order = rng.shuffle(Array.from({ length: n }, (_, i) => i))
  const pos = new Array(n)
  order.forEach((p, k) => (pos[p] = k))
  const clues: Clue[] = []
  let sols = arrangements(n, clues, circular)
  for (let i = 0; i < 40 && !done(sols); i++) {
    const c = randomClue(rng, pos, d, circular)
    if (!clueTrue(c, pos, circular) || clues.some((x) => sameClue(x, c))) continue
    if (circular && c.t === 'before') continue
    const next = arrangements(n, [...clues, c], circular)
    if (next.length === sols.length) continue // clue adds no information
    clues.push(c)
    sols = next
  }
  if (!done(sols)) return null
  // Drop clues that are not needed (keeps puzzles crisp).
  for (let i = clues.length - 1; i >= 0; i--) {
    const without = clues.filter((_, j) => j !== i)
    const s = arrangements(n, without, circular)
    if (done(s)) {
      clues.splice(i, 1)
      sols = s
    }
  }
  if (clues.length > maxClues || clues.length < minClues) return null
  return { n, circular, ctx, pos, clues, sols }
}

function orderText(p: Puzzle, lang: Lang, pos: number[]): string {
  const t = texts(p.ctx, lang, p.n)
  return Array.from({ length: p.n }, (_, k) => `${t.pos(k)}: ${NAMES[pos.indexOf(k)]}`).join(' · ')
}

function explain(p: Puzzle, lang: Lang, conclusion: string): string[] {
  const t = texts(p.ctx, lang, p.n)
  const fixed: Clue[] = p.clues.filter((c) => c.t === 'pos')
  const blocks: Clue[] = p.clues.filter((c) => c.t === 'justBefore' || c.t === 'gap' || c.t === 'adjacent')
  const steps: string[] = []
  // Each step reports how many arrangements are still possible (counted by the solver) – checkable narrowing.
  const used: Clue[] = []
  const left = (cs: Clue[]) => {
    used.push(...cs)
    const k = arrangements(p.n, used, p.circular).length
    return k === 1 ? ' → nur noch 1 Anordnung möglich.' : ` → noch ${k} Anordnungen möglich.`
  }
  if (fixed.length) steps.push(`Feste Angaben zuerst eintragen: ${fixed.map((c) => t.clue(c)).join(' ')}${left(fixed)}`)
  if (blocks.length) steps.push(`${fixed.length ? 'Dann' : 'Zuerst'} Paare/Blöcke platzieren: ${blocks.map((c) => t.clue(c)).join(' ')}${left(blocks)}`)
  const others = p.clues.filter((c) => !fixed.includes(c) && !blocks.includes(c))
  if (others.length) steps.push(`Mit den übrigen Hinweisen Möglichkeiten streichen: ${others.map((c) => t.clue(c)).join(' ')}${left(others)}`)
  if (p.sols.length === 1) steps.push(`Einzige mögliche Anordnung: ${orderText(p, lang, p.sols[0])}`)
  else steps.push(`Es bleiben ${p.sols.length} Anordnungen möglich, z. B. ${orderText(p, lang, p.sols[0])} und ${orderText(p, lang, p.sols[1])}`)
  steps.push(conclusion)
  return steps
}

const SHORTCUT =
  'Zeichne eine Positionsleiste (bzw. einen Kreis) und trage zuerst feste Plätze ein, dann „direkt vor/neben“-Paare als Block. Erst danach „vor/nach“-Hinweise. Bei jeder Option prüfen: Gibt es eine erlaubte Anordnung, in der sie falsch ist?'

function makeItem(def: GeneratorDef, seed: number, d: Difficulty, lang: Lang, p: Puzzle, prompt: string, query: Record<string, unknown>, options: string[], correct: number, steps: string[], notes: string[]): McqItem {
  const t = texts(p.ctx, lang, p.n)
  return {
    ...core(def, seed, d, lang),
    type: 'mcq',
    exhibits: [{ kind: 'text', title: t.intro(p.n), body: p.clues.map((c, i) => `${i + 1}. ${t.clue(c)}`).join('\n') }],
    prompt,
    query: { family: 'ordering', n: p.n, circular: p.circular, clues: p.clues, ...query },
    options: options.map((text) => ({ text })),
    correct,
    explanation: { steps, distractors: notes, shortcut: SHORTCUT },
  }
}

export const ordering: GeneratorDef = {
  id: 'ded.ordering',
  version: 1,
  category: 'deductive',
  title: 'Reihenfolge & Terminplan',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const ctx: Ctx = rng.pick(['race', 'schedule'])
      const askKind = d === 1 ? rng.pick(['whoAt', 'whereIs']) : d === 2 ? rng.pick(['whoAt', 'whereIs', 'must']) : rng.pick(['must', 'whoAt'])
      const n = d === 1 ? 4 : d === 2 ? 5 : 6
      const k = rng.int(0, n - 1)
      const a = rng.int(0, n - 1)
      const optPeople = (correctPerson: number) => rng.shuffle([correctPerson, ...rng.sample(Array.from({ length: n }, (_, i) => i).filter((x) => x !== correctPerson), Math.min(4, n - 1))])
      if (askKind === 'whoAt' || askKind === 'whereIs') {
        const p = buildPuzzle(rng, d, ctx, (s) => (d === 1 ? s.length === 1 : askKind === 'whoAt' ? new Set(s.map((x) => x.indexOf(k))).size === 1 : new Set(s.map((x) => x[a])).size === 1))
        if (!p) return null
        const t = texts(ctx, lang, n)
        const askedFact: Fact = askKind === 'whoAt' ? { t: 'at', a: p.pos.indexOf(k), k } : { t: 'at', a, k: p.pos[a] }
        if (trivial(askedFact, p.clues, n, false)) return null
        if (askKind === 'whoAt') {
          const who = p.pos.indexOf(k)
          const people = optPeople(who)
          const correct = people.indexOf(who)
          return makeItem(this, seed, d, lang, p, t.whoAt(k), { ask: { t: 'whoAt', k }, optionPeople: people }, people.map((x) => NAMES[x]), correct, explain(p, lang, `Also: **${NAMES[who]}** (${t.pos(k)})`), people.filter((x) => x !== who).map((x) => (p.sols.length === 1 ? `${NAMES[x]}: steht in der Lösung auf ${t.pos(p.pos[x])}.` : `${NAMES[x]}: steht in keiner erlaubten Anordnung auf ${t.pos(k)}.`)))
        }
        const where = p.pos[a]
        const positions = rng.shuffle([where, ...rng.sample(Array.from({ length: n }, (_, i) => i).filter((x) => x !== where), Math.min(4, n - 1))])
        const correct = positions.indexOf(where)
        return makeItem(this, seed, d, lang, p, t.whereIs(a), { ask: { t: 'whereIs', a }, optionPositions: positions }, positions.map((x) => t.pos(x)), correct, explain(p, lang, `Also: **${t.pos(where)}**`), positions.filter((x) => x !== where).map((x) => (p.sols.length === 1 ? `${t.pos(x)}: Dort steht in der Lösung ${NAMES[p.pos.indexOf(x)]}.` : `${t.pos(x)}: In keiner erlaubten Anordnung steht ${NAMES[a]} dort.`)))
      }
      // "Which must be true?"
      const p = buildPuzzle(rng, d, ctx, (s) => s.length >= 1 && s.length <= (d === 3 ? 3 : 2))
      if (!p) return null
      const t = texts(ctx, lang, n)
      const allFacts: Fact[] = []
      for (let x = 0; x < n; x++) {
        for (let y = 0; y < n; y++) if (x !== y) allFacts.push({ t: 'before', a: x, b: y }, { t: 'justBefore', a: x, b: y })
        for (let kk = 0; kk < n; kk++) allFacts.push({ t: 'at', a: x, k: kk })
      }
      const isClue = (f: Fact) => p.clues.some((c) => (c.t === 'pos' && f.t === 'at' && c.a === f.a && c.k === f.k) || (c.t === f.t && 'b' in c && 'b' in f && c.a === f.a && c.b === f.b))
      const must = allFacts.filter((f) => !isClue(f) && !trivial(f, p.clues, n, false) && p.sols.every((s) => factTrue(f, s, false)))
      const could = allFacts.filter((f) => p.sols.some((s) => factTrue(f, s, false)) && !p.sols.every((s) => factTrue(f, s, false)))
      const never = allFacts.filter((f) => !p.sols.some((s) => factTrue(f, s, false)))
      if (must.length === 0) return null
      const right = rng.pick(must)
      const wrong = [...rng.shuffle(could).slice(0, d === 3 ? 3 : 2), ...rng.shuffle(never)].slice(0, 4)
      if (wrong.length < 4) return null
      const facts = rng.shuffle([right, ...wrong])
      const correct = facts.indexOf(right)
      const texts2 = facts.map((f) => t.fact(f))
      if (new Set(texts2).size !== 5) return null
      return makeItem(
        this,
        seed,
        d,
        lang,
        p,
        tr(lang, 'Which of the following statements must be true?', 'Welche der folgenden Aussagen muss wahr sein?'),
        { ask: { t: 'must' }, optionFacts: facts },
        texts2,
        correct,
        explain(p, lang, `In jeder möglichen Anordnung gilt: **${t.fact(right)}**`),
        facts
          .map((f, i) => ({ f, i }))
          .filter(({ i }) => i !== correct)
          .map(({ f, i }) => `**${String.fromCharCode(65 + i)}**: ${p.sols.some((s) => factTrue(f, s, false)) ? 'Kann wahr sein, muss aber nicht (nicht in jeder möglichen Anordnung).' : 'Ist in keiner möglichen Anordnung wahr.'}`),
      )
    })
  },
}

export const seating: GeneratorDef = {
  id: 'ded.seating',
  version: 1,
  category: 'deductive',
  title: 'Sitzordnung',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const n = d === 1 ? 4 : d === 2 ? 5 : 6
      const k = rng.int(0, n - 1)
      const p = buildPuzzle(rng, d, 'seating', (s) => (d === 1 ? s.length === 1 : new Set(s.map((x) => x.indexOf(k))).size === 1))
      if (!p) return null
      const t = texts('seating', lang, n)
      const who = p.pos.indexOf(k)
      if (trivial({ t: 'at', a: who, k }, p.clues, n, true)) return null
      const people = rng.shuffle([who, ...rng.sample(Array.from({ length: n }, (_, i) => i).filter((x) => x !== who), Math.min(4, n - 1))])
      const correct = people.indexOf(who)
      return makeItem(this, seed, d, lang, p, t.whoAt(k), { ask: { t: 'whoAt', k }, optionPeople: people }, people.map((x) => NAMES[x]), correct, explain(p, lang, `Also: **${NAMES[who]}** (${t.pos(k)})`), people.filter((x) => x !== who).map((x) => (p.sols.length === 1 ? `${NAMES[x]}: sitzt in der Lösung auf ${t.pos(p.pos[x])}.` : `${NAMES[x]}: sitzt in keiner erlaubten Anordnung auf ${t.pos(k)}.`)))
    })
  },
}

export const orderingTfc: GeneratorDef = {
  id: 'ded.tfc',
  version: 1,
  category: 'deductive',
  title: 'Wahr / Falsch / Nicht bestimmbar',
  types: ['mcq'],
  generate(seed, d, lang) {
    return firstAccepted(seed, (rng) => {
      const ctx: Ctx = rng.pick(['race', 'schedule'])
      const target = rng.pick(['T', 'F', 'C'] as const)
      const p = buildPuzzle(rng, d, ctx, (s) => s.length >= 2 && s.length <= 4)
      if (!p) return null
      const t = texts(ctx, lang, p.n)
      const facts: Fact[] = []
      for (let x = 0; x < p.n; x++) {
        for (let y = 0; y < p.n; y++) if (x !== y) facts.push({ t: 'before', a: x, b: y }, { t: 'adjacent', a: x, b: y })
        for (let kk = 0; kk < p.n; kk++) facts.push({ t: 'at', a: x, k: kk })
      }
      const cls = (f: Fact) => {
        const v = new Set(p.sols.map((s) => factTrue(f, s, false)))
        return v.size === 2 ? 'C' : v.has(true) ? 'T' : 'F'
      }
      const isClueText = (f: Fact) => p.clues.some((c) => t.clue(c) === t.fact(f))
      // Gate 3: a statement that a single clue already settles is no deduction, also not at level 1.
      const cands = facts.filter((f) => cls(f) === target && !isClueText(f) && (target === 'C' || !trivial(f, p.clues, p.n, false)))
      if (cands.length === 0) return null
      const fact = rng.pick(cands)
      const opts = lang === 'de' ? ['Wahr', 'Falsch', 'Nicht bestimmbar'] : ['True', 'False', 'Cannot say']
      const correct = target === 'T' ? 0 : target === 'F' ? 1 : 2
      const verdict =
        target === 'T'
          ? 'Die Aussage gilt in jeder möglichen Anordnung → **Wahr**.'
          : target === 'F'
            ? 'Die Aussage gilt in keiner möglichen Anordnung → **Falsch**.'
            : 'Die Aussage gilt in manchen möglichen Anordnungen, in anderen nicht → **Nicht bestimmbar**.'
      return makeItem(
        this,
        seed,
        d,
        lang,
        p,
        tr(lang, `Based on the information, is the following statement true, false, or can it not be determined? "${t.fact(fact)}"`, `Ist die folgende Aussage auf Basis der Informationen wahr, falsch oder nicht bestimmbar? „${t.fact(fact)}“`),
        { ask: { t: 'tfc', fact } },
        opts,
        correct,
        explain(p, lang, verdict),
        [
          'Wahr heißt: in JEDER erlaubten Anordnung erfüllt. Falsch heißt: in KEINER. Sonst ist die Antwort „Nicht bestimmbar“ – auch wenn die Aussage plausibel klingt.',
        ],
      )
    })
  },
}
